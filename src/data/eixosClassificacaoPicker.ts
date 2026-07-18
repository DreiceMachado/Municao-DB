// Opções dos pickers de classificação técnica (os eixos do diagrama de arma de
// fogo) para o FORMULÁRIO — o perito escolhe/corrige aqui o que derivarEixos()
// preencheu a partir do catálogo.
//
// Fonte única: os valores são conferidos contra os union types de src/lib/eixos.ts
// via `satisfies`, então adicionar um valor lá sem refletir aqui (ou vice-versa)
// quebra o build. A ordem é a do diagrama / a progressão lógica (tiro unitário →
// repetição → semi → automática), NÃO alfabética — por isso o picker não passa
// por ordenarOpcoes.
//
// NÃO inclui os eixos 1 (alma do cano) e 4 (gatilho): já têm campo editável no
// formulário — "Tipo de raiamento" e "Sistema de acionamento". Duplicá-los criaria
// dois controles para o mesmo dado.
//
// TODO valor que derivarEixos() pode produzir tem que existir aqui como opção —
// senão o formulário mostra um valor que o perito não consegue reeditar pelo
// picker. Por isso "Não aplicável" está em todos: derivação legítima (garrucha de
// tiro unitário não tem depósito → alimentação "Não aplicável"). O checador
// verifica essa cobertura (invariante "picker cobre os derivados").
import type { WeaponEntry } from "../types"
import type {
  SistemaCarregamento,
  SistemaFuncionamento,
  PercussaoLocalizacao,
  TipoEspoleta,
  PercussaoTransmissao,
  PercussaoMecanismo,
  AlimentacaoTipo,
} from "../lib/eixos"

type Opcao<T extends string> = { l: T; d?: string }

export type DefEixo = {
  campo: keyof Omit<WeaponEntry, "type">
  titulo: string   // cabeçalho do sheet
  rotulo: string   // label do campo no card
  help: string
  opcoes: { l: string; d?: string }[]
  // Eixo 4 (gatilho) usa o picker de sistemaAcionamento que já existe e cujas
  // opções variam por tipo de arma — não a lista fixa daqui. Marcado para o card
  // abrir aquele picker em vez do genérico; `opcoes` fica vazio.
  pickerProprio?: boolean
}

