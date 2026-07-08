// Mapeia um item local (WeaponEntry, camelCase) para o SCHEMA NORMALIZADO
// do Supabase: uma linha em `pecas` + uma linha na tabela de detalhe do tipo.
//
// Usado pelo sync.ts. Mantém o app organizado em cima do schema montado,
// no lugar da antiga tabela `armas` (dados_json).

import type { WeaponEntry, WeaponType } from "../types"

// tipo da peça -> tabela de detalhe (espelha DETALHE_POR_TIPO do gerador)
export const TABELA_POR_TIPO: Partial<Record<WeaponType, string>> = {
  "REVÓLVER": "armas_fogo", "PISTOLA": "armas_fogo", "PISTOLETE": "armas_fogo",
  "GARRUCHA": "armas_fogo", "ESPINGARDA": "armas_fogo", "CARABINA": "armas_fogo",
  "FUZIL": "armas_fogo", "METRALHADORA": "armas_fogo", "SUBMETRALHADORA": "armas_fogo",
  "PROJÉTIL": "projeteis",
  "ESTOJO": "estojos",
  "CARTUCHO": "cartuchos",
  "FACA": "facas",
  "ARMA DE PRESSÃO": "armas_pressao",
  "ARMA DE ANTECARGA": "armas_antecarga",
  "PÓLVORA": "polvoras",
  "ESPOLETA": "espoletas",
  "CARREGADOR": "carregadores",
  // "ARMA DE CHOQUE" não tem tabela de detalhe.
}

// texto -> string ou null (evita gravar "" em coluna)
function s(v: unknown): string | null {
  const t = (v ?? "").toString().trim()
  return t === "" ? null : t
}

// booleano -> boolean ou null
function b(v: unknown): boolean | null {
  if (typeof v === "boolean") return v
  return v == null ? null : Boolean(v)
}

// array de textos -> string[] ou null (para colunas TEXT[])
function arr(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const items = v.map((x) => (x ?? "").toString().trim()).filter((x) => x !== "")
  return items.length ? items : null
}

// respeita CHECK constraints: só grava se estiver no conjunto permitido
function enumOrNull(v: unknown, permitidos: string[]): string | null {
  const t = (v ?? "").toString().trim().toUpperCase()
  return permitidos.includes(t) ? t : null
}

const SERIAL_ESTADOS = ["LEGÍVEL", "PARCIAL", "SUPRIMIDO", "NÃO APARENTE"]
const TIPOS_PRODUCAO = ["INDUSTRIAL", "ARTESANAL"]
const DESTINACOES = ["LIBERADO", "CONSUMIDO"]

// ── PECAS (tabela base) ──────────────────────────────────────────────────────
export function pecaPayload(
  localId: string,
  laudoServerId: string,
  ordem: number,
  d: WeaponEntry,
): Record<string, unknown> {
  return {
    local_id:           localId,
    laudo_id:           laudoServerId,
    tipo:               d.type,
    ordem,
    destinacao:         enumOrNull(d.destinacao, DESTINACOES),
    // Munições (ESTOJO/CARTUCHO/CARREGADOR) guardam a identificação/headstamp no
    // campo `model`; armas de fogo usam `identificacao`. Faz o fallback p/ não perder o dado.
    identificacao:      s(d.identificacao) ?? s(d.model),
    quantidade:         s(d.quantidade),
    lacre_entrada_peca: s(d.lacreEntradaPeca),
    lacre_saida_peca:   s(d.lacreSaidaPeca) ?? s(d.coletaLacreSaida),
  }
}

