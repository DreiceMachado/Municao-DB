// Classificação técnica de arma de fogo nos 6 eixos ortogonais do diagrama.
//
// Cada eixo é uma propriedade que TODA arma de fogo tem simultaneamente — não
// uma categoria de arma. Um revólver de antecarga é um revólver (tipo) COM
// carregamento por antecarga (eixo 2); os dois convivem.
//
// Este módulo é função pura: não lê banco, não toca UI. É a única fonte de
// verdade dos eixos — o checador (scripts/check_eixos.ts) importa daqui em vez
// de reimplementar as regras, para não certificar uma cópia.
//
// Ordem de precedência: perito > ficha do catálogo > derivação > Indeterminado.
// O perito sempre vence a máquina — é laudo, não palpite.
//
// Cobertura sobre as 578 fichas do catálogo (conferir com `npm run check:eixos`,
// que roda ESTA função e valida 31 invariantes):
//   alma do cano 99,7% · carregamento 100% · funcionamento 100%
//   localização da mistura 100% · espoleta 99,7% · alimentação 90,5%
//   transmissão e mecanismo 83,7% — os 94 restantes são fichas sem
//   sistema_percussao preenchido (metralhadoras open bolt, antecargas,
//   garruchas). Falta de DADO, não de regra: preencher a ficha os leva a 100%
//   sem uma linha de código aqui.

// Extensão .ts explícita: permite que scripts/check_eixos.ts importe este módulo
// rodando em `node` puro (o Node ESM exige extensão; o Vite aceita ambos).
import { CALIBRES_RIMFIRE, CALIBRES_INDETERMINADOS } from "../data/calibresEspoleta.ts"

// ── Vocabulário dos eixos ──────────────────────────────────────────────
// "Não aplicável" ≠ "Indeterminado": o primeiro diz que a pergunta não faz
// sentido para esta peça (espoleta em arma de antecarga); o segundo diz que
// ninguém conseguiu determinar. Distinguir os dois é o que impede um laudo de
// afirmar ausência quando o que houve foi falta de exame.

export type AlmaCano = "Lisa" | "Raiada" | "Híbrida/Combinada" | "Não aplicável" | "Indeterminado"

export type SistemaCarregamento = "Antecarga" | "Retrocarga" | "Não aplicável" | "Indeterminado"

export type SistemaFuncionamento =
  | "Tiro unitário"
  | "Repetição manual"
  | "Repetição automática"
  | "Semi-automática"
  | "Automática"
  | "Não aplicável"
  | "Indeterminado"

export type PercussaoLocalizacao = "Intrínseca" | "Extrínseca" | "Não aplicável" | "Indeterminado"

export type TipoEspoleta =
  | "Central (centerfire)"
  | "Anular/radial (rimfire)"
  | "Não aplicável"
  | "Indeterminado"

export type PercussaoTransmissao = "Direta" | "Indireta" | "Não aplicável" | "Indeterminado"

// "Percussor" (o que percute) é a grafia do picker — AllPickers.tsx:291,
// "Striker-fired (percussor armado)" — e é a correta. Três grafias circulam:
// o catálogo escreve "percutor lançado", o diagrama escreve "Percursor Lançado"
// ("percursor" = precursor; é outro vocábulo). normTexto + as três variantes em
// MARCAS_PERCUSSOR casam todas; o rótulo canônico segue o picker.
export type PercussaoMecanismo =
  | "Cão (hammer-fired)"
  | "Percussor lançado (striker-fired)"
  // Metralhadoras (pesquisa de ficha técnica): não usam cão nem striker de pistola.
  // Percutor fixo: pino solidário à face do ferrolho (MAG, KPV, Lewis). Acionado:
  // pino separado disparado pelo porta-ferrolho/came ao travar (a maioria).
  | "Percutor fixo (no ferrolho)"
  | "Percutor acionado"
  | "Não aplicável"
  | "Indeterminado"

