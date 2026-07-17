// Checador de cobertura dos 6 eixos de classificação (diagrama de arma de fogo).
//
// Roda derivarEixos() — a MESMA função que o app usa — sobre os 578 registros do
// weaponCatalog.json e reporta, por eixo: quantos foram classificados e quais
// valores de origem não casaram com regra nenhuma. A lista de não-casados é o
// produto principal: é ela que diz o que consertar.
//
// Importa a função real de propósito. Um checador que reimplementasse as regras
// certificaria a cópia, não o código que roda em produção.
//
// Uso:  npm run check:eixos
// (Node 24 faz type-stripping nativo; scripts/ fica fora do tsc -b, por isso o
//  import abaixo pode levar a extensão .ts explícita que o Node exige.)

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { derivarEixos, type EixosFonte, type Eixos } from "../src/lib/eixos.ts"

const AQUI = dirname(fileURLToPath(import.meta.url))
const CATALOGO = resolve(AQUI, "../public/data/weaponCatalog.json")

type Ficha = {
  tipo?: string
  marca?: string
  modelo?: string
  tipo_descritivo?: string
  calibre_nominal?: string
  sistema_disparo?: string
  sistema_percussao?: string
  tipo_raiamento?: string
  carregador_tipo?: string
  carregador_capacidade?: number
}

// Espelha TIPO_BALISTICADB_PARA_CATALOGO de useWeaponCatalog.ts, ao contrário:
// a ficha traz o tipo Capitalizado, o app usa MAIÚSCULAS.
const TIPO_FICHA_PARA_APP: Record<string, string> = {
  "Revólver": "REVÓLVER",
  "Pistola": "PISTOLA",
  "Pistolete": "PISTOLETE",
  "Garrucha": "GARRUCHA",
  "Espingarda": "ESPINGARDA",
  "Carabina": "CARABINA",
  "Fuzil": "FUZIL",
  "Metralhadora": "METRALHADORA",
  "Submetralhadora": "SUBMETRALHADORA",
  "Arma de antecarga": "ARMA DE ANTECARGA",
  "Arma de choque": "ARMA DE CHOQUE",
  "Arma de pressão": "ARMA DE PRESSÃO",
}

function fichaParaFonte(f: Ficha): EixosFonte {
  return {
    type: f.tipo ? TIPO_FICHA_PARA_APP[f.tipo] : undefined,
    caliber: f.calibre_nominal,
    tipoRaiamento: f.tipo_raiamento,
    fichaTipo: f.tipo,
    tipoDescritivo: f.tipo_descritivo,
    carregadorTipo: f.carregador_tipo,
    sistemaDisparo: f.sistema_disparo,
    sistemaPercussao: f.sistema_percussao,
  }
}

// Eixos já implementados. Os demais são stubs das Etapas 3-6 e reportá-los como
// "0% de cobertura" seria ruído — a lista cresce a cada etapa.
const EIXOS_ATIVOS: Array<keyof Eixos> = [
  "almaCano",
  "sistemaCarregamento",
  "sistemaFuncionamento",
  "percussaoLocalizacao",
  "percussaoTipoEspoleta",
  "percussaoTransmissao",
  "percussaoMecanismo",
  "alimentacaoTipo",
]

// Qual campo da ficha explica o não-casamento de cada eixo. Sem isso a lista de
// não-casados mostraria "calibre" para um eixo de percussão — inútil para consertar.
const ORIGEM_POR_EIXO: Partial<Record<keyof Eixos, (f: Ficha) => string>> = {
  almaCano: (f) => `tipo=${f.tipo} | raiamento=${f.tipo_raiamento ?? "<vazio>"} | desc=${f.tipo_descritivo ?? "<vazio>"}`,
  sistemaCarregamento: (f) => `tipo=${f.tipo} | disparo=${f.sistema_disparo ?? "<vazio>"}`,
  sistemaFuncionamento: (f) =>
    `tipo=${f.tipo} | disparo=${f.sistema_disparo ?? "<vazio>"} | desc=${f.tipo_descritivo ?? "<vazio>"}`,
  percussaoLocalizacao: (f) => `tipo=${f.tipo} | disparo=${f.sistema_disparo ?? "<vazio>"}`,
  percussaoTipoEspoleta: (f) => `tipo=${f.tipo} | calibre=${f.calibre_nominal ?? "<vazio>"}`,
  percussaoTransmissao: (f) =>
    `tipo=${f.tipo} | percussao=${f.sistema_percussao ?? "<vazio>"} | disparo=${f.sistema_disparo ?? "<vazio>"}`,
  percussaoMecanismo: (f) =>
    `tipo=${f.tipo} | percussao=${f.sistema_percussao ?? "<vazio>"} | disparo=${f.sistema_disparo ?? "<vazio>"}`,
  alimentacaoTipo: (f) => `tipo=${f.tipo} | carregador=${f.carregador_tipo ?? "<vazio>"}`,
}

