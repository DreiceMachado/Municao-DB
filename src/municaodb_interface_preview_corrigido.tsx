import React, { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import logo from "./assets/logo.png"
import logoEscudo from "./assets/logo-escudo.png"
import {
  BarChart3,
  Building2,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Database,
  Eye,
  EyeOff,
  FolderKanban,
  Crosshair,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Microscope,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  Target,
  User2,
  X,
} from "lucide-react"

type WeaponType =
  | "REVÓLVER" | "PISTOLA" | "ESPINGARDA" | "CARABINA" | "FUZIL" | "METRALHADORA"
  | "ESTOJO" | "PROJÉTIL" | "CARTUCHO" | "FACA" | "ARMA DE PRESSÃO" | "ARMA DE ANTECARGA" | "PÓLVORA" | "ESPOLETA" | "CARREGADOR"

type WeaponEntry = {
  type: WeaponType
  // 1. Identificação
  identificacao: string
  brand: string
  model: string
  caliber: string
  serial: string
  paisFabricacao: string
  origemMunicao: string
  // 2. Características físicas
  material: string
  acabamento: string
  compCano: string // Comprimento do cano
  numCamaras: string // Número de câmaras (revólver)
  tipoMira: string
  tipoCarregador: string
  // 3. Mecanismo de funcionamento
  acaoSimples: boolean
  acaoDupla: boolean
  tamborGira: boolean
  indexacaoCorreta: boolean
  caoFuncional: boolean
  gatilhoFuncional: boolean
  seguranca: boolean
  // 4. Estado de conservação
  ferrugem: boolean
  ferrugemObs: string
  desgaste: boolean
  desgasteObs: string
  danoEstruturais: boolean
  danoEstruturaisObs: string
  pecasFaltantes: boolean
  pecasFaltantesObs: string
  // 5. Exame de disparo (revólver)
  aptoDisparo: boolean
  funcMunicaoReal: boolean
  testePercussao: boolean
  marcacaoPercussor: boolean
  // Carabina — Funcionamento
  sistemaRepeticao: boolean
  // Pistola — Funcionamento
  carregadorPresente: boolean
  carregadorFuncional: boolean
  ferrolhoFuncional: boolean
  percussorFuncional: boolean
  extratorFuncional: boolean
  ejetorFuncional: boolean
  retencaoFerrolho: boolean
  alimentacaoFuncional: boolean
  // Pistola — Estado de conservação
  desgasteMecanico: boolean
  desgasteMecanicoObs: string
  danosAparentes: boolean
  danosAparentesObs: string
  // Pistola — Teste de disparo
  extracaoFuncional: boolean
  ejacaoFuncional: boolean
  ciclagemFuncional: boolean
  // Físicas gerais (multi-tipo)
  compTotal: string
  capacidadeCarregador: string
  numCanos: string
  // Armas de fogo
  sistemaAcionamento: string
  tamanhoCamara: string
  tipoRaiamento: string
  materialQuadro: string
  materialCoroha: string
  // FUZIL / METRALHADORA
  modoFogo: string
  seletoDisparo: boolean
  modoSemiAuto: boolean
  modoAutoFuncional: boolean
  culatelFuncional: boolean
  // ESTOJO / PROJÉTIL
  formato: string
  numEstrias: string
  sentidoEstrias: string
  diametro: string
  marcacaoExtrator: boolean
  marcacaoEjetor: boolean
  marcacaoCamara: boolean
  estriasPresentes: boolean
  deformacaoPresente: boolean
  fragmentado: boolean
  oxidacaoPresente: boolean
  inscricaoFabricante: string
  // CARTUCHO
  amassado: boolean
  completo: boolean
  // FACA
  tipoLamina: string
  compLamina: string
  tipoGume: string
  gumeFuncional: boolean
  aptaUso: boolean
  laminaIntegra: boolean
  caboDanificado: boolean
  manchas: boolean
  manchasObs: string
  institucional: boolean | null
  naFlags: string[]
  tipoProd: string
  serialEstado: string
  quantidade: string
  diametroMin: string
  massa: string
  origemProjetil: string
  origemProjetilRef: string
  regiaoColeta: string
  deformacoesAcidentais: string
  estadoProjetil: string
  estadoCartucho: string
  estadoEstojo: string
  alturaProjetil: string
  // PÓLVORA
  tipoPolvora: string
  cor: string
  // ESPOLETA
  tipoEspoleta: string
  // ARMA DE PRESSÃO
  adaptadaArmaFogo: boolean | null
}

type RecordItem = {
  id: string
  number: string
  year: string
  type: WeaponType
  model: string
  updatedAt: string
  unit: string
  expert: string
}

const recordsSeed: RecordItem[] = [
  {
    id: "1",
    number: "Sem número",
    year: "2026",
    type: "REVÓLVER",
    model: "Exame preliminar",
    updatedAt: "24/03/2026, 15:01:28",
    unit: "NPC Umuarama",
    expert: "Perito responsável",
  },
  {
    id: "2",
    number: "1234",
    year: "2026",
    type: "PISTOLA",
    model: "Taurus G2C",
    updatedAt: "23/03/2026, 23:18:40",
    unit: "NPC Cascavel",
    expert: "Perito responsável",
  },
  {
    id: "3",
    number: "2217",
    year: "2026",
    type: "CARABINA",
    model: "CBC Puma",
    updatedAt: "20/03/2026, 10:21:58",
    unit: "NPC Curitiba",
    expert: "Perito responsável",
  },
]

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function CollapsibleSection({
  title,
  extra,
  children,
  defaultOpen = true,
}: {
  title: string
  extra?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-[#d3c3a4] pb-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left md:cursor-default"
        >
          <span className="text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">{title}</span>
          <ChevronDown className="h-5 w-5 shrink-0 text-[#6b5838] md:hidden" />
        </button>
        {extra && <div className="flex items-center gap-2">{extra}</div>}
      </div>
      <div className={cn("md:!block", open ? "block" : "hidden")}>{children}</div>
    </div>
  )
}

function CollapsibleCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d5c7aa] bg-[#fbf8f3]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 md:cursor-default"
      >
        <span className="text-sm font-black uppercase tracking-[0.14em] text-[#50442f] md:text-xs md:tracking-[0.18em] md:text-[#6b5838]">{title}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e8dfc8] text-[#6b5838] shadow-sm md:hidden">
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      <div className={cn("px-5 pb-6 md:!block", open ? "block" : "hidden")}>{children}</div>
    </div>
  )
}

