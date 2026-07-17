import { useCallback } from "react"
import type { WeaponEntry, WeaponType } from "../types"
import { catalogDb, type CatalogWeapon as FichaCatalogo } from "../lib/catalogDb"
import { derivarEixos } from "../lib/eixos"

// Mapeamento de tipos do Balística → tipos do catálogo (armas_brasil.py)
const TIPO_BALISTICADB_PARA_CATALOGO: Partial<Record<WeaponType, string>> = {
  "PISTOLA":        "Pistola",
  "PISTOLETE":      "Pistola",
  "REVÓLVER":       "Revólver",
  "ESPINGARDA":     "Espingarda",
  "FUZIL":          "Fuzil",
  "CARABINA":       "Carabina",
  "SUBMETRALHADORA":"Submetralhadora",
  "GARRUCHA":       "Garrucha",
  "ARMA DE CHOQUE": "Arma de choque",
  "METRALHADORA":   "Metralhadora",
  "ARMA DE ANTECARGA": "Arma de antecarga",
}

// Exporta o tipo para ser usado em outros lugares se necessário
export type { FichaCatalogo }

export async function useCatalogoBrands(weaponType?: WeaponType | null): Promise<string[] | undefined> {
  if (!weaponType) return undefined
  const tipoCatalogo = TIPO_BALISTICADB_PARA_CATALOGO[weaponType]
  if (!tipoCatalogo) return undefined

  const items = await catalogDb.catalog.where('tipo').equals(tipoCatalogo).toArray()
  return [...new Set(items.map(w => w.marca))].sort()
}

export async function useCatalogoModels(weaponType: WeaponType | undefined, marca: string | undefined): Promise<string[] | undefined> {
  if (!weaponType) return undefined
  const tipoCatalogo = TIPO_BALISTICADB_PARA_CATALOGO[weaponType]
  if (!tipoCatalogo) return undefined

  // Sem fabricante (ou "Indeterminado"): mostra TODOS os modelos do tipo.
  const semMarca = !marca || marca === "Indeterminado"
  const items = semMarca
    ? await catalogDb.catalog.where('tipo').equals(tipoCatalogo).toArray()
    : await catalogDb.catalog.where({ tipo: tipoCatalogo, marca }).toArray()
  return [...new Set(items.map(w => w.modelo))].sort()
}

// Descobre a marca (fabricante) de um modelo — usado ao escolher um modelo sem
// fabricante definido, para preencher o fabricante automaticamente.
export async function buscarMarcaPorModelo(weaponType: WeaponType | undefined, modelo: string): Promise<string | null> {
  if (!weaponType || !modelo) return null
  const tipoCatalogo = TIPO_BALISTICADB_PARA_CATALOGO[weaponType]
  if (!tipoCatalogo) return null
  const item = await catalogDb.catalog.where({ tipo: tipoCatalogo, modelo }).first()
  return item?.marca ?? null
}