// ── DETALHE (uma tabela por tipo) ────────────────────────────────────────────
export function detalhePayload(
  tabela: string,
  pecaId: string,
  d: WeaponEntry,
): Record<string, unknown> {
  const calibre = { peca_id: pecaId, calibre_nome: s(d.caliber) }

  switch (tabela) {
    case "armas_fogo":
      return {
        ...calibre,
        marca:               s(d.brand),
        modelo:              s(d.model),
        numero_serie:        s(d.serial),
        serial_estado:       enumOrNull(d.serialEstado, SERIAL_ESTADOS),
        tipo_producao:       enumOrNull(d.tipoProd, TIPOS_PRODUCAO),
        pais_fabricacao:     s(d.paisFabricacao),
        material:            s(d.material),
        acabamento:          s(d.acabamento),
        comp_cano:           s(d.compCano),
        comp_total:          s(d.compTotal),
        num_camaras:         s(d.numCamaras),
        num_canos:           s(d.numCanos),
        cap_carregador:      s(d.capacidadeCarregador),
        tipo_raiamento:      s(d.tipoRaiamento),
        material_quadro:     s(d.materialQuadro),
        material_coronha:    s(d.materialCoroha),
        sistema_acionamento: s(d.sistemaAcionamento),
        tipo_mira:           arr(d.tipoMira),
        tipo_carregador:     arr(d.tipoCarregador),
        // Mecanismo — comum
        acao_simples:        b(d.acaoSimples),
        acao_dupla:          b(d.acaoDupla),
        tambor_gira:         b(d.tamborGira),
        indexacao_correta:   b(d.indexacaoCorreta),
        cao_funcional:       b(d.caoFuncional),
        gatilho_funcional:   b(d.gatilhoFuncional),
        seguranca:           b(d.seguranca),
        // Mecanismo — CARABINA
        sistema_repeticao:   b(d.sistemaRepeticao),
        // Mecanismo — PISTOLA
        carregador_presente:  b(d.carregadorPresente),
        carregador_funcional: b(d.carregadorFuncional),
        ferrolho_funcional:   b(d.ferrolhoFuncional),
        percussor_funcional:  b(d.percussorFuncional),
        extrator_funcional:   b(d.extratorFuncional),
        ejator_funcional:     b(d.ejetorFuncional),
        retencao_ferrolho:    b(d.retencaoFerrolho),
        alimentacao_funcional: b(d.alimentacaoFuncional),
        // Mecanismo — FUZIL / METRALHADORA
        modo_fogo:           s(d.modoFogo),
        seletor_disparo:     b(d.seletoDisparo),
        modo_semi_auto:      b(d.modoSemiAuto),
        modo_auto_funcional: b(d.modoAutoFuncional),
        culatel_funcional:   b(d.culatelFuncional),
        // Estado de conservação
        ferrugem:            b(d.ferrugem),
        ferrugem_obs:        s(d.ferrugemObs),
        desgaste:            b(d.desgaste),
        desgaste_obs:        s(d.desgasteObs),
        desgaste_mecanico:   b(d.desgasteMecanico),
        desgaste_mec_obs:    s(d.desgasteMecanicoObs),
        danos_estruturais:   b(d.danoEstruturais),
        danos_obs:           s(d.danoEstruturaisObs),
        danos_aparentes:     b(d.danosAparentes),
        danos_ap_obs:        s(d.danosAparentesObs),
        pecas_faltantes:     b(d.pecasFaltantes),
        pecas_obs:           s(d.pecasFaltantesObs),
        // Exame de disparo
        apto_disparo:        b(d.aptoDisparo),
        func_municao_real:   b(d.funcMunicaoReal),
        teste_percussao:     b(d.testePercussao),
        marcacao_percussor:  b(d.marcacaoPercussor),
        tipo_municao_disp:   s(d.tipoMunicaoDisparo),
        qtd_municao_disp:    s(d.qtdMunicaoDisparo),
        extracao_funcional:  b(d.extracaoFuncional),
        ejacao_funcional:    b(d.ejacaoFuncional),
        ciclagem_funcional:  b(d.ciclagemFuncional),
        origem_municao:      s(d.origemMunicao),
      }

    case "projeteis":
      return {
        ...calibre,
        formato:             s(d.formato),
        material:            s(d.material),
        diametro:            s(d.diametro),
        diametro_min:        s(d.diametroMin),
        massa:               s(d.massa),
        altura:              s(d.alturaProjetil),
        num_estrias:         s(d.numEstrias),
        sent_estrias:        s(d.sentidoEstrias),
        inscricao_fab:       s(d.inscricaoFabricante),
        quantidade:          s(d.quantidade),
        deformacao_presente: b(d.deformacaoPresente),
        fragmentado:         b(d.fragmentado),
        oxidacao:            b(d.oxidacaoPresente),
        estado:              s(d.estadoProjetil),
        origem:              s(d.origemProjetil),
        origem_ref:          s(d.origemProjetilRef),
        regiao_coleta:       s(d.regiaoColeta),
      }

    case "estojos":
      return {
        ...calibre,
        marca:             s(d.brand),
        lote:              s(d.lote),
        inscricao_fab:     s(d.inscricaoFabricante),
        quantidade:        s(d.quantidade),
        marcacao_extrator: b(d.marcacaoExtrator),
        marcacao_ejator:   b(d.marcacaoEjetor),
        marcacao_camara:   b(d.marcacaoCamara),
        estrias_presentes: b(d.estriasPresentes),
        oxidacao:          b(d.oxidacaoPresente),
        estado:            s(d.estadoEstojo),
      }

    case "cartuchos":
      return {
        ...calibre,
        marca:      s(d.brand),
        tipo:       s(d.tipoConstrutivo),
        quantidade: s(d.quantidade),
        completo:   b(d.completo),
        amassado:   b(d.amassado),
        estado:     s(d.estadoCartucho),
      }

    case "facas":
      return {
        peca_id:         pecaId,
        marca:           s(d.brand),
        tipo_lamina:     s(d.tipoLamina),
        comp_lamina:     s(d.compLamina),
        tipo_gume:       s(d.tipoGume),
        gume_funcional:  b(d.gumeFuncional),
        apta_uso:        b(d.aptaUso),
        lamina_integra:  b(d.laminaIntegra),
        cabo_danificado: b(d.caboDanificado),
        manchas:         b(d.manchas),
        manchas_obs:     s(d.manchasObs),
        institucional:   b(d.institucional),
      }

    case "armas_pressao":
      return {
        ...calibre,
        marca:               s(d.brand),
        modelo:              s(d.model),
        sistema_acionamento: s(d.sistemaAcionamento),
        comp_cano:           s(d.compCano),
        estado_conservacao:  s(d.desgasteObs),
        adaptada_arma_fogo:  b(d.adaptadaArmaFogo),
      }

    case "armas_antecarga":
      return {
        ...calibre,
        marca:               s(d.brand),
        modelo:              s(d.model),
        comp_cano:           s(d.compCano),
        sistema_acionamento: s(d.sistemaAcionamento),
        estado_conservacao:  s(d.desgasteObs),
      }

    case "carregadores":
      return {
        ...calibre,
        marca:              s(d.brand),
        tipo:               s(d.tipoCarregador?.[0]),
        material:           s(d.material),
        capacidade:         s(d.capacidadeCarregador),
        estado_conservacao: s(d.desgasteObs),
      }

    case "polvoras":
      return {
        peca_id:    pecaId,
        tipo:       s(d.tipoPolvora),
        cor:        s(d.cor),
        marca:      s(d.brand),
        quantidade: s(d.quantidade),
      }

    case "espoletas":
      return {
        peca_id:    pecaId,
        tipo:       s(d.tipoEspoleta),
        marca:      s(d.brand),
        quantidade: s(d.quantidade),
      }

    default:
      return calibre
  }
}