// Eixo 1 (alma do cano) NÃO entra aqui: já é representado por "Tipo de raiamento"
// (Características Físicas). Ter os dois seria duplicar o mesmo dado.
export const EIXOS_CLASSIFICACAO: DefEixo[] = [
  {
    campo: "sistemaCarregamento",
    titulo: "Sistema de carregamento",
    rotulo: "Carregamento",
    help: "Por onde a munição entra na arma. Antecarga: pela boca do cano (armas históricas de pólvora negra). Retrocarga: pela culatra (padrão moderno).",
    opcoes: [
      { l: "Antecarga", d: "Munição introduzida pela boca do cano" },
      { l: "Retrocarga", d: "Munição introduzida pela culatra" },
      { l: "Não aplicável", d: "A classificação não se aplica a esta peça (ex.: carga direta, sem depósito)" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ] satisfies Opcao<SistemaCarregamento>[],
  },
  {
    campo: "sistemaFuncionamento",
    titulo: "Sistema de funcionamento",
    rotulo: "Funcionamento",
    help: "Como a arma repete o disparo. Tiro unitário: recarrega a cada tiro. Repetição: ação manual do atirador (ferrolho, alavanca, bomba) ou revólver. Semi-automática: um tiro por acionamento, recarga automática. Automática: dispara em rajada enquanto o gatilho é pressionado.",
    opcoes: [
      { l: "Tiro unitário", d: "Um cartucho por vez; recarrega a cada disparo" },
      { l: "Repetição manual", d: "Atirador realiza o ciclo (ferrolho/alavanca/bomba) ou tambor de revólver" },
      { l: "Repetição automática", d: "O ciclo de repetição é acionado por energia do disparo" },
      { l: "Semi-automática", d: "Um disparo por acionamento; recarrega sozinha" },
      { l: "Automática", d: "Dispara continuamente enquanto o gatilho é pressionado" },
      { l: "Não aplicável", d: "A classificação não se aplica a esta peça (ex.: carga direta, sem depósito)" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ] satisfies Opcao<SistemaFuncionamento>[],
  },
  {
    // Eixo 4 do diagrama (Mecanismo de Acionamento/Gatilho). Reaproveita o picker
    // de sistemaAcionamento, cujas opções (SA/DA/DA-SA/DAO e variantes) mudam por
    // tipo de arma — por isso pickerProprio e opcoes vazio.
    campo: "sistemaAcionamento",
    titulo: "Sistema de acionamento",
    rotulo: "Acionamento (gatilho)",
    help: "Como o gatilho aciona o disparo. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. DA/SA: ambos. DAO: sempre dupla. Striker-fired: percussor armado pelo ciclo do ferrolho.",
    opcoes: [],
    pickerProprio: true,
  },
  {
    campo: "percussaoLocalizacao",
    titulo: "Localização da mistura iniciadora",
    rotulo: "Mistura iniciadora",
    help: "Onde fica a mistura que inicia a ignição. Intrínseca: dentro do cartucho (munição moderna). Extrínseca: fora da munição — na espoleta de percussão ou na escorva de armas de antecarga.",
    opcoes: [
      { l: "Intrínseca", d: "Mistura iniciadora dentro do cartucho" },
      { l: "Extrínseca", d: "Mistura fora da munição (espoleta de percussão, pederneira)" },
      { l: "Não aplicável", d: "A classificação não se aplica a esta peça (ex.: carga direta, sem depósito)" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ] satisfies Opcao<PercussaoLocalizacao>[],
  },
  {
    campo: "percussaoTipoEspoleta",
    titulo: "Tipo de espoleta (da munição)",
    rotulo: "Espoleta",
    help: "Onde o percutor golpeia o cartucho. Central: no centro da base (centerfire). Anular/radial: na borda do culote (rimfire, típico do .22).",
    opcoes: [
      { l: "Central (centerfire)", d: "Percussão no centro da base do cartucho" },
      { l: "Anular/radial (rimfire)", d: "Percussão na borda do culote (ex.: .22 LR)" },
      { l: "Não aplicável", d: "A classificação não se aplica a esta peça (ex.: carga direta, sem depósito)" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ] satisfies Opcao<TipoEspoleta>[],
  },
  {
    campo: "percussaoTransmissao",
    titulo: "Transmissão do movimento de percussão",
    rotulo: "Transmissão",
    help: "Como a energia chega à espoleta. Direta: o próprio percutor lançado atinge a espoleta. Indireta: um cão golpeia o percutor, que então atinge a espoleta.",
    opcoes: [
      { l: "Direta", d: "O percutor lançado atinge a espoleta diretamente" },
      { l: "Indireta", d: "Um cão golpeia o percutor" },
      { l: "Não aplicável", d: "A classificação não se aplica a esta peça (ex.: carga direta, sem depósito)" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ] satisfies Opcao<PercussaoTransmissao>[],
  },
  {
    campo: "percussaoMecanismo",
    titulo: "Mecanismo percutor",
    rotulo: "Percutor",
    help: "Peça que percute a espoleta. Cão: martelo externo ou interno (hammer-fired). Percussor lançado: percutor interno armado pelo ciclo do ferrolho (striker-fired), típico das pistolas modernas.",
    opcoes: [
      { l: "Cão (hammer-fired)", d: "Martelo (aparente ou interno) golpeia o percutor" },
      { l: "Percussor lançado (striker-fired)", d: "Percutor interno armado pelo ciclo do ferrolho" },
      { l: "Percutor fixo (no ferrolho)", d: "Pino solidário à face do ferrolho (metralhadoras: MAG, KPV, Lewis)" },
      { l: "Percutor acionado", d: "Pino separado disparado pelo porta-ferrolho/came ao travar (metralhadoras)" },
      { l: "Não aplicável", d: "A classificação não se aplica a esta peça (ex.: carga direta, sem depósito)" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ] satisfies Opcao<PercussaoMecanismo>[],
  },
  {
    campo: "alimentacaoTipo",
    titulo: "Sistema de alimentação",
    rotulo: "Alimentação",
    help: "Fixação do depósito de munição. Depósito fixo: não se destaca da arma (tambor de revólver, tubo de espingarda, caixa interna). Carregador removível: destacável (caixa de pistola/fuzil, drum). O formato (caixa/tubular/tambor) fica no campo Carregador.",
    opcoes: [
      { l: "Depósito fixo", d: "Não se destaca da arma (tambor, tubular, caixa interna)" },
      { l: "Carregador removível", d: "Destacável (caixa, prato, drum)" },
      { l: "Alimentação por cinta/fita", d: "Cinta de munição ou tira rígida (metralhadoras)" },
      { l: "Não aplicável", d: "A classificação não se aplica a esta peça (ex.: carga direta, sem depósito)" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ] satisfies Opcao<AlimentacaoTipo>[],
  },
]
