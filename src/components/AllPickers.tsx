import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useWeaponForm } from "../context/WeaponFormContext"
import type { WeaponType } from "../types"
import { ordenarOpcoes } from "../lib/ordenar"

const FIREARMS: WeaponType[] = ["REVÓLVER", "PISTOLA", "PISTOLETE", "GARRUCHA", "ESPINGARDA", "CARABINA", "FUZIL", "METRALHADORA", "SUBMETRALHADORA", "ARMA DE ANTECARGA"]

const sheetClass = "fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
const backdropClass = "fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
const sheetAnim = { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring" as const, damping: 28, stiffness: 280 } }
const backdropAnim = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="shrink-0 px-5 pb-3 pt-4">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">{title}</span>
        <button type="button" onClick={onClose} className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

const checkSvg = (
  <svg viewBox="0 0 12 10" className="h-3 w-3">
    <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function PickerItem({ label, desc, selected, onSelect, last }: {
  label: string; desc?: string; selected: boolean; onSelect: () => void; last: boolean
}) {
  return (
    <button type="button" onClick={onSelect}
      className={`flex w-full items-center gap-4 py-4 text-left ${last ? "" : "border-b border-[#e5d9c3]"}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
        {selected && checkSvg}
      </span>
      {desc ? (
        <div className="min-w-0 flex-1">
          <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{label}</div>
          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{desc}</div>
        </div>
      ) : (
        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{label}</span>
      )}
    </button>
  )
}

// Normaliza calibre para comparar: minúsculas, sem espaços, ×→x, e ignora o que vem
// depois do "(". Assim "9mm Luger (9x19mm NATO)" (catálogo/ficha) casa com
// "9 mm Luger (9×19mm)" (opção do seletor).
function normCal(s: string): string {
  return (s ?? "").toLowerCase().split("(")[0]
    .replace(/×/g, "x").replace(/,/g, ".").replace(/\+p/g, "")
    .replace(/\s+/g, "").trim()
}

// Normaliza país para comparar: ignora anotações após "(" e o 2º país após "/".
// Assim "Alemanha (variantes US)" e "Brasil / Turquia" casam com "Alemanha"/"Brasil".
function normPais(s: string): string {
  return (s ?? "").toLowerCase().split("(")[0].split("/")[0].replace(/\s+/g, " ").trim()
}

// Normaliza texto livre (material/acabamento) só p/ DESTAQUE: minúsculas + espaços.
// Não corta parênteses — evita casar "madeira" com 3 opções "Madeira (mogno/faia/…)".
// O campo mantém o valor descritivo do catálogo; isto só acende a opção quando coincide.
function normTxt(s: string): string {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim()
}

type PickersProps = {
  materialPickerOpen: boolean
  formatoPickerOpen: boolean
  miraPickerOpen: boolean
  carregadorPickerOpen: boolean
  sentidoPickerOpen: boolean
  deformacoesPickerOpen: boolean
  tipoLaminaPickerOpen: boolean
  tipoGumePickerOpen: boolean
  tipoRaiamentoPickerOpen: boolean
  sistemaAcionamentoPickerOpen: boolean
  paisPickerOpen: boolean
  calibrePickerOpen: boolean
  calibreAntecargaPickerOpen: boolean
  calibreArmaPressaoPickerOpen: boolean
  materialCoronhaPickerOpen: boolean
  materialQuadroPickerOpen: boolean
  acabamentoPickerOpen: boolean
  tipoPolvoraPickerOpen: boolean
  tipoEspoletaPickerOpen: boolean
  onClose: (picker: string) => void
}

export function AllPickers(props: PickersProps) {
  const { weapon, setDirect, handleField } = useWeaponForm()
  const { fieldHelper, clearFieldHelper } = useWeaponForm()
  const [calibreCustomInput, setCalibreCustomInput] = useState("")
  const [calibreAntecargaCustom, setCalibreAntecargaCustom] = useState("")
  const [miraOutroText, setMiraOutroText] = useState("")
  const [miraOutroOpen, setMiraOutroOpen] = useState(false)
  const close = props.onClose

  const materialOptions = (): string[] => {
    if (weapon.type === "PÓLVORA") return ["Granulada","Em pó fino","Em flocos","Esférica","Extrudada","Compactada","Indeterminado"]
    if (weapon.type === "ESPOLETA") return ["Latão","Aço","Alumínio","Cobre","Niquelado","Indeterminado"]
    if (weapon.type === "ESTOJO" || weapon.type === "CARTUCHO") return ["Latão","Aço","Aço inoxidável","Alumínio","Cobre","Bimetálico (aço/latão)","Niquelado","Polímero / plástico"]
    if (weapon.type === "FACA") return ["Aço inoxidável","Aço carbono","Aço inox cirúrgico","Aço damasco","Aço revestido (titânio / DLC)","Liga metálica","Cerâmica","Ferro","Indeterminado"]
    if (weapon.type === "CARREGADOR") return ["Polímero","Polímero reforçado (P-Mag)","Aço","Aço inoxidável","Alumínio","Liga de alumínio","Latão","Plástico ABS","Indeterminado"]
    if (FIREARMS.includes(weapon.type as WeaponType)) return ["Aço","Aço oxidado","Aço inoxidável","Aço fosfatado","Aço niquelado","Aço cromado","Aço brunido","Alumínio anodizado","Liga de alumínio","Liga metálica","Titânio","Latão","Polímero","Madeira","Inox escovado","Indeterminado"]
    return ["Chumbo","Liga de chumbo","Chumbo endurecido","Cobre","Latão","Aço","Aço inoxidável","Alumínio","Tungstênio","Bismuto","Polímero","Niquelado","Indeterminado"]
  }

  const materialTitle = () => {
    if (weapon.type === "ESTOJO" || weapon.type === "CARTUCHO") return "Material do estojo"
    if (weapon.type === "FACA") return "Material da lâmina"
    if (weapon.type === "ARMA DE PRESSÃO") return "Material da arma de pressão"
    if (weapon.type === "CARREGADOR") return "Material do carregador"
    if (FIREARMS.includes(weapon.type as WeaponType)) return "Material e acabamento do cano"
    return "Material do projétil"
  }

  const formatoOptions = (): string[] => {
    if (weapon.type === "CARTUCHO") return ["Reto","Cônico","Gargalado","Semi-gargalado","Com cinta","Indeterminado"]
    if (weapon.type === "ESTOJO") return ["Sem rebordo / Rimless (RL)","Semi-rebordo / Semi-rim (SR)","Com rebordo / Rimmed (R)","Rebordo destacável / Rebated rim (RB)","Semi-rebordo destacável / Semi-rebated (SRB)","Garrafa / Bottle neck","Reto / Straight","Cônico / Tapered"]
    return ["Ogival","Ogival truncado","Ponta plana (FP)","Arredondado (RN)","Wadcutter (WC)","Semi-wadcutter (SWC)","Expansivo / Hollow Point (HP)","Ponta de polímero","Ponta de aço","Spitzer","Boat tail","Flat base","Garrafa (bottle neck)","Deformado","Fragmentado"]
  }

  const formatoTitle = () => {
    if (weapon.type === "ESTOJO") return "Tipo de rebordo"
    if (weapon.type === "CARTUCHO") return "Formato do estojo"
    return "Formato do projétil"
  }

  const miraOptions = () => {
    const outro = { l: "Outro", d: "Especifique o tipo de mira" }
    const redDot = { l: "Ponto vermelho (red dot)", d: "Mira óptica com ponto luminoso; sem aumento" }
    const telescopica = { l: "Telescópica", d: "Luneta com aumento óptico" }
    if (weapon.type === "REVÓLVER" || weapon.type === "PISTOLA") return [
      { l: "Aberta fixada", d: "Mira dianteira e alça traseira fixas, sem regulagem" },
      { l: "Aberta regulável", d: "Alça traseira com ajuste de elevação e/ou deriva" },
      redDot,
      { l: "Noturna (tritium)", d: "Miras com insertos de trítio para visibilidade noturna" },
      { l: "Laser", d: "Mira laser acoplada ou integrada" },
      { l: "Holográfica", d: "Mira holográfica de visão aberta" },
      telescopica,
      outro,
    ]
    if (weapon.type === "ESPINGARDA") return [
      { l: "Bead (pérola frontal)", d: "Ponto metálico ou plástico na extremidade do cano" },
      { l: "Aberta", d: "Mira dianteira e alça traseira" },
      { l: "Ghost ring", d: "Anel traseiro largo de resposta rápida" },
      redDot, telescopica, outro,
    ]
    if (weapon.type === "CARABINA") return [
      { l: "Aberta", d: "Mira dianteira e alça traseira" },
      redDot, telescopica,
      { l: "Holográfica", d: "Mira holográfica de visão aberta" },
      { l: "Colimador", d: "Colimador reflex de visão aberta" },
      { l: "Noturna (NVG/tritium)", d: "Para uso em condições de baixa luminosidade" },
      { l: "BUIS (ferro de reserva)", d: "Mira de ferro dobrável de backup" },
      outro,
    ]
    if (weapon.type === "FUZIL") return [
      { l: "Aberta (ferro)", d: "Mira dianteira e alça traseira padrão" },
      redDot, telescopica,
      { l: "Holográfica", d: "EOTech e similares; visão aberta" },
      { l: "ACOG", d: "Advanced Combat Optical Gunsight; aumento fixo 4x" },
      { l: "Colimador", d: "Colimador reflex" },
      { l: "Noturna / NVG", d: "Compatível com visão noturna" },
      { l: "BUIS (ferro de reserva)", d: "Mira de ferro dobrável de backup" },
      outro,
    ]
    if (weapon.type === "METRALHADORA") return [
      { l: "Aberta", d: "Mira dianteira e alça traseira" },
      { l: "Óptica", d: "Mira óptica acoplada" },
      redDot, outro,
    ]
    if (weapon.type === "SUBMETRALHADORA") return [
      { l: "Aberta fixada", d: "Mira dianteira e alça traseira fixas" },
      { l: "Aberta regulável", d: "Alça traseira com ajuste de elevação e/ou deriva" },
      redDot,
      { l: "Holográfica", d: "Mira holográfica de visão aberta" },
      { l: "Colimador", d: "Colimador reflex" },
      { l: "Noturna (tritium)", d: "Insertos de trítio para uso noturno" },
      { l: "Laser", d: "Mira laser acoplada" },
      { l: "BUIS (ferro de reserva)", d: "Mira de ferro dobrável de backup" },
      outro,
    ]
    if (weapon.type === "GARRUCHA") return [
      { l: "Sem mira / rudimentar", d: "Sem sistema de mira formal; alinhamento visual pelo cano" },
      { l: "Ponto frontal", d: "Apenas referência frontal fixada no cano" },
      { l: "Aberta simples", d: "Ponto frontal e entalhe traseiro rudimentares" },
      outro,
    ]
    if (weapon.type === "PISTOLETE") return [
      { l: "Aberta fixada", d: "Mira dianteira e alça traseira fixas, sem regulagem" },
      { l: "Aberta regulável", d: "Alça traseira com ajuste de elevação e/ou deriva" },
      redDot,
      { l: "Noturna (tritium)", d: "Miras com insertos de trítio para visibilidade noturna" },
      { l: "Laser", d: "Mira laser acoplada ou integrada" },
      outro,
    ]
    if (weapon.type === "ARMA DE CHOQUE") return []
    if (weapon.type === "ARMA DE ANTECARGA") return [
      { l: "Alzas abertas (alça + dianteira)", d: "Mira de alça traseira e ponto frontal fixos (miras metálicas abertas)" },
      { l: "Alzas abertas reguláveis", d: "Alça traseira com ajuste de elevação; usada em rifles de precisão antigos" },
      { l: "Mira de vôo (tangent sight)", d: "Alça graduada deslizante para diferentes distâncias" },
      telescopica, outro,
    ]
    return [outro]
  }

  const carregadorOptions = () => {
    if (weapon.type === "REVÓLVER") return [
      { l: "Jetloader", d: "Dispositivo de carregamento rápido do tambor" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    if (weapon.type === "PISTOLA") return [
      { l: "Caixa padrão (standard)", d: "Carregador de caixa removível de capacidade original" },
      { l: "Caixa estendido", d: "Carregador com capacidade superior ao original" },
      { l: "Tambor (drum)", d: "Carregador circular de alta capacidade" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    if (weapon.type === "ESPINGARDA") return [
      { l: "Tubo tubular (interno)", d: "Carregador tubular fixo sob o cano" },
      { l: "Caixa removível padrão", d: "Carregador de caixa destacável" },
      { l: "Caixa estendida", d: "Carregador de caixa de maior capacidade" },
      { l: "Fixo interno", d: "Câmara única; carga pelo cano ou abertura superior" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    if (weapon.type === "CARABINA") return [
      { l: "Caixa reto", d: "Carregador de caixa reto removível" },
      { l: "Caixa curvo", d: "Carregador de caixa curvo removível" },
      { l: "Tambor (drum)", d: "Carregador circular de alta capacidade" },
      { l: "Tubo tubular", d: "Carregador tubular sob o cano ou na coronha" },
      { l: "Integrado fixo", d: "Carregador interno não removível" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    if (weapon.type === "FUZIL") return [
      { l: "Caixa reto (STANAG)", d: "Padrão OTAN; 20 ou 30 cartuchos" },
      { l: "Caixa curvo", d: "Carregador curvo para cartuchos cônicos" },
      { l: "Tambor (drum)", d: "Carregador circular de alta capacidade" },
      { l: "Duplo acoplado", d: "Dois carregadores unidos para troca rápida" },
      { l: "P-Mag / polímero", d: "Carregador de polímero reforçado" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    if (weapon.type === "METRALHADORA") return [
      { l: "Cinta / fita de munição", d: "Alimentação por correia ou fita metálica" },
      { l: "Tambor (drum)", d: "Carregador circular de alta capacidade" },
      { l: "Caixa", d: "Carregador de caixa removível" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    if (weapon.type === "SUBMETRALHADORA") return [
      { l: "Caixa reto", d: "Carregador de caixa reto removível" },
      { l: "Caixa curvo", d: "Carregador de caixa curvo removível" },
      { l: "Caixa estendido", d: "Carregador de maior capacidade que o original" },
      { l: "Tambor (drum)", d: "Carregador circular de alta capacidade" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    if (weapon.type === "GARRUCHA") return [
      { l: "Não aplicável (carga direta)", d: "Garrucha de cano tombante; carga individual por câmara" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    if (weapon.type === "PISTOLETE") return [
      { l: "Caixa padrão compacto", d: "Carregador de caixa de baixa capacidade; original do fabricante" },
      { l: "Caixa estendido", d: "Carregador de maior capacidade" },
      { l: "Indeterminado", d: "Não foi possível determinar" },
    ]
    return [{ l: "Indeterminado", d: "Não foi possível determinar" }]
  }

  const sistemaAcionamentoOptions = () => {
    if (weapon.type === "REVÓLVER") return [
      { l: "Ação simples (SA)", d: "Cão deve ser amartilhado manualmente antes de cada disparo" },
      { l: "Ação dupla (DA)", d: "Gatilho arma e dispara o cão em um único movimento" },
      { l: "Ação dupla / ação simples (DA/SA)", d: "Dispara em ação dupla e permite amartilhar o cão para ação simples" },
      { l: "Ação dupla exclusiva (DAO)", d: "Sempre DA; cão retorna à posição de repouso após cada disparo" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "PISTOLA") return [
      { l: "Ação simples (SA)", d: "Cão externo amartilhado manualmente; gatilho apenas dispara" },
      { l: "Ação dupla / ação simples (DA/SA)", d: "Primeiro disparo DA; seguintes SA" },
      { l: "Ação dupla exclusiva (DAO)", d: "Todo disparo pelo gatilho; cão retorna ao repouso sempre" },
      { l: "Striker-fired (percussor armado)", d: "Percussor interno parcialmente armado pelo ciclo do ferrolho" },
      { l: "DA com desamartilhador", d: "DA/SA com alavanca que abaixa o cão com segurança" },
      { l: "DA com trava de serrilha", d: "Trava no ferrolho impede disparo acidental; desengata pelo gatilho" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "ESPINGARDA") return [
      { l: "Ferrolho deslizante (pump-action)", d: "Bombeamento manual para ciclar a munição" },
      { l: "Semi-automático (autocarregável)", d: "Gases ou recuo ciclam automaticamente após cada disparo" },
      { l: "Ferrolho giratório (bolt-action)", d: "Ação manual por alavanca giratória e deslizante" },
      { l: "Alavanca (lever-action)", d: "Alavanca inferior cicla o mecanismo manualmente" },
      { l: "Canos tombantes (break-action)", d: "Cano(s) tombam para baixo para carga/descarga" },
      { l: "Duplo gatilho", d: "Um gatilho por cano; acionamento independente" },
      { l: "Gatilho seletivo", d: "Um gatilho seleciona qual cano será disparado" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "CARABINA") return [
      { l: "Ferrolho giratório (bolt-action)", d: "Alavanca gira e desliza para ciclar manualmente" },
      { l: "Alavanca (lever-action)", d: "Alavanca abaixo do gatilho cicla o mecanismo" },
      { l: "Ferrolho deslizante (pump-action)", d: "Bombeamento manual da coronha dianteira" },
      { l: "Semi-automático (autocarregável)", d: "Gases ou recuo ciclam automaticamente após cada disparo" },
      { l: "Tiro a tiro (single-shot)", d: "Carregamento manual individual a cada disparo" },
      { l: "Tambor de revólver (SA/DA)", d: "Carabina de tambor rotativo (revolving), tipo Rossi Circuit Judge" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "FUZIL") return [
      { l: "Semi-automático", d: "Um disparo por acionamento do gatilho; cicla automaticamente" },
      { l: "Automático", d: "Disparo contínuo enquanto o gatilho é pressionado" },
      { l: "Semi/automático seletivo", d: "Seletor permite alternar entre semi e automático" },
      { l: "Rajada de 3 tiros", d: "Ciclo limitado a 3 disparos por acionamento do gatilho" },
      { l: "Ferrolho giratório (bolt-action)", d: "Ação manual; cada ciclo é feito pelo atirador" },
      { l: "Tiro a tiro (single-shot)", d: "Carregamento manual individual a cada disparo" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "METRALHADORA") return [
      { l: "Automático (open bolt)", d: "Ferrolho parte da posição aberta; seguro quando não dispara" },
      { l: "Automático (closed bolt)", d: "Ferrolho fecha antes do disparo; maior precisão" },
      { l: "Semi/automático seletivo", d: "Seletor permite alternar entre semi e automático" },
      { l: "Rajada de 3 tiros", d: "Ciclo limitado a 3 disparos por acionamento" },
      { l: "Automático contínuo", d: "Disparos contínuos sem limite de rajada" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "SUBMETRALHADORA") return [
      { l: "Semi-automático", d: "Um disparo por acionamento do gatilho; cicla automaticamente" },
      { l: "Automático (open bolt)", d: "Ferrolho parte da posição aberta; padrão de submetralhadoras clássicas" },
      { l: "Automático (closed bolt)", d: "Ferrolho fecha antes do disparo; maior precisão no primeiro tiro" },
      { l: "Semi/automático seletivo", d: "Seletor permite alternar entre semi e automático" },
      { l: "Rajada de 3 tiros", d: "Ciclo limitado a 3 disparos por acionamento" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "GARRUCHA") return [
      { l: "Ação simples (SA)", d: "Cão deve ser amartilhado manualmente antes de cada disparo" },
      { l: "Ação dupla (DA)", d: "Gatilho arma e dispara o cão em um único movimento" },
      { l: "Canos tombantes (break-action)", d: "Cano(s) tombam para baixo para carga/descarga" },
      { l: "Percussão central", d: "Ignição por espoleta centralizada no cartucho" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "PISTOLETE") return [
      { l: "Ação simples (SA)", d: "Cão externo amartilhado manualmente; gatilho apenas dispara" },
      { l: "Ação dupla / ação simples (DA/SA)", d: "Primeiro disparo DA; seguintes SA" },
      { l: "Ação dupla exclusiva (DAO)", d: "Todo disparo pelo gatilho; cão retorna ao repouso sempre" },
      { l: "Striker-fired (percussor armado)", d: "Percussor interno parcialmente armado pelo ciclo do ferrolho" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "ARMA DE CHOQUE") return [
      { l: "Eletrochoque direto (stun gun)", d: "Contato direto com eletrodos; descarga de alta tensão" },
      { l: "Projétil condutor (Taser)", d: "Dispara dardos condutores por fios; alcance à distância" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    if (weapon.type === "ARMA DE ANTECARGA") return [
      { l: "Pederneira (flintlock)", d: "Sílex preso no cão golpeia frisa metálica gerando faísca" },
      { l: "Percussão (percussion cap)", d: "Cão golpeia espoleta de fulminato de mercúrio; séc. XIX" },
      { l: "Mecha (matchlock)", d: "Corda embebida incandescente aciona a panela de pólvora" },
      { l: "Roda (wheellock)", d: "Roda de aço ranhurada gera faíscas ao girar contra pirita" },
      { l: "Espoleta inline", d: "Sistema moderno inline; espoleta centralizada no eixo do cano" },
      { l: "Indeterminado", d: "Sistema de ignição não pôde ser determinado" },
    ]
    if (weapon.type === "ARMA DE PRESSÃO") return [
      { l: "Mola/pistão (spring-piston)", d: "Mola comprimida pelo armamento libera pistão que comprime o ar" },
      { l: "CO₂ (cartucho de gás)", d: "Cartucho de CO₂ armazenado pressuriza o sistema de disparo" },
      { l: "PCP (pré-carregado pneumático)", d: "Reservatório de ar comprimido recarregado externamente" },
      { l: "Bomba manual (multi-pump)", d: "Bombeamento manual acumula pressão antes do disparo" },
      { l: "Gás (outra fonte)", d: "Outro tipo de propelente gasoso" },
      { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
    ]
    return [{ l: "Indeterminado", d: "Sistema não pôde ser determinado" }]
  }

  const calibreOptions = () => {
    if (weapon.type === "PISTOLA") return [
      { l: "9 mm Luger (9×19mm)", d: "Padrão NATO e policial mundial" },
      { l: ".38 SPL", d: "O mais comum no Brasil; padrão policial" },
      { l: ".357 Magnum", d: "Revólveres e carabinas; compatível com .38 SPL" },
      { l: ".40 S&W", d: "Padrão policial brasileiro" },
      { l: ".45 ACP", d: "Grande diâmetro; alto poder de parada" },
      { l: ".45 Colt", d: ".45 Colt (.45 Long Colt); revólveres de porte e lever-action" },
      { l: ".380 ACP (9 mm Curto)", d: "Pistolas compactas de porte dissimulado" },
      { l: ".357 SIG", d: "Alta velocidade em cano curto; uso policial especializado" },
      { l: ".38 Super Auto", d: "Alta velocidade; competições e forças especiais" },
      { l: ".32 ACP (7,65mm)", d: "Pistolas compactas antigas; antigo padrão policial" },
      { l: ".32 S&W Long", d: "Revólveres compactos; antigo padrão policial" },
      { l: ".32 H&R Magnum", d: "Evolução do .32 S&W Long; revólveres modernos" },
      { l: ".25 ACP (6,35mm)", d: "Pistolas de bolso; baixo poder de parada" },
      { l: "9 mm Makarov (9×18mm)", d: "Padrão soviético" },
      { l: "10 mm Auto", d: "Alta energia; base do .40 S&W" },
      { l: ".44 SPL", d: "Versão de menor pressão do .44 Magnum" },
      { l: ".44 Magnum", d: "Revólveres e pistolas de grande porte" },
      { l: ".22 LR", d: "Rimfire; revólveres e pistolas de treinamento" },
      { l: ".22 WMR (.22 Mag)", d: "Rimfire magnum" },
      { l: "5,7×28 mm FN", d: "Pistola FN Five-seveN; alta penetração" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "REVÓLVER") return [
      { l: "9 mm Luger (9×19mm)", d: "Padrão NATO e policial mundial" },
      { l: ".38 SPL", d: "O mais comum no Brasil; padrão policial" },
      { l: ".357 Magnum", d: "Revólveres e carabinas; compatível com .38 SPL" },
      { l: ".40 S&W", d: "Padrão policial brasileiro" },
      { l: ".45 ACP", d: "Grande diâmetro; alto poder de parada" },
      { l: ".45 Colt", d: ".45 Colt (.45 Long Colt); revólveres de porte e lever-action" },
      { l: ".380 ACP (9 mm Curto)", d: "Revólveres compactos; calibre de porte" },
      { l: ".357 SIG", d: "Alta velocidade em cano curto; uso policial especializado" },
      { l: ".38 Super Auto", d: "Alta velocidade; competições e forças especiais" },
      { l: ".32 ACP (7,65mm)", d: "Revólveres compactos antigos" },
      { l: ".32 S&W Long", d: "Revólveres compactos; antigo padrão policial" },
      { l: ".32 H&R Magnum", d: "Evolução do .32 S&W Long; revólveres modernos" },
      { l: ".25 ACP (6,35mm)", d: "Revólveres de bolso; baixo poder de parada" },
      { l: "9 mm Makarov (9×18mm)", d: "Padrão soviético" },
      { l: "10 mm Auto", d: "Alta energia; base do .40 S&W" },
      { l: ".44 SPL", d: "Versão de menor pressão do .44 Magnum" },
      { l: ".44 Magnum", d: "Revólveres de grande porte" },
      { l: ".22 LR", d: "Rimfire; revólveres de treinamento" },
      { l: ".22 WMR (.22 Mag)", d: "Rimfire magnum" },
      { l: "5,7×28 mm FN", d: "Alta penetração; revólveres modernos" },
      { l: ".38 S&W", d: ".38 S&W (.38-200 / .380 Revolver); Webley Mk IV, Enfield No.2 Mk I" },
      { l: ".22 LR / .22 WMR", d: "Tambores intercambiáveis rimfire; Ruger Single-Six" },
      { l: ".357 Magnum / 9 mm", d: "Tambores intercambiáveis .357 Magnum e 9 mm Luger" },
      { l: ".327 Federal Magnum", d: ".327 Federal Magnum; aceita .32 H&R e .32 S&W Long" },
      { l: ".45 Colt / .410", d: "Câmara mista .45 Colt / .410 Bore; Taurus Judge" },
      { l: ".454 Casull", d: ".454 Casull; alta pressão, revólveres de caça" },
      { l: ".454 Casull / .45 Colt / .410", d: "Taurus Raging Judge; aceita .454 Casull, .45 Colt e .410" },
      { l: ".357 Mag / .44 Mag / .454 Casull", d: "Magnum Research BFR; conversões multicalibre" },
      { l: ".460 S&W Magnum", d: ".460 S&W Magnum; aceita .454 Casull e .45 Colt (S&W X-Frame)" },
      { l: ".500 S&W Magnum", d: ".500 S&W Magnum; S&W X-Frame" },
      { l: ".45-70 Government", d: ".45-70 Government; Magnum Research BFR" },
      { l: ".36 (pólvora negra)", d: "Percussão / cap-and-ball .36 (Ø 9,1 mm); Colt 1851 Navy, Pietta" },
      { l: ".44 (pólvora negra)", d: "Percussão / cap-and-ball .44 (Ø 11,2 mm); Remington 1858, Uberti" },
      { l: ".442 Webley", d: ".442 Webley (.442 RIC); revólveres Webley RIC" },
      { l: ".455 Webley", d: ".455 Webley Mk II; Webley Mk VI" },
      { l: "7,62×38R Nagant", d: "7,62×38mmR Nagant; revólver Nagant M1895" },
      { l: "8 mm Mle 1892 (Lebel)", d: "8 mm French Ordnance (8×27mmR); revólver Modèle 1892" },
      { l: "8 mm Rast-Gasser", d: "8 mm Gasser (8×27mmR); revólver Rast & Gasser M1898" },
      { l: "10,35 mm Italiano (Bodeo)", d: "10,35 mm Italian Ordnance; revólver Bodeo Mod. 1889" },
      { l: "11 mm Spanish (.44)", d: "11×17,5R Spanish; revólver Orbea Hermanos Mod. 1884" },
      { l: ".22 Curto", d: ".22 Short; revólveres antigos e de treino (GDL)" },
      { l: ".32 S&W", d: ".32 S&W (curto); revólveres compactos antigos (GDL)" },
      { l: ".38 Curto", d: ".38 Short Colt; revólveres antigos (GDL)" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "ESPINGARDA") return [
      { l: "12 Ga (2¾\")", d: "O mais comum no Brasil" },
      { l: "12 Ga (3\")", d: "Câmara magnum" },
      { l: "12 Ga (3½\")", d: "Super magnum" },
      { l: "16 Ga", d: "Calibre intermediário" },
      { l: "20 Ga", d: "Menor recuo" },
      { l: "28 Ga", d: "Calibre esportivo" },
      { l: ".410 Bore (2½\")", d: "Menor calibre de espingarda" },
      { l: ".410 Bore (3\")", d: "Versão magnum do .410" },
      { l: ".36 (.410 Bore)", d: "Designação antiga do .410; espingardas de pequeno porte" },
      { l: ".22 LR", d: "Espingarda de alma lisa .22 (garden gun)" },
      { l: "24 Ga", d: "Calibre 24; espingardas de pequeno porte (GDL)" },
      { l: "32 Ga", d: "Calibre 32; espingardas de pequeno porte (GDL)" },
      { l: "36 Ga", d: "Calibre 36 (≈ .410); espingardas de pequeno porte (GDL)" },
      { l: "40 Ga", d: "Calibre 40; espingardas de pequeno porte (GDL)" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "CARABINA") return [
      { l: ".22 LR", d: "Rimfire; o mais usado em carabinas esportivas no Brasil" },
      { l: ".22 WMR (.22 Mag)", d: "Rimfire magnum" },
      { l: ".22 Hornet", d: "Centerfire de pequeno porte" },
      { l: ".223 Rem / 5,56×45mm", d: "Padrão NATO; carabinas táticas e IMBEL" },
      { l: ".243 Winchester", d: "Calibre de caça e tiro de precisão" },
      { l: "7mm-08 Rem", d: "Derivado do .308; excelente precisão" },
      { l: ".308 Win / 7,62×51mm", d: "Padrão NATO; carabinas táticas e de precisão" },
      { l: "7,62×39 mm", d: "Cartucho russo; AK e SKS" },
      { l: ".30-30 Winchester", d: "Clássico americano; lever-action" },
      { l: ".30 Carbine (7,62×33mm)", d: "Carabina M1 Carbine" },
      { l: ".357 Magnum", d: "Lever-action; mesma munição do revólver" },
      { l: ".44 Magnum", d: "Lever-action; alta energia" },
      { l: "9 mm Luger", d: "Carabinas pistoleiras" },
      { l: ".45 ACP", d: "Carabinas pistoleiras" },
      { l: ".30-06 Springfield", d: "Clássico americano; bolt-action" },
      { l: "6,5mm Creedmoor", d: "Precisão de longa distância" },
      { l: ".38 SPL / .357 Magnum", d: "Lever-action; aceita .38 SPL e .357 Magnum" },
      { l: ".357 Magnum / .44 Magnum", d: "Lever-action; mesma munição de revólver" },
      { l: ".45-70 Government", d: ".45-70 Government; lever-action e monotiro de grande porte" },
      { l: "Diversos (.22 a .45-70)", d: "Monotiro de calibre variável (ex.: Winchester 1885)" },
      { l: ".45 Colt / .410", d: "Câmara mista .45 Colt/.410; carabina de tambor Rossi Circuit Judge" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "FUZIL") return [
      { l: "5,56×45 mm NATO", d: "Padrão OTAN; AR-15, M16, IMBEL IA2" },
      { l: "7,62×51 mm NATO", d: "Padrão OTAN pesado; FAL, G3, IMBEL MD-2" },
      { l: "7,62×39 mm", d: "Cartucho russo; AK-47/AKM" },
      { l: "5,45×39 mm", d: "Padrão soviético moderno; AK-74" },
      { l: "7,62×54R mm", d: "Rimmed russo; SVD Dragunov, PK" },
      { l: ".308 Winchester", d: "Equivalente civil do 7,62×51 NATO" },
      { l: ".300 Blackout (.300 BLK)", d: "Uso com supressor; AR-15" },
      { l: "6,5mm Creedmoor", d: "Fuzis de precisão de longa distância" },
      { l: ".338 Lapua Magnum", d: "Precisão extrema; atirador de elite" },
      { l: ".50 BMG (12,7×99mm)", d: "Anti-material; Barrett e similares" },
      { l: ".30-06 Springfield", d: "Clássico americano; carabinas bolt-action de caça" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "METRALHADORA") return [
      { l: "5,56×45 mm NATO", d: "Metralhadoras leves; Minimi/M249" },
      { l: "7,62×51 mm NATO", d: "Metralhadoras médias; MAG58/M240" },
      { l: "7,62×39 mm", d: "RPK, PKM" },
      { l: "7,62×54R mm", d: "PK/PKM; padrão soviético pesado" },
      { l: "12,7×99 mm (.50 BMG)", d: "Metralhadoras pesadas; M2 Browning" },
      { l: "12,7×108 mm", d: "DShK, NSV, Kord; pesada soviética/russa" },
      { l: "14,5×114 mm", d: "KPV; metralhadoras antiaéreas soviéticas" },
      { l: ".30-06 Springfield", d: "Browning M1917/M1919 e BAR; cartucho .30-06 (7,62×63mm)" },
      { l: ".303 British", d: "Vickers, Bren, Lewis; cartucho britânico 7,7×56mmR" },
      { l: "7,92×57 mm Mauser", d: "MG34/MG42, Maxim MG08, ZB vz.26" },
      { l: "7,5×54 mm French", d: "Châtellerault FM 24/29; padrão francês" },
      { l: "7,7×58 mm Arisaka", d: "Metralhadoras japonesas (Type 92/99)" },
      { l: "8×50R Lebel", d: "Hotchkiss M1914; cartucho francês 8mm Lebel" },
      { l: "8×59 RB Breda", d: "Breda M37; padrão italiano" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "SUBMETRALHADORA") return [
      { l: "9 mm Luger (9×19mm)", d: "Mais comum; HK MP5, Uzi, INA M953, Taurus CT9" },
      { l: ".45 ACP", d: "Thompson M1921/M1928; alta energia" },
      { l: ".40 S&W", d: "Submetralhadoras policiais modernas" },
      { l: ".380 ACP (9mm Curto)", d: "Submetralhadoras compactas de porte" },
      { l: "5,7×28 mm FN", d: "FN P90; alta penetração em coletes" },
      { l: "10 mm Auto", d: "Alta energia; uso policial especializado" },
      { l: "4,6×30 mm HK", d: "HK MP7; PDW de alta penetração" },
      { l: ".32 ACP (7,65mm)", d: "Škorpion vz. 61; pistola-metralhadora compacta" },
      { l: "7,62×25 mm Tokarev", d: "PPSh-41, PPS-43; padrão soviético histórico" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "GARRUCHA") return [
      { l: ".22 LR", d: "Rimfire; garruchas de pequeno porte" },
      { l: ".22 WMR (.22 Mag)", d: "Rimfire magnum; maior energia" },
      { l: ".25 ACP (6,35mm)", d: "Garruchas compactas de porte dissimulado" },
      { l: ".32 ACP (7,65mm)", d: "Antigo padrão; garruchas de porte" },
      { l: ".38 SPL", d: "Padrão policial brasileiro; garruchas de dois canos" },
      { l: ".357 Magnum", d: "Alta energia; garruchas de maior porte" },
      { l: ".44 Magnum", d: "Garruchas de grande porte" },
      { l: ".45 Colt", d: "Clássico americano; garruchas e derringers de grande calibre" },
      { l: ".45 Colt / .410", d: "Câmara mista .45 Colt/.410; Bond Arms, American Derringer" },
      { l: ".45 ACP", d: "Garruchas modernas de grande calibre" },
      { l: ".410 Bore (2½\")", d: "Calibre de espingarda; garruchas mistas" },
      { l: ".45-70 Government", d: "Derringer monotiro de grande calibre; Bond Arms Cyclops" },
      { l: ".41 Rimfire", d: "Remington Model 95 (double derringer); fogo circular .41" },
      { l: ".32 S&W", d: "Garruchas/revólveres de bolso; .32 S&W (curto)" },
      { l: "9 mm Luger", d: "Garruchas modernas de porte" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "PISTOLETE") return [
      { l: ".22 LR", d: "Rimfire; pistoletes de treinamento e porte" },
      { l: ".25 ACP (6,35mm)", d: "Pistoletes compactos de porte dissimulado" },
      { l: ".32 ACP (7,65mm)", d: "Antigo padrão policial; pistoletes compactos" },
      { l: ".380 ACP (9mm Curto)", d: "O mais comum em pistoletes modernos" },
      { l: "9 mm Luger (9×19mm)", d: "Pistoletes subcompactos modernos" },
      { l: ".40 S&W", d: "Pistoletes policiais compactos" },
      { l: ".45 ACP", d: "Pistoletes de grande calibre" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "ARMA DE CHOQUE") return [
      { l: "Não aplicável", d: "Armas de choque não utilizam munição convencional" },
    ]
    if (weapon.type === "PROJÉTIL") return [
      { l: ".22 LR / .22 WMR",         d: "Ø 5,6 mm — rimfire; revólveres e pistolas de treinamento" },
      { l: ".25 ACP (6,35mm)",         d: "Ø 6,35 mm — pistolas compactas antigas" },
      { l: ".32 ACP / 7,65mm",         d: "Ø 7,65 mm — antigo padrão policial" },
      { l: ".32 S&W Long",             d: "Ø 7,92 mm — revólveres compactos" },
      { l: "9 mm Luger / .380 ACP",    d: "Ø 9,01 mm — pistolas; padrão NATO e policial" },
      { l: ".38 SPL",                  d: "Ø 9,06 mm — revólveres; padrão policial brasileiro" },
      { l: ".357 Magnum",              d: "Ø 9,06 mm — mesmo diâmetro do .38 SPL; estojo mais longo" },
      { l: ".38 SPL ou .357 Magnum",   d: "Ø 9,06 mm — indistinguível pelo projétil isolado" },
      { l: ".38 Super Auto",           d: "Ø 9,01 mm — pistolas de competição" },
      { l: ".40 S&W",                  d: "Ø 10,16 mm — padrão policial brasileiro" },
      { l: "10 mm Auto",               d: "Ø 10,16 mm — pistolas de alta energia" },
      { l: ".44 SPL / .44 Magnum",     d: "Ø 10,9 mm — revólveres de grande porte" },
      { l: ".45 ACP",                  d: "Ø 11,43 mm — pistolas de grande porte" },
      { l: ".45 Colt",                 d: "Ø 11,43 mm — revólveres e lever-action" },
      { l: "5,56×45mm / .223 Rem",    d: "Ø 5,7 mm — fuzis e carabinas táticas" },
      { l: "7,62×39mm",                d: "Ø 7,92 mm — AK e derivados" },
      { l: "7,62×51mm / .308 Win",    d: "Ø 7,92 mm — fuzis e carabinas de precisão" },
      { l: "7,62×54R",                 d: "Ø 7,92 mm — fuzis e metralhadoras russas" },
      { l: "12 Ga (perdigão/slug)",    d: "Espingarda calibre 12" },
      { l: "Outro",                    d: "Informar calibre não listado" },
      { l: "Indeterminado",            d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "ESTOJO" || weapon.type === "CARTUCHO") return [
      { l: ".22 LR", d: "Rimfire" },
      { l: ".22 WMR (.22 Mag)", d: "Rimfire magnum" },
      { l: ".25 ACP (6,35mm)", d: "Pistolas compactas antigas" },
      { l: ".32 ACP (7,65mm)", d: "Antigo padrão policial" },
      { l: ".32 S&W Long", d: "Revólveres compactos" },
      { l: ".380 ACP (9mm Curto)", d: "Pistolas de porte dissimulado" },
      { l: "9 mm Luger (9×19mm)", d: "Padrão NATO e policial" },
      { l: "9 mm Makarov (9×18mm)", d: "Pistolas de origem soviética" },
      { l: ".38 SPL", d: "Padrão no Brasil" },
      { l: ".357 Magnum", d: "Revólveres e lever-action" },
      { l: ".38 Super Auto", d: "Pistolas de competição" },
      { l: ".40 S&W", d: "Pistolas policiais" },
      { l: ".44 SPL", d: "Revólveres de grande porte" },
      { l: ".44 Magnum", d: "Alta energia" },
      { l: ".45 ACP", d: "Pistolas de grande porte" },
      { l: ".45 Colt", d: "Revólveres e carabinas lever-action" },
      { l: ".223 Rem / 5,56×45mm", d: "Fuzis e carabinas táticas" },
      { l: ".308 Win / 7,62×51mm", d: "Fuzis e carabinas de precisão" },
      { l: "7,62×39 mm", d: "AK e derivados" },
      { l: "7,62×54R mm", d: "Fuzis e metralhadoras russas" },
      { l: ".30-30 Winchester", d: "Carabinas lever-action" },
      { l: ".30 Carbine", d: "Carabina M1" },
      { l: ".30-06 Springfield", d: "Fuzis e carabinas de caça" },
      { l: "12 Ga", d: "Espingarda calibre 12" },
      { l: "16 Ga", d: "Espingarda calibre 16 (GDL)" },
      { l: "20 Ga", d: "Espingarda calibre 20" },
      { l: "24 Ga", d: "Espingarda calibre 24 (GDL)" },
      { l: "28 Ga", d: "Espingarda calibre 28 (GDL)" },
      { l: "32 Ga", d: "Espingarda calibre 32 (GDL)" },
      { l: "36 Ga", d: "Espingarda calibre 36 / .410 (GDL)" },
      { l: "40 Ga", d: "Espingarda calibre 40 (GDL)" },
      { l: ".410 Bore", d: "Espingarda calibre .410" },
      { l: ".22 Curto", d: ".22 Short (GDL)" },
      { l: ".32 S&W", d: ".32 S&W curto (GDL)" },
      { l: ".38 Curto", d: ".38 Short Colt (GDL)" },
      { l: "5,7×28 mm FN", d: "FN P90 / Five-seveN" },
      { l: "12,7×99 mm (.50 BMG)", d: "Metralhadoras pesadas" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    if (weapon.type === "CARREGADOR") return [
      { l: "9 mm Luger", d: "Pistolas e submetralhadoras" },
      { l: ".40 S&W", d: "Pistolas policiais; padrão brasileiro" },
      { l: ".45 ACP", d: "Pistolas de grande porte" },
      { l: ".380 ACP", d: "Pistolas compactas" },
      { l: ".32 ACP (7,65mm)", d: "Pistolas compactas antigas" },
      { l: ".38 Super Auto", d: "Pistolas de competição" },
      { l: "10 mm Auto", d: "Pistolas de alta energia" },
      { l: "5,56×45 mm NATO", d: "Fuzis AR-15/M16 e carabinas táticas" },
      { l: "7,62×39 mm", d: "AK-47 e derivados" },
      { l: "7,62×51 mm NATO", d: "Fuzis FAL, G3" },
      { l: ".308 Win", d: "Carabinas e fuzis de precisão" },
      { l: ".223 Rem", d: "Carabinas esportivas AR-15" },
      { l: ".22 LR", d: "Pistolas e carabinas de treinamento" },
      { l: "5,7×28 mm FN", d: "FN P90 e pistola Five-seveN" },
      { l: "Outro", d: "Informar calibre não listado" },
      { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
    ]
    return [{ l: "Indeterminado", d: "Calibre não pôde ser determinado" }]
  }

  return (
    <>
      {/* Material */}
      <AnimatePresence>
        {props.materialPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("material")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title={materialTitle()} onClose={() => close("material")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(materialOptions()).map((mat, idx, arr) => (
                  <PickerItem key={mat} label={mat} selected={weapon.material === mat || (!!weapon.material && normTxt(weapon.material) === normTxt(mat))} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("material", weapon.material === mat ? "" : mat); close("material") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Formato */}
      <AnimatePresence>
        {props.formatoPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("formato")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title={formatoTitle()} onClose={() => close("formato")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(formatoOptions()).map((fmt, idx, arr) => (
                  <PickerItem key={fmt} label={fmt} selected={weapon.formato === fmt} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("formato", weapon.formato === fmt ? "" : fmt); close("formato") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mira */}
      <AnimatePresence>
        {props.miraPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("mira")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Tipo de mira" onClose={() => close("mira")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(miraOptions()).map(({ l, d }, idx, arr) => {
                  if (l === "Outro") {
                    const temOutro = (weapon.tipoMira ?? []).some(m => !miraOptions().slice(0, -1).find(o => o.l === m))
                    return (
                      <div key="outro" className={`py-4 ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <button type="button"
                          onClick={() => setMiraOutroOpen(v => !v)}
                          className="flex w-full items-center gap-4 text-left">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${miraOutroOpen || temOutro ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                            {(miraOutroOpen || temOutro) && checkSvg}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[15px] font-semibold leading-tight ${miraOutroOpen || temOutro ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>Outro</div>
                            <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">Especifique o tipo de mira</div>
                          </div>
                        </button>
                        {miraOutroOpen && (
                          <div className="mt-3 flex gap-2 pl-10">
                            <input
                              value={miraOutroText}
                              onChange={e => setMiraOutroText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter" && miraOutroText.trim()) {
                                  const cur = weapon.tipoMira ?? []
                                  setDirect("tipoMira", [...cur, miraOutroText.trim()])
                                  setMiraOutroText("")
                                  setMiraOutroOpen(false)
                                }
                              }}
                              className="h-10 flex-1 rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-[14px] outline-none transition focus:border-[#9e7f45]"
                              placeholder="Digite o tipo de mira…"
                              autoFocus
                            />
                            <button type="button"
                              disabled={!miraOutroText.trim()}
                              onClick={() => {
                                if (!miraOutroText.trim()) return
                                const cur = weapon.tipoMira ?? []
                                setDirect("tipoMira", [...cur, miraOutroText.trim()])
                                setMiraOutroText("")
                                setMiraOutroOpen(false)
                              }}
                              className="h-10 rounded-xl bg-[#7d6334] px-4 text-[13px] font-black text-white disabled:opacity-40">
                              OK
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  }
                  return (
                    <PickerItem key={l} label={l} desc={d} selected={(weapon.tipoMira ?? []).includes(l)} last={idx === arr.length - 1}
                      onSelect={() => {
                        const cur = weapon.tipoMira ?? []
                        const nxt = cur.includes(l) ? cur.filter(i => i !== l) : [...cur, l]
                        setDirect("tipoMira", nxt)
                      }} />
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Carregador */}
      <AnimatePresence>
        {props.carregadorPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("carregador")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <div className="shrink-0 px-5 pb-3 pt-4">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Carregador</span>
                  <button type="button" onClick={() => close("carregador")} className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Capacidade</label>
                    <input value={String(weapon.capacidadeCarregador ?? "")} onChange={handleField("capacidadeCarregador")}
                      className="h-10 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-[14px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                      placeholder="Ex.: 17 cartuchos" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Tipo</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(carregadorOptions()).map(({ l, d }, idx, arr) => (
                  <PickerItem key={l} label={l} desc={d} selected={(weapon.tipoCarregador ?? []).includes(l)} last={idx === arr.length - 1}
                    onSelect={() => {
                      const cur = weapon.tipoCarregador ?? []
                      const nxt = cur.includes(l) ? cur.filter(i => i !== l) : [...cur, l]
                      setDirect("tipoCarregador", nxt)
                    }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sentido das raias */}
      <AnimatePresence>
        {props.sentidoPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("sentido")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Sentido das raias" onClose={() => close("sentido")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(["Dextrorso","Sinistrorso","Dextrorso e Sinistrorso (combinado)","Anfidextrorso","Indeterminado"]).map((s, idx, arr) => (
                  <PickerItem key={s} label={s} selected={weapon.sentidoEstrias === s} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("sentidoEstrias", weapon.sentidoEstrias === s ? "" : s); close("sentido") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deformações acidentais */}
      <AnimatePresence>
        {props.deformacoesPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("deformacoes")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Deformações acidentais" onClose={() => close("deformacoes")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(weapon.type === "ESTOJO" ? [
                  "Ausente","Amassamento na boca","Amassamento no corpo","Amassamento no rebordo","Deformação por extração forçada","Arranhões / riscos superficiais","Oxidação com deformação","Indeterminada",
                ] : weapon.type === "CARTUCHO" ? [
                  "Ausente","Amassamento na boca do estojo","Amassamento no corpo do estojo","Deformação no projétil","Deformação no rebordo","Arranhões / riscos superficiais","Oxidação com deformação","Indeterminada",
                ] : [
                  "Ausente","Leve","Moderada","Acentuada","Severa","Fragmentação parcial","Fragmentação total","Moderada com fragmentação parcial","Acentuada com fragmentação parcial","Achatamento leve","Achatamento moderado","Achatamento severo","Encurvamento","Esmagamento","Expansão (HP)","Expansão parcial","Deformação por ricochete","Deformação por impacto em superfície dura","Deformação por passagem em material mole","Indeterminada",
                ]).map((def, idx, arr) => {
                  const selecionados = weapon.deformacoesAcidentais.split(",").map(s => s.trim()).filter(Boolean)
                  return (
                    <PickerItem key={def} label={def} selected={selecionados.includes(def)} last={idx === arr.length - 1}
                      onSelect={() => {
                        const sel = selecionados.includes(def)
                        const nxt = sel ? selecionados.filter(d => d !== def) : [...selecionados, def]
                        setDirect("deformacoesAcidentais", nxt.join(", "))
                      }} />
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tipo de lâmina */}
      <AnimatePresence>
        {props.tipoLaminaPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("tipoLamina")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Tipo de lâmina" onClose={() => close("tipoLamina")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(["Lisa","Serrilhada","Mista (lisa e serrilhada)","Ondulada / dentada","Indeterminada"]).map((opt, idx, arr) => (
                  <PickerItem key={opt} label={opt} selected={weapon.tipoLamina === opt} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("tipoLamina", weapon.tipoLamina === opt ? "" : opt); close("tipoLamina") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tipo de gume */}
      <AnimatePresence>
        {props.tipoGumePickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("tipoGume")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Tipo de gume" onClose={() => close("tipoGume")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(["Simples (um gume)","Duplo (dois gumes)","Falso gume","Sem gume definido","Indeterminado"]).map((opt, idx, arr) => (
                  <PickerItem key={opt} label={opt} selected={weapon.tipoGume === opt} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("tipoGume", weapon.tipoGume === opt ? "" : opt); close("tipoGume") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tipo de raiamento */}
      <AnimatePresence>
        {props.tipoRaiamentoPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("tipoRaiamento")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Tipo de raiamento do cano" onClose={() => close("tipoRaiamento")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(["Alma lisa (sem raiamento)","Raiamento convencional","Raiamento poligonal","Raiamento de campo e alvéolo","Microgroove (múltiplos raios)","Raiamento quadrado","Híbrida/Combinada (canos de almas distintas)","Indeterminado"]).map((opt, idx, arr) => (
                  <PickerItem key={opt} label={opt} selected={weapon.tipoRaiamento === opt} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("tipoRaiamento", weapon.tipoRaiamento === opt ? "" : opt); close("tipoRaiamento") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sistema de acionamento */}
      <AnimatePresence>
        {props.sistemaAcionamentoPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("sistemaAcionamento")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Sistema de acionamento" onClose={() => close("sistemaAcionamento")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(sistemaAcionamentoOptions()).map(({ l, d }, idx, arr) => (
                  <PickerItem key={l} label={l} desc={d} selected={weapon.sistemaAcionamento === l} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("sistemaAcionamento", weapon.sistemaAcionamento === l ? "" : l); close("sistemaAcionamento") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* País de fabricação */}
      <AnimatePresence>
        {props.paisPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("pais")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="País de fabricação" onClose={() => close("pais")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes([
                  { c: "br", l: "Brasil" },{ c: "us", l: "Estados Unidos" },{ c: "at", l: "Áustria" },
                  { c: "de", l: "Alemanha" },{ c: "it", l: "Itália" },{ c: "cz", l: "República Tcheca" },
                  { c: "be", l: "Bélgica" },{ c: "ar", l: "Argentina" },{ c: "ru", l: "Rússia" },
                  { c: "cn", l: "China" },{ c: "il", l: "Israel" },{ c: "fr", l: "França" },
                  { c: "gb", l: "Reino Unido" },{ c: "es", l: "Espanha" },{ c: "pt", l: "Portugal" },
                  { c: "ch", l: "Suíça" },{ c: "se", l: "Suécia" },{ c: "fi", l: "Finlândia" },
                  { c: "no", l: "Noruega" },{ c: "jp", l: "Japão" },{ c: "kr", l: "Coreia do Sul" },
                  { c: "tr", l: "Turquia" },{ c: "pk", l: "Paquistão" },{ c: "in", l: "Índia" },
                  { c: "za", l: "África do Sul" },{ c: "mx", l: "México" },{ c: "ca", l: "Canadá" },
                  { c: "cl", l: "Chile" },{ c: "co", l: "Colômbia" },{ c: "py", l: "Paraguai" },
                  { c: "bo", l: "Bolívia" },{ c: "rs", l: "Sérvia" },{ c: "hu", l: "Hungria" },
                  { c: "tw", l: "Taiwan" },{ c: "ph", l: "Filipinas" },{ c: "pl", l: "Polônia" },
                  { c: "dk", l: "Dinamarca" },{ c: "hr", l: "Croácia" },{ c: "sg", l: "Singapura" },
                  { c: "", l: "União Soviética" },{ c: "", l: "Tchecoslováquia" },{ c: "", l: "Iugoslávia" },
                  { c: "", l: "Indeterminado" },
                ]).map(({ c, l }, idx, arr) => {
                  const exact = weapon.paisFabricacao === l
                  const selected = exact || (!!weapon.paisFabricacao && normPais(weapon.paisFabricacao) === normPais(l))
                  return (
                    <button key={l} type="button"
                      onClick={() => { setDirect("paisFabricacao", exact ? "" : l); close("pais") }}
                      className={`flex w-full items-center gap-4 py-3.5 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                      {c
                        ? <img src={`https://flagcdn.com/32x24/${c}.png`} alt={l} className="h-5 w-auto rounded-sm shadow-sm shrink-0" />
                        : <span className="flex h-5 w-8 shrink-0 items-center justify-center rounded-sm bg-[#e8dfc8] text-[10px] font-black text-[#8d7854]">?</span>
                      }
                      <span className={`flex-1 text-[15px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{l}</span>
                      {selected && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7d6334]">{checkSvg}</span>}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calibre geral */}
      <AnimatePresence>
        {props.calibrePickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("calibre")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Calibre" onClose={() => close("calibre")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {calibreOptions().map(({ l, d }, idx, arr) => {
                  const isOutro = l === "Outro"
                  const exact = weapon.caliber === l
                  // Casa exato OU normalizado (ficha/catálogo vêm com formato diferente)
                  const selected = exact || (!isOutro && !!weapon.caliber && normCal(weapon.caliber) === normCal(l)) || (isOutro && weapon.caliber === "__outro__")
                  return (
                    <div key={l}>
                      <PickerItem label={l} desc={d} selected={selected} last={idx === arr.length - 1}
                        onSelect={() => {
                          if (isOutro) {
                            setCalibreCustomInput(weapon.caliber && !calibreOptions().some(o => o.l === weapon.caliber) ? weapon.caliber : "")
                            setDirect("caliber", "__outro__")
                          } else {
                            // Desmarca só se for exatamente igual; se veio da ficha (formato diferente),
                            // normaliza para o valor da opção em vez de perder.
                            setDirect("caliber", exact ? "" : l)
                            close("calibre")
                          }
                        }} />
                      {isOutro && weapon.caliber === "__outro__" && (
                        <div className="border-b border-[#e5d9c3] pb-4 pt-2 space-y-2">
                          <input autoFocus value={calibreCustomInput} onChange={e => setCalibreCustomInput(e.target.value)}
                            className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: .357 SIG, 7,5mm FK…" />
                          <button type="button" disabled={!calibreCustomInput.trim()}
                            onClick={() => { if (calibreCustomInput.trim()) { setDirect("caliber", calibreCustomInput.trim()); close("calibre") } }}
                            className="w-full rounded-xl border-2 border-[#9e7f45] bg-[#9e7f45] py-2.5 text-sm font-black uppercase tracking-[0.1em] text-white transition disabled:opacity-40">
                            Confirmar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calibre antecarga */}
      <AnimatePresence>
        {props.calibreAntecargaPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("calibreAntecarga")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Calibre (mm)" onClose={() => close("calibreAntecarga")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {([
                  { l: "6,35 mm (.25 cal)",  d: "Colt 1849 Pocket; revólveres de bolso de antecarga" },
                  { l: "7,65 mm (.30 cal)",  d: "Pistolas compactas e revólveres de antecarga de pequeno porte" },
                  { l: "7,87 mm (.31 cal)",  d: "Colt Model 1849 Pocket; muito encontrado como reprodução no Brasil" },
                  { l: "8,13 mm (.32 cal)",  d: "Rifles e pistolas de antecarga de pequeno porte" },
                  { l: "9,14 mm (.36 cal)",  d: "Colt Navy 1851; muito comum como reprodução no Brasil" },
                  { l: "10,16 mm (.40 cal)", d: "Pistolas e rifles de antecarga de médio porte" },
                  { l: "11,17 mm (.44 cal)", d: "Colt Army 1860 e Remington 1858; o mais comum no Brasil" },
                  { l: "11,43 mm (.45 cal)", d: "Rifles e pistolas de calibre padrão americano" },
                  { l: "11,5 mm",            d: "Revólveres de percussão de fabricação europeia; encontrados no Brasil" },
                  { l: "12,7 mm (.50 cal)",  d: "Rifles Kentucky/Hawken; muito usados por atiradores no Brasil" },
                  { l: "13,72 mm (.54 cal)", d: "Rifles plains e carabinas de caça; frequente em coleções no Brasil" },
                  { l: "14,73 mm (.58 cal)", d: "Fuzil Springfield / Enfield; projétil Minié; encontrado em coleções" },
                  { l: "15,4 mm (.61 cal)",  d: "Pistolas de duelo e armas de coleção de grande calibre" },
                  { l: "17,5 mm (.69 cal)",  d: "Mosquetes de alma lisa; padrão francês e americano colonial" },
                  { l: "19,0 mm (.75 cal)",  d: "Brown Bess; mosquete britânico padrão séc. XVIII–XIX" },
                  { l: "20,3 mm (.80 cal)",  d: "Armas pesadas de infantaria e artilharia leve" },
                  { l: "Outro",              d: "Informar calibre em mm não listado acima" },
                  { l: "Indeterminado",       d: "Calibre não pôde ser determinado" },
                ]).map(({ l, d }, idx, arr) => {
                  const isOutro = l === "Outro"
                  const selected = weapon.caliber === l || (isOutro && weapon.caliber === "__antecarga_outro__")
                  return (
                    <div key={l}>
                      <PickerItem label={l} desc={d} selected={selected} last={idx === arr.length - 1}
                        onSelect={() => {
                          if (isOutro) {
                            const knownLabels = ["6,35 mm (.25 cal)","7,65 mm (.30 cal)","7,87 mm (.31 cal)","8,13 mm (.32 cal)","9,14 mm (.36 cal)","10,16 mm (.40 cal)","11,17 mm (.44 cal)","11,43 mm (.45 cal)","11,5 mm","12,7 mm (.50 cal)","13,72 mm (.54 cal)","14,73 mm (.58 cal)","15,4 mm (.61 cal)","17,5 mm (.69 cal)","19,0 mm (.75 cal)","20,3 mm (.80 cal)","Indeterminado"]
                            setCalibreAntecargaCustom(weapon.caliber && !knownLabels.includes(weapon.caliber) ? weapon.caliber : "")
                            setDirect("caliber", "__antecarga_outro__")
                          } else {
                            setDirect("caliber", weapon.caliber === l ? "" : l)
                            close("calibreAntecarga")
                          }
                        }} />
                      {isOutro && weapon.caliber === "__antecarga_outro__" && (
                        <div className="border-b border-[#e5d9c3] pb-4 pt-2 space-y-2">
                          <input
                            autoFocus
                            value={calibreAntecargaCustom}
                            onChange={e => setCalibreAntecargaCustom(e.target.value)}
                            className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: 10,4 mm, 13,0 mm…"
                          />
                          <button
                            type="button"
                            disabled={!calibreAntecargaCustom.trim()}
                            onClick={() => {
                              if (calibreAntecargaCustom.trim()) {
                                setDirect("caliber", calibreAntecargaCustom.trim())
                                close("calibreAntecarga")
                              }
                            }}
                            className="w-full rounded-xl border-2 border-[#9e7f45] bg-[#9e7f45] py-2.5 text-sm font-black uppercase tracking-[0.1em] text-white transition disabled:opacity-40"
                          >
                            Confirmar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calibre arma de pressão */}
      <AnimatePresence>
        {props.calibreArmaPressaoPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("calibreArmaPressao")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Calibre" onClose={() => close("calibreArmaPressao")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {(weapon.adaptadaArmaFogo === true ? [
                  { l: ".22 LR", d: "Calibre de fogo circular rimfire" },
                  { l: ".32 ACP", d: "Pistolas compactas; uso civil" },
                  { l: ".38 SPL", d: "Calibre amplamente utilizado em revólveres" },
                  { l: "9 mm Luger", d: "Pistolas semiautomáticas; padrão NATO" },
                  { l: ".40 S&W", d: "Calibre policial de alta capacidade" },
                  { l: ".45 ACP", d: "Grande diâmetro; alto poder de parada" },
                  { l: "Outro calibre", d: "Calibre de arma de fogo não listado acima" },
                ] : [
                  { l: "4,5 mm (.177)", d: "Calibre mais comum; CO₂ e mola" },
                  { l: "5,5 mm (.22)", d: "Calibre intermediário; maior energia" },
                  { l: "6,35 mm (.25)", d: "Alta potência; rifles PCP" },
                  { l: "6 mm (airsoft)", d: "Calibre padrão de airsoft" },
                  { l: "Indeterminado", d: "Calibre não pôde ser determinado" },
                ]).map(({ l, d }, idx, arr) => (
                  <PickerItem key={l} label={l} desc={d} selected={weapon.caliber === l} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("caliber", weapon.caliber === l ? "" : l); close("calibreArmaPressao") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Material da coronha */}
      <AnimatePresence>
        {props.materialCoronhaPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("materialCoronha")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Material e acabamento da coronha" onClose={() => close("materialCoronha")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(["Madeira","Polímero","Borracha","Metal","Material sintético","Sem coronha","Polímero sintético","Madeira (mogno)","Madeira (faia)","Madeira (carvalho)","Madeira laminada","Fibra de vidro","Fibra de carbono","Metal (dobrável/retrátil)","Plástico reforçado","Borracha / soft-touch","Indeterminado"]).map((opt, idx, arr) => (
                  <PickerItem key={opt} label={opt} selected={weapon.materialCoroha === opt || (!!weapon.materialCoroha && normTxt(weapon.materialCoroha) === normTxt(opt))} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("materialCoroha", weapon.materialCoroha === opt ? "" : opt); close("materialCoronha") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Material do quadro */}
      <AnimatePresence>
        {props.materialQuadroPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("materialQuadro")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Material e acabamento do quadro" onClose={() => close("materialQuadro")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(["Aço","Aço oxidado","Aço inoxidável","Aço fosfatado","Alumínio forjado","Liga de alumínio","Liga metálica","Liga de zinco (Zamak)","Polímero","Polímero reforçado","Titânio","Aço niquelado","Indeterminado"]).map((opt, idx, arr) => (
                  <PickerItem key={opt} label={opt} selected={weapon.materialQuadro === opt || (!!weapon.materialQuadro && normTxt(weapon.materialQuadro) === normTxt(opt))} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("materialQuadro", weapon.materialQuadro === opt ? "" : opt); close("materialQuadro") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Acabamento */}
      <AnimatePresence>
        {props.acabamentoPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("acabamento")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Acabamento" onClose={() => close("acabamento")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(FIREARMS.includes(weapon.type as WeaponType) ? [
                  "Oxidado / pavonado","Niquelado","Cromado","Brunido","Polido / espelhado","Fosfatado","DLC (Diamond-Like Carbon)","Revestimento Teflon","Casehardenado","Inox escovado","Indeterminado",
                ] : [
                  "Polido / espelhado","Brunido / escurecido","Fosco","Revestimento preto","Titânio","DLC (Diamond-Like Carbon)","Pintado","Envernizado","Oxidado","Indeterminado",
                ]).map((opt, idx, arr) => (
                  <PickerItem key={opt} label={opt} selected={weapon.acabamento === opt || (!!weapon.acabamento && normTxt(weapon.acabamento) === normTxt(opt))} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("acabamento", weapon.acabamento === opt ? "" : opt); close("acabamento") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tipo de pólvora */}
      <AnimatePresence>
        {props.tipoPolvoraPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("tipoPolvora")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Tipo de pólvora" onClose={() => close("tipoPolvora")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(["Pólvora negra (black powder)","Pólvora sem fumaça — base simples (nitrocelulose)","Pólvora sem fumaça — base dupla (nitrocelulose + nitroglicerina)","Pólvora sem fumaça — base tripla","Propelente esférico (ball powder)","Propelente extrudado","Propelente de chumbinho (pistão de ar)","Indeterminado"]).map((opt, idx, arr) => (
                  <PickerItem key={opt} label={opt} selected={weapon.tipoPolvora === opt} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("tipoPolvora", weapon.tipoPolvora === opt ? "" : opt); close("tipoPolvora") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tipo de espoleta */}
      <AnimatePresence>
        {props.tipoEspoletaPickerOpen && (
          <>
            <motion.div className={backdropClass} {...backdropAnim} onClick={() => close("tipoEspoleta")} />
            <motion.div className={sheetClass} {...sheetAnim}>
              <SheetHeader title="Tipo de espoleta" onClose={() => close("tipoEspoleta")} />
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {ordenarOpcoes(["Boxer (percussão central — 1 orifício)","Berdan (percussão central — 2 orifícios)","Rimfire (percussão periférica / anel)","Percussão anular","Espoleta elétrica","Indeterminado"]).map((opt, idx, arr) => (
                  <PickerItem key={opt} label={opt} selected={weapon.tipoEspoleta === opt} last={idx === arr.length - 1}
                    onSelect={() => { setDirect("tipoEspoleta", weapon.tipoEspoleta === opt ? "" : opt); close("tipoEspoleta") }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Field Helper */}
      <AnimatePresence>
        {fieldHelper && (
          <>
            <motion.div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={clearFieldHelper} />
            <motion.div
              className="fixed inset-x-4 top-1/2 z-[210] -translate-y-1/2 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
            >
              <div className="flex items-center justify-between border-b border-[#ede3ce] bg-[#fdfaf4] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#12213d] text-[11px] font-black text-[#f0d08a]">?</div>
                  <span className="text-[13px] font-black uppercase tracking-[0.16em] text-[#50442f]">{fieldHelper.title}</span>
                </div>
                <button type="button" onClick={clearFieldHelper} className="rounded-lg border border-[#d3c4a8] bg-[#f5efe3] p-1 text-[#8d7854]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 text-[15px] leading-relaxed text-[#50442f]">{fieldHelper.text}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