// ── COLETA DE PADRÃO (tiro padrão) — filho de armas_fogo ──────────────────────
// Retorna a linha, ou null se não houver nenhum dado de coleta preenchido.
export function coletaPayload(
  armaId: string,
  d: WeaponEntry,
): Record<string, unknown> | null {
  const row: Record<string, unknown> = {
    arma_id:       armaId,
    numero_rep:    s(d.coletaNumero),
    ano_rep:       s(d.coletaRepAno),
    tipo_municao:  s(d.coletaMunicaoTipo),
    qtd_projeteis: s(d.coletaQtdProjeteis),
    qtd_estojos:   s(d.coletaQtdEstojos),
    tipo_projetil: s(d.coletaTipoProjetil),
    mat_projetil:  s(d.coletaMaterialProjetil),
    tipo_estojo:   s(d.coletaTipoEstojo),
    mat_estojo:    s(d.coletaMaterialEstojo),
    lacre_saida:   s(d.coletaLacreSaida),
  }
  const temDado = Object.entries(row).some(([k, v]) => k !== "arma_id" && v != null)
  return temDado ? row : null
}

// ── ACESSÓRIOS — uma linha por tipo de acessório selecionado ──────────────────
export function acessoriosPayload(
  armaId: string,
  d: WeaponEntry,
): Record<string, unknown>[] {
  const tipos = Array.isArray(d.tipoAcessorio) ? d.tipoAcessorio : []
  const materiais = d.materialAcessorio ?? {}
  return tipos
    .map((t) => (t ?? "").toString().trim())
    .filter((t) => t !== "")
    .map((tipo) => ({
      arma_id:       armaId,
      tipo,
      material:      s(materiais[tipo]),
      descricao:     s(d.descricaoAcessorio),
      lacre_entrada: s(d.lacreEntradaAcessorio),
      lacre_saida:   s(d.lacreSaidaAcessorio),
      origem:        s(d.origemAcessorio),
    }))
}

// ── SOBRESSALENTES — tambor e/ou cano sobressalente ───────────────────────────
export function sobressalentesPayload(
  armaId: string,
  d: WeaponEntry,
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []

  if (s(d.tamborSobressalente) || s(d.tamborSobressalenteQtd)) {
    rows.push({
      arma_id:    armaId,
      tipo:       "TAMBOR",
      quantidade: s(d.tamborSobressalenteQtd),
    })
  }

  if (
    s(d.canoSobressalente) || s(d.canoSobressalenteQtd) ||
    s(d.canoSobressalenteComp) || s(d.canoSobressalenteMaterial)
  ) {
    rows.push({
      arma_id:    armaId,
      tipo:       "CANO",
      quantidade: s(d.canoSobressalenteQtd),
      comp:       s(d.canoSobressalenteComp),
      material:   s(d.canoSobressalenteMaterial),
      acabamento: s(d.canoSobressalenteAcabamento),
    })
  }

  return rows
}

// ── LACRES (nível do laudo) — a partir dos lacres de entrada/saída da peça ─────
export function lacresDaPeca(
  laudoId: string,
  d: WeaponEntry,
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []
  const entrada = s(d.lacreEntradaPeca)
  if (entrada) rows.push({ laudo_id: laudoId, numero: entrada, tipo: "ENTRADA" })
  const saida = s(d.lacreSaidaPeca) ?? s(d.coletaLacreSaida)
  if (saida) rows.push({ laudo_id: laudoId, numero: saida, tipo: "SAIDA" })
  return rows
}
