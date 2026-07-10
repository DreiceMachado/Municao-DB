import { useCallback } from "react"
import type { WeaponEntry, WeaponType } from "../types"
import { catalogDb, type CatalogWeapon as FichaCatalogo } from "../lib/catalogDb"

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

  // Converte a ficha do catálogo para campos do WeaponEntry
  const fichaParaWeaponEntry = useCallback(
    (ficha: FichaCatalogo): Partial<Record<keyof Omit<WeaponEntry, "type">, string | boolean | null | string[]>> => {
      const disparo = (ficha.sistema_disparo ?? "").toLowerCase()
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
      if (ficha.raias_qtd != null)   campos.numEstrias         = String(ficha.raias_qtd)
      if (ficha.raias_sentido)       campos.sentidoEstrias     = ficha.raias_sentido
      if (ficha.carregador_capacidade != null)
        campos.capacidadeCarregador = String(ficha.carregador_capacidade)

      // Sistemas de disparo → booleanos
      campos.acaoSimples = disparo.includes("simples")
      campos.acaoDupla   = disparo.includes("dupla")

      // Travas → segurança (tem ao menos uma trava?)
      if (ficha.travas_seguranca?.length)
        campos.seguranca = true

      return campos
    },
    []
  )

  // Como não temos mais o estado de loading aqui, retornamos apenas as funções.
  // O componente pode usar `useLiveQuery` para ter seu próprio estado de loading se necessário.
  return { buscarFicha, fichaParaWeaponEntry, loadingFicha: false } // Retornando false para não quebrar a desestruturação no componente
}