// Um eixo "não classificado" é o que caiu em Indeterminado. "Não aplicável" é
// classificação legítima (a pergunta não se aplica àquela peça), não falha.
const NAO_CLASSIFICADO = "Indeterminado"

const fichas: Ficha[] = JSON.parse(readFileSync(CATALOGO, "utf-8"))

console.log(`\ncatálogo: ${fichas.length} registros — ${CATALOGO}\n`)

let falhas = 0

for (const eixo of EIXOS_ATIVOS) {
  const dist = new Map<string, number>()
  const naoCasados = new Map<string, number>()

  for (const f of fichas) {
    const valor = String(derivarEixos(fichaParaFonte(f))[eixo])
    dist.set(valor, (dist.get(valor) ?? 0) + 1)
    if (valor === NAO_CLASSIFICADO) {
      const origem = (ORIGEM_POR_EIXO[eixo] ?? ((f: Ficha) => `tipo=${f.tipo}`))(f)
      naoCasados.set(origem, (naoCasados.get(origem) ?? 0) + 1)
    }
  }

  const indet = dist.get(NAO_CLASSIFICADO) ?? 0
  const ok = fichas.length - indet
  const pct = ((ok / fichas.length) * 100).toFixed(1)
  falhas += indet

  console.log(`### ${eixo}: ${ok}/${fichas.length} classificados (${pct}%)`)
  for (const [v, n] of [...dist].sort((a, b) => b[1] - a[1])) {
    console.log(`     ${String(n).padStart(4)}  ${v}`)
  }
  if (naoCasados.size) {
    console.log(`     ── não casados (${naoCasados.size} origens distintas):`)
    for (const [o, n] of [...naoCasados].sort((a, b) => b[1] - a[1])) {
      console.log(`     ${String(n).padStart(4)}  ${o}`)
    }
  }
  console.log()
}