// DIVERGE DO DIAGRAMA, deliberadamente. O diagrama pendura Caixa/Tubular/Tambor
// debaixo de "Carregador Removível". Os dados dizem o contrário: das 578 fichas,
// as 211 com "tambor" são todas cilindro de revólver e as 37 com "tubular" são
// todas "sob o cano" — 248 registros (43%) que NÃO se destacam da arma.
//
// A causa: formato e fixação são eixos que se CRUZAM, não uma hierarquia. Existe
// caixa fixa (Mauser 98, Winchester 70 interno) e tambor removível (drum de
// Thompson/PPSh). Pendurar o formato sob "removível" torna a coluna "fixo"
// inexprimível. Por isso este eixo carrega SÓ a fixação; o formato continua no
// tipoCarregador[] (WeaponEntry), que já existe e já tem esses valores.
export type AlimentacaoTipo =
  | "Depósito fixo"
  | "Carregador removível"
  // Cinta/fita de munição: nem depósito fixo nem carregador removível — é o
  // terceiro modo de alimentação, típico de metralhadoras. O diagrama não o
  // prevê; a realidade exige (pesquisa de ficha técnica das 53 metralhadoras).
  | "Alimentação por cinta/fita"
  | "Não aplicável"
  | "Indeterminado"

export type Eixos = {
  almaCano: AlmaCano                          // eixo 1
  sistemaCarregamento: SistemaCarregamento    // eixo 2
  sistemaFuncionamento: SistemaFuncionamento  // eixo 3
  percussaoLocalizacao: PercussaoLocalizacao  // eixo 5a
  percussaoTipoEspoleta: TipoEspoleta         // eixo 5a → intrínseca
  percussaoTransmissao: PercussaoTransmissao  // eixo 5b
  percussaoMecanismo: PercussaoMecanismo      // eixo 5c
  alimentacaoTipo: AlimentacaoTipo            // eixo 6
}

// Fonte da derivação: o que o app já tem hoje, seja do formulário ou da ficha.
// Campos opcionais porque arma sem ficha no catálogo ainda deriva parte dos eixos.
// `| null` porque a ficha do catálogo (CatalogWeapon) usa null para campo
// ausente, e ela é a fonte natural desta derivação — quem se adapta é o
// consumidor, não a fonte. normCalibre/normTexto já tratam null.
export type EixosFonte = {
  type?: string | null             // WeaponType do app (MAIÚSCULAS)
  caliber?: string | null
  sistemaAcionamento?: string | null
  tipoRaiamento?: string | null
  tipoCarregador?: string[] | null
  // Vindos da ficha do catálogo (weaponCatalog.json)
  fichaTipo?: string | null        // ex.: "Arma de antecarga" (Capitalizado, ≠ WeaponType)
  carregadorTipo?: string | null   // texto livre da ficha, ex.: "tambor de 6 câmaras"
  tipoDescritivo?: string | null   // ex.: "Revólver de percussão (cap-and-ball), alma raiada"
  sistemaDisparo?: string | null   // texto livre da ficha
  sistemaPercussao?: string | null // texto livre da ficha, ex.: "indireta (cão aparente)"
}

// ── Normalização ───────────────────────────────────────────────────────

// Espelha norm() de scripts/verifica_picker.py, que é o normalizador de calibre
// já validado nesta casa. Descarta o trecho após "(" de propósito: no catálogo
// o parêntese carrega equivalência/variante (".22 LR (variantes .357/.44)"),
// não o calibre principal.
export function normCalibre(s?: string | null): string {
  return (s ?? "")
    .toLowerCase()
    .split("(")[0]
    .replace(/×/g, "x")
    .replace(/,/g, ".")
    .replace(/\+p/g, "")
    .replace(/\s+/g, "")
    .trim()
}