function PieceIcon({ type, className = "h-14 w-auto" }: { type: WeaponType; className?: string }) {
  switch (type) {
    case "REVÓLVER": return (
      <svg viewBox="0 0 64 40" fill="currentColor" className={className} aria-hidden="true">
        <rect x="8" y="22" width="10" height="16" rx="3"/>
        <rect x="8" y="14" width="22" height="9" rx="2"/>
        <ellipse cx="25" cy="18" rx="9" ry="9"/>
        <ellipse cx="25" cy="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="25" cy="18" r="1.5"/>
        <rect x="29" y="15" width="26" height="6" rx="2"/>
        <path d="M11 23 Q11 30 18 30 L18 23" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="6" y="12" width="5" height="7" rx="1.5"/>
      </svg>
    )
    case "PISTOLA": return (
      <svg viewBox="0 0 64 40" fill="currentColor" className={className} aria-hidden="true">
        <rect x="12" y="20" width="11" height="18" rx="3"/>
        <rect x="12" y="12" width="30" height="10" rx="2"/>
        <rect x="20" y="8" width="26" height="9" rx="2"/>
        <rect x="44" y="10" width="16" height="5" rx="2"/>
        <path d="M15 22 Q15 30 24 30 L24 22" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="34" y="9" width="7" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="20" y="6" width="4" height="3" rx="1"/>
        <rect x="56" y="7" width="3" height="3" rx="1"/>
      </svg>
    )
    case "ESPINGARDA": return (
      <svg viewBox="0 0 88 36" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 14 Q2 6 8 6 L20 8 L22 28 L8 30 Q2 30 2 22 Z"/>
        <rect x="20" y="10" width="10" height="18" rx="2"/>
        <rect x="18" y="8" width="22" height="13" rx="2"/>
        <rect x="38" y="9" width="22" height="11" rx="2"/>
        <rect x="58" y="10" width="28" height="9" rx="3"/>
        <path d="M22 22 Q22 32 30 32 L30 24" fill="none" stroke="currentColor" strokeWidth="2"/>
        <ellipse cx="86" cy="14.5" rx="2" ry="4.5"/>
      </svg>
    )
    case "CARABINA": return (
      <svg viewBox="0 0 80 32" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 14 Q2 8 8 8 L16 8 L18 24 L8 26 Q2 26 2 20 Z"/>
        <rect x="18" y="17" width="8" height="12" rx="2"/>
        <rect x="16" y="9" width="22" height="10" rx="2"/>
        <rect x="36" y="10" width="20" height="8" rx="2"/>
        <rect x="54" y="12" width="24" height="4" rx="2"/>
        <path d="M22 19 L28 19 L30 30 L20 30 Z"/>
        <rect x="18" y="6" width="20" height="4" rx="1"/>
        <rect x="77" y="11" width="3" height="6" rx="1"/>
      </svg>
    )
    case "FUZIL": return (
      <svg viewBox="0 0 88 36" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 15 L14 13 L16 22 L2 24 Z"/>
        <rect x="10" y="14" width="9" height="8" rx="1"/>
        <rect x="16" y="13" width="22" height="10" rx="2"/>
        <path d="M20 23 L28 22 L30 35 L18 35 Z"/>
        <rect x="18" y="7" width="28" height="8" rx="2"/>
        <rect x="18" y="5" width="26" height="3" rx="1" opacity="0.5"/>
        <rect x="44" y="8" width="22" height="7" rx="2"/>
        <rect x="64" y="10" width="22" height="4" rx="1.5"/>
        <path d="M22 23 L32 23 L34 35 L20 35 Q20 33 22 30 Z"/>
        <rect x="85" y="9" width="3" height="6" rx="1"/>
      </svg>
    )
    case "METRALHADORA": return (
      <svg viewBox="0 0 80 40" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 16 L12 14 L14 22 L2 24 Z"/>
        <rect x="10" y="10" width="28" height="14" rx="2"/>
        <rect x="16" y="24" width="9" height="13" rx="2"/>
        <rect x="36" y="11" width="30" height="12" rx="2"/>
        <rect x="64" y="13" width="14" height="8" rx="2"/>
        <rect x="12" y="24" width="22" height="14" rx="2"/>
        <circle cx="42" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="48" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="54" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="60" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <rect x="77" y="12" width="3" height="10" rx="1"/>
      </svg>
    )
    case "ESTOJO": return (
      <svg viewBox="0 0 24 56" fill="currentColor" className={className} aria-hidden="true">
        <path d="M7 6 Q7 2 9 2 L15 2 Q17 2 17 6 Z"/>
        <rect x="7" y="5" width="10" height="34" rx="1.5"/>
        <rect x="5" y="39" width="14" height="3" rx="1" opacity="0.55"/>
        <rect x="3" y="42" width="18" height="5" rx="1.5"/>
        <rect x="5" y="47" width="14" height="4" rx="1"/>
        <circle cx="12" cy="49.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    )
    case "PROJÉTIL": return (
      <svg viewBox="0 0 20 52" fill="currentColor" className={className} aria-hidden="true">
        <path d="M3 28 Q2 12 10 2 Q18 12 17 28 Z"/>
        <rect x="3" y="26" width="14" height="22" rx="1"/>
        <rect x="3" y="36" width="14" height="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    )
    case "CARTUCHO": return (
      <svg viewBox="0 0 24 68" fill="currentColor" className={className} aria-hidden="true">
        <path d="M5 28 Q4 12 12 2 Q20 12 19 28 Z"/>
        <rect x="5" y="26" width="14" height="8" rx="1"/>
        <path d="M5 34 L7 40 L17 40 L19 34 Z"/>
        <rect x="7" y="32" width="10" height="10" rx="1"/>
        <rect x="5" y="39" width="14" height="17" rx="1"/>
        <rect x="4" y="55" width="16" height="2.5" rx="1" opacity="0.55"/>
        <rect x="3" y="57" width="18" height="5" rx="1.5"/>
        <circle cx="12" cy="64" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    )
    case "CARREGADOR": return (
      <svg viewBox="0 0 32 48" fill="currentColor" className={className} aria-hidden="true">
        <rect x="7" y="2" width="18" height="36" rx="3"/>
        <rect x="10" y="5" width="12" height="4" rx="1.5" opacity="0.35"/>
        <rect x="10" y="11" width="12" height="3" rx="1" opacity="0.28"/>
        <rect x="10" y="16" width="12" height="3" rx="1" opacity="0.28"/>
        <rect x="10" y="21" width="12" height="3" rx="1" opacity="0.28"/>
        <rect x="9" y="38" width="14" height="8" rx="2"/>
      </svg>
    )
    case "FACA": return (
      <svg viewBox="0 0 72 28" fill="currentColor" className={className} aria-hidden="true">
        <rect x="2" y="10" width="18" height="10" rx="3"/>
        <rect x="5" y="11" width="2" height="8" rx="1" opacity="0.32"/>
        <rect x="9" y="11" width="2" height="8" rx="1" opacity="0.32"/>
        <rect x="13" y="11" width="2" height="8" rx="1" opacity="0.32"/>
        <rect x="19" y="7" width="3" height="16" rx="1.5"/>
        <path d="M22 9 L68 14 L22 19 Z"/>
        <path d="M22 9 L58 11 L68 14" fill="none" stroke="currentColor" strokeWidth="0.8"/>
      </svg>
    )
    case "ARMA DE ANTECARGA": return (
      <svg viewBox="0 0 88 32" fill="currentColor" className={className} aria-hidden="true">
        {/* Cano longo */}
        <rect x="4" y="13" width="60" height="6" rx="3"/>
        <rect x="62" y="14" width="20" height="4" rx="2"/>
        {/* Coronha curva */}
        <path d="M4 13 Q2 13 2 19 Q2 25 6 27 L14 27 Q10 22 10 19 L4 19 Z"/>
        {/* Gatilho/cão */}
        <path d="M18 19 Q20 23 18 27" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        {/* Pederneira / mecanismo */}
        <rect x="14" y="10" width="8" height="9" rx="1.5" opacity="0.7"/>
        <rect x="15" y="8" width="5" height="3" rx="1" opacity="0.5"/>
      </svg>
    )
    case "ARMA DE PRESSÃO": return (
      <svg viewBox="0 0 80 36" fill="currentColor" className={className} aria-hidden="true">
        {/* Cano */}
        <rect x="10" y="15" width="48" height="7" rx="3.5"/>
        <rect x="55" y="16" width="14" height="5" rx="2.5"/>
        {/* Coronha/cabo */}
        <rect x="6" y="22" width="10" height="12" rx="3"/>
        <rect x="8" y="23" width="2" height="10" rx="1" opacity="0.3"/>
        <rect x="11" y="23" width="2" height="10" rx="1" opacity="0.3"/>
        {/* Gatilho */}
        <path d="M18 22 Q20 26 18 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        {/* Reservatório de CO2 */}
        <ellipse cx="14" cy="20" rx="6" ry="4" opacity="0.6"/>
      </svg>
    )
    default: return null
  }
}

function SidebarContent({ onOpenProfile }: { onOpenProfile: () => void }) {
  const item =
    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[17px] font-medium transition"
  const icon = "h-5 w-5"

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#8e7340]/60 px-6 py-4">
        <img
          src={logo}
          alt="Polícia Científica"
          className="mx-auto w-24 h-24 object-contain"
          style={{ background: "transparent" }}
        />
        <div className="mt-3 text-center">
          <div className="text-base font-bold tracking-wide text-[#f4dda2]">
            POLÍCIA CIENTÍFICA
          </div>
          <div className="text-xs uppercase tracking-[0.32em] text-[#d3b971]">
            Paraná
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-[#b89a58]">
          Perícia
        </div>

        <div className="space-y-2">
          <button className={cn(item, "text-[#f3e8c3] hover:bg-[#d7b76f]/10")}>
            <LayoutDashboard className={icon} />
            Início
          </button>

          <button className={cn(item, "bg-[#d7b76f]/12 text-[#f4dda2] shadow-inner shadow-[#d7b76f]/10")}>
            <Crosshair className={icon} />
            Exames de Armas
          </button>

          <button className={cn(item, "text-[#f3e8c3] hover:bg-[#d7b76f]/10")}>
            <FolderKanban className={icon} />
            Registros
          </button>

          <button className={cn(item, "text-[#f3e8c3] hover:bg-[#d7b76f]/10")}>
            <BarChart3 className={icon} />
            Estatísticas
          </button>
        </div>

        <div className="mb-3 mt-7 text-xs font-bold uppercase tracking-[0.32em] text-[#b89a58]">
          Referência
        </div>

        <div className="space-y-2">
          <button className={cn(item, "text-[#f3e8c3] hover:bg-[#d7b76f]/10")}>
            <Database className={icon} />
            Base de Dados
          </button>

          <button className={cn(item, "text-[#f3e8c3] hover:bg-[#d7b76f]/10")}>
            <Target className={icon} />
            Calibres
          </button>

          <button className={cn(item, "text-[#f3e8c3] hover:bg-[#d7b76f]/10")}>
            <Building2 className={icon} />
            Fabricantes
          </button>
        </div>
      </div>

      <div className="mt-auto border-t border-[#8e7340]/60">
        <button
          onClick={onOpenProfile}
          className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-[#d7b76f]/10 active:bg-[#d7b76f]/15"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0d08a]/15">
            <User2 className="h-5 w-5 text-[#f0d08a]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[#f3e8c3]">Perfil</div>
            <div className="text-[10px] text-[#b89a58] truncate">Configurações da conta</div>
          </div>
          <Settings className="h-4 w-4 shrink-0 text-[#7a8a9a]" />
        </button>
        <div className="px-6 pb-3 text-[10px] text-[#4a5a72]">v3.0 • Beta</div>
      </div>
    </div>
  )
}
function TopTab({
  label,
  active = false,
}: {
  label: string
  active?: boolean
}) {
  return (
    <button
      className={cn(
        "border-r border-[#8e7340] px-4 py-3 text-[15px] font-semibold tracking-wide transition",
        active
          ? "bg-[#1a2846] text-[#f4dda2]"
          : "bg-[linear-gradient(180deg,#dcc17b_0%,#c9a458_100%)] text-[#1c2433] hover:brightness-105",
      )}
    >
      {label}
    </button>
  )
}

function PhotoSlot({
  label,
  slotKey,
  photoUrl,
  onCapture,
  onRemove,
  onView,
}: {
  label: string
  slotKey: string
  photoUrl?: string
  onCapture: (key: string, file: File) => void
  onRemove: (key: string) => void
  onView: (url: string) => void
}) {
  const cameraRef = React.useRef<HTMLInputElement>(null)
  const galleryRef = React.useRef<HTMLInputElement>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [converting, setConverting] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      /\.(heic|heif)$/i.test(file.name)

    if (isHeic) {
      setConverting(true)
      try {
        const heic2any = (await import("heic2any")).default
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.88 })
        const converted = new File(
          [blob as Blob],
          file.name.replace(/\.(heic|heif)$/i, ".jpg"),
          { type: "image/jpeg" }
        )
        onCapture(slotKey, converted)
      } catch {
        onCapture(slotKey, file)
      } finally {
        setConverting(false)
      }
    } else {
      onCapture(slotKey, file)
    }
  }

  const ACCEPT = "image/*,.heic,.heif"
  const camId = `fc-cam-${slotKey}`
  const galId = `fc-gal-${slotKey}`

  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#6b5838]">{label}</span>
      <input id={camId} ref={cameraRef} type="file" accept={ACCEPT} capture="environment" onChange={handleFile} className="sr-only" />
      <input id={galId} ref={galleryRef} type="file" accept={ACCEPT} onChange={handleFile} className="sr-only" />

      {converting ? (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#c8b47e] bg-[#fbf8f2]">
          <svg className="h-8 w-8 animate-spin text-[#b89a58]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-[11px] font-bold text-[#8d7854]">Convertendo…</span>
        </div>
      ) : photoUrl ? (
        <div className="overflow-hidden rounded-2xl border-2 border-[#b89a58] bg-white shadow-sm">
          <button type="button" onClick={() => onView(photoUrl)} className="block w-full">
            <img src={photoUrl} alt={label} className="aspect-[4/3] w-full object-cover" />
          </button>
          <div className="flex divide-x divide-[#e8dfc8] bg-[#fbf8f2]">
            <button type="button" onClick={() => setShowPicker(true)} className="flex flex-1 items-center justify-center gap-1 py-3 text-[#6b5838] active:bg-[#ece6da]">
              <Camera className="h-4 w-4" />
              <span className="text-[10px] font-bold">Trocar</span>
            </button>
            <button type="button" onClick={() => onRemove(slotKey)} className="flex items-center justify-center px-4 py-3 text-[#b03030] active:bg-[#fdf0f0]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c8b47e] bg-[#fbf8f2] active:bg-[#ece6da]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8dfc8]">
            <Camera className="h-7 w-7 text-[#8d7854]" />
          </div>
          <span className="text-[12px] font-semibold text-[#8d7854]">Adicionar foto</span>
        </button>
      )}

      {/* Picker de origem */}
      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4">
                  <div className="text-base font-black text-[#f0d08a]">{label}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione a origem</div>
                </div>
                <div className="space-y-3 p-4">
                  <label
                    htmlFor={camId}
                    onClick={() => setShowPicker(false)}
                    className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-4 text-left active:scale-[.97] active:bg-[#ece6da]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                      <Camera className="h-6 w-6 text-[#8d7854]" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#1d2433]">Câmera</div>
                      <div className="text-xs text-[#8d7854]">Tirar foto agora</div>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-[#b89a58]" />
                  </label>
                  <label
                    htmlFor={galId}
                    onClick={() => setShowPicker(false)}
                    className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-4 text-left active:scale-[.97] active:bg-[#ece6da]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                      <ImageIcon className="h-6 w-6 text-[#8d7854]" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#1d2433]">Galeria</div>
                      <div className="text-xs text-[#8d7854]">Escolher da galeria</div>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-[#b89a58]" />
                  </label>
                </div>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => setShowPicker(false)}
                    className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const photoSlotsByType: Record<WeaponType, string[]> = {
  "REVÓLVER":     ["Frente – boca do cano", "Lado direito", "Lado esquerdo", "Superior", "Inferior", "Numeração de série"],
  "PISTOLA":      ["Frente – boca do cano", "Lado direito", "Lado esquerdo", "Superior", "Inferior", "Numeração de série"],
  "ESPINGARDA":   ["Frente – boca do cano", "Lado direito", "Lado esquerdo", "Superior", "Inferior", "Numeração de série"],
  "CARABINA":     ["Frente – boca do cano", "Lado direito", "Lado esquerdo", "Superior", "Inferior", "Numeração de série"],
  "FUZIL":        ["Frente – boca do cano", "Lado direito", "Lado esquerdo", "Superior", "Inferior", "Numeração de série"],
  "METRALHADORA": ["Frente – boca do cano", "Lado direito", "Lado esquerdo", "Superior", "Inferior", "Numeração de série"],
  "ESTOJO":       ["Vista lateral", "Base – headstamp", "Boca do estojo", "Marcação de percussor"],
  "PROJÉTIL":     ["Vista lateral", "Base do projétil", "Ápice", "Estrias"],
  "CARTUCHO":     ["Vista lateral", "Base – headstamp", "Vista do projétil", "Vista geral"],
  "FACA":         ["Lâmina – frente", "Lâmina – verso", "Cabo", "Ponta", "Gume", "Numeração"],
  "ARMA DE PRESSÃO": ["Frente – boca do cano", "Lado direito", "Lado esquerdo", "Reservatório/cilindro", "Vista geral"],
  "ARMA DE ANTECARGA": ["Frente – boca do cano", "Lado direito", "Lado esquerdo", "Mecanismo de ignição", "Coronha", "Vista geral"],
  "PÓLVORA":      ["Vista geral", "Embalagem – frente", "Embalagem – verso", "Detalhe da granulometria"],
  "ESPOLETA":     ["Vista frontal", "Vista lateral", "Base da espoleta", "Marcação de percussor"],
  "CARREGADOR":   ["Vista frontal", "Vista lateral", "Base", "Detalhe interno"],
}

export default function BalísticaDBInterfacePreview({ onLogout }: { onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [weaponType, setWeaponType] = useState<WeaponType | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [numberFilter, setNumberFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("2026")
  const [unitFilter, setUnitFilter] = useState("")

  const [form, setForm] = useState({
    examNumber: "",
    examYear: String(new Date().getFullYear()),
    unit: "Núcleo de Polícia Científica",
    expert: "Perito responsável",
    date: "26/03/2026",
    observacoes: "",
  })

  const [weapons, setWeapons] = useState<WeaponEntry[]>([])
  const [activeWeaponIdx, setActiveWeaponIdx] = useState(0)
  const [showAddWeaponSelector, setShowAddWeaponSelector] = useState(false)
  const [savedPieces, setSavedPieces] = useState<WeaponEntry[]>([])
  const [editingPieceIdx, setEditingPieceIdx] = useState<number | null>(null)
  const [confirmDeletePieceIdx, setConfirmDeletePieceIdx] = useState<number | null>(null)
  const [pieceFormOpen, setPieceFormOpen] = useState(false)
  const [typePickerOpen, setTypePickerOpen] = useState(false)
  const [examType, setExamType] = useState<"EFICIÊNCIA" | "CONSTATAÇÃO" | null>(null)
  const [repMinimized, setRepMinimized] = useState(false)
  const [confirmDeleteRep, setConfirmDeleteRep] = useState(false)
  const [confirmDeleteMira, setConfirmDeleteMira] = useState(false)
  const [confirmDeleteCarregador, setConfirmDeleteCarregador] = useState(false)
  const [photosOpen, setPhotosOpen] = useState(false)
  const [lacreNumero, setLacreNumero] = useState("")
  const [lacreSaidaNumero, setLacreSaidaNumero] = useState("")
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map())
  const [viewerPhoto, setViewerPhoto] = useState<string | null>(null)
  const [materialPickerOpen, setMaterialPickerOpen] = useState(false)
  const [formatoPickerOpen, setFormatoPickerOpen] = useState(false)
  const [sentidoPickerOpen, setSentidoPickerOpen] = useState(false)
  const [deformacoesPickerOpen, setDeformacoesPickerOpen] = useState(false)
  const [miraPickerOpen, setMiraPickerOpen] = useState(false)
  const [carregadorPickerOpen, setCarregadorPickerOpen] = useState(false)
  const [tipoLaminaPickerOpen, setTipoLaminaPickerOpen] = useState(false)
  const [tipoGumePickerOpen, setTipoGumePickerOpen] = useState(false)
  const [acabamentoPickerOpen, setAcabamentoPickerOpen] = useState(false)
  const [sistemaAcionamentoPickerOpen, setSistemaAcionamentoPickerOpen] = useState(false)
  const [calibreArmaPressaoPickerOpen, setCalibreArmaPressaoPickerOpen] = useState(false)
  const [calibreAntecargaPickerOpen, setCalibreAntecargaPickerOpen] = useState(false)
  const [calibrePickerOpen, setCalibrePickerOpen] = useState(false)
  const [calibreCustomInput, setCalibreCustomInput] = useState("")
  const [paisPickerOpen, setPaisPickerOpen] = useState(false)
  const [tipoRaiamentoPickerOpen, setTipoRaiamentoPickerOpen] = useState(false)
  const [materialCoronhaPickerOpen, setMaterialCoronhaPickerOpen] = useState(false)
  const [materialQuadroPickerOpen, setMaterialQuadroPickerOpen] = useState(false)
  const [tipoPolvoraPickerOpen, setTipoPolvoraPickerOpen] = useState(false)
  const [tipoEspoletaPickerOpen, setTipoEspoletaPickerOpen] = useState(false)
  const [fieldHelper, setFieldHelper] = useState<{ title: string; text: string } | null>(null)
  const HelpBtn = ({ title, text }: { title: string; text: string }) => (
    <button
      type="button"
      onClick={() => setFieldHelper({ title, text })}
      className="ml-1.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[#c8a96e] bg-[#fdf6e8] text-[10px] font-black text-[#9e7f45] transition active:bg-[#f0d08a]"
    >?</button>
  )

  const [profileView, setProfileView] = useState<null | "main" | "changeEmail" | "changePassword">(null)
  const [profileEmail, setProfileEmail] = useState("")
  const [profileEmailConfirm, setProfileEmailConfirm] = useState("")
  const [profileCurPwd, setProfileCurPwd] = useState("")
  const [profileNewPwd, setProfileNewPwd] = useState("")
  const [profileNewPwdConfirm, setProfileNewPwdConfirm] = useState("")
  const [profileShowPwd, setProfileShowPwd] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const handlePhotoCapture = (key: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setPhotoUrls(prev => {
        const next = new Map(prev)
        next.set(key, url)
        return next
      })
    }
    reader.readAsDataURL(file)
  }
  const handlePhotoRemove = (key: string) =>
    setPhotoUrls(prev => { const n = new Map(prev); n.delete(key); return n })

  const activeWeapon = weapons[activeWeaponIdx] ?? null

  const resetPieceForm = () => {
    setWeaponType(null) // Reset weapon type
    setWeapons([]) // Clear current weapon forms
    setActiveWeaponIdx(0) // Reset active weapon index
    setPieceFormOpen(false) // Close piece form
    setPhotosOpen(false) // Close photos screen
    setLacreNumero("") // Clear entry seal number
    setLacreSaidaNumero("") // Clear exit seal number
    setPhotoUrls(new Map()) // Clear photo URLs
    setViewerPhoto(null)
    setEditingPieceIdx(null)
  }

  const savePiece = () => {
    if (!activeWeapon) return
    if (editingPieceIdx !== null) {
      setSavedPieces(prev => prev.map((p, i) => i === editingPieceIdx ? { ...activeWeapon } : p))
    } else {
      setSavedPieces(prev => [...prev, { ...activeWeapon }])
    }
    resetPieceForm()
  }

  const openEditPiece = (idx: number) => {
    const piece = savedPieces[idx]
    setEditingPieceIdx(idx)
    setWeaponType(piece.type)
    setWeapons([{ ...piece }])
    setActiveWeaponIdx(0)
    setPieceFormOpen(true)
  }

  const removeSavedPiece = (idx: number) => {
    setSavedPieces(prev => prev.filter((_, i) => i !== idx))
  }

  const filteredRecords = useMemo(() => {
    return recordsSeed.filter((item) => {
      const numberOk =
        !numberFilter ||
        item.number.toLowerCase().includes(numberFilter.toLowerCase()) ||
        item.model.toLowerCase().includes(numberFilter.toLowerCase())
      const yearOk = !yearFilter || item.year.includes(yearFilter)
      const unitOk = !unitFilter || item.unit.toLowerCase().includes(unitFilter.toLowerCase())
      return numberOk && yearOk && unitOk
    })
  }, [numberFilter, yearFilter])

  const titleByType: Record<WeaponType, string> = {
    "REVÓLVER":     "Exame de Revólver",
    "PISTOLA":      "Exame de Pistola",
    "ESPINGARDA":   "Exame de Espingarda",
    "CARABINA":     "Exame de Carabina",
    "FUZIL":        "Exame de Fuzil",
    "METRALHADORA": "Exame de Metralhadora",
    "ESTOJO":       "Exame de Estojo",
    "PROJÉTIL":     "Exame de Projétil",
    "CARTUCHO":     "Exame de Cartucho",
    "FACA":         "Exame de Faca",
    "ARMA DE PRESSÃO":    "Exame de Arma de Pressão",
    "ARMA DE ANTECARGA":  "Exame de Arma de Antecarga",
    "PÓLVORA":      "Exame de Pólvora",
    "ESPOLETA":     "Exame de Espoleta",
    "CARREGADOR":   "Exame de Carregador",
  }

  const handleField =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target instanceof HTMLInputElement && event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value
      setForm((current) => ({ ...current, [field]: value as never }))
    }

  const handleWeaponField =
    (field: keyof Omit<WeaponEntry, "type">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target instanceof HTMLInputElement && event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value
      setWeapons((prev) =>
        prev.map((w, i) => (i === activeWeaponIdx ? { ...w, [field]: value as never } : w))
      )
    }

  const setWeaponDirect = (field: keyof Omit<WeaponEntry, "type">, value: string | boolean | null) => {
    setWeapons(prev => prev.map((w, i) => i === activeWeaponIdx ? { ...w, [field]: value as never } : w))
  }

  const handleWeaponNaToggle = (field: string) => {
    setWeapons(prev => prev.map((w, i) => {
      if (i !== activeWeaponIdx) return w
      const naFlags = w.naFlags.includes(field)
        ? w.naFlags.filter(f => f !== field) // Remove if already present
        : [...w.naFlags, field]
      return { ...w, naFlags }
    }))
  }

  const makeWeaponEntry = (type: WeaponType): WeaponEntry => ({
    type,
    identificacao: "", brand: "", model: "", caliber: "", serial: "", paisFabricacao: "", origemMunicao: "",
    material: "", acabamento: "", compCano: "", numCamaras: "", tipoMira: [], tipoCarregador: [], // Changed to arrays
    acaoSimples: true, acaoDupla: true, tamborGira: true, indexacaoCorreta: true, // Default to true for boolean flags
    caoFuncional: true, gatilhoFuncional: true, seguranca: true,
    ferrugem: false, ferrugemObs: "", desgaste: false, desgasteObs: "",
    danoEstruturais: false, danoEstruturaisObs: "", pecasFaltantes: false, pecasFaltantesObs: "",
    aptoDisparo: true, funcMunicaoReal: true, testePercussao: true, marcacaoPercussor: true,
    sistemaRepeticao: true, carregadorPresente: true, carregadorFuncional: true,
    ferrolhoFuncional: true, percussorFuncional: true, extratorFuncional: true,
    ejetorFuncional: true, retencaoFerrolho: true, alimentacaoFuncional: true,
    desgasteMecanico: false, desgasteMecanicoObs: "", danosAparentes: false, danosAparentesObs: "",
    extracaoFuncional: true, ejacaoFuncional: true, ciclagemFuncional: true,
    compTotal: "", capacidadeCarregador: "", numCanos: "", modoFogo: "",
    seletoDisparo: true, modoSemiAuto: true, modoAutoFuncional: true, culatelFuncional: true,
    formato: "", numEstrias: "", sentidoEstrias: "", diametro: "",
    marcacaoExtrator: false, marcacaoEjetor: false, marcacaoCamara: false,
    estriasPresentes: true, deformacaoPresente: false, fragmentado: false,
    oxidacaoPresente: false, inscricaoFabricante: "",
    amassado: false, completo: true,
    tipoLamina: "", compLamina: "", tipoGume: "",
    gumeFuncional: true, aptaUso: true, laminaIntegra: true,
    caboDanificado: false, manchas: false, manchasObs: "",
    sistemaAcionamento: "", tamanhoCamara: "", tipoRaiamento: "", materialQuadro: "", materialCoroha: "",
    institucional: null, naFlags: [], tipoProd: "", serialEstado: "", quantidade: "", diametroMin: "", massa: "",
    origemProjetil: "", origemProjetilRef: "", regiaoColeta: "", deformacoesAcidentais: "", estadoProjetil: "", alturaProjetil: "",
    estadoCartucho: "", estadoEstojo: "",
    tipoPolvora: "", cor: "", tipoEspoleta: "",
    adaptadaArmaFogo: null,
  })

  const addWeapon = (type: WeaponType) => {
    setActiveWeaponIdx(weapons.length)
    setWeapons((prev) => [...prev, makeWeaponEntry(type)])
  }

  const sidebarDesktop = (
    <aside className="hidden w-[300px] shrink-0 border-r border-[#8e7340] bg-[linear-gradient(180deg,#0d1a31_0%,#11203c_58%,#0b1730_100%)] xl:block">
      <SidebarContent onOpenProfile={() => setProfileView("main")} />
    </aside>
  )

  const sidebarMobile = (
  <div className="min-h-screen bg-[linear-gradient(180deg,#0d1a31_0%,#11203c_58%,#0b1730_100%)]">
    <SidebarContent onOpenProfile={() => setProfileView("main")} />
  </div>
  )



  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#09142a_0%,#0d1a34_50%,#091429_100%)] text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_15%_18%,rgba(245,211,128,.08),transparent_18%),radial-gradient(circle_at_90%_10%,rgba(245,211,128,.05),transparent_18%),linear-gradient(180deg,rgba(255,255,255,.01),rgba(255,255,255,0))]">
        <header className="border-b-[3px] border-[#b79248] bg-[linear-gradient(180deg,#13233f_0%,#10203b_100%)] shadow-[0_12px_28px_rgba(0,0,0,.28)]">
          <div className="border-b border-[#8e7340]/70 px-4 py-2.5 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center ml-1">
                  <img src={logoEscudo} alt="BalísticaDB" className="h-10 w-auto object-contain" style={{ marginRight: "-10px" }} />
                  <div className="flex flex-col gap-0" style={{ marginLeft: "-10px" }}>
                    <div style={{ paddingLeft: "5px" }} className="text-lg font-black text-[#f0d08a] leading-tight">BalísticaDB</div>
                    <div style={{ paddingLeft: "2px" }} className="text-[9px] font-bold text-white/60 uppercase tracking-[0.16em] leading-tight">Polícia Científica do Paraná</div>
                  </div>
                </div>
              </div>

              <div className="hidden items-center lg:flex">
                <img
                  src={logoEscudo}
                  alt="BalísticaDB"
                  className="h-20 w-auto object-contain drop-shadow-[0_0_16px_rgba(240,208,138,.2)]"
                  style={{ marginRight: "-18px" }}
                />
                <div style={{ marginLeft: "-34px" }} className="flex flex-col gap-0">
                  <h1 style={{ paddingLeft: "6px" }} className="text-xl font-black tracking-tight text-[#f0d08a]">BalísticaDB</h1>
                  <p style={{ paddingLeft: "8px" }} className="text-[11px] text-[#f4e6be]">
                    Perícia Balística — Sistema de Exames e Banco de Dados
                  </p>
                  <p style={{ paddingLeft: "2px" }} className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                    Polícia Científica do Paraná
                  </p>
                </div>
              </div>

              <div className="hidden overflow-hidden rounded-2xl border-2 border-[#8e7340] shadow-[0_6px_18px_rgba(0,0,0,.22)] lg:flex">
                <TopTab label="Registros" />
                <TopTab label="Calibres" />
                <TopTab label="Fabricantes" />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1800px]">
          {sidebarDesktop}

          <main className="flex-1 px-4 py-5 lg:px-8 lg:py-6 xl:px-10">
            <div className="grid gap-6 max-w-[1060px] mx-auto">
              <section className="space-y-6">
                <div className="rounded-[28px] border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] p-6 shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-[#f0d08a] md:text-2xl">
                        Cadastro e gestão de exames em armas
                      </h2>
                      <p className="mt-2 max-w-3xl text-[15px] text-[#eadab0]">
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setWeaponType(null)
                          setWeapons([])
                          setSavedPieces([])
                          setExamType(null)
                          setRepMinimized(false)
                          setTypePickerOpen(true)
                        }}
                        className="flex h-12 items-center gap-2 rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#e1c580_0%,#caa65c_100%)] px-6 text-sm font-black tracking-wide text-[#1d2433] shadow transition hover:brightness-105"
                      >
                        + NOVA REP
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                    <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                      <h3 className="text-xl font-black text-[#f0d08a]">Buscar</h3>
                    </div>

                    <div className="space-y-4 p-5 text-[#27231c] lg:grid lg:grid-cols-4 lg:gap-4 lg:items-end lg:space-y-0">
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-[#6b5838]">
                          Número
                        </label>
                        <input
                          value={numberFilter}
                          onChange={(e) => setNumberFilter(e.target.value)}
                          className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                          placeholder="Digite número, tipo ou modelo"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-[#6b5838]">
                          Ano
                        </label>
                        <input
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                          placeholder="2026"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-[#6b5838]">
                          Unidade
                        </label>
                        <input
                          value={unitFilter}
                          onChange={(e) => setUnitFilter(e.target.value)}
                          className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                          placeholder="Ex: NPC Curitiba"
                        />
                      </div>

                      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] text-sm font-black tracking-[0.16em] text-[#f8e3b3] shadow-[0_10px_18px_rgba(66,50,24,.22)]">
                        <Search className="h-4 w-4" />
                        BUSCAR
                      </button>
                    </div>
                  </div>

                  {/* <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f7f1e5] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                    <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                      <h3 className="text-xl font-black text-[#f0d08a]">Exames de Armas Registrados</h3>
                    </div>

                    <div className="space-y-4 p-5 text-[#26221b]">
                      {filteredRecords.map((item) => (
                        <button
                          key={item.id}
                          className="flex w-full flex-col rounded-2xl border border-[#d9ccb2] bg-[#fbf8f3] px-4 py-4 text-left transition hover:border-[#ac8d50] hover:shadow-[0_10px_24px_rgba(0,0,0,.08)]"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-2xl font-black tracking-tight">{item.number}/{item.year}</div>
                              <div className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-[#67583d]">
                                {item.type}
                              </div>
                            </div>
                            <span className="rounded-full border border-[#d8c59b] bg-[#f2e4bc] px-3 py-1 text-xs font-bold tracking-[0.16em] text-[#5b4a2e]">
                              {item.unit}
                            </span>
                          </div>

                          <div className="mt-2 text-base text-[#40362a]">{item.model}</div>
                          <div className="mt-3 text-sm text-[#6a5c45]">Atualizado em {item.updatedAt}</div>
                        </button>
                      ))}

                      {filteredRecords.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#cab88d] bg-[#fbf8f3] px-4 py-8 text-center text-[#6e614d]">
                          Nenhum exame encontrado com os filtros informados.
                        </div>
                      )}
                    </div>
                  </div> */}
                </div>

                <div className="rounded-[26px] border border-[#8e7340] bg-[linear-gradient(180deg,#14233f_0%,#0b1730_100%)] shadow-[0_16px_40px_rgba(0,0,0,.24)] overflow-hidden">
                  <div className="border-b border-[#8e7340]/60 px-5 py-3">
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#ccb780]">Painel</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#8e7340]/40">
                    {([
                      [<Database className="h-6 w-6" />, "198", "Registros periciais"],
                      [<CircleDot className="h-6 w-6" />, "29",  "Calibres cadastrados"],
                      [<Building2 className="h-6 w-6" />, "21", "Fabricantes"],
                      [<Crosshair className="h-6 w-6" />, "70", "Armas vinculadas"],
                    ] as [React.ReactNode, string, string][]).map(([icon, value, label], i) => (
                      <div key={i} className="p-5">
                        <div className="mb-3 w-fit rounded-2xl border border-[#8e7340] bg-[#0f1e39] p-3 text-[#f0d08a]">
                          {icon}
                        </div>
                        <div className="text-4xl font-extrabold tracking-tight text-[#f0d08a]">{value}</div>
                        <div className="mt-1 text-sm text-[#eadab0]">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>

        {/* ── Modal de tipo de exame ── */}
        <AnimatePresence>
          {typePickerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTypePickerOpen(false)}
              />
              <motion.div
                className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-6"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
              >
                <div className="w-full max-w-sm rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_32px_80px_rgba(0,0,0,.55)] overflow-hidden">
                  {/* topo */}
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-5">
                    <div className="text-xl font-black text-[#f0d08a]">Nova REP</div>
                    <div className="mt-0.5 text-xs uppercase tracking-[0.2em] text-[#ccb780]">Selecione o tipo de exame</div>
                  </div>
                  {/* opções */}
                  <div className="space-y-3 p-4">
                    {(["EFICIÊNCIA", "CONSTATAÇÃO"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setTypePickerOpen(false); setExamType(t) }}
                        className="flex w-full items-center justify-between rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-5 text-left transition active:scale-[.97] active:bg-[#ece6da]"
                      >
                        <div>
                          <div className="text-base font-black uppercase tracking-[0.12em] text-[#1d2433]">{t}</div>
                          <div className="mt-1 text-xs leading-relaxed text-[#8d7854]">
                            {t === "EFICIÊNCIA" ? "Exame de disparo e funcionamento da arma" : "Constatação de características e estado geral"}
                          </div>
                        </div>
                        <ChevronRight className="ml-3 h-5 w-5 shrink-0 text-[#b89a58]" />
                      </button>
                    ))}
                  </div>
                  {/* cancelar */}
                  <div className="px-4 pb-5">
                    <button type="button" onClick={() => setTypePickerOpen(false)}
                      className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95">
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>


        {/* ── REP Minimizado ── */}
        <AnimatePresence>
          {examType !== null && repMinimized && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-6 left-4 right-4 z-40 mx-auto max-w-sm"
            >
              <button
                type="button"
                onClick={() => setRepMinimized(false)}
                className="w-full overflow-hidden rounded-[32px] border border-[#f1d58d]/30 bg-[#12213d] p-1 shadow-2xl active:brightness-110"
              >
                <div className="flex items-center gap-4 rounded-[28px] bg-[linear-gradient(135deg,#1b2947_0%,#12213d_100%)] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0d08a]/10 text-[#f0d08a]">
                    <CircleDot className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ccb780]">REP em andamento</div>
                    <div className="text-sm font-black text-[#f0d08a]">{examType}</div>
                  </div>
                  <div className="rounded-xl bg-[#f1d58d] px-4 py-2 text-xs font-black text-[#12213d]">
                    VOLTAR
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Menu Mobile ── */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 top-0 z-[100] w-[300px] bg-[#0d1a31] lg:hidden"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div className="flex items-center">
                      <img src={logoEscudo} alt="BalísticaDB" className="h-11 w-auto object-contain" style={{ marginRight: "-12px" }} />
                      <span style={{ paddingLeft: "6px" }} className="text-xl font-black text-[#f0d08a]">BalísticaDB</span>
                    </div>
                    <button onClick={() => setMenuOpen(false)} className="text-white/60">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <SidebarContent onOpenProfile={() => { setMenuOpen(false); setProfileView("main") }} />
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>


        {/* ── Formulário do REP ── */}
        <AnimatePresence>
          {examType !== null && !repMinimized && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed inset-0 z-[60] overflow-y-auto"
            >
              <div className="min-h-full bg-[#f5efe3] text-[#26221b]">
                {/* header */}
                <div className="sticky top-0 z-10 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setRepMinimized(true)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8e7340] bg-[#12213d] text-[#f0d08a] active:bg-[#1a2c4f]">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <div className="text-lg font-black text-[#f0d08a]">Nova REP</div>
                        <div className="inline-block rounded-full bg-[#f0d08a]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#f0d08a]">{examType}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setRepMinimized(true)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8e7340] bg-[#12213d] text-[#f0d08a] active:bg-[#1a2c4f]">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* conteúdo */}
                <div className="space-y-6 p-5 md:p-8 max-w-[860px] mx-auto">
                  {/* Identificação */}
                  <div>
                    <div className="mb-6 border-b border-[#d3c3a4] pb-3 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Identificação do exame
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número do exame</label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                          <input value={form.examNumber} onChange={handleField("examNumber")}
                            placeholder="Nº REP"
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm" />
                        </div>
                        <span className="text-2xl font-black text-[#9e7f45]">/</span>
                        <div className="relative w-28">
                          <select value={form.examYear} onChange={e => setForm(f => ({ ...f, examYear: e.target.value }))}
                            className="h-14 w-full appearance-none rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] pl-3 pr-8 text-[16px] text-center outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm cursor-pointer">
                            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                              <option key={y} value={String(y)}>{y}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e7f45]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Peças salvas */}
                  {savedPieces.length > 0 && (
                    <div>
                      <div className="mb-3 border-b border-[#d3c3a4] pb-2 text-[13px] font-black uppercase tracking-[0.18em] text-[#50442f]">
                        Peças do exame
                      </div>
                      <div className="space-y-1.5">
                        {savedPieces.map((p, i) => (
                          <div key={i} className="overflow-hidden rounded-xl border border-[#ddd0b3] bg-white shadow-sm">
                            <div className="flex items-stretch">
                              <button
                                type="button"
                                onClick={() => openEditPiece(i)}
                                className="flex flex-1 items-center gap-2.5 px-3 py-2.5 text-left transition active:bg-[#f5efe3]"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a]">
                                  <PieceIcon type={p.type} className="h-4 w-auto max-w-[22px]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b89a58]">{p.type}</div>
                                  <div className="truncate text-[13px] font-black leading-tight text-[#26221b]">
                                    {p.brand || <span className="font-medium italic text-[#b8a070]">Não identificado</span>}
                                  </div>
                                  {p.model && p.model !== "" && (
                                    <div className="truncate text-[11px] text-[#6b5838]">{p.model}</div> // Display model if present
                                  )}
                                </div>
                                <Pencil className="h-3.5 w-3.5 shrink-0 text-[#c8a96e]" />
                              </button>
                              <div className="my-2 w-px shrink-0 bg-[#e8dfc8]" />
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePieceIdx(i)}
                                className="flex w-10 shrink-0 items-center justify-center text-[#c87070] transition active:bg-[#fdf0f0]"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="border-t border-[#f0e8d8] bg-[#fdfaf5] px-3 py-1.5">
                              <div className="flex flex-wrap gap-x-3 gap-y-0">
                                <span className="text-[10px] text-[#9e8255]">Série: <span className="font-black text-[#50442f]">{p.serial || <span className="italic text-[#c4ac82]">—</span>}</span></span>
                                {p.tipoMira && p.tipoMira.length > 0 && <span className="text-[10px] text-[#9e8255]">Mira: <span className="font-black text-[#50442f]">{p.tipoMira.join(", ")}</span></span>}
                                {p.tipoCarregador && p.tipoCarregador.length > 0 && <span className="text-[10px] text-[#9e8255]">Carregador: <span className="font-black text-[#50442f]">{p.tipoCarregador.join(", ")}{p.capacidadeCarregador ? ` · ${p.capacidadeCarregador}` : ""}</span></span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tipo de peça */}
                  <div>
                    <div className="mb-5 border-b border-[#d3c3a4] pb-3 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Tipo de peça
                    </div>

                    {/* Armas de fogo */}
                    <div className="mb-5">
                      <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#8d7854]">Armas de fogo</div>
                      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                        {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).map((type) => (
                          <button key={type} type="button"
                            onClick={() => {
                              setWeaponType(type)
                              setWeapons([makeWeaponEntry(type)])
                              setActiveWeaponIdx(0)
                              setPieceFormOpen(true)
                            }}
                            className="flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-[#d3c4a8] bg-white px-3 py-4 text-center text-[14px] font-black uppercase tracking-[0.08em] text-[#1a1410] shadow-sm transition active:scale-[.96] active:bg-[#ece6da]"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Munição e componentes */}
                    <div className="mb-5">
                      <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#8d7854]">Munição e componentes</div>
                      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                        {(["PROJÉTIL","CARTUCHO","ESTOJO","ESPOLETA","PÓLVORA","CARREGADOR"] as WeaponType[]).map((type) => (
                          <button key={type} type="button"
                            onClick={() => {
                              setWeaponType(type)
                              setWeapons([makeWeaponEntry(type)])
                              setActiveWeaponIdx(0)
                              setPieceFormOpen(true)
                            }}
                            className="flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-[#d3c4a8] bg-white px-3 py-4 text-center text-[14px] font-black uppercase tracking-[0.08em] text-[#1a1410] shadow-sm transition active:scale-[.96] active:bg-[#ece6da]"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Arma branca */}
                    <div className="mb-5">
                      <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#8d7854]">Arma branca e outros</div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(["FACA", "ARMA DE PRESSÃO", "ARMA DE ANTECARGA"] as WeaponType[]).map((type) => (
                          <button key={type} type="button"
                            onClick={() => {
                              setWeaponType(type)
                              setWeapons([makeWeaponEntry(type)])
                              setActiveWeaponIdx(0)
                              setPieceFormOpen(true)
                            }}
                            className="flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-[#d3c4a8] bg-white px-3 py-4 text-center text-[14px] font-black uppercase tracking-[0.08em] text-[#1a1410] shadow-sm transition active:scale-[.96] active:bg-[#ece6da]"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>


                  </div>

                  {/* Observações */}
                  <div>
                    <div className="mb-6 border-b border-[#d3c3a4] pb-3 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Observações
                    </div>
                    <textarea value={form.observacoes} onChange={handleField("observacoes")}
                      className="min-h-[140px] w-full rounded-[24px] border border-[#cdbf9e] bg-[#fbf8f2] px-5 py-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                      placeholder="Inserir observações técnicas, estado geral, particularidades e demais elementos relevantes." />
                  </div>

                  {/* Footer */}
                  <div className="border-t border-[#d3c3a4] pt-5 flex gap-3">
                    <button
                      onClick={() => setConfirmDeleteRep(true)}
                      className="flex-1 rounded-2xl border-2 border-[#b03030] bg-[linear-gradient(180deg,#8b2020_0%,#5c1515_100%)] py-4 text-sm font-black tracking-[0.14em] text-[#ffd4d4] shadow-[0_8px_20px_rgba(120,20,20,.30)] transition active:brightness-95">
                      EXCLUIR
                    </button>
                    <button className="flex-[2] rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] py-4 text-sm font-black tracking-[0.18em] text-[#f8e3b3] shadow-[0_12px_24px_rgba(66,50,24,.22)] transition active:brightness-95">
                      SALVAR EXAME
                    </button>
                  </div>

                  {/* Confirm delete dialog */}
                  <AnimatePresence>
                    {confirmDeleteRep && (
                      <>
                        <motion.div
                          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setConfirmDeleteRep(false)}
                        />
                        <motion.div
                          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center p-4 sm:p-6"
                          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                          transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        >
                          <div className="w-full max-w-xs rounded-3xl border border-[#e8c0c0] bg-[#f5efe3] shadow-[0_32px_80px_rgba(0,0,0,.55)] overflow-hidden">
                            <div className="bg-[linear-gradient(180deg,#2e1414_0%,#1a0a0a_100%)] px-6 py-5">
                              <div className="text-xl font-black text-[#ffb3b3]">Excluir exame?</div>
                              <div className="mt-1 text-xs leading-relaxed text-[#e08080]">Esta ação não pode ser desfeita. Todas as peças adicionadas serão perdidas.</div>
                            </div>
                            <div className="flex gap-3 p-4">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRep(false)}
                                className="flex-1 rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#6b5838] active:brightness-95"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteRep(false)
                                  setExamType(null)
                                  setRepMinimized(false)
                                  setSavedPieces([])
                                  setWeaponType(null)
                                  setWeapons([])
                                  setPieceFormOpen(false)
                                }}
                                className="flex-1 rounded-2xl border-2 border-[#b03030] bg-[linear-gradient(180deg,#8b2020_0%,#5c1515_100%)] py-4 text-sm font-black uppercase tracking-[0.12em] text-[#ffd4d4] active:brightness-90"
                              >
                                Sim, excluir
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tela de detalhes da peça ── */}
        <AnimatePresence>
          {pieceFormOpen && weaponType && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed inset-0 z-[70] overflow-y-auto"
            >
              <div className="min-h-full bg-[#f5efe3] text-[#26221b]">
                <div className="sticky top-0 z-10 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { resetPieceForm() }}
                        className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <div className="text-xl font-black text-[#f0d08a]">{weaponType}</div>
                        <div className="text-xs uppercase tracking-[0.22em] text-[#ccb780]">
                          {editingPieceIdx !== null ? `Editando peça ${editingPieceIdx + 1}` : "Dados da peça"}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { resetPieceForm() }}
                      className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 p-5 md:p-8 max-w-[860px] mx-auto">
                  <div className="space-y-3">
                    {/* ── Ícone da peça ── */}
                    <div className="flex items-center gap-4 rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(135deg,#1b2947_0%,#12213d_100%)] px-5 py-4 shadow-[0_6px_22px_rgba(0,0,0,.28)]">
                      <div className="flex shrink-0 items-center justify-center rounded-xl bg-[#0f1e39] p-3 text-[#f0d08a]">
                        <PieceIcon type={weaponType} className="h-12 w-auto max-w-[80px]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ccb780]">Tipo de peça</div>
                        <div className="text-lg font-black uppercase tracking-[0.1em] text-[#f0d08a]">{weaponType}</div>
                      </div>
                    </div>

                    {/* Institucional — apenas armas de fogo */}
                    {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                      <div className="overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                        <div className="border-b border-[#e8dfc8] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ccb780]">Vínculo da arma</div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-[#e8dfc8]">
                          {([
                            { v: true,  icon: <Building2 className="h-5 w-5" />, l: "Institucional", s: "Órgão público" },
                            { v: false, icon: <User2     className="h-5 w-5" />, l: "Particular",    s: "Pessoa física / privada" },
                          ] as { v: boolean; icon: React.ReactNode; l: string; s: string }[]).map(({ v, icon, l, s }) => {
                            const sel = activeWeapon?.institucional === v
                            return (
                              <button key={String(v)} type="button"
                                onClick={() => setWeaponDirect("institucional", sel ? null : v)}
                                className={cn(
                                  "flex flex-col items-center gap-2 px-4 py-5 transition active:scale-[0.97]",
                                  sel ? "bg-[#7d6334]/10" : "bg-white hover:bg-[#fbf8f2]"
                                )}>
                                <div className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                                  sel ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md" : "border-[#d3c4a8] bg-[#f5efe3] text-[#8d7854]"
                                )}>
                                  {icon}
                                </div>
                                <div className="text-center">
                                  <div className={`text-[13px] font-black leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{l}</div>
                                  <div className="mt-0.5 text-[11px] text-[#a08c68]">{s}</div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Estado do Projétil */}
                    {activeWeapon?.type === "PROJÉTIL" && (
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Estado do projétil</div>
                        <div className="grid grid-cols-2 gap-2">
                          {(["ÍNTEGRO", "DEFLAGRADO"] as const).map((op) => {
                            const isSelected = activeWeapon?.estadoProjetil === op;
                            return (
                              <button
                                key={op}
                                type="button"
                                onClick={() => setWeaponDirect("estadoProjetil", isSelected ? "" : op)}
                                className={cn(
                                  "rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[0.98]",
                                  isSelected
                                    ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md"
                                    : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838] hover:bg-[#f5efe3]"
                                )}
                              >
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}


                    {/* Estado do Cartucho — ÍNTEGRO / PERCUTIDO */}
                    {activeWeapon?.type === "CARTUCHO" && (
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Estado do cartucho</div>
                        <div className="grid grid-cols-2 gap-2">
                          {(["ÍNTEGRO", "PERCUTIDO"] as const).map((op) => {
                            const isSelected = activeWeapon?.estadoCartucho === op;
                            return (
                              <button
                                key={op}
                                type="button"
                                onClick={() => setWeaponDirect("estadoCartucho", isSelected ? "" : op)}
                                className={cn(
                                  "rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[0.98]",
                                  isSelected
                                    ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md"
                                    : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838] hover:bg-[#f5efe3]"
                                )}
                              >
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Estado do Estojo — ÍNTEGRO / PERCUTIDO */}
                    {activeWeapon?.type === "ESTOJO" && (
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Estado do estojo</div>
                        <div className="grid grid-cols-2 gap-2">
                          {(["ÍNTEGRO", "PERCUTIDO"] as const).map((op) => {
                            const isSelected = activeWeapon?.estadoEstojo === op;
                            return (
                              <button
                                key={op}
                                type="button"
                                onClick={() => setWeaponDirect("estadoEstojo", isSelected ? "" : op)}
                                className={cn(
                                  "rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[0.98]",
                                  isSelected
                                    ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md"
                                    : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838] hover:bg-[#f5efe3]"
                                )}
                              >
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Origem — universal para todos os tipos */}
                    {(() => {
                      const origemLabel: Record<WeaponType, string> = {
                        "PROJÉTIL":    "Origem de coleta do projétil",
                        "CARTUCHO":    "Origem de coleta do cartucho",
                        "ESTOJO":      "Origem de coleta do estojo",
                        "FACA":        "Origem de coleta da faca",
                        "ARMA DE PRESSÃO":    "Origem de coleta da arma de pressão",
                        "ARMA DE ANTECARGA":  "Origem de coleta da arma de antecarga",
                        "REVÓLVER":    "Origem de coleta do revólver",
                        "PISTOLA":     "Origem de coleta da pistola",
                        "ESPINGARDA":  "Origem de coleta da espingarda",
                        "CARABINA":    "Origem de coleta da carabina",
                        "FUZIL":       "Origem de coleta do fuzil",
                        "METRALHADORA":"Origem de coleta da metralhadora",
                        "PÓLVORA":     "Origem de coleta da pólvora",
                        "ESPOLETA":    "Origem de coleta da espoleta",
                        "CARREGADOR":  "Origem de coleta do carregador",
                      }
                      const label = origemLabel[activeWeapon?.type as WeaponType] ?? "Origem"
                      return (
                        <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                          <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8d7854]">{label}</div>
                          <div className={`grid gap-2 ${(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","PÓLVORA","ESPOLETA","CARREGADOR","ARMA DE PRESSÃO","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? "grid-cols-2" : "grid-cols-3"}`}>
                            {(
                              (["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","PÓLVORA","ESPOLETA","CARREGADOR","ARMA DE PRESSÃO","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType)
                                ? [
                                    { id: "DELEGACIA", label: "Delegacia", Icon: Building2 },
                                    { id: "LOCAL",     label: "Local",     Icon: MapPin    },
                                  ]
                                : [
                                    { id: "DELEGACIA", label: "Delegacia", Icon: Building2  },
                                    { id: "LOCAL",     label: "Local",     Icon: MapPin     },
                                    { id: "NECROPSIA", label: "Necropsia", Icon: Microscope },
                                  ]
                            ).map(({ id, label, Icon }) => {
                              const active = activeWeapon?.origemProjetil === id
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setWeaponDirect("origemProjetil", active ? "" : id)}
                                  className={cn(
                                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-3 px-1 transition active:scale-95",
                                    active
                                      ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md"
                                      : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838] hover:bg-[#f5efe3]"
                                  )}
                                >
                                  <Icon className={cn("h-6 w-6", active ? "text-white" : "text-[#9e7f45]")} />
                                  <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          {activeWeapon?.origemProjetil === "LOCAL" && (
                            <div className="mt-3 space-y-3 border-t border-[#ede3ce] pt-3">
                              <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Referência do local</label>
                                <input
                                  value={String(activeWeapon?.origemProjetilRef ?? "")}
                                  onChange={handleWeaponField("origemProjetilRef" as keyof Omit<WeaponEntry,"type">)}
                                  className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                                  placeholder="Ex.: REP 138.740/2025"
                                />
                              </div>
                              <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Região da coleta</label>
                                <input
                                  value={String(activeWeapon?.regiaoColeta ?? "")}
                                  onChange={handleWeaponField("regiaoColeta" as keyof Omit<WeaponEntry,"type">)}
                                  className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                                  placeholder="Ex.: Interior do imóvel (#3)"
                                />
                              </div>
                            </div>
                          )}
                          {activeWeapon?.type === "CARTUCHO" && (
                            <div className="mt-3 border-t border-[#ede3ce] pt-3">
                              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Natureza da munição</div>
                              <div className="space-y-2">
                                {([
                                  { v: "Industrial",    d: "Fabricada em linha industrial por empresa homologada" },
                                  { v: "Recarga",       d: "Montada artesanalmente com componentes avulsos" },
                                  { v: "Indeterminado", d: "Não foi possível determinar a origem" },
                                ] as {v:string;d:string}[]).map(({v,d}) => {
                                  const sel = activeWeapon?.origemMunicao === v
                                  return (
                                    <button key={v} type="button"
                                      onClick={() => setWeaponDirect("origemMunicao", sel ? "" : v)}
                                      className={cn(
                                        "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                        sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-[#fbf8f2]"
                                      )}>
                                      <span className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                        sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                      )}>
                                        {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                      </span>
                                      <div className="min-w-0">
                                        <div className={`text-[13px] font-black leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{v}</div>
                                        <div className="text-[11px] text-[#a08c68]">{d}</div>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          {activeWeapon?.type === "ARMA DE PRESSÃO" && (
                            <div className="mt-3 border-t border-[#ede3ce] pt-3">
                              <div className="mb-2.5 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#8d7854]">
                                Adaptada para arma de fogo?
                                <HelpBtn title="Adaptada para arma de fogo?" text="Indica se a arma de pressão foi modificada ou convertida para realizar disparos com munição de fogo real (pólvora). A adaptação é crime previsto no Estatuto do Desarmamento e altera o enquadramento pericial da peça." />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {([["Sim", true], ["Não", false]] as [string, boolean][]).map(([label, val]) => {
                                  const active = activeWeapon?.adaptadaArmaFogo === val
                                  return (
                                    <button key={label} type="button"
                                      onClick={() => setWeaponDirect("adaptadaArmaFogo", active ? null : val)}
                                      className={`rounded-xl border-2 py-3 text-sm font-black uppercase tracking-[0.1em] transition active:scale-[.97] ${active ? "border-[#7d6334] bg-[#7d6334] text-white" : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838]"}`}>
                                      {label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>

                  {/* ── Campos base ── */}
                  {!(["PROJÉTIL","PÓLVORA","ESPOLETA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && <div className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-4">
                      {/* Identificação — armas de fogo usam campo próprio; demais usam model */}
                      {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Identificação
                            <HelpBtn title="Identificação" text="Designação ou referência de identificação do item. Ex.: RT 627, REP 001/2025." />
                          </label>
                          <input value={activeWeapon?.identificacao ?? ""} onChange={handleWeaponField("identificacao" as keyof Omit<WeaponEntry,"type">)}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: RT 627, REP 001/2025…" />
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && !(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            {activeWeapon?.type === "CARTUCHO" ? "Tipo" : "Identificação"}
                            <HelpBtn title={activeWeapon?.type === "CARTUCHO" ? "Tipo" : "Identificação"} text={
                              activeWeapon?.type === "ESTOJO" ? "Headstamp ou marcação identificadora do estojo. Ex.: CBC .38, RP 9mm." :
                              activeWeapon?.type === "CARTUCHO" ? "Tipo construtivo da munição. Ex.: FMJ (encamisado), HP (ponta oca), Slug (projétil único para espingarda)." :
                              "Designação ou referência de identificação do item."
                            } />
                          </label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder={activeWeapon?.type === "CARTUCHO" ? "Ex.: FMJ, HP, Slug…" : "Ex.: RT 627"} />
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && activeWeapon?.type !== "CARREGADOR" && !(activeWeapon?.type === "CARTUCHO" && activeWeapon?.origemMunicao === "Recarga") && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Fabricante
                            <HelpBtn title="Fabricante" text="Empresa responsável pela fabricação. Ex.: Taurus, Glock, CBC, Remington." />
                          </label>
                          <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder={activeWeapon?.type === "ESTOJO" ? "Ex.: CBC, Sellier & Bellot…" : activeWeapon?.type === "CARTUCHO" ? "Ex.: CBC, Sellier & Bellot…" : "Ex.: Taurus, Glock, Colt…"} />
                        </div>
                      )}
                      {/* Modelo — apenas armas de fogo */}
                      {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Modelo
                            <HelpBtn title="Modelo" text="Designação comercial ou nomenclatura do armamento. Ex.: GP100, M1911, AR-15." />
                          </label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: GP100, M1911, AR-15…" />
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && activeWeapon?.type !== "CARREGADOR" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Calibre
                            <HelpBtn title="Calibre" text="Designação nominal da munição compatível com a arma ou peça. Ex.: .38 SPL, 9 mm Luger, 12 Ga. Para projéteis deflagrados, utilize o campo de diâmetro medido." />
                          </label>
                          <button type="button" onClick={() => {
                            if (activeWeapon?.type === "ARMA DE ANTECARGA") setCalibreAntecargaPickerOpen(true);
                            else setCalibrePickerOpen(true);
                          }}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.caliber || "Selecionar calibre…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && activeWeapon?.type !== "CARREGADOR" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            País de fabricação
                            <HelpBtn title="País de fabricação" text="País onde a peça foi fabricada, conforme indicação do fabricante ou marcação na arma. Ex.: Brasil, EUA, Alemanha." />
                          </label>
                          <button type="button" onClick={() => setPaisPickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.paisFabricacao ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.paisFabricacao || "Selecionar país…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tipo de produção — apenas armas de fogo */}
                    {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white p-4 shadow-sm">
                        <label className="mb-3 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de produção</label>
                        <div className="flex gap-2">
                          {(["INDUSTRIAL", "ARTESANAL"]).map(tipo => (
                            <button
                              key={tipo}
                              type="button"
                              onClick={() => { setWeaponDirect("tipoProd", tipo); if (tipo === "ARTESANAL") setWeaponDirect("serialEstado", "") }}
                              className={`flex-1 rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[.97] ${
                                activeWeapon?.tipoProd === tipo
                                  ? "border-[#9e7f45] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a] shadow-md"
                                  : "border-[#cdbf9e] bg-[#fbf8f2] text-[#6b5838]"
                              }`}
                            >
                              {tipo}
                            </button>
                          ))}
                        </div>

                        {/* Bloco de número de série — só para INDUSTRIAL */}
                        {activeWeapon?.tipoProd === "INDUSTRIAL" && (
                          <div className="mt-4 border-t border-[#e8dfc8] pt-4">
                            <label className="mb-3 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                              Número de série — estado
                              <HelpBtn title="Número de série" text="Indica a condição em que o número de série se encontra na arma. LEGÍVEL: completamente visível. PARCIAL: parte dos algarismos visível. SUPRIMIDO: intencionalmente removido ou apagado. NÃO APARENTE: não localizado no exame visual." />
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {(["LEGÍVEL", "PARCIAL", "SUPRIMIDO", "NÃO APARENTE"]).map(est => (
                                <button
                                  key={est}
                                  type="button"
                                  onClick={() => setWeaponDirect("serialEstado", est)}
                                  className={`rounded-xl border-2 py-2.5 text-xs font-black tracking-[0.1em] transition active:scale-[.97] ${
                                    activeWeapon?.serialEstado === est
                                      ? "border-[#9e7f45] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a]"
                                      : "border-[#cdbf9e] bg-[#fbf8f2] text-[#6b5838]"
                                  }`}
                                >
                                  {est}
                                </button>
                              ))}
                            </div>

                            {/* Input do número — só para LEGÍVEL ou PARCIAL */}
                            {(activeWeapon?.serialEstado === "LEGÍVEL" || activeWeapon?.serialEstado === "PARCIAL") && (
                              <div className="mt-3">
                                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                                  Número de série
                                  {activeWeapon?.serialEstado === "PARCIAL" && (
                                    <span className="ml-2 text-[10px] font-semibold normal-case tracking-normal text-[#b89a58]">(registrar parte visível)</span>
                                  )}
                                </label>
                                <input
                                  value={activeWeapon?.serial ?? ""}
                                  onChange={handleWeaponField("serial")}
                                  className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                                  placeholder={
                                    activeWeapon?.type === "REVÓLVER" ? "Ex.: TE123456" :
                                    activeWeapon?.type === "PISTOLA" ? "Ex.: T1G23456" :
                                    activeWeapon?.type === "ESPINGARDA" ? "Ex.: SG-123456" :
                                    activeWeapon?.type === "CARABINA" ? "Ex.: CB123456" :
                                    activeWeapon?.type === "FUZIL" ? "Ex.: FZ123456" :
                                    activeWeapon?.type === "METRALHADORA" ? "Ex.: MT123456" :
                                    "Ex.: ABC-123456"
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>}

                  {/* ── REVÓLVER ── */}
                  {activeWeapon?.type === "REVÓLVER" && (<>
                    <CollapsibleSection title="Características físicas" defaultOpen={true}>
                      {/* Material — picker */}
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                        <button type="button" onClick={() => setMaterialPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.material || "Selecionar material…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      {/* Acabamento — picker */}
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                        <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.acabamento || "Selecionar acabamento…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                        <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      {/* Sistema de acionamento — picker */}
                      <div className="mb-4">
                        <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                        <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      {/* Raiamento do cano */}
                      <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                        <div className="border-b border-[#ede3ce] px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                        </div>
                        <div className="divide-y divide-[#ede3ce]">
                          <div className="px-4 py-3">
                            <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lisa: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                            <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          {activeWeapon?.tipoRaiamento && activeWeapon.tipoRaiamento !== "Alma lisa (sem raiamento)" && (<>
                          <div className="px-4 py-3">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                            <button type="button" onClick={() => setSentidoPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          <div className="px-4 py-3">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                            <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 6" />
                          </div>
                          </>)}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {([
                          ["compCano",   "Comprimento do cano", "Ex.: 4 pol."],
                          ["numCamaras", "Número de câmaras",   "Ex.: 6"],
                        ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                          <div key={field}>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                            <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder={ph} />
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    <div className="space-y-4">
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["acaoSimples",      "Ação simples funcional"],
                            ["acaoDupla",        "Ação dupla funcional"],
                            ["tamborGira",       "Tambor gira livremente"],
                            ["indexacaoCorreta", "Indexação correta do tambor"],
                            ["caoFuncional",     "Cão funcional"],
                            ["gatilhoFuncional", "Gatilho funcional"],
                            ["seguranca",        "Sistema de segurança"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, true)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>SIM</button>
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, false)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",       "ferrugemObs",       "Presença de ferrugem"],
                            ["desgaste",       "desgasteObs",       "Desgaste"],
                            ["danoEstruturais","danoEstruturaisObs","Danos estruturais"],
                            ["pecasFaltantes", "pecasFaltantesObs", "Peças faltantes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",      "Apto a disparo"],
                            ["funcMunicaoReal",  "Funcionamento com munição real"],
                            ["testePercussao",   "Teste de percussão"],
                            ["marcacaoPercussor","Marcação de percussor"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  </>)}

                  {/* ── CARABINA ── */}
                  {activeWeapon?.type === "CARABINA" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar acabamento…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                          <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                          <div className="border-b border-[#ede3ce] px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                          </div>
                          <div className="divide-y divide-[#ede3ce]">
                            <div className="px-4 py-3">
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lisa: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                              <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                              <button type="button" onClick={() => setSentidoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                              <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder="Ex.: 6" />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",  "Ex.: 510 mm"],
                            ["compTotal",            "Comprimento total",    "Ex.: 940 mm"],
                            ["capacidadeCarregador", "Capacidade (munições)","Ex.: Sete"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["sistemaRepeticao",   "Sistema de repetição funcional"],
                            ["ferrolhoFuncional",  "Ferrolho funcional"],
                            ["percussorFuncional", "Percussor funcional"],
                            ["extratorFuncional",  "Extrator funcional"],
                            ["ejetorFuncional",    "Ejetor funcional"],
                            ["gatilhoFuncional",   "Gatilho funcional"],
                            ["seguranca",          "Trava de segurança funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, true)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>SIM</button>
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, false)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",       "Apta para disparo"],
                            ["testePercussao",    "Percussão funcional"],
                            ["extracaoFuncional", "Extração funcional"],
                            ["ejacaoFuncional",   "Ejeção funcional"],
                            ["ciclagemFuncional", "Ciclagem funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── PISTOLA ── */}
                  {activeWeapon?.type === "PISTOLA" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar acabamento…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                          <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                          <div className="border-b border-[#ede3ce] px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                          </div>
                          <div className="divide-y divide-[#ede3ce]">
                            <div className="px-4 py-3">
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lisa: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                              <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                              <button type="button" onClick={() => setSentidoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                              <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder="Ex.: 6" />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",     "Ex.: 100 mm"],
                            ["compTotal",            "Comprimento total",       "Ex.: 180 mm"],
                            ["capacidadeCarregador", "Capacidade do carregador","Ex.: 17 cartuchos"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["carregadorPresente",  "Carregador presente"],
                            ["carregadorFuncional", "Carregador funcional"],
                            ["ferrolhoFuncional",   "Ferrolho funcional"],
                            ["percussorFuncional",  "Percussor funcional"],
                            ["extratorFuncional",   "Extrator funcional"],
                            ["ejetorFuncional",     "Ejetor funcional"],
                            ["gatilhoFuncional",    "Gatilho funcional"],
                            ["seguranca",           "Trava de segurança funcional"],
                            ["retencaoFerrolho",    "Retenção do ferrolho funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, true)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>SIM</button>
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, false)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",       "Apta para disparo"],
                            ["testePercussao",    "Percussão funcional"],
                            ["extracaoFuncional", "Extração funcional"],
                            ["ejacaoFuncional",   "Ejeção funcional"],
                            ["ciclagemFuncional", "Ciclagem funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ESPINGARDA ── */}
                  {activeWeapon?.type === "ESPINGARDA" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar acabamento…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",  "Ex.: 510 mm"],
                            ["compTotal",            "Comprimento total",    "Ex.: 940 mm"],
                            ["numCanos",             "Número de canos",      "Ex.: 1, 2"],
                            ["tamanhoCamara",        "Tamanho da câmara",    "Ex.: 2 ¾ polegadas"],
                            ["capacidadeCarregador", "Capacidade (munições)","Ex.: Sete"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["gatilhoFuncional",    "Gatilho funcional"],
                            ["caoFuncional",        "Cão funcional"],
                            ["extratorFuncional",   "Extrator funcional"],
                            ["seguranca",           "Trava de segurança funcional"],
                            ["sistemaRepeticao",    "Sistema de repetição funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, true)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>SIM</button>
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, false)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",      "Apta para disparo"],
                            ["testePercussao",   "Percussão funcional"],
                            ["extracaoFuncional","Extração funcional"],
                            ["ejacaoFuncional",  "Ejeção funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── FUZIL ── */}
                  {activeWeapon?.type === "FUZIL" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                          <div className="border-b border-[#ede3ce] px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                          </div>
                          <div className="divide-y divide-[#ede3ce]">
                            <div className="px-4 py-3">
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lisa: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                              <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                              <button type="button" onClick={() => setSentidoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                              <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder="Ex.: 6" />
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                          <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",   "Ex.: 410 mm"],
                            ["compTotal",            "Comprimento total",     "Ex.: 860 mm"],
                            ["capacidadeCarregador", "Capacidade (munições)", "Ex.: Trinta"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["ferrolhoFuncional",   "Ferrolho funcional"],
                            ["percussorFuncional",  "Percussor funcional"],
                            ["extratorFuncional",   "Extrator funcional"],
                            ["ejetorFuncional",     "Ejetor funcional"],
                            ["gatilhoFuncional",    "Gatilho funcional"],
                            ["seguranca",           "Trava de segurança funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                            ["seletoDisparo",       "Seletor de disparo funcional"],
                            ["modoSemiAuto",        "Modo semi-automático funcional"],
                            ["modoAutoFuncional",   "Modo automático funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, true)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>SIM</button>
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, false)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",      "Apto a disparo"],
                            ["testePercussao",   "Percussão funcional"],
                            ["extracaoFuncional","Extração funcional"],
                            ["ejacaoFuncional",  "Ejeção funcional"],
                            ["ciclagemFuncional","Ciclagem funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── METRALHADORA ── */}
                  {activeWeapon?.type === "METRALHADORA" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar acabamento…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                          <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                          <div className="border-b border-[#ede3ce] px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                          </div>
                          <div className="divide-y divide-[#ede3ce]">
                            <div className="px-4 py-3">
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lista: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                              <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                              <button type="button" onClick={() => setSentidoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                              <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder="Ex.: 6" />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",  "Ex.: 260 mm"],
                            ["compTotal",            "Comprimento total",    "Ex.: 690 mm"],
                            ["capacidadeCarregador", "Capacidade (munições)","Ex.: Cem"],
                            ["modoFogo",             "Modo de fogo",         "Ex.: semi, auto"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["ferrolhoFuncional",   "Ferrolho funcional"],
                            ["percussorFuncional",  "Percussor funcional"],
                            ["extratorFuncional",   "Extrator funcional"],
                            ["ejetorFuncional",     "Ejetor funcional"],
                            ["gatilhoFuncional",    "Gatilho funcional"],
                            ["seguranca",           "Trava de segurança funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                            ["seletoDisparo",       "Seletor de disparo funcional"],
                            ["modoAutoFuncional",   "Modo automático funcional"],
                            ["culatelFuncional",    "Culatel funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, true)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>SIM</button>
                                  <button type="button" disabled={isNa}
                                    onClick={() => setWeaponDirect(key, false)}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45] disabled:opacity-25"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",      "Apto a disparo"],
                            ["testePercussao",   "Percussão funcional"],
                            ["extracaoFuncional","Extração funcional"],
                            ["ejacaoFuncional",  "Ejeção funcional"],
                            ["ciclagemFuncional","Ciclagem funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ESTOJO ── */}
                  {activeWeapon?.type === "ESTOJO" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Material — picker */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Formato / tipo de rebordo — picker */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de rebordo</label>
                          <button type="button" onClick={() => setFormatoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.formato ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.formato || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Inscrições (headstamp) */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Inscrições (headstamp)</label>
                          <input
                            value={activeWeapon?.inscricaoFabricante ?? ""}
                            onChange={handleWeaponField("inscricaoFabricante")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: CBC .38 SPL, RP 9mm LUGER…"
                          />
                        </div>
                        {/* Outros campos */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ...(activeWeapon?.estadoEstojo === "ÍNTEGRO" ? [["quantidade", "Quantidade", "Ex.: 3"]] : []),
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Marcações balísticas">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["marcacaoPercussor","Marcação de percussor"],
                            ["marcacaoExtrator", "Marcação de extrator"],
                            ["marcacaoEjetor",   "Marcação de ejetor"],
                            ["marcacaoCamara",   "Marcação de câmara"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["ferrugem",          "Ferrugem presente"],
                            ["deformacaoPresente","Deformação presente"],
                            ["fragmentado",       "Fragmentado"],
                            ["oxidacaoPresente",  "Oxidação presente"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Deformações acidentais</label>
                          <button type="button" onClick={() => setDeformacoesPickerOpen(true)}
                            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-left transition focus:border-[#9e7f45]">
                            <span className={`text-[14px] leading-snug ${activeWeapon?.deformacoesAcidentais ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.deformacoesAcidentais || "Selecionar deformações…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── PROJÉTIL ── */}
                  {activeWeapon?.type === "PROJÉTIL" && (
                    <div className="space-y-4">

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Identificação</label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CBC, Remington…" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Fabricante</label>
                          <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CBC, Sellier & Bellot…" />
                        </div>
                      </div>

                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Material — seletor bottom sheet */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button
                            type="button"
                            onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]"
                          >
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Formato — seletor bottom sheet */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Formato</label>
                          <button
                            type="button"
                            onClick={() => setFormatoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]"
                          >
                            <span className={`truncate text-[15px] ${activeWeapon?.formato ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.formato || "Selecionar formato…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleCard title="Marcações balísticas">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["estriasPresentes",  "Estrias presentes"],
                            ["deformacaoPresente","Deformação presente"],
                            ["fragmentado",       "Fragmentado"],
                            ["oxidacaoPresente",  "Oxidação presente"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Deformações acidentais</label>
                          <button type="button" onClick={() => setDeformacoesPickerOpen(true)}
                            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-left transition focus:border-[#9e7f45]">
                            <span className={`text-[14px] leading-snug ${activeWeapon?.deformacoesAcidentais ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.deformacoesAcidentais || "Selecionar deformações…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["completo", "Projétil íntegro / completo"],
                            ["manchas",  "Manchas ou resíduos presentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleSection title="Medições e calibre" defaultOpen={true}>
                        {/* Raias — só para DEFLAGRADO */}
                        {activeWeapon?.estadoProjetil !== "ÍNTEGRO" && (<>
                          {/* Sentido das raias */}
                          <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido das raias</label>
                            <button
                              type="button"
                              onClick={() => setSentidoPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]"
                            >
                              <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.sentidoEstrias || "Selecionar…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          {/* N° de raias */}
                          <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">N° de raias</label>
                            <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 6" />
                          </div>
                          {/* Cavados/Ressaltos e Raiamento — calculados */}
                          {(() => {
                            const n = activeWeapon?.numEstrias?.trim()
                            const sentido = activeWeapon?.sentidoEstrias?.trim()
                            const orientacaoMap: Record<string, string> = {

                              "Dextrorso": "dextrógiro",
                              "Sinistrorso": "sinistrógiro",
                              "Dextrorso e Sinistrorso (combinado)": "combinado dextro/sinistro",
                              "Anfidextrorso": "anfidextrorso",

                              "Indeterminado": "orientação indeterminada",
                            }
                            const orientacao = sentido ? (orientacaoMap[sentido] ?? sentido.toLowerCase()) : null
                            if (!n && !sentido) return null
                            return (
                              <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                                <div className="border-b border-[#ede3ce] px-4 py-3">
                                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento</div>
                                </div>
                                <div className="divide-y divide-[#ede3ce]">
                                  {n && (
                                    <div className="flex items-center justify-between px-4 py-3">
                                      <span className="text-[13px] font-semibold text-[#7a6540]">Cavados e Ressaltos</span>
                                      <span className="text-[15px] font-black text-[#26221b]">{n} e {n}</span>
                                    </div>
                                  )}
                                  {(n || orientacao) && (
                                    <div className="flex items-center justify-between px-4 py-3">
                                      <span className="text-[13px] font-semibold text-[#7a6540]">Raiamento e Orientação</span>
                                      <span className="text-[15px] font-black text-right text-[#26221b]">
                                        {[n ? `${n} raias` : null, orientacao].filter(Boolean).join(", ")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                          {/* Diâmetro máx / mín e calibre calculado — só DEFLAGRADO */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {([
                              ["diametro",    "Diâmetro máx.", "Ex.: 9,02 mm"],
                              ["diametroMin", "Diâmetro mín.", "Ex.: 8,98 mm"],
                            ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                              <div key={field}>
                                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                                <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                  className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                  placeholder={ph} />
                              </div>
                            ))}
                          </div>
                          {(() => {
                            const pv = (v: string | undefined) => parseFloat(String(v ?? "").replace(",", ".").replace(/[^\d.]/g, ""))
                            const dMax  = pv(activeWeapon?.diametro)
                            const dMin  = pv(activeWeapon?.diametroMin)
                            const alt   = pv(activeWeapon?.alturaProjetil)
                            const mass  = pv(activeWeapon?.massa)
                            if (isNaN(dMax) || isNaN(dMin)) return null
                            const diam  = (dMax + dMin) / 2
                            const media = diam.toFixed(2).replace(".", ",")

                            type Cal = { nome: string; nominal: string; mm: string; dMin: number; dMax: number; aMin: number; aMax: number; mMin: number; mMax: number }
                            const db: Cal[] = [
                              { nome: ".22 LR",               nominal: ".22 LR",                    mm:"5,59 mm", dMin:5.40, dMax:5.80, aMin:7,  aMax:12, mMin:2.0,  mMax:3.5  },
                              { nome: ".25 ACP / 6,35mm",     nominal: ".25 ACP / 6,35mm Browning", mm:"6,35 mm", dMin:6.00, dMax:6.60, aMin:8,  aMax:12, mMin:3.0,  mMax:4.0  },
                              { nome: ".32 ACP / 7,65mm",     nominal: ".32 ACP / 7,65mm Browning", mm:"7,65 mm", dMin:7.45, dMax:7.85, aMin:9,  aMax:13, mMin:4.0,  mMax:5.5  },
                              { nome: ".32 S&W Long",         nominal: ".32 S&W Long",              mm:"7,97 mm", dMin:7.85, dMax:8.10, aMin:11, aMax:16, mMin:5.0,  mMax:7.0  },
                              { nome: ".380 ACP / 9mm Kurz",  nominal: ".380 ACP / 9mm Curto",      mm:"9,02 mm", dMin:8.70, dMax:9.10, aMin:8,  aMax:11, mMin:5.0,  mMax:7.5  },
                              { nome: "9mm Luger / 9×19mm",   nominal: "9mm Luger",                 mm:"9,02 mm", dMin:8.80, dMax:9.20, aMin:11, aMax:15, mMin:6.5,  mMax:9.5  },
                              { nome: ".38 SPL",              nominal: ".38 S&W Special",           mm:"9,07 mm", dMin:9.00, dMax:9.20, aMin:14, aMax:18, mMin:7.5,  mMax:12.0 },
                              { nome: ".357 Magnum",          nominal: ".357 Magnum",               mm:"9,07 mm", dMin:9.00, dMax:9.20, aMin:15, aMax:22, mMin:8.0,  mMax:13.5 },
                              { nome: ".40 S&W",              nominal: ".40 S&W",                   mm:"10,17 mm",dMin:9.90, dMax:10.40, aMin:12, aMax:16, mMin:9.5, mMax:13.5 },
                              { nome: "10mm Auto",            nominal: "10mm Auto",                 mm:"10,17 mm",dMin:9.90, dMax:10.40, aMin:14, aMax:18, mMin:10.0,mMax:14.0 },
                              { nome: ".44 SPL",              nominal: ".44 S&W Special",           mm:"10,92 mm",dMin:10.70, dMax:11.10, aMin:16, aMax:21, mMin:12.0,mMax:17.0},
                              { nome: ".44 Magnum",           nominal: ".44 Magnum",                mm:"10,92 mm",dMin:10.70, dMax:11.10, aMin:18, aMax:26, mMin:13.0,mMax:20.0},
                              { nome: ".45 ACP",              nominal: ".45 ACP",                   mm:"11,43 mm",dMin:11.20, dMax:11.70, aMin:13, aMax:17, mMin:12.0,mMax:17.0},
                              { nome: ".45 Colt",             nominal: ".45 Colt / Long Colt",      mm:"11,43 mm",dMin:11.20, dMax:11.70, aMin:17, aMax:24, mMin:14.0,mMax:20.0},
                            ]

                            const deformado = !!(activeWeapon?.deformacaoPresente || activeWeapon?.fragmentado)

                            const scoreNormal = (cal: Cal) => {
                              const dScore = diam >= cal.dMin && diam <= cal.dMax ? 1
                                : 1 - Math.min(1, Math.min(Math.abs(diam - cal.dMin), Math.abs(diam - cal.dMax)) / 0.5)
                              if (dScore <= 0) return -1
                              let total = dScore * 0.5, weight = 0.5
                              if (!isNaN(alt) && alt > 0) {
                                const a = alt >= cal.aMin && alt <= cal.aMax ? 1
                                  : 1 - Math.min(1, Math.min(Math.abs(alt - cal.aMin), Math.abs(alt - cal.aMax)) / 3)
                                total += a * 0.3; weight += 0.3
                              }
                              if (!isNaN(mass) && mass > 0) {
                                const gap = Math.min(Math.abs(mass - cal.mMin), Math.abs(mass - cal.mMax))
                                const m = mass >= cal.mMin && mass <= cal.mMax ? 1 : 1 - Math.min(1, gap / 1.0)
                                if (m <= 0) return -1
                                total += m * 0.3; weight += 0.3
                              }
                              return total / weight
                            }

                            // Modo deformado: considera que massa medida <= massa original
                            // Massa pode estar abaixo do mínimo (perdeu massa); exclui apenas se acima do máximo
                            const scoreDeformado = (cal: Cal) => {
                              // Diâmetro: tolerância mais ampla (deformação altera diâmetro)
                              const dScore = diam >= cal.dMin && diam <= cal.dMax ? 1
                                : 1 - Math.min(1, Math.min(Math.abs(diam - cal.dMin), Math.abs(diam - cal.dMax)) / 1.2)
                              if (dScore <= 0) return -1
                              let total = dScore * 0.6, weight = 0.6
                              if (!isNaN(mass) && mass > 0) {
                                // Se massa > max do calibre → impossível (projétil não ganhou massa)
                                if (mass > cal.mMax + 0.5) return -1
                                // Se massa <= max → compatível (pode ter perdido massa)
                                const m = mass >= cal.mMin ? 1
                                  : 1 - Math.min(0.4, (cal.mMin - mass) / cal.mMin) // pequena penalidade por perda
                                total += m * 0.4; weight += 0.4
                              }
                              return total / weight
                            }

                            const ranked = db
                              .map(c => ({ ...c, score: deformado ? scoreDeformado(c) : scoreNormal(c) }))
                              .filter(c => c.score > (deformado ? 0.35 : 0.45))
                              .sort((a, b) => b.score - a.score)
                              .slice(0, deformado ? 3 : 1)

                            const top = ranked[0]
                            return (
                              <div className="mt-3 space-y-2">
                                <div className="rounded-xl border border-[#b89a58]/40 bg-[#f0e8d4] px-4 py-3">
                                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre real (média)</div>
                                  <div className="text-lg font-black text-[#1d2433]">{media} mm</div>
                                </div>
                                {top && !deformado && (
                                  <div className="rounded-xl border border-[#7d9b6a]/40 bg-[#eef4e8] px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5a7a48]">Família do calibre</div>
                                    <div className="text-base font-black text-[#1d2433]">{top.mm}</div>
                                    <div className="text-[11px] text-[#5a7a48]">{top.nome}</div>
                                  </div>
                                )}
                                {top && !deformado && (
                                  <div className="rounded-xl border border-[#4a6fa5]/30 bg-[#eaf0f8] px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a5a80]">Provável calibre nominal</div>
                                    <div className="text-base font-black text-[#1d2433]">{top.nominal}</div>
                                  </div>
                                )}
                                {deformado && ranked.length > 0 && (
                                  <div className="rounded-xl border border-[#c4913a]/40 bg-[#fdf3e3] px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a5e20]">
                                      Possíveis calibres — perda de massa considerada
                                    </div>
                                    <div className="mt-1.5 space-y-1">
                                      {ranked.map((c, i) => (
                                        <div key={c.nome} className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${i === 0 ? "bg-[#f5e5c8]" : "bg-[#fbf0dc]"}`}>
                                          <div>
                                            <div className="text-[13px] font-black text-[#1d2433]">{c.nominal}</div>
                                            <div className="text-[10px] text-[#8a6030]">{c.mm} · {c.nome}</div>
                                          </div>
                                          <div className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black text-[#8a5e20] bg-[#f0d9a8]">
                                            {Math.round(c.score * 100)}%
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-2 text-[10px] text-[#a07040]">
                                      {activeWeapon?.fragmentado ? "Projétil fragmentado" : "Deformação presente"} — calibre nominal requer confirmação
                                    </div>
                                  </div>
                                )}
                                {!top && (
                                  <div className="rounded-xl border border-[#b89a58]/25 bg-[#f5f0e8] px-4 py-2.5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Provável calibre nominal</div>
                                    <div className="text-base font-black text-[#1d2433]">Indeterminado</div>
                                    <div className="mt-0.5 text-[11px] text-[#8d7854]">
                                      {deformado
                                        ? activeWeapon?.fragmentado
                                          ? "Projétil fragmentado — insuficiente para determinação"
                                          : "Deformação severa — insuficiente para determinação"
                                        : `Nenhum calibre identificado para ${media} mm`}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </>)}
                        {/* Calibre real direto — só para ÍNTEGRO */}
                        {activeWeapon?.estadoProjetil === "ÍNTEGRO" && (
                          <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Calibre real (mm)</label>
                            <input value={String(activeWeapon?.diametro ?? "")} onChange={handleWeaponField("diametro")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 9,02" />
                          </div>
                        )}
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Massa (g)</label>
                          <input
                            value={String(activeWeapon?.massa ?? "")}
                            onChange={handleWeaponField("massa" as keyof Omit<WeaponEntry,"type">)}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: 7,162"
                          />
                          {(() => {
                            const g = parseFloat(String(activeWeapon?.massa ?? "").replace(",", ".").replace(/[^\d.]/g, ""))
                            if (isNaN(g) || g <= 0) return null
                            const gr = (g * 15.4324).toFixed(2).replace(".", ",")
                            const gFmt = g.toFixed(3).replace(".", ",")
                            return (
                              <div className="mt-2 rounded-xl border border-[#b89a58]/40 bg-[#f0e8d4] px-4 py-3">
                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Massa (g / gr)</div>
                                <div className="text-lg font-black text-[#1d2433]">{gFmt} g &nbsp;/&nbsp; {gr} gr</div>
                              </div>
                            )
                          })()}
                        </div>
                        {/* Altura — só para DEFLAGRADO */}
                        {activeWeapon?.estadoProjetil !== "ÍNTEGRO" && (
                          <div className="mt-4">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Altura (mm)</label>
                            <input
                              value={String(activeWeapon?.alturaProjetil ?? "")}
                              onChange={handleWeaponField("alturaProjetil" as keyof Omit<WeaponEntry,"type">)}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 14,20"
                            />
                          </div>
                        )}
                      </CollapsibleSection>
                    </div>
                  )}

                  {/* ── PÓLVORA ── */}
                  {activeWeapon?.type === "PÓLVORA" && (
                    <div className="space-y-4">

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Identificação</label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: Hodgdon H4895, IMR 4064…" />
                        </div>
                      </div>

                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Tipo de pólvora */}
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de pólvora<HelpBtn title="Tipo de pólvora" text="Pólvora negra: mistura de carvão, enxofre e nitrato — mais antiga, produz fumaça densa. Sem fumaça base simples: nitrocelulose, usada em munições modernas. Base dupla: nitrocelulose + nitroglicerina, maior energia. Propelente esférico: grânulos esféricos de queima uniforme." /></label>
                          <button type="button" onClick={() => setTipoPolvoraPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.tipoPolvora ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tipoPolvora || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Estado físico */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Estado físico / granulometria</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar estado físico…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Cor */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Cor</label>
                          <input value={activeWeapon?.cor ?? ""} onChange={handleWeaponField("cor" as keyof Omit<WeaponEntry,"type">)}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: Cinza, Preta, Branca, Amarela…" />
                        </div>
                        {/* Massa e Quantidade */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Massa (g)</label>
                            <input value={String(activeWeapon?.massa ?? "")} onChange={handleWeaponField("massa" as keyof Omit<WeaponEntry,"type">)}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 2,500" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Quantidade</label>
                            <input value={String(activeWeapon?.quantidade ?? "")} onChange={handleWeaponField("quantidade")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 1 frasco" />
                          </div>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["oxidacaoPresente", "Oxidação / umidade presente"],
                            ["manchas",          "Contaminação ou manchas"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        {Boolean(activeWeapon?.manchas) && (
                          <div className="mt-3">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Observações</label>
                            <input value={activeWeapon?.manchasObs ?? ""} onChange={handleWeaponField("manchasObs")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Descreva as contaminações…" />
                          </div>
                        )}
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ESPOLETA ── */}
                  {activeWeapon?.type === "ESPOLETA" && (
                    <div className="space-y-4">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Identificação</label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CCI 400, Federal 100…" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Fabricante</label>
                          <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CBC, CCI, Federal, Remington…" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">País de fabricação</label>
                          <button type="button" onClick={() => setPaisPickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.paisFabricacao ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.paisFabricacao || "Selecionar país…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </div>

                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Tipo de espoleta */}
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de espoleta<HelpBtn title="Tipo de espoleta" text="Boxer: espoleta central com 1 orifício de chama — padrão americano, permite recarga. Berdan: central com 2 orifícios — padrão europeu, dificulta recarga. Rimfire: espoleta distribuída no anel periférico do estojo, comum em calibres .22." /></label>
                          <button type="button" onClick={() => setTipoEspoletaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.tipoEspoleta ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tipoEspoleta || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Material */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Calibre e Quantidade */}
                        <div className="space-y-3">
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Calibre compatível</label>
                            <button type="button" onClick={() => setCalibrePickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.caliber || "Selecionar calibre…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Quantidade</label>
                            <input value={String(activeWeapon?.quantidade ?? "")} onChange={handleWeaponField("quantidade")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 5" />
                          </div>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleCard title="Marcações e estado">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["completo",           "Espoleta íntegra"],
                            ["marcacaoPercussor",  "Marcação de percussor"],
                            ["deformacaoPresente", "Deformação presente"],
                            ["oxidacaoPresente",   "Oxidação presente"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── CARTUCHO ── */}
                  {activeWeapon?.type === "CARTUCHO" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Material do estojo — picker */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do estojo</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Formato do estojo */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Formato do estojo</label>
                          <button type="button" onClick={() => setFormatoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.formato ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.formato || "Selecionar formato…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Inscrições (headstamp) */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Inscrições (headstamp)</label>
                          <input
                            value={activeWeapon?.inscricaoFabricante ?? ""}
                            onChange={handleWeaponField("inscricaoFabricante")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: CBC .38 SPL, RP 9mm LUGER…"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ...(activeWeapon?.estadoCartucho === "ÍNTEGRO" ? [["quantidade", "Quantidade", "Ex.: 12"]] : []),
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["completo", "Cartucho íntegro / completo"],
                            ["amassado", "Amassado"],
                            ["oxidacaoPresente","Oxidação presente"],
                            ["aptoDisparo","Apto a disparo"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Deformações acidentais</label>
                          <button type="button" onClick={() => setDeformacoesPickerOpen(true)}
                            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-left transition focus:border-[#9e7f45]">
                            <span className={`text-[14px] leading-snug ${activeWeapon?.deformacoesAcidentais ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.deformacoesAcidentais || "Selecionar deformações…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── FACA ── */}
                  {activeWeapon?.type === "FACA" && (
                    <div className="space-y-4">

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Identificação</label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: Tramontina, Gerber…" />
                        </div>
                      </div>

                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Material da lâmina */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da lâmina</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Tipo de lâmina */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de lâmina</label>
                          <button type="button" onClick={() => setTipoLaminaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.tipoLamina ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tipoLamina || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Tipo de gume */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de gume</label>
                          <button type="button" onClick={() => setTipoGumePickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.tipoGume ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tipoGume || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Acabamento */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.acabamento || "Selecionar acabamento…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Comprimentos */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compLamina", "Comprimento da lâmina", "Ex.: 120 mm"],
                            ["compTotal",  "Comprimento total",     "Ex.: 240 mm"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",      "ferrugemObs",      "Ferrugem presente"],
                            ["desgaste",      "desgasteObs",      "Desgaste na lâmina"],
                            ["manchas",       "manchasObs",       "Manchas / resíduos"],
                            ["danoEstruturais","danoEstruturaisObs","Danos estruturais"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Exame de corte">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["laminaIntegra",  "Lâmina íntegra"],
                            ["gumeFuncional",  "Gume funcional / afiado"],
                            ["caboDanificado", "Cabo danificado"],
                            ["aptaUso",        "Apta ao uso"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ARMA DE PRESSÃO ── */}
                  {activeWeapon?.type === "ARMA DE PRESSÃO" && (
                    <div className="space-y-4" style={{ marginTop: '-0.625rem' }}>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Identificação
                            <HelpBtn title="Identificação" text="Designação comercial ou referência da arma de pressão. Inclua marca e modelo quando conhecidos. Ex.: Rossi M1000, Crosman 1077, Gamo Whisper." />
                          </label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: Rossi 1000, Crosman 1077…" />
                        </div>
                        <div>
                          <label className={`mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] ${activeWeapon?.adaptadaArmaFogo === null ? "text-[#b0a08a]" : "text-[#6b5838]"}`}>
                            Calibre
                            <HelpBtn title="Calibre" text="Diâmetro nominal do projétil. Armas de pressão comuns utilizam 4,5 mm (.177) ou 5,5 mm (.22). Armas adaptadas para fogo real podem utilizar calibres de pistola ou revólver." />
                          </label>
                          <button type="button"
                            disabled={activeWeapon?.adaptadaArmaFogo === null}
                            onClick={() => setCalibreArmaPressaoPickerOpen(true)}
                            className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left transition ${activeWeapon?.adaptadaArmaFogo === null ? "cursor-not-allowed border-[#e0d8cc] bg-[#f5f2ed] opacity-50" : "border-[#cdbf9e] bg-[#fbf8f2] focus:border-[#9e7f45]"}`}>
                            <span className={`truncate text-[15px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.adaptadaArmaFogo === null ? "Responda se foi adaptada para arma de fogo" : activeWeapon?.caliber || "Selecionar calibre…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </div>
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Sistema de acionamento
                            <HelpBtn title="Sistema de acionamento" text="Mecanismo que propele o projétil. Mola/pistão: mola comprimida libera pistão de ar. CO₂: cartucho de gás pressurizado. PCP: reservatório de ar pré-carregado externamente. Bomba manual: pressão acumulada por bombeamento." />
                          </label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Material
                            <HelpBtn title="Material" text="Material predominante da estrutura da arma. Ex.: aço, alumínio, polímero, zamak (liga de zinco). Relevante para determinar resistência e valor pericial." />
                          </label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",  "Comprimento do cano",  "Ex.: 200 mm", "Medida do cano desde a câmara até a boca. Influencia a velocidade do projétil e a precisão do disparo."],
                            ["compTotal", "Comprimento total",    "Ex.: 450 mm", "Medida total da arma da culatra à boca do cano, incluindo coronha quando fixa."],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string, string][]).map(([field, lbl, ph, help]) => (
                            <div key={field}>
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                                {lbl}
                                <HelpBtn title={lbl} text={help} />
                              </label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",       "ferrugemObs",       "Ferrugem presente"],
                            ["desgaste",       "desgasteObs",       "Desgaste visível"],
                            ["danoEstruturais","danoEstruturaisObs","Danos estruturais"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Funcionalidade">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["gatilhoFuncional", "Gatilho funcional"],
                            ["seguranca",        "Segurança funcional"],
                            ["aptaUso",          "Apta ao uso / disparo"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ARMA DE ANTECARGA ── */}
                  {activeWeapon?.type === "ARMA DE ANTECARGA" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Sistema de ignição
                            <HelpBtn title="Sistema de ignição" text="Mecanismo usado para deflagrar a carga propulsora. Pederneira (flintlock): sílex golpeia frisa gerando faísca. Percussão: cão golpeia espoleta de fulminato. Mecha: corda incandescente aciona a carga." />
                          </label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Material do cano
                            <HelpBtn title="Material do cano" text="Material de que é feito o cano da arma. Ex.: aço, ferro forjado, bronze." />
                          </label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {([
                            ["compCano",  "Comprimento do cano", "Ex.: 190 mm"],
                            ["compTotal", "Comprimento total",   "Ex.: 380 mm"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",       "ferrugemObs",       "Ferrugem / oxidação presente"],
                            ["desgaste",       "desgasteObs",       "Desgaste visível"],
                            ["danoEstruturais","danoEstruturaisObs","Danos estruturais"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── CARREGADOR (peça independente) ── */}
                  {activeWeapon?.type === "CARREGADOR" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características" defaultOpen={true}>
                        <div className="space-y-3">
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Capacidade</label>
                            <input value={String(activeWeapon?.capacidadeCarregador ?? "")} onChange={handleWeaponField("capacidadeCarregador")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 17 cartuchos" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo</label>
                            <button type="button" onClick={() => setCarregadorPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.tipoCarregador ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.tipoCarregador || "Selecionar tipo…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                            <button type="button" onClick={() => setMaterialPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.material || "Selecionar material…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado / Condição">
                        <div className="space-y-2">
                          {([
                            ["carregadorFuncional", "Carregador funcional (mola/segurador)"],
                            ["ferrugemPresente",    "Presença de ferrugem"],
                            ["danoEstruturais",     "Danos estruturais visíveis"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean((activeWeapon as Record<string,unknown>)?.[key] ?? true)
                            const isNao = !isNa && !Boolean((activeWeapon as Record<string,unknown>)?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>{label}</span>
                                <div className="flex shrink-0 gap-1.5">
                                  {(["SIM","NÃO","N/A"] as const).map(opt => {
                                    const active = opt === "N/A" ? isNa : opt === "SIM" ? isSim : isNao
                                    return (
                                      <button key={opt} type="button"
                                        onClick={() => {
                                          if (opt === "N/A") handleWeaponNaToggle(key)
                                          else setWeaponDirect(key as keyof Omit<WeaponEntry,"type">, opt === "SIM")
                                        }}
                                        className={cn("rounded-lg px-2.5 py-1 text-[11px] font-black tracking-[0.1em] transition",
                                          active ? "bg-[#7d6334] text-white" : "bg-[#e8dfc8] text-[#7a6540]")}>
                                        {opt}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── Mira e Carregador ── */}
                  {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                    <div className="overflow-hidden rounded-2xl border border-[#d5c7aa] bg-[#fbf8f3]">
                      <div className="border-b border-[#e8dfc8] px-5 py-4">
                        <span className="text-sm font-black uppercase tracking-[0.14em] text-[#1a1410]">Mira e Carregador</span>
                      </div>
                      <div className="divide-y divide-[#e8dfc8]">
                        {/* Mira */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Mira</div>
                            {activeWeapon?.tipoMira && activeWeapon.tipoMira.length > 0
                              ? <div className="mt-0.5 text-[14px] font-semibold text-[#26221b]">{activeWeapon.tipoMira.join(", ")}</div>
                              : <div className="mt-0.5 text-[13px] text-[#b09a78]">Não informada</div>}
                          </div>
                          <div className="ml-3 flex items-center gap-1.5">
                            {activeWeapon?.tipoMira && activeWeapon.tipoMira.length > 0 && (
                              <button type="button" onClick={() => setConfirmDeleteMira(true)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e0b0b0] bg-[#fdf0f0] text-[#c87070] transition active:bg-[#fde0e0]">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button type="button" onClick={() => setMiraPickerOpen(true)}
                              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-[12px] font-black uppercase tracking-[0.1em] text-[#7d6334] transition active:bg-[#f0e8d4]">
                              <Plus className="h-3.5 w-3.5" />{activeWeapon?.tipoMira && activeWeapon.tipoMira.length > 0 ? "Alterar" : "Adicionar"}
                            </button>
                          </div>
                        </div>
                        {/* Carregador */}
                        {(
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Carregador</div>
                              {activeWeapon?.tipoCarregador && activeWeapon.tipoCarregador.length > 0
                                ? <div className="mt-0.5 text-[14px] font-semibold text-[#26221b]">
                                    {activeWeapon.tipoCarregador.join(", ")}
                                    {activeWeapon.capacidadeCarregador ? <span className="ml-1.5 text-[12px] font-normal text-[#7a6540]">· {activeWeapon.capacidadeCarregador}</span> : null}
                                  </div>
                                : <div className="mt-0.5 text-[13px] text-[#b09a78]">Não informado</div>}
                            </div>
                            <div className="ml-3 flex items-center gap-1.5">
                              {activeWeapon?.tipoCarregador && activeWeapon.tipoCarregador.length > 0 && (
                                <button type="button" onClick={() => setConfirmDeleteCarregador(true)}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e0b0b0] bg-[#fdf0f0] text-[#c87070] transition active:bg-[#fde0e0]">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button type="button" onClick={() => setCarregadorPickerOpen(true)}
                                className="flex h-9 items-center gap-1.5 rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-[12px] font-black uppercase tracking-[0.1em] text-[#7d6334] transition active:bg-[#f0e8d4]">
                                <Plus className="h-3.5 w-3.5" />{activeWeapon?.tipoCarregador && activeWeapon.tipoCarregador.length > 0 ? "Alterar" : "Adicionar"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Imagens ── */}
                  <div>
                    <div className="mb-4 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Imagens
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotosOpen(true)}
                      className="w-full overflow-hidden rounded-2xl border-2 border-[#d3c4a8] bg-[#fbf8f3] shadow-sm active:bg-[#ece6da]"
                    >
                      {photoUrls.size > 0 ? (
                        <>
                          <div className="flex gap-2 overflow-x-auto p-3 pb-2">
                            {Array.from(photoUrls.entries()).map(([k, url]) => (
                              <img key={k} src={url} alt="" className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover" />
                            ))}
                          </div>
                          <div className="flex items-center justify-between border-t border-[#e8dfc8] px-4 py-3">
                            <span className="text-xs font-bold text-[#6b5838]">
                              {photoUrls.size} foto{photoUrls.size > 1 ? "s" : ""} adicionada{photoUrls.size > 1 ? "s" : ""}
                            </span>
                            <div className="flex items-center gap-1 text-[#b89a58]">
                              <span className="text-xs font-bold">Gerenciar</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-4 px-5 py-5">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                            <Camera className="h-7 w-7 text-[#8d7854]" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-black uppercase tracking-[0.12em] text-[#50442f]">Adicionar fotos</div>
                            <div className="mt-0.5 text-xs text-[#8d7854]">Câmera e lacres da peça</div>
                          </div>
                          <ChevronRight className="ml-auto h-5 w-5 text-[#b89a58]" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* ── Footer ── */}
                  <div className="grid grid-cols-2 gap-3 border-t border-[#d3c3a4] pt-5 pb-20">
                    <button
                      type="button"
                      onClick={() => { resetPieceForm() }}
                      className="rounded-2xl border border-[#a8894c] bg-[#efe1b5] py-4 text-sm font-black tracking-[0.14em] text-[#4b3b21] transition hover:brightness-95"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="button"
                      onClick={savePiece}
                      className="rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.16em] text-[#f0d08a] shadow-[0_12px_24px_rgba(0,0,0,.28)] transition hover:brightness-110"
                    >
                      {editingPieceIdx !== null ? "ATUALIZAR PEÇA" : "SALVAR PEÇA"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tela de fotos ── */}
        <AnimatePresence>
          {photosOpen && weaponType && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed inset-0 z-[80] flex flex-col bg-[#f5efe3] text-[#26221b]"
            >
              {/* Header */}
              <div className="shrink-0 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPhotosOpen(false)}
                    className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-black text-[#f0d08a]">Fotos</div>
                    <div className="truncate text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">{weaponType}</div>
                  </div>
                  {photoUrls.size > 0 && (
                    <div className="shrink-0 rounded-full bg-[#f0d08a]/15 px-3 py-1 text-[11px] font-black text-[#f0d08a]">
                      {photoUrls.size} foto{photoUrls.size > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo rolável */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-8 p-4 pb-4">

                  {/* Lacre de entrada */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">
                      Lacre de entrada
                    </label>
                    <input
                      value={lacreNumero}
                      onChange={e => setLacreNumero(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-[#d3c4a8] bg-white px-4 text-[16px] font-bold text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/10"
                      placeholder="Nº lacre de entrada"
                    />
                  </div>

                  {/* Fotos da peça */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#b89a58]" />
                      <span className="text-[15px] font-black uppercase tracking-[0.22em] text-[#6b5838]">
                        Fotos da peça
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(photoSlotsByType[weaponType] ?? []).filter(slot =>
                        !(slot === "Numeração de série" &&
                          (["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).includes(weaponType as WeaponType) &&
                          activeWeapon?.tipoProd === "ARTESANAL")
                      ).map((slot) => (
                        <PhotoSlot
                          key={slot}
                          slotKey={`piece-${slot}`}
                          label={slot}
                          photoUrl={photoUrls.get(`piece-${slot}`)}
                          onCapture={handlePhotoCapture}
                          onRemove={handlePhotoRemove}
                          onView={setViewerPhoto}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Lacre e Embalagem */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#b89a58]" />
                      <span className="text-[15px] font-black uppercase tracking-[0.22em] text-[#6b5838]">
                        Embalagem
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <PhotoSlot
                        slotKey="lacre-Frente da embalagem recebida"
                        label="Entrada (Frente)"
                        photoUrl={photoUrls.get("lacre-Frente da embalagem recebida")}
                        onCapture={handlePhotoCapture}
                        onRemove={handlePhotoRemove}
                        onView={setViewerPhoto}
                      />
                      <PhotoSlot
                        slotKey="lacre-Verso da embalagem recebida"
                        label="Entrada (Verso)"
                        photoUrl={photoUrls.get("lacre-Verso da embalagem recebida")}
                        onCapture={handlePhotoCapture}
                        onRemove={handlePhotoRemove}
                        onView={setViewerPhoto}
                      />
                      <PhotoSlot
                        slotKey="lacre-Frente da embalagem despachada"
                        label="Saída (Frente)"
                        photoUrl={photoUrls.get("lacre-Frente da embalagem despachada")}
                        onCapture={handlePhotoCapture}
                        onRemove={handlePhotoRemove}
                        onView={setViewerPhoto}
                      />
                      <PhotoSlot
                        slotKey="lacre-Verso da embalagem despachada"
                        label="Saída (Verso)"
                        photoUrl={photoUrls.get("lacre-Verso da embalagem despachada")}
                        onCapture={handlePhotoCapture}
                        onRemove={handlePhotoRemove}
                        onView={setViewerPhoto}
                      />
                    </div>
                  </div>

                  {/* Lacre de saída */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">
                      Lacre de saída
                    </label>
                    <input
                      value={lacreSaidaNumero}
                      onChange={e => setLacreSaidaNumero(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-[#d3c4a8] bg-white px-4 text-[16px] font-bold text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/10"
                      placeholder="Nº lacre de saída"
                    />
                  </div>

                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Material picker ── */}
        <AnimatePresence>
          {materialPickerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMaterialPickerOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                {/* Handle + título */}
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">
                      {activeWeapon?.type === "ESTOJO" ? "Material do estojo"
                        : activeWeapon?.type === "CARTUCHO" ? "Material do cartucho"
                        : activeWeapon?.type === "FACA" ? "Material da lâmina"
                        : activeWeapon?.type === "ARMA DE PRESSÃO" ? "Material da arma de pressão"
                        : activeWeapon?.type === "CARREGADOR" ? "Material do carregador"
                        : (["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? "Material da arma"
                        : "Material do projétil"}
                    </span>
                    <button type="button" onClick={() => setMaterialPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Lista rolável */}
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {(activeWeapon?.type === "PÓLVORA" ? [
                    "Granulada",
                    "Em pó fino",
                    "Em flocos",
                    "Esférica",
                    "Extrudada",
                    "Compactada",
                    "Indeterminado",
                  ] : activeWeapon?.type === "ESPOLETA" ? [
                    "Latão",
                    "Aço",
                    "Alumínio",
                    "Cobre",
                    "Niquelado",
                    "Indeterminado",
                  ] : activeWeapon?.type === "ESTOJO" || activeWeapon?.type === "CARTUCHO" ? [
                    "Latão",
                    "Aço",
                    "Aço inoxidável",
                    "Alumínio",
                    "Cobre",
                    "Bimetálico (aço/latão)",
                    "Niquelado",
                    "Polímero / plástico",
                  ] : activeWeapon?.type === "FACA" ? [
                    "Aço inoxidável",
                    "Aço carbono",
                    "Aço inox cirúrgico",
                    "Aço damasco",
                    "Aço revestido (titânio / DLC)",
                    "Liga metálica",
                    "Cerâmica",
                    "Ferro",
                    "Indeterminado",
                  ] : activeWeapon?.type === "CARREGADOR" ? [
                    "Polímero",
                    "Polímero reforçado (P-Mag)",
                    "Aço",
                    "Aço inoxidável",
                    "Alumínio",
                    "Liga de alumínio",
                    "Latão",
                    "Plástico ABS",
                    "Indeterminado",
                  ] : (["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? [
                    "Aço",
                    "Aço inoxidável",
                    "Alumínio",
                    "Liga de alumínio",
                    "Titânio",
                    "Latão",
                    "Polímero",
                    "Madeira",
                    "Inox escovado",
                    "Indeterminado",
                  ] : [
                    "Chumbo",
                    "Liga de chumbo",
                    "Chumbo endurecido",
                    "Encamisado (FMJ)",
                    "Semiencamisado",
                    "Ponta oca (HP)",
                    "Encamisado de aço",
                    "Cobre",
                    "Latão",
                    "Aço",
                    "Aço inoxidável",
                    "Alumínio",
                    "Tungstênio",
                    "Bismuto",
                    "Polímero",
                    "Niquelado",
                  ]).map((mat, idx, arr) => {
                    const selected = (activeWeapon?.material ?? "").split(",").map(s => s.trim()).filter(Boolean).includes(mat)
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => {
                          const current = (activeWeapon?.material ?? "").split(",").map(s => s.trim()).filter(Boolean)
                          const next = selected ? current.filter(m => m !== mat) : [...current, mat]
                          setWeaponDirect("material", next.join(", "))
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3 fill-white"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{mat}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Formato picker ── */}
        <AnimatePresence>
          {formatoPickerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setFormatoPickerOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">
                      {activeWeapon?.type === "ESTOJO" ? "Tipo de rebordo" : activeWeapon?.type === "CARTUCHO" ? "Formato do estojo" : "Formato do projétil"}
                    </span>
                    <button type="button" onClick={() => setFormatoPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {(activeWeapon?.type === "CARTUCHO" ? [
                    "Reto",
                    "Cônico",
                    "Gargalado",
                    "Semi-gargalado",
                    "Com cinta",
                    "Indeterminado",
                  ] : activeWeapon?.type === "ESTOJO" ? [
                    "Sem rebordo / Rimless (RL)",
                    "Semi-rebordo / Semi-rim (SR)",
                    "Com rebordo / Rimmed (R)",
                    "Rebordo destacável / Rebated rim (RB)",
                    "Semi-rebordo destacável / Semi-rebated (SRB)",
                    "Garrafa / Bottle neck",
                    "Reto / Straight",
                    "Cônico / Tapered",
                  ] : [
                    "Ogival",
                    "Ogival truncado",
                    "Ponta plana (FP)",
                    "Arredondado (RN)",
                    "Wadcutter (WC)",
                    "Semi-wadcutter (SWC)",
                    "Expansivo / Hollow Point (HP)",
                    "Ponta de polímero",
                    "Ponta de aço",
                    "Spitzer",
                    "Boat tail",
                    "Flat base",
                    "Garrafa (bottle neck)",
                    "Deformado",
                    "Fragmentado",
                  ]).map((fmt, idx, arr) => {
                    const selected = activeWeapon?.formato === fmt
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setWeaponDirect("formato", selected ? "" : fmt)
                          setFormatoPickerOpen(false)
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{fmt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Mira picker ── */}
        <AnimatePresence>
          {miraPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMiraPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Tipo de mira</span>
                    <button type="button" onClick={() => setMiraPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {(activeWeapon?.type === "REVÓLVER" || activeWeapon?.type === "PISTOLA" ? [
                    { l: "Aberta fixada",        d: "Mira dianteira e alça traseira fixas, sem regulagem" },
                    { l: "Aberta regulável",     d: "Alça traseira com ajuste de elevação e/ou deriva" },
                    { l: "Ponto vermelho (red dot)", d: "Mira óptica com ponto luminoso; sem aumento" },
                    { l: "Noturna (tritium)",    d: "Miras com insertos de trítio para visibilidade noturna" },
                    { l: "Laser",                d: "Mira laser acoplada ou integrada" },
                    { l: "Holográfica",          d: "Mira holográfica de visão aberta" },
                    { l: "Telescópica",          d: "Luneta com aumento óptico" },
                    { l: "Sem mira",             d: "Mira ausente ou removida" },
                    { l: "Indeterminada",        d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "ESPINGARDA" ? [
                    { l: "Bead (pérola frontal)", d: "Ponto metálico ou plástico na extremidade do cano" },
                    { l: "Aberta",               d: "Mira dianteira e alça traseira" },
                    { l: "Ghost ring",           d: "Anel traseiro largo de resposta rápida" },
                    { l: "Ponto vermelho (red dot)", d: "Mira óptica sem aumento com ponto luminoso" },
                    { l: "Telescópica",          d: "Luneta com aumento óptico" },
                    { l: "Sem mira",             d: "Mira ausente ou removida" },
                    { l: "Indeterminada",        d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "CARABINA" ? [
                    { l: "Aberta",               d: "Mira dianteira e alça traseira" },
                    { l: "Telescópica",          d: "Luneta com aumento óptico" },
                    { l: "Ponto vermelho (red dot)", d: "Mira óptica sem aumento" },
                    { l: "Holográfica",          d: "Mira holográfica de visão aberta" },
                    { l: "Colimador",            d: "Colimador reflex de visão aberta" },
                    { l: "Noturna (NVG/tritium)", d: "Para uso em condições de baixa luminosidade" },
                    { l: "BUIS (ferro de reserva)", d: "Mira de ferro dobrável de backup" },
                    { l: "Sem mira",             d: "Mira ausente ou removida" },
                    { l: "Indeterminada",        d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "FUZIL" ? [
                    { l: "Aberta (ferro)",       d: "Mira dianteira e alça traseira padrão" },
                    { l: "Telescópica",          d: "Luneta com aumento óptico" },
                    { l: "Ponto vermelho (red dot)", d: "Mira óptica sem aumento" },
                    { l: "Holográfica",          d: "EOTech e similares; visão aberta" },
                    { l: "ACOG",                 d: "Advanced Combat Optical Gunsight; aumento fixo 4x" },
                    { l: "Colimador",            d: "Colimador reflex" },
                    { l: "Noturna / NVG",        d: "Compatível com visão noturna" },
                    { l: "BUIS (ferro de reserva)", d: "Mira de ferro dobrável de backup" },
                    { l: "Sem mira",             d: "Mira ausente ou removida" },
                    { l: "Indeterminada",        d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "METRALHADORA" ? [
                    { l: "Aberta",               d: "Mira dianteira e alça traseira" },
                    { l: "Óptica",               d: "Mira óptica acoplada" },
                    { l: "Ponto vermelho (red dot)", d: "Mira óptica sem aumento" },
                    { l: "Sem mira",             d: "Mira ausente ou removida" },
                    { l: "Indeterminada",        d: "Não foi possível determinar" },
                  ] : [{ l: "Indeterminada", d: "Não foi possível determinar" }]
                  ).map(({ l: opt, d: desc }, idx, arr) => {
                    const sel = activeWeapon?.tipoMira === opt
                    const isSelected = activeWeapon?.tipoMira?.includes(opt) // Check if option is in the array
                    return (
                      <button key={opt} type="button"
                        onClick={() => { // Toggle selection in array
                          const currentMirasList = activeWeapon?.tipoMira ? [...activeWeapon.tipoMira] : [];
                          const newMirasList = isSelected ? currentMirasList.filter(item => item !== opt) : [...currentMirasList, opt];
                          setWeaponDirect("tipoMira", newMirasList);
                          // setMiraPickerOpen(false) // Do not close picker, allow multiple selections
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${isSelected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {isSelected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <div className="min-w-0 flex-1"> {/* Display option label and description */}
                          <div className={`text-[15px] font-semibold leading-tight ${isSelected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</div>
                          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{desc}</div> {/* Description */}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Carregador picker ── */}
        <AnimatePresence>
          {carregadorPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCarregadorPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] text-[#26221b] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Carregador</span>
                    <button type="button" onClick={() => setCarregadorPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Capacidade</label>
                      <input value={String(activeWeapon?.capacidadeCarregador ?? "")} onChange={handleWeaponField("capacidadeCarregador")}
                        className="h-10 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-[14px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: 17 cartuchos" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Material</label>
                      <button type="button" onClick={() => { setCarregadorPickerOpen(false); setMaterialPickerOpen(true) }}
                        className="flex h-10 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition focus:border-[#9e7f45]">
                        <span className={`truncate text-[14px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                          {activeWeapon?.material || "Selecionar material…"}
                        </span>
                        <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                      </button>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Tipo</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {(activeWeapon?.type === "REVÓLVER" ? [
                    { l: "Jetloader",   d: "Dispositivo de carregamento rápido do tambor; acondiciona e insere todos os cartuchos simultaneamente" },
                    { l: "Indeterminado", d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "PISTOLA" ? [
                    { l: "Caixa padrão (standard)", d: "Carregador de caixa removível de capacidade original" },
                    { l: "Caixa estendido",         d: "Carregador com capacidade superior ao original" },
                    { l: "Tambor (drum)",           d: "Carregador circular de alta capacidade" },
                    { l: "Indeterminado",           d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "ESPINGARDA" ? [
                    { l: "Tubo tubular (interno)",  d: "Carregador tubular fixo sob o cano" },
                    { l: "Caixa removível padrão",  d: "Carregador de caixa destacável" },
                    { l: "Caixa estendida",         d: "Carregador de caixa de maior capacidade" },
                    { l: "Fixo interno",            d: "Câmara única; carga pelo cano ou abertura superior" },
                    { l: "Indeterminado",           d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "CARABINA" ? [
                    { l: "Caixa reto",              d: "Carregador de caixa reto removível" },
                    { l: "Caixa curvo",             d: "Carregador de caixa curvo removível" },
                    { l: "Tambor (drum)",           d: "Carregador circular de alta capacidade" },
                    { l: "Tubo tubular",            d: "Carregador tubular sob o cano ou na coronha" },
                    { l: "Integrado fixo",          d: "Carregador interno não removível" },
                    { l: "Indeterminado",           d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "FUZIL" ? [
                    { l: "Caixa reto (STANAG)",     d: "Padrão OTAN; 20 ou 30 cartuchos" },
                    { l: "Caixa curvo",             d: "Carregador curvo para cartuchos cônicos (ex: 7,62×39)" },
                    { l: "Tambor (drum)",           d: "Carregador circular de alta capacidade" },
                    { l: "Duplo acoplado",          d: "Dois carregadores unidos para troca rápida" },
                    { l: "P-Mag / polímero",        d: "Carregador de polímero reforçado" },
                    { l: "Indeterminado",           d: "Não foi possível determinar" },
                  ] : activeWeapon?.type === "METRALHADORA" ? [
                    { l: "Cinta / fita de munição", d: "Alimentação por correia ou fita metálica" },
                    { l: "Tambor (drum)",           d: "Carregador circular de alta capacidade" },
                    { l: "Caixa",                  d: "Carregador de caixa removível" },
                    { l: "Indeterminado",           d: "Não foi possível determinar" },
                  ] : [{ l: "Indeterminado", d: "Não foi possível determinar" }]
                  ).map(({ l: opt, d: desc }, idx, arr) => {
                    const sel = activeWeapon?.tipoCarregador === opt
                    const isSelected = activeWeapon?.tipoCarregador?.includes(opt) // Check if option is in the array
                    return (
                      <button key={opt} type="button"
                        onClick={() => { // Toggle selection in array
                          const currentCarregadorList = activeWeapon?.tipoCarregador ? [...activeWeapon.tipoCarregador] : [];
                          const newCarregadorList = isSelected ? currentCarregadorList.filter(item => item !== opt) : [...currentCarregadorList, opt];
                          setWeaponDirect("tipoCarregador", newCarregadorList);
                          // setCarregadorPickerOpen(false) // Do not close picker, allow multiple selections
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${isSelected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {isSelected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <div className="min-w-0 flex-1"> {/* Display option label and description */}
                          <div className={`text-[15px] font-semibold leading-tight ${isSelected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</div>
                          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{desc}</div> {/* Description */}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Sentido das raias picker ── */}
        <AnimatePresence>
          {sentidoPickerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSentidoPickerOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Sentido das raias</span>
                    <button type="button" onClick={() => setSentidoPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {[
                    "Dextrorso",
                    "Sinistrorso",
                    "Dextrorso e Sinistrorso (combinado)",
                    "Anfidextrorso",
                    "Indeterminado",
                  ].map((sentido, idx, arr) => {
                    const selected = activeWeapon?.sentidoEstrias === sentido
                    return (
                      <button
                        key={sentido}
                        type="button"
                        onClick={() => {
                          setWeaponDirect("sentidoEstrias", selected ? "" : sentido)
                          setSentidoPickerOpen(false)
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{sentido}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Deformações acidentais picker ── */}
        <AnimatePresence>
          {deformacoesPickerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setDeformacoesPickerOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Deformações acidentais</span>
                    <button type="button" onClick={() => setDeformacoesPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {(activeWeapon?.type === "ESTOJO" ? [
                    "Ausente",
                    "Amassamento na boca",
                    "Amassamento no corpo",
                    "Amassamento no rebordo",
                    "Deformação por extração forçada",
                    "Arranhões / riscos superficiais",
                    "Oxidação com deformação",
                    "Indeterminada",
                  ] : activeWeapon?.type === "CARTUCHO" ? [
                    "Ausente",
                    "Amassamento na boca do estojo",
                    "Amassamento no corpo do estojo",
                    "Deformação no projétil",
                    "Deformação no rebordo",
                    "Arranhões / riscos superficiais",
                    "Oxidação com deformação",
                    "Indeterminada",
                  ] : [
                    "Ausente",
                    "Leve",
                    "Moderada",
                    "Acentuada",
                    "Severa",
                    "Fragmentação parcial",
                    "Fragmentação total",
                    "Moderada com fragmentação parcial",
                    "Acentuada com fragmentação parcial",
                    "Achatamento leve",
                    "Achatamento moderado",
                    "Achatamento severo",
                    "Encurvamento",
                    "Esmagamento",
                    "Expansão (HP)",
                    "Expansão parcial",
                    "Deformação por ricochete",
                    "Deformação por impacto em superfície dura",
                    "Deformação por passagem em material mole",
                    "Indeterminada",
                  ]).map((def, idx, arr) => {
                    const selecionados = (activeWeapon?.deformacoesAcidentais ?? "").split(",").map(s => s.trim()).filter(Boolean)
                    const selected = selecionados.includes(def)
                    return (
                      <button
                        key={def}
                        type="button"
                        onClick={() => {
                          const next = selected ? selecionados.filter(d => d !== def) : [...selecionados, def]
                          setWeaponDirect("deformacoesAcidentais", next.join(", "))
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[15px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{def}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Tipo de lâmina picker ── */}
        <AnimatePresence>
          {tipoLaminaPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTipoLaminaPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Tipo de lâmina</span>
                    <button type="button" onClick={() => setTipoLaminaPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {["Lisa", "Serrilhada", "Mista (lisa e serrilhada)", "Ondulada / dentada", "Indeterminada"].map((opt, idx, arr) => {
                    const selected = activeWeapon?.tipoLamina === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("tipoLamina", selected ? "" : opt); setTipoLaminaPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Tipo de gume picker ── */}
        <AnimatePresence>
          {tipoGumePickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTipoGumePickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Tipo de gume</span>
                    <button type="button" onClick={() => setTipoGumePickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {["Simples (um gume)", "Duplo (dois gumes)", "Falso gume", "Sem gume definido", "Indeterminado"].map((opt, idx, arr) => {
                    const selected = activeWeapon?.tipoGume === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("tipoGume", selected ? "" : opt); setTipoGumePickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Acabamento picker ── */}
        <AnimatePresence>
          {tipoRaiamentoPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTipoRaiamentoPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Tipo de raiamento do cano</span>
                    <button type="button" onClick={() => setTipoRaiamentoPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {[
                    "Alma lisa (sem raiamento)",

                    "Raiamento convencional",
                    "Raiamento poligonal",
                    "Raiamento de campo e alvéolo",
                    "Microgroove (múltiplos raios)",
                    "Raiamento quadrado",
                    "Indeterminado",
                  ].map((opt, idx, arr) => {
                    const selected = activeWeapon?.tipoRaiamento === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("tipoRaiamento", selected ? "" : opt); setTipoRaiamentoPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {sistemaAcionamentoPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSistemaAcionamentoPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Sistema de acionamento</span>
                    <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {(activeWeapon?.type === "REVÓLVER" ? [
                    { l: "Ação simples (SA)",           d: "Cão deve ser amartilhado manualmente antes de cada disparo" },
                    { l: "Ação dupla (DA)",             d: "Gatilho arma e dispara o cão em um único movimento" },
                    { l: "Ação dupla exclusiva (DAO)",  d: "Sempre DA; cão retorna à posição de repouso após cada disparo" },
                    { l: "Indeterminado",               d: "Sistema não pôde ser determinado" },
                  ] : activeWeapon?.type === "PISTOLA" ? [
                    { l: "Ação simples (SA)",                    d: "Cão externo amartilhado manualmente; gatilho apenas dispara" },
                    { l: "Ação dupla / ação simples (DA/SA)",    d: "Primeiro disparo DA (gatilho arma e dispara); seguintes SA" },
                    { l: "Ação dupla exclusiva (DAO)",           d: "Todo disparo pelo gatilho; cão retorna ao repouso sempre" },
                    { l: "Striker-fired (percussor armado)",     d: "Percussor interno parcialmente armado pelo ciclo do ferrolho" },
                    { l: "DA com desamartilhador",               d: "DA/SA com alavanca que abaixa o cão com segurança" },
                    { l: "DA com trava de serrilha",             d: "Trava no ferrolho impede disparo acidental; desengata pelo gatilho" },
                    { l: "Indeterminado",                        d: "Sistema não pôde ser determinado" },
                  ] : activeWeapon?.type === "ESPINGARDA" ? [
                    { l: "Ferrolho deslizante (pump-action)",    d: "Bombeamento manual para ciclar a munição" },
                    { l: "Semi-automático (autocarregável)",     d: "Gases ou recuo ciclam automaticamente após cada disparo" },
                    { l: "Ferrolho giratório (bolt-action)",     d: "Ação manual por alavanca giratória e deslizante" },
                    { l: "Alavanca (lever-action)",              d: "Alavanca inferior cicla o mecanismo manualmente" },
                    { l: "Canos tombantes (break-action)",       d: "Cano(s) tombam para baixo para carga/descarga" },
                    { l: "Duplo gatilho",                        d: "Um gatilho por cano; acionamento independente" },
                    { l: "Gatilho seletivo",                     d: "Um gatilho seleciona qual cano será disparado" },
                    { l: "Indeterminado",                        d: "Sistema não pôde ser determinado" },
                  ] : activeWeapon?.type === "CARABINA" ? [
                    { l: "Ferrolho giratório (bolt-action)",     d: "Alavanca gira e desliza para ciclar manualmente" },
                    { l: "Alavanca (lever-action)",              d: "Alavanca abaixo do gatilho cicla o mecanismo" },
                    { l: "Ferrolho deslizante (pump-action)",    d: "Bombeamento manual da coronha dianteira" },
                    { l: "Semi-automático (autocarregável)",     d: "Gases ou recuo ciclam automaticamente após cada disparo" },
                    { l: "Tiro a tiro (single-shot)",            d: "Carregamento manual individual a cada disparo" },
                    { l: "Indeterminado",                        d: "Sistema não pôde ser determinado" },
                  ] : activeWeapon?.type === "FUZIL" ? [
                    { l: "Semi-automático",                      d: "Um disparo por acionamento do gatilho; cicla automaticamente" },
                    { l: "Automático",                           d: "Disparo contínuo enquanto o gatilho é pressionado" },
                    { l: "Semi/automático seletivo",             d: "Seletor permite alternar entre semi e automático" },
                    { l: "Rajada de 3 tiros",                    d: "Ciclo limitado a 3 disparos por acionamento do gatilho" },
                    { l: "Ferrolho giratório (bolt-action)",     d: "Ação manual; cada ciclo é feito pelo atirador" },
                    { l: "Tiro a tiro (single-shot)",            d: "Carregamento manual individual a cada disparo" },
                    { l: "Indeterminado",                        d: "Sistema não pôde ser determinado" },
                  ] : activeWeapon?.type === "METRALHADORA" ? [
                    { l: "Automático (open bolt)",               d: "Ferrolho parte da posição aberta; seguro quando não dispara" },
                    { l: "Automático (closed bolt)",             d: "Ferrolho fecha antes do disparo; maior precisão" },
                    { l: "Semi/automático seletivo",             d: "Seletor permite alternar entre semi e automático" },
                    { l: "Rajada de 3 tiros",                    d: "Ciclo limitado a 3 disparos por acionamento" },
                    { l: "Automático contínuo",                  d: "Disparos contínuos sem limite de rajada" },
                    { l: "Indeterminado",                        d: "Sistema não pôde ser determinado" },
                  ] : activeWeapon?.type === "ARMA DE ANTECARGA" ? [
                    { l: "Pederneira (flintlock)",        d: "Sílex preso no cão golpeia frisa metálica gerando faísca; sistema mais antigo" },
                    { l: "Percussão (percussion cap)",    d: "Cão golpeia espoleta de fulminato de mercúrio; séc. XIX" },
                    { l: "Mecha (matchlock)",             d: "Corda embebida incandescente aciona a panela de pólvora" },
                    { l: "Roda (wheellock)",              d: "Roda de aço ranhurada gera faíscas ao girar contra pirita" },
                    { l: "Espoleta inline",               d: "Sistema moderno inline; espoleta centralizada no eixo do cano" },
                    { l: "Indeterminado",                 d: "Sistema de ignição não pôde ser determinado" },
                  ] : activeWeapon?.type === "ARMA DE PRESSÃO" ? [
                    { l: "Mola/pistão (spring-piston)",          d: "Mola comprimida pelo armamento libera pistão que comprime o ar" },
                    { l: "CO₂ (cartucho de gás)",                d: "Cartucho de CO₂ armazenado pressuriza o sistema de disparo" },
                    { l: "PCP (pré-carregado pneumático)",       d: "Reservatório de ar comprimido recarregado externamente" },
                    { l: "Bomba manual (multi-pump)",            d: "Bombeamento manual acumula pressão antes do disparo" },
                    { l: "Gás (outra fonte)",                    d: "Outro tipo de propelente gasoso" },
                    { l: "Indeterminado",                        d: "Sistema não pôde ser determinado" },
                  ] : [
                    { l: "Indeterminado", d: "Sistema não pôde ser determinado" },
                  ]).map(({ l: opt, d: desc }, idx, arr) => {
                    const selected = activeWeapon?.sistemaAcionamento === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("sistemaAcionamento", selected ? "" : opt); setSistemaAcionamentoPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</div>
                          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {/* ── País de fabricação picker ── */}
          {paisPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setPaisPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">País de fabricação</span>
                    <button type="button" onClick={() => setPaisPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {([
                    { c: "br", l: "Brasil" },
                    { c: "us", l: "Estados Unidos" },
                    { c: "at", l: "Áustria" },
                    { c: "de", l: "Alemanha" },
                    { c: "it", l: "Itália" },
                    { c: "cz", l: "República Tcheca" },
                    { c: "be", l: "Bélgica" },
                    { c: "ar", l: "Argentina" },
                    { c: "ru", l: "Rússia" },
                    { c: "cn", l: "China" },
                    { c: "il", l: "Israel" },
                    { c: "fr", l: "França" },
                    { c: "gb", l: "Reino Unido" },
                    { c: "es", l: "Espanha" },
                    { c: "pt", l: "Portugal" },
                    { c: "ch", l: "Suíça" },
                    { c: "se", l: "Suécia" },
                    { c: "fi", l: "Finlândia" },
                    { c: "no", l: "Noruega" },
                    { c: "jp", l: "Japão" },
                    { c: "kr", l: "Coreia do Sul" },
                    { c: "tr", l: "Turquia" },
                    { c: "pk", l: "Paquistão" },
                    { c: "in", l: "Índia" },
                    { c: "za", l: "África do Sul" },
                    { c: "",   l: "Indeterminado" },
                  ]).map(({ c, l }, idx, arr) => {
                    const selected = activeWeapon?.paisFabricacao === l
                    return (
                      <button key={l} type="button"
                        onClick={() => { setWeaponDirect("paisFabricacao", selected ? "" : l); setPaisPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-3.5 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        {c
                          ? <img src={`https://flagcdn.com/32x24/${c}.png`} alt={l} className="h-5 w-auto rounded-sm shadow-sm shrink-0" />
                          : <span className="flex h-5 w-8 shrink-0 items-center justify-center rounded-sm bg-[#e8dfc8] text-[10px] font-black text-[#8d7854]">?</span>
                        }
                        <span className={`flex-1 text-[15px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{l}</span>
                        {selected && (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7d6334]">
                            <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {/* ── Calibre picker geral (armas de fogo e demais peças) ── */}
          {calibrePickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCalibrePickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] text-[#26221b] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Calibre</span>
                    <button type="button" onClick={() => setCalibrePickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {((activeWeapon?.type === "REVÓLVER" || activeWeapon?.type === "PISTOLA") ? [
                    { l: "9 mm Luger (9×19mm)",    d: "Padrão NATO e policial mundial; pistolas e revólveres adaptados" },
                    { l: ".38 SPL",                d: "O mais comum no Brasil; padrão policial; revólveres e algumas pistolas" },
                    { l: ".38 SPL +P",             d: "Versão de maior pressão do .38 SPL; maior velocidade" },
                    { l: ".357 Magnum",            d: "Revólveres e carabinas; compatível com câmaras .38 SPL" },
                    { l: ".40 S&W",                d: "Padrão policial brasileiro; pistolas e alguns revólveres" },
                    { l: ".45 ACP",                d: "Grande diâmetro; alto poder de parada; pistolas e revólveres .45" },
                    { l: ".45 Colt",               d: "Calibre histórico; revólveres de porte e lever-action" },
                    { l: ".380 ACP (9 mm Curto)",  d: "Pistolas compactas de porte dissimulado" },
                    { l: ".357 SIG",               d: "Alta velocidade em cano curto; uso policial especializado" },
                    { l: ".38 Super Auto",         d: "Alta velocidade; competições e forças especiais" },
                    { l: ".32 ACP (7,65mm)",       d: "Pistolas compactas antigas; antigo padrão policial" },
                    { l: ".32 S&W Long",           d: "Revólveres compactos; antigo padrão policial" },
                    { l: ".32 H&R Magnum",         d: "Evolução do .32 S&W Long; revólveres modernos" },
                    { l: ".25 ACP (6,35mm)",       d: "Pistolas de bolso; baixo poder de parada" },
                    { l: "9 mm Makarov (9×18mm)", d: "Padrão soviético; pistolas e revólveres de origem russa" },
                    { l: "10 mm Auto",             d: "Alta energia; base do .40 S&W" },
                    { l: ".44 SPL",                d: "Versão de menor pressão do .44 Magnum" },
                    { l: ".44 Magnum",             d: "Revólveres e pistolas de grande porte; alta energia cinética" },
                    { l: ".22 LR",                 d: "Rimfire; revólveres e pistolas de treinamento e esporte" },
                    { l: ".22 WMR (.22 Mag)",      d: "Rimfire magnum; maior potência que o .22 LR" },
                    { l: "5,7×28 mm FN",           d: "Pistola FN Five-seveN; alta penetração em coletes" },
                    { l: "Outro",                  d: "Informar calibre não listado" },
                    { l: "Indeterminado",          d: "Calibre não pôde ser determinado" },
                  ] : activeWeapon?.type === "ESPINGARDA" ? [
                    { l: "12 Ga (2¾\")",           d: "O mais comum no Brasil; ampla variedade de cargas" },
                    { l: "12 Ga (3\")",            d: "Câmara magnum; maior carga de pólvora e chumbo" },
                    { l: "12 Ga (3½\")",           d: "Super magnum; uso em caça de aves migratórias" },
                    { l: "16 Ga",                  d: "Calibre intermediário; uso em caça e tiro esportivo" },
                    { l: "20 Ga",                  d: "Menor recuo; uso civil, esportivo e feminino" },
                    { l: "28 Ga",                  d: "Calibre esportivo; argolas e pombos de barro" },
                    { l: ".410 Bore (2½\")",       d: "Menor calibre de espingarda; baixo recuo; iniciantes" },
                    { l: ".410 Bore (3\")",        d: "Versão magnum do .410; maior carga" },
                    { l: "Outro",                  d: "Informar calibre não listado" },
                    { l: "Indeterminado",          d: "Calibre não pôde ser determinado" },
                  ] : activeWeapon?.type === "CARABINA" ? [
                    { l: ".22 LR",                 d: "Rimfire; o mais usado em carabinas esportivas no Brasil" },
                    { l: ".22 WMR (.22 Mag)",      d: "Rimfire magnum; maior alcance que o .22 LR" },
                    { l: ".22 Hornet",             d: "Centerfire de pequeno porte; caça de animais pequenos" },
                    { l: ".223 Rem / 5,56×45mm",  d: "Padrão NATO; carabinas táticas, esportivas e IMBEL" },
                    { l: ".243 Winchester",        d: "Calibre de caça e tiro de precisão; médio alcance" },
                    { l: "7mm-08 Rem",             d: "Derivado do .308; excelente precisão e baixo recuo" },
                    { l: ".308 Win / 7,62×51mm",  d: "Padrão NATO; carabinas táticas e de precisão" },
                    { l: "7,62×39 mm",            d: "Cartucho russo; AK-47 e derivados; carabinas SKS" },
                    { l: ".30-30 Winchester",      d: "Clássico americano; carabinas lever-action" },
                    { l: ".30 Carbine (7,62×33mm)",d: "Carabina M1 Carbine; leve e compacta" },
                    { l: ".357 Magnum",            d: "Carabinas lever-action; mesma munição do revólver" },
                    { l: ".44 Magnum",             d: "Carabinas lever-action; alta energia em curtas distâncias" },
                    { l: "9 mm Luger",             d: "Carabinas pistoleiras; mesma munição da pistola 9mm" },
                    { l: ".45 ACP",                d: "Carabinas pistoleiras; mesma munição da pistola .45" },
                    { l: ".30-06 Springfield",     d: "Clássico americano; carabinas bolt-action de caça" },
                    { l: "6,5mm Creedmoor",        d: "Precisão de longa distância; crescente no Brasil" },
                    { l: "Outro",                  d: "Informar calibre não listado" },
                    { l: "Indeterminado",          d: "Calibre não pôde ser determinado" },
                  ] : activeWeapon?.type === "FUZIL" ? [
                    { l: "5,56×45 mm NATO",        d: "Padrão OTAN; AR-15, M16, IMBEL IA2 — o mais usado no Brasil" },
                    { l: "7,62×51 mm NATO",        d: "Padrão OTAN pesado; FAL, G3, IMBEL MD-2" },
                    { l: "7,62×39 mm",            d: "Cartucho russo; AK-47/AKM e derivados" },
                    { l: "5,45×39 mm",            d: "Padrão soviético moderno; AK-74 e derivados" },
                    { l: "7,62×54R mm",           d: "Rimmed russo; SVD Dragunov, PK, Mosin-Nagant" },
                    { l: ".308 Winchester",        d: "Equivalente civil do 7,62×51 NATO; fuzis de precisão" },
                    { l: ".300 Blackout (.300 BLK)",d: "Subsônico/supersônico; uso com supressor; AR-15" },
                    { l: "6,5mm Creedmoor",        d: "Fuzis de precisão de longa distância" },
                    { l: ".338 Lapua Magnum",      d: "Precisão extrema; fuzis de atirador de elite" },
                    { l: ".50 BMG (12,7×99mm)",   d: "Anti-material; fuzis Barrett e similares" },
                    { l: ".30-06 Springfield",     d: "Clássico americano; fuzis históricos e caça" },
                    { l: "Outro",                  d: "Informar calibre não listado" },
                    { l: "Indeterminado",          d: "Calibre não pôde ser determinado" },
                  ] : activeWeapon?.type === "METRALHADORA" ? [
                    { l: "9 mm Luger (9×19mm)",   d: "Submetralhadoras; HK MP5, Uzi, INA M953" },
                    { l: ".45 ACP",               d: "Thompson M1921/M1928; submetralhadoras clássicas" },
                    { l: ".40 S&W",               d: "Submetralhadoras policiais modernas" },
                    { l: ".380 ACP",              d: "Submetralhadoras compactas de porte" },
                    { l: "5,56×45 mm NATO",       d: "Metralhadoras leves; Minimi/M249, HK23" },
                    { l: "7,62×51 mm NATO",       d: "Metralhadoras médias; MAG58/M240, HK21" },
                    { l: "7,62×39 mm",            d: "RPK, PKM e metralhadoras soviéticas" },
                    { l: "7,62×54R mm",           d: "PK/PKM; padrão soviético pesado" },
                    { l: "12,7×99 mm (.50 BMG)",  d: "Metralhadoras pesadas; M2 Browning" },
                    { l: "14,5×114 mm",           d: "KPV; metralhadoras antiaéreas soviéticas" },
                    { l: "Outro",                  d: "Informar calibre não listado" },
                    { l: "Indeterminado",          d: "Calibre não pôde ser determinado" },
                  ] : activeWeapon?.type === "ESTOJO" || activeWeapon?.type === "CARTUCHO" ? [
                    { l: ".22 LR",                d: "Rimfire; revólveres e pistolas de treinamento" },
                    { l: ".22 WMR (.22 Mag)",     d: "Rimfire magnum" },
                    { l: ".25 ACP (6,35mm)",      d: "Pistolas compactas antigas" },
                    { l: ".32 ACP (7,65mm)",      d: "Pistolas compactas; antigo padrão policial" },
                    { l: ".32 S&W Long",          d: "Revólveres compactos" },
                    { l: ".380 ACP (9mm Curto)",  d: "Pistolas de porte dissimulado" },
                    { l: "9 mm Luger (9×19mm)",   d: "Padrão NATO e policial; pistolas e submetralhadoras" },
                    { l: "9 mm Makarov (9×18mm)", d: "Pistolas de origem soviética" },
                    { l: ".38 SPL",               d: "Revólveres policiais e civis; padrão no Brasil" },
                    { l: ".38 SPL +P",            d: "Versão +P do .38 SPL" },
                    { l: ".357 Magnum",           d: "Revólveres e carabinas lever-action" },
                    { l: ".38 Super Auto",        d: "Pistolas de competição" },
                    { l: ".40 S&W",               d: "Pistolas policiais; padrão brasileiro" },
                    { l: "10 mm Auto",            d: "Pistolas de alta energia" },
                    { l: ".44 SPL",               d: "Revólveres de grande porte" },
                    { l: ".44 Magnum",            d: "Revólveres e carabinas de alta energia" },
                    { l: ".45 ACP",               d: "Pistolas de grande porte" },
                    { l: ".45 Colt",              d: "Revólveres lever-action históricos" },
                    { l: ".223 Rem / 5,56×45mm",  d: "Fuzis e carabinas táticas" },
                    { l: ".308 Win / 7,62×51mm",  d: "Fuzis e carabinas de precisão" },
                    { l: "7,62×39 mm",            d: "AK e derivados" },
                    { l: "7,62×54R mm",           d: "Fuzis e metralhadoras russas" },
                    { l: ".30-30 Winchester",     d: "Carabinas lever-action" },
                    { l: ".30 Carbine",           d: "Carabina M1" },
                    { l: ".30-06 Springfield",    d: "Fuzis e carabinas de caça" },
                    { l: "12 Ga",                 d: "Espingarda calibre 12" },
                    { l: "20 Ga",                 d: "Espingarda calibre 20" },
                    { l: ".410 Bore",             d: "Espingarda calibre .410" },
                    { l: "5,7×28 mm FN",          d: "FN P90 / Five-seveN" },
                    { l: "12,7×99 mm (.50 BMG)",  d: "Metralhadoras pesadas e fuzis anti-material" },
                    { l: "Outro",                 d: "Informar calibre não listado" },
                    { l: "Indeterminado",         d: "Calibre não pôde ser determinado" },
                  ] : activeWeapon?.type === "CARREGADOR" ? [
                    { l: "9 mm Luger",            d: "Pistolas e submetralhadoras; padrão policial" },
                    { l: ".40 S&W",               d: "Pistolas policiais; padrão brasileiro" },
                    { l: ".45 ACP",               d: "Pistolas de grande porte" },
                    { l: ".380 ACP",              d: "Pistolas compactas de porte" },
                    { l: ".32 ACP (7,65mm)",      d: "Pistolas compactas antigas" },
                    { l: ".38 Super Auto",        d: "Pistolas de competição" },
                    { l: "10 mm Auto",            d: "Pistolas de alta energia" },
                    { l: "5,56×45 mm NATO",       d: "Fuzis AR-15/M16 e carabinas táticas" },
                    { l: "7,62×39 mm",            d: "AK-47 e derivados" },
                    { l: "7,62×51 mm NATO",       d: "Fuzis FAL, G3 e metralhadoras NATO" },
                    { l: ".308 Win",              d: "Carabinas e fuzis de precisão" },
                    { l: ".223 Rem",              d: "Carabinas esportivas AR-15" },
                    { l: ".22 LR",                d: "Pistolas e carabinas de treinamento" },
                    { l: "5,7×28 mm FN",          d: "FN P90 e pistola Five-seveN" },
                    { l: "Outro",                 d: "Informar calibre não listado" },
                    { l: "Indeterminado",         d: "Calibre não pôde ser determinado" },
                  ] : [
                    { l: "Indeterminado",     d: "Calibre não pôde ser determinado" },
                  ]).map(({ l: opt, d: desc }, idx, arr) => {
                    const selected = activeWeapon?.caliber === opt
                    const isOutro = opt === "Outro"
                    const outroAtivo = isOutro && activeWeapon?.caliber !== "Outro" &&
                      !arr.some(o => o.l !== "Outro" && o.l !== "Indeterminado" && activeWeapon?.caliber === o.l) &&
                      activeWeapon?.caliber && activeWeapon.caliber !== "Indeterminado"
                    return (
                      <div key={opt}>
                        <button type="button"
                          onClick={() => {
                            if (isOutro) {
                              setCalibreCustomInput(activeWeapon?.caliber && !arr.some(o => o.l === activeWeapon.caliber) ? activeWeapon.caliber : "")
                              setWeaponDirect("caliber", "__outro__")
                            } else {
                              setWeaponDirect("caliber", selected ? "" : opt)
                              setCalibrePickerOpen(false)
                            }
                          }}
                          className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${(selected || activeWeapon?.caliber === "__outro__" && isOutro || outroAtivo) ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                            {(selected || (activeWeapon?.caliber === "__outro__" && isOutro) || outroAtivo) && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[15px] font-semibold leading-tight ${(selected || activeWeapon?.caliber === "__outro__" && isOutro) ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</div>
                            <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{desc}</div>
                          </div>
                        </button>
                        {isOutro && activeWeapon?.caliber === "__outro__" && (
                          <div className="border-b border-[#e5d9c3] pb-4 pt-2 space-y-2">
                            <input
                              autoFocus
                              value={calibreCustomInput}
                              onChange={e => setCalibreCustomInput(e.target.value)}
                              className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: .357 SIG, 7,5mm FK, 6,5 Creedmoor…"
                            />
                            <button type="button"
                              disabled={!calibreCustomInput.trim()}
                              onClick={() => {
                                if (calibreCustomInput.trim()) {
                                  setWeaponDirect("caliber", calibreCustomInput.trim())
                                  setCalibrePickerOpen(false)
                                }
                              }}
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

          {/* ── Calibre antecarga picker (em mm) ── */}
          {calibreAntecargaPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCalibreAntecargaPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] text-[#26221b] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Calibre (mm)</span>
                    <button type="button" onClick={() => setCalibreAntecargaPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {([
                    { l: "6,35 mm (.25 cal)",   d: "Pistolas de bolso e pequenos revólveres de antecarga" },
                    { l: "7,65 mm (.30 cal)",   d: "Pistolas compactas e revólveres de antecarga de pequeno porte" },
                    { l: "9,14 mm (.36 cal)",   d: "Revólveres Colt Navy 1851; calibre policial civil do séc. XIX" },
                    { l: "10,16 mm (.40 cal)",  d: "Pistolas e rifles de médio porte" },
                    { l: "11,17 mm (.44 cal)",  d: "Revólveres Colt Army 1860 e Remington 1858; o mais comum" },
                    { l: "11,43 mm (.45 cal)",  d: "Rifles e pistolas de calibre padrão americano" },
                    { l: "12,7 mm (.50 cal)",   d: "Rifles Hawken e rifles de precisão do séc. XIX" },
                    { l: "13,72 mm (.54 cal)",  d: "Rifles plains e carabinas de caça de grande porte" },
                    { l: "14,73 mm (.58 cal)",  d: "Fuzis Minié da Guerra de Secessão; alto poder de parada" },
                    { l: "15,4 mm (.61 cal)",   d: "Pistolas de duelo e armas de coleção de grande calibre" },
                    { l: "17,5 mm (.69 cal)",   d: "Mosquetes de alma lisa; padrão francês e americano colonial" },
                    { l: "19,0 mm (.75 cal)",   d: "Brown Bess; mosquete britânico padrão séc. XVIII–XIX" },
                    { l: "20,3 mm (.80 cal)",   d: "Armas pesadas de infantaria e artilharia leve" },
                    { l: "Indeterminado",        d: "Calibre não pôde ser determinado" },
                  ]).map(({ l: opt, d: desc }, idx, arr) => {
                    const selected = activeWeapon?.caliber === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("caliber", selected ? "" : opt); setCalibreAntecargaPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</div>
                          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {calibreArmaPressaoPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCalibreArmaPressaoPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Calibre</span>
                    <button type="button" onClick={() => setCalibreArmaPressaoPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {activeWeapon?.adaptadaArmaFogo === true ? (
                    ([
                      { l: ".22 LR",         d: "Calibre de fogo circular rimfire; uso em pistolas e rifles adaptados" },
                      { l: ".32 ACP",        d: "Pistolas compactas; cartucho semi-flangeado de uso civil" },
                      { l: ".38 SPL",        d: "Calibre amplamente utilizado em revólveres de uso policial e civil" },
                      { l: "9 mm Luger",     d: "Pistolas semiautomáticas; padrão NATO e policial mundial" },
                      { l: ".40 S&W",        d: "Calibre policial de alta capacidade de parada" },
                      { l: ".45 ACP",        d: "Calibre de grande diâmetro; alto poder de parada" },
                      { l: "Outro calibre",  d: "Calibre de arma de fogo não listado acima" },
                    ]).map(({ l: opt, d: desc }, idx, arr) => {
                      const selected = activeWeapon?.caliber === opt
                      return (
                        <button key={opt} type="button"
                          onClick={() => { setWeaponDirect("caliber", selected ? "" : opt); setCalibreArmaPressaoPickerOpen(false) }}
                          className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                            {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</div>
                            <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{desc}</div>
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    ([
                      { l: "4,5 mm (.177)",   d: "Calibre mais comum; adequado para pistolas e carabinas de CO₂ e mola" },
                      { l: "5,5 mm (.22)",    d: "Calibre intermediário; maior energia de impacto que o 4,5 mm" },
                      { l: "6,35 mm (.25)",   d: "Calibre de maior energia; utilizado em rifles PCP de alta potência" },
                      { l: "6 mm (airsoft)",  d: "Calibre padrão de airsoft; projéteis plásticos esféricos" },
                      { l: "Indeterminado",   d: "Calibre não pôde ser determinado" },
                    ]).map(({ l: opt, d: desc }, idx, arr) => {
                      const selected = activeWeapon?.caliber === opt
                      return (
                        <button key={opt} type="button"
                          onClick={() => { setWeaponDirect("caliber", selected ? "" : opt); setCalibreArmaPressaoPickerOpen(false) }}
                          className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                            {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</div>
                            <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{desc}</div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}

          {materialCoronhaPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMaterialCoronhaPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Material da coronha</span>
                    <button type="button" onClick={() => setMaterialCoronhaPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {["Polímero sintético","Madeira (mogno)","Madeira (faia)","Madeira (carvalho)","Madeira laminada","Fibra de vidro","Fibra de carbono","Metal (dobrável/retrátil)","Plástico reforçado","Borracha / soft-touch","Indeterminado"].map((opt, idx, arr) => {
                    const selected = activeWeapon?.materialCoroha === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("materialCoroha", selected ? "" : opt); setMaterialCoronhaPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {materialQuadroPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMaterialQuadroPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Material do quadro</span>
                    <button type="button" onClick={() => setMaterialQuadroPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {["Aço oxidado","Aço inoxidável","Aço fosfatado","Alumínio forjado","Liga de alumínio","Polímero reforçado","Titânio","Aço niquelado","Indeterminado"].map((opt, idx, arr) => {
                    const selected = activeWeapon?.materialQuadro === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("materialQuadro", selected ? "" : opt); setMaterialQuadroPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {acabamentoPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setAcabamentoPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Acabamento</span>
                    <button type="button" onClick={() => setAcabamentoPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {((["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? [
                    "Oxidado / pavonado",
                    "Niquelado",
                    "Cromado",
                    "Brunido",
                    "Polido / espelhado",
                    "Fosfatado",
                    "DLC (Diamond-Like Carbon)",
                    "Revestimento Teflon",
                    "Casehardenado",
                    "Inox escovado",
                    "Indeterminado",
                  ] : [
                    "Polido / espelhado", "Brunido / escurecido", "Fosco", "Revestimento preto", "Titânio", "DLC (Diamond-Like Carbon)", "Pintado", "Envernizado", "Oxidado", "Indeterminado",
                  ]).map((opt, idx, arr) => {
                    const selected = activeWeapon?.acabamento === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("acabamento", selected ? "" : opt); setAcabamentoPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[16px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {/* ── Tipo de pólvora picker ── */}
          {tipoPolvoraPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTipoPolvoraPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Tipo de pólvora</span>
                    <button type="button" onClick={() => setTipoPolvoraPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {[
                    "Pólvora negra (black powder)",
                    "Pólvora sem fumaça — base simples (nitrocelulose)",
                    "Pólvora sem fumaça — base dupla (nitrocelulose + nitroglicerina)",
                    "Pólvora sem fumaça — base tripla",
                    "Propelente esférico (ball powder)",
                    "Propelente extrudado",
                    "Propelente de chumbinho (pistão de ar)",
                    "Indeterminado",
                  ].map((opt, idx, arr) => {
                    const selected = activeWeapon?.tipoPolvora === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("tipoPolvora", selected ? "" : opt); setTipoPolvoraPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[15px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {/* ── Tipo de espoleta picker ── */}
          {tipoEspoletaPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTipoEspoletaPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[75vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Tipo de espoleta</span>
                    <button type="button" onClick={() => setTipoEspoletaPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {[
                    "Boxer (percussão central — 1 orifício)",
                    "Berdan (percussão central — 2 orifícios)",
                    "Rimfire (percussão periférica / anel)",
                    "Percussão anular",
                    "Espoleta elétrica",
                    "Indeterminado",
                  ].map((opt, idx, arr) => {
                    const selected = activeWeapon?.tipoEspoleta === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("tipoEspoleta", selected ? "" : opt); setTipoEspoletaPickerOpen(false) }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className={`text-[15px] font-semibold ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Helper de campo ── */}
        <AnimatePresence>
          {fieldHelper && (
            <>
              <motion.div
                className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setFieldHelper(null)}
              />
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
                  <button type="button" onClick={() => setFieldHelper(null)}
                    className="rounded-lg border border-[#d3c4a8] bg-[#f5efe3] p-1 text-[#8d7854]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[14px] leading-relaxed text-[#393025]">{fieldHelper.text}</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Confirmar exclusão de peça ── */}
        <AnimatePresence>
          {confirmDeletePieceIdx !== null && (
            <>
              <motion.div
                className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setConfirmDeletePieceIdx(null)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] px-4 pb-8"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
              >
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.45)]">
                  {/* Cabeçalho */}
                  <div className="bg-[linear-gradient(180deg,#3a1515_0%,#2a0f0f_100%)] px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f08a8a]/15">
                        <X className="h-5 w-5 text-[#f08a8a]" />
                      </div>
                      <div>
                        <div className="text-base font-black text-[#f08a8a]">Excluir peça</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#c47a7a]">Esta ação não pode ser desfeita</div>
                      </div>
                    </div>
                  </div>
                  {/* Info da peça */}
                  {confirmDeletePieceIdx !== null && savedPieces[confirmDeletePieceIdx] && (
                    <div className="flex items-center gap-3 border-b border-[#e8dfc8] px-6 py-4">
                      <div className="flex shrink-0 items-center justify-center rounded-xl bg-[#12213d] p-2 text-[#f0d08a]">
                        <PieceIcon type={savedPieces[confirmDeletePieceIdx].type} className="h-5 w-auto max-w-[36px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b5838]">
                          {savedPieces[confirmDeletePieceIdx].type}
                        </div>
                        <div className="truncate text-sm font-bold text-[#26221b]">
                          {savedPieces[confirmDeletePieceIdx].model || <span className="italic text-[#a89268]">modelo não informado</span>}
                        </div>
                        <div className="text-xs text-[#6b5838]">
                          Nº {savedPieces[confirmDeletePieceIdx].serial || "—"}
                          {savedPieces[confirmDeletePieceIdx].caliber ? ` • ${savedPieces[confirmDeletePieceIdx].caliber}` : ""}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Botões */}
                  <div className="space-y-3 p-4">
                    <button
                      type="button"
                      onClick={() => {
                        removeSavedPiece(confirmDeletePieceIdx!)
                        setConfirmDeletePieceIdx(null)
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#7a3535] bg-[linear-gradient(180deg,#6b2020_0%,#4a1515_100%)] py-4 text-sm font-black tracking-[0.18em] text-[#ffcccc] shadow-[0_8px_20px_rgba(120,30,30,.35)] active:brightness-95"
                    >
                      <X className="h-4 w-4" />
                      SIM, EXCLUIR
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeletePieceIdx(null)}
                      className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95"
                    >
                      CANCELAR
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Confirmar exclusão de mira ── */}
        <AnimatePresence>
          {confirmDeleteMira && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setConfirmDeleteMira(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] px-4 pb-8"
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.45)]">
                  <div className="bg-[linear-gradient(180deg,#3a1515_0%,#2a0f0f_100%)] px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f08a8a]/15">
                        <X className="h-5 w-5 text-[#f08a8a]" />
                      </div>
                      <div>
                        <div className="text-base font-black text-[#f08a8a]">Remover mira</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#c47a7a]">Deseja mesmo remover a mira selecionada?</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <button type="button"
                      onClick={() => { setWeaponDirect("tipoMira", []); setConfirmDeleteMira(false) }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#7a3535] bg-[linear-gradient(180deg,#6b2020_0%,#4a1515_100%)] py-4 text-sm font-black tracking-[0.18em] text-[#ffcccc] shadow-[0_8px_20px_rgba(120,30,30,.35)] active:brightness-95">
                      <X className="h-4 w-4" /> SIM, REMOVER
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteMira(false)}
                      className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95">
                      CANCELAR
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Confirmar exclusão de carregador ── */}
        <AnimatePresence>
          {confirmDeleteCarregador && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setConfirmDeleteCarregador(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[150] px-4 pb-8"
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.45)]">
                  <div className="bg-[linear-gradient(180deg,#3a1515_0%,#2a0f0f_100%)] px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f08a8a]/15">
                        <X className="h-5 w-5 text-[#f08a8a]" />
                      </div>
                      <div>
                        <div className="text-base font-black text-[#f08a8a]">Remover carregador</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#c47a7a]">Deseja mesmo remover o tipo de carregador?</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <button type="button"
                      onClick={() => { setWeaponDirect("tipoCarregador", []); setConfirmDeleteCarregador(false) }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#7a3535] bg-[linear-gradient(180deg,#6b2020_0%,#4a1515_100%)] py-4 text-sm font-black tracking-[0.18em] text-[#ffcccc] shadow-[0_8px_20px_rgba(120,30,30,.35)] active:brightness-95">
                      <X className="h-4 w-4" /> SIM, REMOVER
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteCarregador(false)}
                      className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95">
                      CANCELAR
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Perfil / Configurações ── */}
        <AnimatePresence>
          {profileView && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed inset-0 z-[130] flex flex-col bg-[#f5efe3] text-[#26221b]"
            >
              {/* Header */}
              <div className="shrink-0 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => profileView === "main" ? setProfileView(null) : setProfileView("main")}
                    className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="text-lg font-black text-[#f0d08a]">
                    {profileView === "main" ? "Perfil" : profileView === "changeEmail" ? "Alterar E-mail" : "Alterar Senha"}
                  </div>
                </div>
              </div>

              {/* ── View principal ── */}
              {profileView === "main" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Avatar + info */}
                  <div className="rounded-3xl border border-[#d3c4a8] bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] ring-4 ring-[#f0d08a]/20">
                      <span className="text-2xl font-black text-[#f0d08a]">PC</span>
                    </div>
                    <div className="text-base font-black text-[#1d2433]">Perito Responsável</div>
                    <div className="mt-0.5 text-sm text-[#8d7854]">perito@policiacientifica.pr.gov.br</div>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e8dfc8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6b5838]">
                      <Shield className="h-3 w-3" />
                      Polícia Científica do Paraná
                    </div>
                  </div>

                  {/* Ações da conta */}
                  <div className="overflow-hidden rounded-3xl border border-[#d3c4a8] bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => { setProfileMsg(null); setProfileView("changeEmail") }}
                      className="flex w-full items-center gap-4 border-b border-[#e8dfc8] px-5 py-4 text-left active:bg-[#f5efe3]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                        <Mail className="h-5 w-5 text-[#8d7854]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[#1d2433]">Alterar e-mail</div>
                        <div className="text-xs text-[#8d7854]">Mude seu endereço de acesso</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#b89a58]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setProfileMsg(null); setProfileView("changePassword") }}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left active:bg-[#f5efe3]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                        <KeyRound className="h-5 w-5 text-[#8d7854]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[#1d2433]">Alterar senha</div>
                        <div className="text-xs text-[#8d7854]">Atualize sua senha de acesso</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#b89a58]" />
                    </button>
                  </div>

                  {/* Sair */}
                  <button
                    type="button"
                    onClick={() => { setProfileView(null); onLogout() }}
                    className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-[#e0b0b0] bg-[#fdf0f0] py-4 text-sm font-black tracking-[0.15em] text-[#b03030] active:brightness-95"
                  >
                    <LogOut className="h-4 w-4" />
                    SAIR DA CONTA
                  </button>
                </div>
              )}

              {/* ── Alterar e-mail ── */}
              {profileView === "changeEmail" && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4 rounded-3xl border border-[#d3c4a8] bg-white p-6 shadow-sm">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Novo e-mail</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        placeholder="novo@email.com"
                        className="h-12 w-full rounded-xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 text-[16px] text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/15"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Confirmar e-mail</label>
                      <input
                        type="email"
                        value={profileEmailConfirm}
                        onChange={e => setProfileEmailConfirm(e.target.value)}
                        placeholder="novo@email.com"
                        className="h-12 w-full rounded-xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 text-[16px] text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/15"
                      />
                    </div>
                    {profileMsg && (
                      <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${profileMsg.type === "ok" ? "border border-green-200 bg-green-50 text-green-700" : "border border-[#f0b8b8] bg-[#fdf0f0] text-[#b03030]"}`}>
                        {profileMsg.text}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!profileEmail || profileEmail !== profileEmailConfirm) {
                          setProfileMsg({ type: "err", text: "Os e-mails não coincidem." })
                          return
                        }
                        setProfileMsg({ type: "ok", text: "E-mail atualizado com sucesso." })
                        setProfileEmail(""); setProfileEmailConfirm("")
                      }}
                      className="w-full rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.2em] text-[#f8e3b3] shadow-[0_8px_20px_rgba(66,50,24,.22)] active:brightness-95"
                    >
                      SALVAR E-MAIL
                    </button>
                  </div>
                </div>
              )}

              {/* ── Alterar senha ── */}
              {profileView === "changePassword" && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4 rounded-3xl border border-[#d3c4a8] bg-white p-6 shadow-sm">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Senha atual</label>
                      <div className="relative">
                        <input
                          type={profileShowPwd ? "text" : "password"}
                          value={profileCurPwd}
                          onChange={e => setProfileCurPwd(e.target.value)}
                          placeholder="••••••••"
                          className="h-12 w-full rounded-xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 pr-12 text-[16px] text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/15"
                        />
                        <button type="button" onClick={() => setProfileShowPwd(v => !v)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-[#b89a58]">
                          {profileShowPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Nova senha</label>
                      <input
                        type="password"
                        value={profileNewPwd}
                        onChange={e => setProfileNewPwd(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 w-full rounded-xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 text-[16px] text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/15"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Confirmar nova senha</label>
                      <input
                        type="password"
                        value={profileNewPwdConfirm}
                        onChange={e => setProfileNewPwdConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 w-full rounded-xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 text-[16px] text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/15"
                      />
                    </div>
                    {profileMsg && (
                      <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${profileMsg.type === "ok" ? "border border-green-200 bg-green-50 text-green-700" : "border border-[#f0b8b8] bg-[#fdf0f0] text-[#b03030]"}`}>
                        {profileMsg.text}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!profileCurPwd || !profileNewPwd || profileNewPwd !== profileNewPwdConfirm) {
                          setProfileMsg({ type: "err", text: "Verifique os campos e confirme a nova senha." })
                          return
                        }
                        if (profileNewPwd.length < 6) {
                          setProfileMsg({ type: "err", text: "A nova senha deve ter ao menos 6 caracteres." })
                          return
                        }
                        setProfileMsg({ type: "ok", text: "Senha atualizada com sucesso." })
                        setProfileCurPwd(""); setProfileNewPwd(""); setProfileNewPwdConfirm("")
                      }}
                      className="w-full rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.2em] text-[#f8e3b3] shadow-[0_8px_20px_rgba(66,50,24,.22)] active:brightness-95"
                    >
                      SALVAR SENHA
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Visualizador de Fotos ── */}
        <AnimatePresence>
          {viewerPhoto && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
            >
              <div className="flex items-center justify-between p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Visualização</div>
                <button onClick={() => setViewerPhoto(null)} className="rounded-full bg-white/10 p-2 text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center p-4">
                <img src={viewerPhoto} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" alt="Foto ampliada" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