// Invariantes: verdades que eu sei de antemão. Se uma quebrar, a regra está
// errada — e o número sozinho não denunciaria, porque a cobertura continuaria alta.
console.log("### invariantes")
const inv: Array<[string, () => boolean]> = [
  [
    "toda arma de antecarga é extrínseca",
    () => fichas.filter((f) => f.tipo === "Arma de antecarga")
      .every((f) => derivarEixos(fichaParaFonte(f)).percussaoLocalizacao === "Extrínseca"),
  ],
  [
    "toda arma de antecarga tem espoleta 'Não aplicável'",
    () => fichas.filter((f) => f.tipo === "Arma de antecarga")
      .every((f) => derivarEixos(fichaParaFonte(f)).percussaoTipoEspoleta === "Não aplicável"),
  ],
  [
    "nenhum 5.56/.223 PRIMÁRIO é rimfire (armadilha do substring: '.223' contém '.22')",
    // Testa o calibre primário (antes do parêntese), que é o que a regra examina.
    // Varrer a string bruta acusaria ".22 LR (variantes em .223 Rem...)", que é um
    // .22 LR rimfire legítimo cujo parêntese só lista variantes de outro modelo.
    // Ainda tem dentes: se a regra voltasse a casar por substring, ".223rem"
    // casaria ".22" e este invariante quebraria.
    () => fichas.filter((f) => /^\s*(5[.,]56|\.223)/.test(f.calibre_nominal ?? ""))
      .every((f) => derivarEixos(fichaParaFonte(f)).percussaoTipoEspoleta !== "Anular/radial (rimfire)"),
  ],
  [
    "todo .22 LR é rimfire",
    () => fichas.filter((f) => (f.calibre_nominal ?? "").startsWith(".22 LR"))
      .every((f) => derivarEixos(fichaParaFonte(f)).percussaoTipoEspoleta === "Anular/radial (rimfire)"),
  ],
  [
    "arma de choque não recebe eixo de arma de fogo",
    () => fichas.filter((f) => f.tipo === "Arma de choque")
      .every((f) => derivarEixos(fichaParaFonte(f)).percussaoLocalizacao === "Não aplicável"),
  ],
  // ── Etapa 2 ──
  [
    "TODA ficha com sistema_percussao preenchido deriva transmissão E mecanismo",
    // O gate prometido da Etapa 2: 464/464. É o teste que justifica a etapa.
    () => fichas.filter((f) => f.sistema_percussao)
      .every((f) => {
        const e = derivarEixos(fichaParaFonte(f))
        return e.percussaoTransmissao !== "Indeterminado" && e.percussaoMecanismo !== "Indeterminado"
      }),
  ],
  [
    "'indireta (...)' ⇒ Indireta + Cão",
    () => fichas.filter((f) => (f.sistema_percussao ?? "").startsWith("indireta"))
      .every((f) => {
        const e = derivarEixos(fichaParaFonte(f))
        return e.percussaoTransmissao === "Indireta" && e.percussaoMecanismo === "Cão (hammer-fired)"
      }),
  ],
  [
    "'direta (percutor lançado)' ⇒ Direta + Percussor lançado",
    () => fichas.filter((f) => (f.sistema_percussao ?? "").startsWith("direta"))
      .every((f) => {
        const e = derivarEixos(fichaParaFonte(f))
        return e.percussaoTransmissao === "Direta"
          && e.percussaoMecanismo === "Percussor lançado (striker-fired)"
      }),
  ],
  // ── Etapa 3 ──
  [
    "exatamente os 24 registros 'Arma de antecarga' são Antecarga — nem um a mais",
    // O gate prometido da Etapa 3. O "nem um a mais" é a metade que importa:
    // uma regra frouxa (ex.: marcador "percuss") classificaria as 47 pistolas
    // striker como antecarga e a contagem sozinha não denunciaria.
    () => {
      const antecarga = fichas.filter(
        (f) => derivarEixos(fichaParaFonte(f)).sistemaCarregamento === "Antecarga",
      )
      return antecarga.length === 24 && antecarga.every((f) => f.tipo === "Arma de antecarga")
    },
  ],
  [
    "toda arma de fogo não-antecarga é Retrocarga (nenhuma fica Indeterminado)",
    () => fichas.filter((f) => f.tipo !== "Arma de antecarga" && f.tipo !== "Arma de choque")
      .every((f) => derivarEixos(fichaParaFonte(f)).sistemaCarregamento === "Retrocarga"),
  ],
  // ── Etapa 4 ──
  [
    "ARMADILHA: as 4 espingardas 'Gatilho seletivo' NÃO são automáticas",
    // Gatilho seletivo em espingarda de 2 canos = seletor de CANO, não de rajada.
    // Casar por substring "seletivo" as classificaria como metralhadoras — num
    // laudo pericial. É o erro mais grave que este eixo pode cometer.
    () => fichas.filter((f) => f.sistema_disparo === "Gatilho seletivo")
      .every((f) => derivarEixos(fichaParaFonte(f)).sistemaFuncionamento === "Tiro unitário"),
  ],
  [
    "'Semi/automático seletivo' (esse sim seletor de tiro) ⇒ Automática",
    () => fichas.filter((f) => f.sistema_disparo === "Semi/automático seletivo")
      .every((f) => derivarEixos(fichaParaFonte(f)).sistemaFuncionamento === "Automática"),
  ],
  [
    "sobrecarga: 'Ação simples (SA)' gera funcionamentos DIFERENTES por tipo",
    // A tese que justifica o eixo existir. Se algum dia isto passar a dar um só
    // valor, ou a regra quebrou, ou o campo deixou de ser sobrecarregado.
    () => {
      const vals = new Set(
        fichas.filter((f) => f.sistema_disparo === "Ação simples (SA)")
          .map((f) => derivarEixos(fichaParaFonte(f)).sistemaFuncionamento),
      )
      return vals.size >= 3
    },
  ],
  [
    "todo revólver (retrocarga) é Repetição manual",
    () => fichas.filter((f) => f.tipo === "Revólver")
      .every((f) => derivarEixos(fichaParaFonte(f)).sistemaFuncionamento === "Repetição manual"),
  ],
  [
    "toda metralhadora é Automática",
    () => fichas.filter((f) => f.tipo === "Metralhadora")
      .every((f) => derivarEixos(fichaParaFonte(f)).sistemaFuncionamento === "Automática"),
  ],
  [
    "as 24 antecargas dividem em 12 revólveres (repetição) + 12 tiro unitário",
    () => {
      const ac = fichas.filter((f) => f.tipo === "Arma de antecarga")
        .map((f) => derivarEixos(fichaParaFonte(f)).sistemaFuncionamento)
      return ac.filter((v) => v === "Repetição manual").length === 12
        && ac.filter((v) => v === "Tiro unitário").length === 12
    },
  ],
  // ── Etapa 6 ──
  [
    "as 33 'Alma lisa (sem raiamento)' derivam Lisa",
    () => fichas.filter((f) => f.tipo_raiamento === "Alma lisa (sem raiamento)")
      .every((f) => derivarEixos(fichaParaFonte(f)).almaCano === "Lisa"),
  ],
  [
    "todo 'Raiamento *' e Microgroove derivam Raiada (501 fichas)",
    () => fichas.filter((f) => /^Raiamento|Microgroove/.test(f.tipo_raiamento ?? ""))
      .every((f) => derivarEixos(fichaParaFonte(f)).almaCano === "Raiada"),
  ],
  [
    "as 22 antecargas que declaram alma no descritivo derivam (17 raiadas + 5 lisas)",
    // Elas não têm tipo_raiamento; o sinal está em "Mosquete de percussão de
    // alma lisa". As outras 2 (revólveres confederados) não declaram nada.
    () => {
      const ac = fichas.filter((f) => f.tipo === "Arma de antecarga")
        .map((f) => derivarEixos(fichaParaFonte(f)).almaCano)
      return ac.filter((v) => v === "Raiada").length === 17
        && ac.filter((v) => v === "Lisa").length === 5
        && ac.filter((v) => v === "Indeterminado").length === 2
    },
  ],
  [
    "ARMADILHA: 'configuração híbrida' (Taurus G3X) NÃO é alma Híbrida",
    // "híbrida" no descritivo é a ARMAÇÃO (ferrolho compacto + punho full-size),
    // não o cano. Nenhuma das 578 fichas descreve alma híbrida de verdade —
    // este eixo só recebe Híbrida/Combinada pela mão do perito.
    () => {
      const g3x = fichas.find((f) => f.modelo === "G3X")
      return !!g3x && derivarEixos(fichaParaFonte(g3x)).almaCano === "Raiada"
    },
  ],
  [
    "nenhuma ficha do catálogo deriva Híbrida/Combinada",
    () => fichas.every((f) => derivarEixos(fichaParaFonte(f)).almaCano !== "Híbrida/Combinada"),
  ],
  // ── Etapa 5 (ponto 1: divergência deliberada do diagrama) ──
  [
    "DIVERGÊNCIA: todo tambor de revólver é Depósito FIXO (o diagrama diz removível)",
    // 208 revólveres + a Rossi Circuit Judge (carabina-revólver). O diagrama
    // pendura Tambor sob "Carregador Removível"; um tambor de revólver não se
    // destaca. Este invariante é a divergência escrita como teste.
    () => fichas.filter((f) => (f.carregador_tipo ?? "").toLowerCase().includes("tambor")
      && (f.carregador_tipo ?? "").toLowerCase().includes("câmara"))
      .every((f) => derivarEixos(fichaParaFonte(f)).alimentacaoTipo === "Depósito fixo"),
  ],
  [
    "DIVERGÊNCIA: tubular/tubos sob o cano é Depósito FIXO (o diagrama diz removível)",
    // Exclui as fichas que declaram variante destacável: nelas o modelo existe
    // nas duas fixações e Indeterminado é a resposta honesta — mesmo caso da
    // Winchester 70. O invariante antes afirmava mais do que os dados sustentam.
    () => fichas.filter((f) => {
      const c = (f.carregador_tipo ?? "").toLowerCase()
      return /tubular|\btubos?\b/.test(c) && !/destac|remov/.test(c)
    }).every((f) => derivarEixos(fichaParaFonte(f)).alimentacaoTipo === "Depósito fixo"),
  ],
  [
    "a Kel-Tec KSG ('dois tubos sob o trilho') é fixa — 'tubos' ≠ 'tubular'",
    // O gate pegou esta: a regex procurava só "tubular" e a ficha diz "tubos".
    () => {
      const ksg = fichas.find((f) => /dois tubos/.test(f.carregador_tipo ?? ""))
      return !!ksg && derivarEixos(fichaParaFonte(ksg)).alimentacaoTipo === "Depósito fixo"
    },
  ],
  [
    "conflito de fixação por VARIANTE também fica Indeterminado, não só a W70",
    // Minha sondagem de " ou " não achou esta ficha porque ela escreve "(ou " —
    // parêntese antes. Duas fichas têm conflito real, não uma.
    () => {
      const v = fichas.find((f) => /tubular sob o cano \(ou caixa destac/.test(f.carregador_tipo ?? ""))
      return !!v && derivarEixos(fichaParaFonte(v)).alimentacaoTipo === "Indeterminado"
    },
  ],
  [
    "a Rossi Circuit Judge (CARABINA com cilindro) é fixa — não vale desambiguar por tipo",
    // O caso que prova que o desambiguador de "tambor" tem que ser a palavra
    // "câmara", e não `type === "REVÓLVER"`.
    () => {
      const cj = fichas.find((f) => f.modelo === "Circuit Judge")
      return !!cj && derivarEixos(fichaParaFonte(cj)).alimentacaoTipo === "Depósito fixo"
    },
  ],
  [
    "os 2 drums de submetralhadora (Thompson, PPSh) são REMOVÍVEIS",
    // A outra metade de "tambor": sem "câmara", é drum, e drum se destaca.
    () => fichas.filter((f) => f.tipo === "Submetralhadora"
      && (f.carregador_tipo ?? "").toLowerCase().includes("tambor"))
      .every((f) => derivarEixos(fichaParaFonte(f)).alimentacaoTipo === "Carregador removível"),
  ],
  [
    "a Winchester Model 70 ('interno (caixa) ou destacável') fica Indeterminada",
    // Único conflito real de fixação no catálogo. As outras 4 fichas com " ou "
    // (material, capacidade, formato) NÃO podem cair aqui.
    () => {
      const w70 = fichas.find((f) => f.modelo === "Model 70")
      return !!w70 && derivarEixos(fichaParaFonte(w70)).alimentacaoTipo === "Indeterminado"
    },
  ],
  [
    "o ' ou ' benigno não vira Indeterminado (material/capacidade/formato)",
    () => fichas.filter((f) => / ou /.test(f.carregador_tipo ?? "") && f.modelo !== "Model 70")
      .every((f) => derivarEixos(fichaParaFonte(f)).alimentacaoTipo === "Carregador removível"),
  ],
  [
    "toda pistola com carregador de caixa é Removível",
    () => fichas.filter((f) => f.tipo === "Pistola" && /reto|curvo/.test(f.carregador_tipo ?? ""))
      .every((f) => derivarEixos(fichaParaFonte(f)).alimentacaoTipo === "Carregador removível"),
  ],
  [
    "caso Sharps: nenhuma arma extrínseca de RETROcarga no catálogo",
    // Vigia a fragilidade documentada em derivarCarregamento(): antecarga ⇒
    // extrínseca, mas o inverso é falso (Sharps 1859 = retrocarga + espoleta de
    // percussão). Hoje o catálogo não tem o caso, e a regra usa ignição
    // histórica como sinal de antecarga. Se este invariante quebrar, é porque
    // entrou um Sharps e a regra passou a mentir — é o alarme, não um teste de
    // rotina. Deixar isto só num comentário seria confiar que alguém o leia.
    () => fichas.every((f) => {
      const e = derivarEixos(fichaParaFonte(f))
      return !(e.percussaoLocalizacao === "Extrínseca" && e.sistemaCarregamento === "Retrocarga")
    }),
  ],
]
for (const [nome, teste] of inv) {
  const passou = teste()
  if (!passou) falhas++
  console.log(`     ${passou ? "OK  " : "FALHA"}  ${nome}`)
}

// ── Diagnóstico: os eixos 5b e 5c são independentes NESTES dados? ──────
// Não é invariante (não é pass/fail) — é um fato sobre o dataset que informa
// uma decisão de modelagem: se transmissão e mecanismo sempre andarem juntos,
// os dois campos carregam informação idêntica e talvez devessem ser um só.
// O diagrama os separa; os dados podem discordar. Reportar em vez de decidir.
console.log("\n### diagnóstico: pares (transmissão, mecanismo) observados")
{
  const pares = new Map<string, number>()
  for (const f of fichas.filter((x) => x.sistema_percussao)) {
    const e = derivarEixos(fichaParaFonte(f))
    const k = `${e.percussaoTransmissao}  +  ${e.percussaoMecanismo}`
    pares.set(k, (pares.get(k) ?? 0) + 1)
  }
  for (const [k, n] of [...pares].sort((a, b) => b[1] - a[1])) {
    console.log(`     ${String(n).padStart(4)}  ${k}`)
  }
  console.log(
    pares.size <= 2
      ? "     ⇒ REDUNDANTES neste dataset: cada transmissão implica um mecanismo.\n" +
        "       Os eixos são conceitualmente distintos (um cão que golpeia a espoleta\n" +
        "       direto seria Direta+Cão), mas o catálogo sozinho não os separa."
      : "     ⇒ independentes: existe ficha que combina os eixos de forma cruzada.",
  )
}

// ── Diagnóstico: fichas do catálogo que se contradizem ─────────────────
// Não é sobre a derivação — é sobre o DADO. Uma arma de báscula/tiro unitário
// não pode ter carregador tubular sob o cano com 4+ cartuchos: as duas
// afirmações da ficha são incompatíveis. Quem estiver errado, o campo
// sistema_disparo é copiado direto para sistemaAcionamento do laudo
// (useWeaponCatalog.ts:101), então o erro sai impresso.
console.log("\n### diagnóstico: fichas internamente contraditórias (dado, não código)")
{
  const UNITARIO = ["Canos tombantes (break-action)", "Tiro a tiro (single-shot)", "Duplo gatilho"]
  const suspeitas = fichas.filter(
    (f) => UNITARIO.includes(f.sistema_disparo ?? "")
      && /tubular|\btubos?\b/.test((f.carregador_tipo ?? "").toLowerCase())
      && (f.carregador_capacidade ?? 0) > 1,
  )
  if (!suspeitas.length) {
    console.log("     (nenhuma) ✔")
  } else {
    console.log(`     ${suspeitas.length} fichas dizem tiro unitário E carregador tubular multi-cartucho:`)
    for (const f of suspeitas) {
      console.log(`     - ${f.marca} ${f.modelo}: disparo="${f.sistema_disparo}" mas `
        + `carregador="${f.carregador_tipo}" (${f.carregador_capacidade} cartuchos)`)
    }
    console.log("     ⇒ sistema_disparo provavelmente errado (são pump-action).")
    console.log("       A alimentação deriva certo porque confia no carregador; mas o")
    console.log("       FUNCIONAMENTO destas segue errado até a ficha ser corrigida.")
  }
}

console.log(`\nTOTAL NÃO CLASSIFICADOS + INVARIANTES QUEBRADOS: ${falhas}\n`)