// Para texto descritivo (sistema_disparo, sistema_percussao): tira acento mas
// PRESERVA parênteses — em "indireta (cão aparente)" o parêntese é o dado.
export function normTexto(s?: string | null): string {
  return (s ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

// ── Eixo 5a: localização da mistura iniciadora ─────────────────────────

const TIPOS_ARMA_DE_FOGO: ReadonlySet<string> = new Set([
  "REVÓLVER", "PISTOLA", "PISTOLETE", "GARRUCHA", "ESPINGARDA",
  "CARABINA", "FUZIL", "METRALHADORA", "SUBMETRALHADORA", "ARMA DE ANTECARGA",
])

// Ignição anterior ao cartucho: a mistura iniciadora fica FORA da munição —
// no frasco de escorva (pederneira) ou na espoleta de percussão encaixada na
// chaminé. É a folha "Extrínseca" do diagrama, e é o que toda arma de antecarga é.
// Marcadores específicos de propósito. "roda" sozinho (por "chave de roda")
// seria solto demais e casaria qualquer palavra que contivesse "roda"; o mesmo
// vale para "percuss", que casaria "percussor armado" — as 47 pistolas striker
// do catálogo — e as classificaria como ignição histórica. Todo marcador aqui
// tem que ser inequívoco.
const MARCAS_EXTRINSECA = [
  "pederneira", "flintlock",
  "percussion cap", "percussao (percussion", "cap lock", "caplock",
  "matchlock", "chave de mecha",
  "wheellock", "wheel lock", "chave de roda",
  "polvora negra", "black powder",
]

function ehArmaDeFogo(src: EixosFonte): boolean {
  if (src.type) return TIPOS_ARMA_DE_FOGO.has(src.type)
  if (src.fichaTipo) return true // toda ficha do weaponCatalog é arma de fogo
  return false
}

function derivarLocalizacao(src: EixosFonte): PercussaoLocalizacao {
  if (!ehArmaDeFogo(src)) return "Não aplicável"

  // Antecarga ⇒ extrínseca, sempre. O tipo é o sinal mais forte.
  if (src.type === "ARMA DE ANTECARGA") return "Extrínseca"
  if (normTexto(src.fichaTipo) === "arma de antecarga") return "Extrínseca"

  // Ignição histórica declarada no sistema de disparo/acionamento.
  const disparo = normTexto(src.sistemaDisparo || src.sistemaAcionamento)
  if (disparo && MARCAS_EXTRINSECA.some((m) => disparo.includes(m))) return "Extrínseca"

  // Arma de fogo de retrocarga usa cartucho ⇒ mistura dentro do estojo.
  return "Intrínseca"
}

function derivarTipoEspoleta(src: EixosFonte, loc: PercussaoLocalizacao): TipoEspoleta {
  // Só faz sentido perguntar central/anular se a mistura está DENTRO do cartucho.
  // Numa arma de antecarga não existe espoleta a classificar — "Não aplicável"
  // é a resposta correta, e é diferente de "Indeterminado".
  if (loc !== "Intrínseca") return "Não aplicável"

  const cal = normCalibre(src.caliber)
  if (CALIBRES_INDETERMINADOS.has(cal)) return "Indeterminado"

  // Casamento por token EXATO, nunca substring: ".223rem" contém ".22" e um
  // substring classificaria fuzis 5.56 como rimfire. O "/" separa calibres
  // intercambiáveis (".22 LR / .22 WMR").
  const tokens = cal.split("/").map((t) => t.trim()).filter(Boolean)
  if (tokens.length === 0) return "Indeterminado"
  if (tokens.some((t) => CALIBRES_RIMFIRE.has(t))) return "Anular/radial (rimfire)"

  return "Central (centerfire)"
}

// ── Eixo 1: alma do cano ───────────────────────────────────────────────

function derivarAlmaCano(src: EixosFonte): AlmaCano {
  if (!ehArmaDeFogo(src)) return "Não aplicável"

  // tipoRaiamento é valor curado de picker (não texto livre), então casar por
  // substring aqui é seguro — ao contrário do tipo_descritivo logo abaixo.
  const tr = normTexto(src.tipoRaiamento)
  if (tr) {
    if (/hibrid|combinad/.test(tr)) return "Híbrida/Combinada"
    if (/lisa|sem raiamento/.test(tr)) return "Lisa"
    if (/raiamento|raiad|microgroove/.test(tr)) return "Raiada"
    // "Indeterminado" cai fora e vira Indeterminado, como deve.
  }

  // Fallback para as 24 antecargas, que não têm tipo_raiamento: a alma está
  // escrita no descritivo ("Mosquete de percussão de alma lisa").
  //
  // ARMADILHA: procurar "hibrid"/"combinad" AQUI classificaria a Taurus G3X
  // ("Pistola semiautomática (compacta, configuração híbrida)") como alma
  // combinada — "híbrida" ali é a armação, ferrolho compacto com punho
  // full-size, e não tem relação com o cano. Nenhuma das 578 fichas descreve
  // alma híbrida de verdade; por isso só casamos "alma lisa"/"alma raiada",
  // que são inequívocos.
  const td = normTexto(src.tipoDescritivo)
  if (td.includes("alma lisa")) return "Lisa"
  if (td.includes("alma raiada")) return "Raiada"

  return "Indeterminado"
}

// ── Eixo 2: sistema de carregamento ────────────────────────────────────

// Este eixo é uma PROPRIEDADE de toda arma, não uma categoria de arma. Um Colt
// 1851 Navy é um REVÓLVER (tipo) com carregamento por ANTECARGA (este eixo) —
// os dois convivem. No app, "ARMA DE ANTECARGA" é um WeaponType e continua
// sendo (o REP/GDL depende dele, mapeado para "OUTROS" em rep_client.py:34);
// este campo é aditivo e responde outra pergunta.
function derivarCarregamento(src: EixosFonte): SistemaCarregamento {
  if (!ehArmaDeFogo(src)) return "Não aplicável"

  // O tipo é o sinal forte e tem precedência.
  if (src.type === "ARMA DE ANTECARGA") return "Antecarga"
  if (normTexto(src.fichaTipo) === "arma de antecarga") return "Antecarga"

  // Ignição histórica é sinal FRACO aqui, e de propósito: antecarga implica
  // extrínseca, mas o inverso é FALSO. A carabina Sharps 1859 carrega pela
  // culatra e usa espoleta de percussão — retrocarga COM ignição extrínseca.
  // É precisamente por isso que o diagrama separa os eixos 2 e 5a. Hoje o
  // catálogo não tem nenhum caso desses (há invariante no checador vigiando);
  // se passar a ter, esta linha é a primeira a revisar.
  const disparo = normTexto(src.sistemaDisparo || src.sistemaAcionamento)
  if (disparo && MARCAS_EXTRINSECA.some((m) => disparo.includes(m))) return "Antecarga"

  // Arma de fogo que não é antecarga carrega pela culatra.
  return "Retrocarga"
}

// ── Eixo 3: sistema de funcionamento ───────────────────────────────────
//
// Este é o eixo que o app hoje NÃO tem, e a razão é visível no catálogo: o campo
// sistema_disparo (→ sistemaAcionamento) mistura três eixos ortogonais. O mesmo
// valor "Ação simples (SA)" descreve 25 revólveres (repetição manual), 17
// pistolas (semi-automáticas) e 5 garruchas (tiro unitário). O gatilho não
// determina o funcionamento — só o tipo desambigua. São 275 fichas assim.
//
// Taxonomia do diagrama: Funcionamento → {Tiro unitário, Repetição, Semi-auto,
// Automática}, e Repetição → {Manual, Automática}. "Repetição automática" não é
// derivada aqui: semi-automática e automática já são as formas específicas dela.

// Valores de sistema_disparo que determinam o funcionamento SOZINHOS, sem o tipo.
// Chaves normalizadas por normTexto(). Casamento por igualdade EXATA, nunca por
// substring — ver a armadilha do "seletivo" logo abaixo.
const FUNCIONAMENTO_POR_DISPARO: Record<string, SistemaFuncionamento> = {
  "alavanca (lever-action)": "Repetição manual",
  "ferrolho giratorio (bolt-action)": "Repetição manual",
  "ferrolho deslizante (pump-action)": "Repetição manual",
  "tambor de revolver (sa/da)": "Repetição manual",
  "semi-automatico": "Semi-automática",
  "semi-automatico (autocarregavel)": "Semi-automática",
  "striker-fired (percussor armado)": "Semi-automática",
  "semi/automatico seletivo": "Automática",
  "automatico (open bolt)": "Automática",
  "tiro a tiro (single-shot)": "Tiro unitário",
  "canos tombantes (break-action)": "Tiro unitário",
  "duplo gatilho": "Tiro unitário",
  // ARMADILHA: "Gatilho seletivo" NÃO é seletor de rajada. As 4 fichas com este
  // valor são espingardas de dois canos (Stoeger Coach Gun/Condor/Uplander, Khan
  // SULTAN) onde o gatilho seleciona QUAL CANO dispara. Casar por substring
  // "seletivo" classificaria espingardas de caça como automáticas — num laudo.
  // Só "Semi/automático seletivo" (fuzil/submetralhadora) é seletor de tiro.
  "gatilho seletivo": "Tiro unitário",
}

// Usado só quando sistema_disparo descreve apenas o GATILHO (SA/DA/DA-SA/DAO) e
// portanto não diz nada sobre o funcionamento. PISTOLETE fica de fora de
// propósito: costuma ser artesanal de tiro unitário, mas varia — sem ficha no
// catálogo para confirmar, "Indeterminado" é mais honesto que um chute.
const FUNCIONAMENTO_POR_TIPO: Record<string, SistemaFuncionamento> = {
  "REVÓLVER": "Repetição manual",
  "PISTOLA": "Semi-automática",
  "GARRUCHA": "Tiro unitário",
  "METRALHADORA": "Automática",
  "SUBMETRALHADORA": "Automática",
}

function derivarFuncionamento(src: EixosFonte, carregamento: SistemaCarregamento): SistemaFuncionamento {
  // Taser/stun gun não tem sistema de funcionamento de arma de fogo — a pergunta
  // não se aplica, e isso é diferente de "não foi possível determinar".
  if (!ehArmaDeFogo(src)) return "Não aplicável"

  const disparo = normTexto(src.sistemaDisparo || src.sistemaAcionamento)

  // 1) O disparo resolve sozinho.
  const porDisparo = FUNCIONAMENTO_POR_DISPARO[disparo]
  if (porDisparo) return porDisparo

  // 2) Antecarga: o disparo só diz a ignição (pederneira/espoleta), nunca o
  //    funcionamento. O sinal está no tipo_descritivo da ficha — os 24 registros
  //    se dividem em 12 "Revólver de percussão" (tambor ⇒ repetição manual) e 12
  //    mosquetes/rifles/pistolas (⇒ tiro unitário). Sem ficha, o perito decide.
  if (carregamento === "Antecarga") {
    const desc = normTexto(src.tipoDescritivo)
    if (!desc) return "Indeterminado"
    if (desc.startsWith("revolver")) return "Repetição manual"
    // Antecarga que não é revólver é de tiro unitário: sem tambor nem depósito,
    // cada disparo exige recarregar pela boca do cano.
    return "Tiro unitário"
  }

  // 3) O disparo só descreve o gatilho — só o tipo desambigua.
  const porTipo = src.type ? FUNCIONAMENTO_POR_TIPO[src.type] : undefined
  if (porTipo) return porTipo

  return "Indeterminado"
}

// ── Eixos 5b e 5c: transmissão do movimento e mecanismo percutor ───────

// O catálogo funde os dois eixos numa string só ("indireta (cão aparente)"),
// porque no vocabulário dele eles andam juntos: direta ⟺ percutor lançado,
// indireta ⟺ cão. O diagrama os separa, e com razão — são perguntas distintas
// (ver a nota sobre antecarga no relatório da Etapa 2). Aqui fazemos o split.

// ATENÇÃO: estes marcadores são comparados contra texto JÁ normalizado por
// normTexto(), que remove acentos. Portanto devem ser escritos na forma
// normalizada — "cão" aqui seria marcador morto, nunca casaria com "cao".
//
// Grafias aceitas de "percussor": o catálogo usa "percutor", o picker
// "percussor", o diagrama "percursor". Todas apontam para a mesma peça.
const MARCAS_PERCUSSOR = ["percutor", "percussor", "percursor", "striker"]
// "caes" cobre o plural: o catálogo tem "indireta (dois cães externos)" em 6
// fichas (garruchas e espingardas de dois canos), e "cães"→"caes" não contém "cao".
const MARCAS_CAO = ["cao", "caes", "hammer"]

// Marcadores por FRONTEIRA DE PALAVRA, não substring. "cao" solto casaria
// "ignicao" (de "ignição por pederneira") e classificaria a pederneira como Cão —
// o bug que motivou isto. \bcao\b só casa "cao" como palavra inteira.
const RE_CAO = new RegExp(`\\b(${MARCAS_CAO.join("|")})\\b`)
const RE_PERCUSSOR = new RegExp(`\\b(${MARCAS_PERCUSSOR.join("|")})\\b`)

// Pederneira/flintlock: ignição por faísca de sílex, não percussão de cartucho.
// Os eixos de transmissão e percutor não se aplicam a ela.
function ehPederneira(src: EixosFonte): boolean {
  const t = normTexto(src.sistemaPercussao) + " " + normTexto(src.sistemaDisparo || src.sistemaAcionamento)
  return /pederneira|flintlock/.test(t)
}

function derivarTransmissao(src: EixosFonte, loc: PercussaoLocalizacao): PercussaoTransmissao {
  if (!ehArmaDeFogo(src)) return "Não aplicável"

  const sp = normTexto(src.sistemaPercussao)
  if (sp.startsWith("direta")) return "Direta"
  if (sp.startsWith("indireta")) return "Indireta"

  // Pederneira: sílex, não percussão de cartucho.
  if (ehPederneira(src)) return "Não aplicável"

  // Sem ficha: o picker declara striker-fired direto no sistema de acionamento.
  const disparo = normTexto(src.sistemaDisparo || src.sistemaAcionamento)
  if (RE_PERCUSSOR.test(disparo)) return "Direta"

  // Antecarga: deliberadamente NÃO derivado. Ver relatório da Etapa 2 — num
  // sistema de espoleta de percussão o cão golpeia a espoleta sem percussor
  // intermediário, o que quebra a equivalência direta⟺percutor do catálogo.
  // É decisão de perito, não de regex.
  if (loc === "Extrínseca") return "Indeterminado"

  return "Indeterminado"
}

function derivarMecanismo(src: EixosFonte): PercussaoMecanismo {
  if (!ehArmaDeFogo(src)) return "Não aplicável"

  // Pederneira: sílex, sem cão de percussão nem percutor de cartucho.
  if (ehPederneira(src)) return "Não aplicável"

  const sp = normTexto(src.sistemaPercussao)
  // "percutor fixo" e "percutor acionado" antes de RE_PERCUSSOR: os dois contêm
  // "percutor", que casaria como striker. São os mecanismos de metralhadora.
  if (/percutor fixo|fixo (na face|no ferrolho)/.test(sp)) return "Percutor fixo (no ferrolho)"
  if (/percutor acionado|\bacionad/.test(sp)) return "Percutor acionado"
  if (RE_CAO.test(sp)) return "Cão (hammer-fired)"
  if (RE_PERCUSSOR.test(sp)) return "Percussor lançado (striker-fired)"

  const disparo = normTexto(src.sistemaDisparo || src.sistemaAcionamento)
  if (RE_PERCUSSOR.test(disparo)) return "Percussor lançado (striker-fired)"

  return "Indeterminado"
}

// ── Eixo 6: sistema de alimentação (só a fixação — ver AlimentacaoTipo) ─

function derivarAlimentacao(
  src: EixosFonte,
  carregamento: SistemaCarregamento,
  funcionamento: SistemaFuncionamento,
): AlimentacaoTipo {
  if (!ehArmaDeFogo(src)) return "Não aplicável"

  // Revólver: o tambor É o depósito e não se destaca — vale pela definição do
  // tipo. Não dá para ler tipoCarregador aqui: o picker de REVÓLVER só oferece
  // "Jetloader" (AllPickers.tsx:222), que é acessório de recarga rápida, não o
  // depósito. Lê-lo como carregador seria confundir acessório com arma.
  if (src.type === "REVÓLVER") return "Depósito fixo"

  // A DECLARAÇÃO EXPLÍCITA DO CARREGADOR VEM ANTES DA INFERÊNCIA PELO
  // FUNCIONAMENTO, e isso não é estilo — é defesa contra dado ruim. Dez fichas
  // do catálogo (Remington 870, Mossberg 500/590/835, Maverick 88, CBC 586…)
  // declaram sistema_disparo = "Canos tombantes (break-action)" sendo pump-action,
  // e ao mesmo tempo declaram "tubular sob o cano" com 4 a 8 cartuchos. As duas
  // afirmações são incompatíveis: báscula de tiro unitário não tem carregador
  // tubular. Confiar no funcionamento inferido daria "Não aplicável" para uma
  // Remington 870. carregador_tipo é observação física direta; sistema_disparo,
  // neste caso, está errado. O checador denuncia as 10 (ver diagnóstico).
  const t = normTexto([src.carregadorTipo ?? "", ...(src.tipoCarregador ?? [])].join(" "))

  if (t) {
    // Conflito real: a ficha declara as duas fixações ("interno (caixa) ou
    // destacável" — Winchester Model 70, que existe nas duas variantes). Só isto
    // é ambíguo; NÃO basta procurar " ou ", porque em "caixa metálica ou
    // polímero" o ou é de material, em "reto destacável (10 ou 20)" é de
    // capacidade e em "curvo de 35 ou tambor de 71" é de formato — as três são
    // removíveis, e uma regra baseada em " ou " estragaria 4 fichas boas.
    // "tubos"/"tubo" além de "tubular": a Kel-Tec KSG traz "dois tubos sob o
    // trilho (7+7), seletor manual" — tubos fixos que a palavra "tubular" não
    // alcança.
    const temFixo = /interno|integrado fixo|fixo interno|tubular|\btubos?\b/.test(t)
    const temRemovivel = /destacavel|removivel/.test(t)
    if (temFixo && temRemovivel) return "Indeterminado"

    // "tambor" é a palavra mais traiçoeira do eixo: significa o CILINDRO de um
    // revólver (fixo) e o DRUM de uma submetralhadora (removível) — o diagrama
    // funde os dois em "Tambor - Cylinder/Drum". O desambiguador NÃO é o tipo:
    // a Rossi Circuit Judge é uma CARABINA com "tambor (cilindro) de 5 câmaras".
    // É a palavra "câmara" que separa: 209 fichas dizem cilindro, 2 dizem drum.
    if (t.includes("tambor") && t.includes("camara")) return "Depósito fixo"

    // Carga direta na câmara, declarada: "câmara única", "1 cartucho por cano",
    // "dois canos sobrepostos". Não há depósito a classificar. Vem antes dos
    // formatos porque "canos" não é carregador nenhum.
    if (/camara unica|nao aplicavel|carga direta|por cano|dois canos|canos justapostos|canos sobrepostos/.test(t)) {
      return "Não aplicável"
    }

    // Cinta/fita de munição e tira rígida (feed strip): o terceiro modo. Vem
    // antes de tudo porque "cinta" não é nem fixo nem removível. As tiras
    // rígidas do Hotchkiss/Breda são o mesmo conceito (munição em suporte
    // externo consumível), agrupadas aqui.
    if (/cinta|fita|tira rigida|feed strip/.test(t)) return "Alimentação por cinta/fita"

    if (temRemovivel || /stanag|p-mag/.test(t)) return "Carregador removível"
    if (/tubular|\btubos?\b/.test(t)) return "Depósito fixo"
    if (/interno|integrado fixo|fixo interno/.test(t)) return "Depósito fixo"
    if (/tambor|drum/.test(t)) return "Carregador removível"
    // Prato (pan) e caixa: carregadores removíveis (DP-27, Lewis, Bren, BAR…).
    if (/prato|\bpan\b|caixa|reto|curvo|bifilar|monofilar|rotativo|duplo acoplado/.test(t)) {
      return "Carregador removível"
    }
  }

  // Revólver de antecarga (cap-and-ball): tem tambor fixo, mas a ficha não traz
  // carregador_tipo em nenhum dos 24 registros — o sinal está no descritivo.
  if (carregamento === "Antecarga" && normTexto(src.tipoDescritivo).startsWith("revolver")) {
    return "Depósito fixo"
  }

  // Fallback: sem nenhuma declaração de carregador, uma arma de tiro unitário
  // não tem depósito — cada disparo exige carga direta na câmara. Cobre as
  // garruchas de cano tombante (cuja ficha não traz carregador) e os 12
  // mosquetes de antecarga. O picker já reconhece isso: GARRUCHA tem a opção
  // "Não aplicável (carga direta)" em AllPickers.tsx:268.
  if (funcionamento === "Tiro unitário") return "Não aplicável"

  return "Indeterminado"
}

// ── API ────────────────────────────────────────────────────────────────

export function derivarEixos(src: EixosFonte): Eixos {
  const percussaoLocalizacao = derivarLocalizacao(src)
  const sistemaCarregamento = derivarCarregamento(src)
  const sistemaFuncionamento = derivarFuncionamento(src, sistemaCarregamento)
  return {
    almaCano: derivarAlmaCano(src),
    sistemaCarregamento,
    sistemaFuncionamento,
    percussaoLocalizacao,
    percussaoTipoEspoleta: derivarTipoEspoleta(src, percussaoLocalizacao),
    // DECISÃO (ponto 3): transmissão e mecanismo continuam sendo DOIS campos,
    // embora hoje sejam 100% redundantes no catálogo — só existem os pares
    // "Indireta+Cão" (321) e "Direta+Percussor lançado" (143), porque o
    // vocabulário do catálogo trata direta como sinônimo de percutor lançado.
    // A redundância é artefato do vocabulário, não da realidade: um cão que
    // golpeia a espoleta diretamente (antecarga de percussão) seria "Direta+Cão"
    // e quebraria a equivalência. Modelar a realidade envelhece melhor do que
    // modelar os dados de hoje; e desfazer depois é remover um campo, enquanto
    // separar depois seria migração. Na UI os dois são preenchidos por um picker
    // só, com o vocabulário fundido que o perito já reconhece.
    // NÃO "simplifique" unindo os dois sem antes reler esta nota.
    percussaoTransmissao: derivarTransmissao(src, percussaoLocalizacao),
    percussaoMecanismo: derivarMecanismo(src),
    alimentacaoTipo: derivarAlimentacao(src, sistemaCarregamento, sistemaFuncionamento),
  }
}
