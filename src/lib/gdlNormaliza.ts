// Normalização de marca / país / calibre entre o GDL e o BalísticaDB.
//
// O GDL e o app foram escritos por fontes diferentes, então a mesma marca aparece
// com grafias distintas (TAURUS vs Taurus, "Smith and Wesson" vs "Smith & Wesson",
// "Bereta" vs "Beretta"). O país no GDL é adjetivo ("brasileira") e no app é
// substantivo ("Brasil"). Estas funções fazem a ponte nos dois sentidos usando a
// tabela gerada em ../data/gdlAliases.
//
// Importação (GDL → app): a marca/país chega igual ao catálogo do app, então o
// picker destaca o item e o botão "preencher ficha" volta a funcionar.
// Envio (app → GDL): traduz de volta para a string EXATA do dropdown do GDL.

import {
  MARCA_GDL_PARA_APP,
  MARCA_APP_PARA_GDL,
  PAIS_GDL_PARA_APP,
  PAIS_APP_PARA_GDL,
  MARCA_MUNICAO_APP_PARA_GDL,
  MARCA_MUNICAO_GDL_PARA_APP,
  PLACEHOLDERS_GDL,
  CALIBRES_GDL,
  CAMPOS_GDL_POR_TIPO,
  CALIBRES_APP_POR_TIPO,
} from "../data/gdlAliases"