export function useWeaponCatalog() {
  // O estado de loading agora é gerenciado pelo useLiveQuery no componente,
  // mas podemos manter um para a busca de ficha específica se quisermos.
  // Por enquanto, vamos simplificar e remover.
  // const [loadingFicha, setLoadingFicha] = useState(false)

  const buscarFicha = useCallback(
    async (weaponType: WeaponType, marca: string, modelo: string): Promise<FichaCatalogo | null> => {
      const tipoCatalogo = TIPO_BALISTICADB_PARA_CATALOGO[weaponType]
      if (!tipoCatalogo) return null

      // setLoadingFicha(true)
      const ficha = await catalogDb.catalog
        .where({ tipo: tipoCatalogo, marca, modelo })
        .first()
      // setLoadingFicha(false)
      return ficha || null
    },
    []
  )

  // Converte a ficha do catálogo para campos do WeaponEntry.
  //
  // `weaponType` é o tipo do APP (MAIÚSCULAS), não o da ficha, e é obrigatório
  // para a classificação nos eixos: TIPO_BALISTICADB_PARA_CATALOGO colapsa
  // PISTOLA e PISTOLETE em "Pistola", então inverter o mapa perderia a distinção
  // — e pistolete é justamente o tipo que derivarEixos() se recusa a classificar
  // por funcionamento (costuma ser artesanal de tiro unitário, mas varia).
  const fichaParaWeaponEntry = useCallback(
    (ficha: FichaCatalogo, weaponType?: WeaponType): Partial<Record<keyof Omit<WeaponEntry, "type">, string | boolean | null | string[]>> => {
      const campos: Partial<Record<keyof Omit<WeaponEntry, "type">, string | boolean | null | string[]>> = {}

      if (ficha.calibre_nominal)     campos.caliber            = ficha.calibre_nominal
      if (ficha.pais_fabricacao)     campos.paisFabricacao     = ficha.pais_fabricacao
      if (ficha.comprimento_cano_cm) campos.compCano           = ficha.comprimento_cano_cm
      if (ficha.comprimento_total_cm)campos.compTotal          = ficha.comprimento_total_cm
      // material_armacao = material da ARMAÇÃO (quadro), não do cano. Vai para materialQuadro.
      if (ficha.material_armacao) {
        const m = ficha.material_armacao.trim()
        campos.materialQuadro = m ? m.charAt(0).toUpperCase() + m.slice(1) : m
      }
      // material_cano = material e acabamento do cano.
      if (ficha.material_cano) {
        const mc = ficha.material_cano.trim()
        campos.material = mc ? mc.charAt(0).toUpperCase() + mc.slice(1) : mc
      }
      // material_cabo = material da coronha/cabo → materialCoroha.
      if (ficha.material_cabo) {
        const mcb = ficha.material_cabo.trim()
        campos.materialCoroha = mcb ? mcb.charAt(0).toUpperCase() + mcb.slice(1) : mcb
      }
      // sistema_disparo → Sistema de acionamento (mostra o texto da ficha).
      if (ficha.sistema_disparo) campos.sistemaAcionamento = ficha.sistema_disparo.trim()
      if (ficha.raias_qtd != null)   campos.numEstrias         = String(ficha.raias_qtd)
      if (ficha.raias_sentido)       campos.sentidoEstrias     = ficha.raias_sentido
      if (ficha.tipo_raiamento)      campos.tipoRaiamento      = ficha.tipo_raiamento
      if (ficha.carregador_capacidade != null) {
        // Revólver: a "capacidade" é o nº de câmaras do tambor.
        if (ficha.tipo === "Revólver") campos.numCamaras = String(ficha.carregador_capacidade)
        else campos.capacidadeCarregador = String(ficha.carregador_capacidade)
      }

      // NÃO preencher achados de exame (trava de segurança, ação simples/dupla funcional,
      // etc.) a partir do catálogo — isso é constatação do perito, não spec da ficha.

      // ── Classificação técnica: os 6 eixos do diagrama (ver src/lib/eixos.ts) ──
      // É AQUI que a ficha é aproveitada por inteiro. sistema_percussao,
      // tipo_descritivo e carregador_tipo eram lidos do catálogo e descartados;
      // agora alimentam a derivação. Nenhum deles existe em WeaponEntry, então
      // este é o único momento em que dá para classificar — depois de gravado,
      // o laudo não tem mais como recalcular.
      const eixos = derivarEixos({
        type: weaponType,
        caliber: ficha.calibre_nominal,
        tipoRaiamento: ficha.tipo_raiamento,
        fichaTipo: ficha.tipo,
        tipoDescritivo: ficha.tipo_descritivo,
        carregadorTipo: ficha.carregador_tipo,
        sistemaDisparo: ficha.sistema_disparo,
        sistemaPercussao: ficha.sistema_percussao,
      })
      // "Indeterminado" não é preenchido: deixar o campo vazio distingue "a
      // máquina não soube" de "o perito examinou e não determinou". Só o perito
      // grava Indeterminado, pelo picker.
      const preencher = (campo: keyof Omit<WeaponEntry, "type">, valor: string) => {
        if (valor && valor !== "Indeterminado") campos[campo] = valor
      }
      preencher("almaCano",              eixos.almaCano)
      preencher("sistemaCarregamento",   eixos.sistemaCarregamento)
      preencher("sistemaFuncionamento",  eixos.sistemaFuncionamento)
      preencher("percussaoLocalizacao",  eixos.percussaoLocalizacao)
      preencher("percussaoTipoEspoleta", eixos.percussaoTipoEspoleta)
      preencher("percussaoTransmissao",  eixos.percussaoTransmissao)
      preencher("percussaoMecanismo",    eixos.percussaoMecanismo)
      preencher("alimentacaoTipo",       eixos.alimentacaoTipo)

      return campos
    },
    []
  )

  // Como não temos mais o estado de loading aqui, retornamos apenas as funções.
  // O componente pode usar `useLiveQuery` para ter seu próprio estado de loading se necessário.
  return { buscarFicha, fichaParaWeaponEntry, loadingFicha: false } // Retornando false para não quebrar a desestruturação no componente
}