// Mesma normalização usada pelo gerador (scratchpad/gen_aliases.py):
// remove acentos, caixa baixa, troca pontuação por espaço, & → "and", colapsa espaços.
export function normChave(s: string): string {
  let out = (s ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos (combining marks)
    .toLowerCase()
  for (const ch of ".,/-()'") out = out.split(ch).join(" ")
  out = out.split("&").join(" and ")
  return out.replace(/\s+/g, " ").trim()
}

const PLACEHOLDERS_SET = new Set(PLACEHOLDERS_GDL.map(normChave))

// É um placeholder do GDL ("Selecione", "Não Aparente", "Eficiente"…) que não
// representa marca/país reais e não deve ser gravado.
export function ehPlaceholderGdl(valor: string): boolean {
  return PLACEHOLDERS_SET.has(normChave(valor))
}

// ── MARCA ────────────────────────────────────────────────────────────────────

// GDL → app: devolve a marca canônica do catálogo do app. Se não houver
// equivalente conhecido, devolve a marca original (sem quebrar dados existentes).
export function normalizarMarcaGdl(marcaGdl: string): string {
  const bruta = (marcaGdl ?? "").trim()
  if (!bruta || ehPlaceholderGdl(bruta)) return ""
  return MARCA_GDL_PARA_APP[normChave(bruta)] ?? bruta
}

// app → GDL: devolve a string exata do dropdown do GDL para o envio.
export function marcaAppParaGdl(marcaApp: string): string {
  const bruta = (marcaApp ?? "").trim()
  if (!bruta) return ""
  return MARCA_APP_PARA_GDL[bruta] ?? bruta
}

// Marca de munição (estojo/cartucho) → dropdown de cartucho do GDL (só 9 opções).
export function marcaMunicaoAppParaGdl(marcaApp: string): string {
  const bruta = (marcaApp ?? "").trim()
  if (!bruta) return ""
  return MARCA_MUNICAO_APP_PARA_GDL[bruta] ?? bruta
}

// GDL "Marca de Cartucho" (Aguila/CBC/Federal/FMFLB/PMC/S&B/SP/Winchester) →
// fabricante de munição do app. "Não Aparente"/placeholder → "".
export function normalizarMarcaMunicaoGdl(marcaGdl: string): string {
  const bruta = (marcaGdl ?? "").trim()
  if (!bruta || ehPlaceholderGdl(bruta)) return ""
  return MARCA_MUNICAO_GDL_PARA_APP[bruta] ?? bruta
}

// GDL "ORIGEM/COLETA" → origem de coleta do app (id do botão).
const ORIGEM_GDL_PARA_APP: Record<string, string> = {
  "delegacia": "DELEGACIA",
  "hospital": "HOSPITAL",
  "local de crime": "LOCAL",
  "necropsia": "NECROPSIA",
  // "Outro" do GDL não tem botão no app → fica sem marcar (retorna "").
}
export function normalizarOrigemGdl(origemGdl: string): string {
  const bruta = (origemGdl ?? "").trim()
  if (!bruta || ehPlaceholderGdl(bruta)) return ""
  return ORIGEM_GDL_PARA_APP[normChave(bruta)] ?? ""
}

// GDL "Resultado PSA" (NEGATIVO/POSITIVO/POSITIVO FRACO) → resultadoPSA do app
// (valores idênticos). Placeholder/vazio → "".
export function normalizarResultadoPsaGdl(valor: string): string {
  const v = (valor ?? "").trim()
  if (!v || ehPlaceholderGdl(v)) return ""
  return v.toUpperCase()
}

// Tipos de munição usam o dropdown de "Marca de Cartucho" do GDL (só 9 opções),
// não a lista de "Marca da Arma".
const TIPOS_MUNICAO = new Set(["ESTOJO", "CARTUCHO", "CARREGADOR", "ESPOLETA", "PÓLVORA"])

// Traduz brand/paisFabricacao de uma peça para as strings exatas do GDL, antes de
// enviar (POST /api/gdl/atualizar). Devolve uma CÓPIA — não muta a peça original.
export function traduzirPecaParaGdl<
  T extends { type?: string; brand?: string; paisFabricacao?: string; caliber?: string }
>(peca: T): T {
  const ehMunicao = peca.type ? TIPOS_MUNICAO.has(peca.type) : false
  return {
    ...peca,
    brand: peca.brand
      ? (ehMunicao ? marcaMunicaoAppParaGdl(peca.brand) : marcaAppParaGdl(peca.brand))
      : peca.brand,
    paisFabricacao: peca.paisFabricacao ? paisAppParaGdl(peca.paisFabricacao) : peca.paisFabricacao,
    // Calibre → string exata do dropdown do GDL (inclusive o ".9mm Luger" errado do GDL).
    caliber: peca.caliber ? calibreAppParaGdl(peca.caliber, peca.type) : peca.caliber,
  }
}

// ── PAÍS ─────────────────────────────────────────────────────────────────────

// GDL → app: "brasileira" → "Brasil". Placeholder/"Não Aparente" → "".
export function normalizarPaisGdl(paisGdl: string): string {
  const bruta = (paisGdl ?? "").trim()
  if (!bruta || ehPlaceholderGdl(bruta)) return ""
  // Match direto (case-insensitive) contra o adjetivo do GDL.
  const k = normChave(bruta)
  for (const [adj, subst] of Object.entries(PAIS_GDL_PARA_APP)) {
    if (normChave(adj) === k) return subst
  }
  return bruta
}

// app → GDL: "Brasil" → "brasileira".
export function paisAppParaGdl(paisApp: string): string {
  const bruta = (paisApp ?? "").trim()
  if (!bruta) return ""
  return PAIS_APP_PARA_GDL[bruta] ?? bruta
}

// ── DESCRIÇÃO ────────────────────────────────────────────────────────────────
// No GDL, "Quant. Descrição" (txtQtdeDescColorParts) e "Observação" (txtObservation)
// costumam trazer o MESMO conteúdo. Na importação mesclamos os dois numa única
// "Descrição" sem duplicar; no envio, o valor volta para os dois campos do GDL.
export function mesclarDescricaoGdl(a: string, b: string): string {
  const partes = [a, b].map(s => (s ?? "").trim()).filter(Boolean)
  const vistos: string[] = []
  for (const p of partes) {
    // ignora se já existe uma parte idêntica (case-insensitive) ou que já a contém
    const dup = vistos.some(v => v.toLowerCase() === p.toLowerCase() || v.toLowerCase().includes(p.toLowerCase()))
    if (!dup) vistos.push(p)
  }
  return vistos.join("\n")
}

// ── CALIBRE ──────────────────────────────────────────────────────────────────

// Extrai o calibre da identificação da peça de forma tolerante e devolve, quando
// possível, o RÓTULO EXATO do picker do app (para ficar marcado na seleção).
// Ex.: "REVOLVER CAL .44 MAGNUM" → ".44 Magnum"; "TAURUS CAL .38SPL" → ".38 SPL".
// `tipo` é o WeaponType do app (REVÓLVER, PISTOLA, …).
export function extrairCalibre(identificacao: string, tipo?: string): string {
  const ident = (identificacao ?? "").trim()
  if (!ident) return ""

  // 1) Casa o texto livre com a lista de calibres do APP para o tipo (mais específica:
  //    ".44 Magnum", ".357 Magnum") e devolve o rótulo exato do picker.
  const appMatch = casarCalibreApp(ident, tipo)
  if (appMatch) return appMatch

  // 2) Casa com a lista oficial de calibres do GDL para o tipo (forma canônica).
  const canon = casarCalibreCanonico(ident, tipo)
  if (canon) return corrigirCalibreGdl(canon)

  // 3) Fallback: "CAL" com ponto OU espaço + valor. Vírgula decimal entre dígitos é
  //    mantida (ex.: "7,62X51"); "032,00", "9x19", ".38SPL" também.
  const m = ident.match(/CAL[.\s]*([.\d](?:[^\s,;]|,(?=\d))*(?:\s*[xX×]\s*(?:[^\s,;]|,(?=\d))+)?)/i)
  return corrigirCalibreGdl(m ? m[1].toUpperCase().trim() : "")
}

// Normaliza texto para busca de calibre (igual ao normCal do app, mas SEM cortar no
// "(" — aqui a identificação é o "palheiro" onde procuramos o rótulo).
function normCalBusca(s: string): string {
  return (s ?? "").toLowerCase()
    .replace(/×/g, "x").replace(/,/g, ".").replace(/\+p/g, "")
    .replace(/\s+/g, "").trim()
}

// Procura na identificação (texto livre) um calibre do PICKER do app para o tipo.
// Tenta o rótulo de maior "assinatura" primeiro (".44 Magnum" antes de ".44 SPL").
function casarCalibreApp(ident: string, tipo?: string): string {
  const labels = tipo ? (CALIBRES_APP_POR_TIPO[tipo] ?? []) : []
  if (!labels.length) return ""
  const hay = normCalBusca(ident)
  if (!hay) return ""
  const ordenados = labels
    .map(l => ({ l, n: normCalApp(l) }))
    .filter(x => x.n.length >= 3)                 // evita casar assinaturas curtas demais
    .sort((a, b) => b.n.length - a.n.length)
  // Passe 1: rótulo inteiro contido no texto (ex.: ".44magnum", ".30-30winchester").
  for (const { l, n } of ordenados) if (hay.includes(n)) return l
  // Passe 2: núcleo dimensional "NxM" (ex.: "7.62x51"), para calibres com sufixo de
  //          unidade que não aparece no texto ("7,62X51" → "7,62×51 mm NATO").
  const nucleo = (s: string) => {
    const mm = s.match(/\d+(?:\.\d+)?x\d+r?/)      // já normalizado (× → x, , → .)
    return mm && mm[0].length >= 5 ? mm[0] : ""
  }
  const comNucleo = ordenados
    .map(x => ({ l: x.l, c: nucleo(x.n) }))
    .filter(x => x.c)
    .sort((a, b) => b.c.length - a.c.length)
  for (const { l, c } of comNucleo) if (hay.includes(c)) return l
  return ""
}

// Ajustes de grafia do GDL p/ casar com o picker do app (que compara por normCal).
// O GDL é inconsistente (".9mm Luger"=9mm; "38 Curto" sem ponto; ".32S&WL"=abreviação);
// aqui devolvemos a grafia que o app usa para o calibre ficar MARCADO no picker.
const CALIBRE_GDL_FIX: Record<string, string> = {
  "38 curto":  ".38 Curto",   // GDL sem ponto → app ".38 Curto"
  ".32s&wl":   ".32 S&W Long", // GDL abrevia o "Long"
  ".32 s&wl":  ".32 S&W Long",
}
export function corrigirCalibreGdl(cal: string): string {
  let c = (cal ?? "").trim()
  if (!c) return ""
  // ".9mm" → "9mm" (o normCal do picker não remove o ponto inicial antes do 9).
  c = c.replace(/^\.9\s*mm/i, "9mm")
  // Correções pontuais onde a grafia do GDL não casaria no picker.
  const fix = CALIBRE_GDL_FIX[c.toLowerCase().replace(/\s+/g, " ").trim()]
  return fix ?? c
}

// Lê o calibre direto do dropdown "Calibre Nominal" do GDL (fonte autoritativa),
// quando o perito o preencheu. Devolve "" se vier vazio/placeholder.
export function calibreDoDropdown(valorDropdown: string): string {
  const v = (valorDropdown ?? "").trim()
  if (!v || ehPlaceholderGdl(v)) return ""
  return corrigirCalibreGdl(v)
}

// Normaliza calibre igual ao picker do app (mantém o ponto, ignora parênteses).
// Ex.: "9 mm Luger (9×19mm)" e "9mm Luger" → "9mmluger".
function normCalApp(s: string): string {
  return (s ?? "").toLowerCase().split("(")[0]
    .replace(/×/g, "x").replace(/,/g, ".").replace(/\+p/g, "")
    .replace(/\s+/g, "").trim()
}

// ENVIO (app → GDL): devolve a string EXATA do dropdown de calibre do GDL para o
// tipo, inclusive quando o GDL está errado (ex.: 9mm no cartucho é ".9mm Luger" lá).
// Assim o dropdown do GDL aceita o valor. Se não houver equivalente, devolve como está.
export function calibreAppParaGdl(caliber: string, tipoGdl?: string): string {
  const c = (caliber ?? "").trim()
  if (!c) return ""
  const lista = calibresDoTipo(tipoGdl)
  if (!lista.length) return c
  const alvo = normCalApp(c)
  for (const gcal of lista) {
    // compara o app com a forma CORRIGIDA do GDL, mas devolve a string ORIGINAL do GDL
    if (normCalApp(corrigirCalibreGdl(gcal)) === alvo) return gcal
  }
  return c
}

// Procura, na identificação inteira, um calibre da lista oficial do GDL (por tipo).
function casarCalibreCanonico(ident: string, tipoGdl?: string): string {
  const lista = calibresDoTipo(tipoGdl)
  if (!lista.length) return ""
  const alvo = normCalibre(ident)
  // Ordena do mais longo p/ o mais curto para casar ".38SPL" antes de "38".
  const ordenados = [...lista].sort((a, b) => normCalibre(b).length - normCalibre(a).length)
  for (const cal of ordenados) {
    const nc = normCalibre(cal)
    if (nc && alvo.includes(nc)) return cal
  }
  return ""
}

function calibresDoTipo(tipoGdl?: string): string[] {
  if (!tipoGdl) return []
  const s = tipoGdl.toUpperCase()
  if (s.startsWith("REVÓLVER") || s.startsWith("REVOLVER")) return CALIBRES_GDL["REVÓLVER"] ?? []
  if (s.startsWith("PISTOLA"))                              return CALIBRES_GDL["PISTOLA"] ?? []
  if (s.startsWith("ESPINGARDA"))                           return CALIBRES_GDL["ESPINGARDA"] ?? []
  if (s.startsWith("CARTUCHO"))                             return CALIBRES_GDL["CARTUCHO"] ?? []
  return []
}

// Normalização específica de calibre: remove espaços/pontos e caixa, mantendo
// dígitos e letras. ".38 SPL" e ".38SPL" viram "38spl".
function normCalibre(s: string): string {
  return (s ?? "")
    .toLowerCase()
    .replace(/[.\s]/g, "")
    .replace(/,/g, "")
}

// ── CAMPOS POR TIPO (acabamento / funcionamento) ─────────────────────────────
// Os índices ctlNN mudam por tipo, então lemos pelo sufixo correto do tipo.

export type CamposGdl = {
  acabamento?: string; funcionamento?: string; calibreDropdown?: string
  statusSerie?: string; marcaDropdown?: string; pais?: string; tambor?: string
  estadoGeral?: string; origemColeta?: string; resultadoPSA?: string
  institucionalSim?: string; institucionalNao?: string
}

// CheckBoxList "Institucional?" do GDL → vínculo da arma no app.
// O leitor grava 'Sim' no checkbox MARCADO (e 'Não' no desmarcado).
//   SIM marcado → true (Institucional) · NÃO marcado → false (Particular)
//   Indeterminado/nenhum → null (não define)
export function institucionalGdl(simCheckbox: string, naoCheckbox: string): boolean | null {
  if ((simCheckbox ?? "").trim() === "Sim") return true
  if ((naoCheckbox ?? "").trim() === "Sim") return false
  return null
}

// GDL "Status do Número de Série" → estado do serial no app.
//   Legível → LEGÍVEL · Ilegível → PARCIAL · Não Aparente → NÃO APARENTE
//   Revelado → LEGÍVEL · Suprimido intencionalmente → SUPRIMIDO
// "Selecione"/vazio → "" (não determina). Ter qualquer status real ⇒ arma industrial.
const STATUS_SERIE_GDL_PARA_APP: Record<string, string> = {
  "legivel": "LEGÍVEL",
  "ilegivel": "PARCIAL",
  "nao aparente": "NÃO APARENTE",
  "revelado": "LEGÍVEL",
  "suprimido intencionalmente": "SUPRIMIDO",
  "suprimido": "SUPRIMIDO",
}
export function normalizarStatusSerieGdl(valor: string): string {
  return STATUS_SERIE_GDL_PARA_APP[normChave((valor ?? "").trim())] ?? ""
}

// GDL "Tambor" ("reversível para a esquerda/direita") → rebatimento do tambor no app
// ("Esquerda"/"Direita"). "Selecione"/vazio → "" (não marca). Inverso do export
// em rep_client.py (_reb_map).
export function normalizarTamborGdl(valor: string): string {
  const v = (valor ?? "").trim()
  if (!v || ehPlaceholderGdl(v)) return ""
  const k = normChave(v)
  if (k.includes("direita"))  return "Direita"
  if (k.includes("esquerda")) return "Esquerda"
  return ""
}

// Devolve o mapa de sufixos de control (ctlNN) para o tipo do GDL informado.
export function camposDoTipo(tipoGdl: string): CamposGdl {
  return (CAMPOS_GDL_POR_TIPO[tipoGdl] as CamposGdl) ?? {}
}

// GDL "Tipo Acabamento" → texto p/ o campo "Material e acabamento do quadro" do app.
// Ex.: "Cromado", "Niquelado", "Oxidado". Placeholder/"Selecione" → "".
export function normalizarAcabamentoGdl(valor: string): string {
  const v = (valor ?? "").trim()
  if (!v || ehPlaceholderGdl(v)) return ""
  return v
}

// GDL "Funcionamento" → apto para disparo (Exame de disparo).
//   "Eficiente"   → true  (apta)
//   "Ineficiente" → false (não apta)
//   "NÃO TESTADO" / "Selecione" / vazio → undefined (não determina)
export function funcionamentoParaApto(valor: string): boolean | undefined {
  // Não usa ehPlaceholderGdl aqui: "Eficiente" é placeholder no contexto de país,
  // mas é valor VÁLIDO no contexto de funcionamento.
  const k = normChave((valor ?? "").trim())
  if (k === "eficiente") return true
  if (k === "ineficiente") return false
  return undefined // "selecione", "não testado", vazio → não determina aptidão
}
