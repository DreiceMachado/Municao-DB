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
  | "ESTOJO" | "PROJÉTIL" | "CARTUCHO" | "FACA" | "PÓLVORA" | "ESPOLETA"

type WeaponEntry = {
  type: WeaponType
  // 1. Identificação
  brand: string
  model: string
  caliber: string
  serial: string
  paisFabricacao: string
  // 2. Características físicas
  material: string
  acabamento: string
  compCano: string
  numCamaras: string
  tipoMira: string
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
  "PÓLVORA":      ["Vista geral", "Embalagem – frente", "Embalagem – verso", "Detalhe da granulometria"],
  "ESPOLETA":     ["Vista frontal", "Vista lateral", "Base da espoleta", "Marcação de percussor"],
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
  const [photosOpen, setPhotosOpen] = useState(false)
  const [lacreNumero, setLacreNumero] = useState("")
  const [lacreSaidaNumero, setLacreSaidaNumero] = useState("")
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map())
  const [viewerPhoto, setViewerPhoto] = useState<string | null>(null)
  const [materialPickerOpen, setMaterialPickerOpen] = useState(false)
  const [formatoPickerOpen, setFormatoPickerOpen] = useState(false)
  const [sentidoPickerOpen, setSentidoPickerOpen] = useState(false)
  const [deformacoesPickerOpen, setDeformacoesPickerOpen] = useState(false)
  const [tipoLaminaPickerOpen, setTipoLaminaPickerOpen] = useState(false)
  const [tipoGumePickerOpen, setTipoGumePickerOpen] = useState(false)
  const [acabamentoPickerOpen, setAcabamentoPickerOpen] = useState(false)
  const [sistemaAcionamentoPickerOpen, setSistemaAcionamentoPickerOpen] = useState(false)
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
    setWeaponType(null)
    setWeapons([])
    setActiveWeaponIdx(0)
    setPieceFormOpen(false)
    setPhotosOpen(false)
    setLacreNumero("")
    setLacreSaidaNumero("")
    setPhotoUrls(new Map())
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
    "PÓLVORA":      "Exame de Pólvora",
    "ESPOLETA":     "Exame de Espoleta",
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

  const setWeaponDirect = (field: keyof Omit<WeaponEntry, "type">, value: string | boolean) => {
    setWeapons(prev => prev.map((w, i) => i === activeWeaponIdx ? { ...w, [field]: value } : w))
  }

  const handleWeaponNaToggle = (field: string) => {
    setWeapons(prev => prev.map((w, i) => {
      if (i !== activeWeaponIdx) return w
      const naFlags = w.naFlags.includes(field)
        ? w.naFlags.filter(f => f !== field)
        : [...w.naFlags, field]
      return { ...w, naFlags }
    }))
  }

  const makeWeaponEntry = (type: WeaponType): WeaponEntry => ({
    type,
    brand: "", model: "", caliber: "", serial: "", paisFabricacao: "",
    material: "", acabamento: "", compCano: "", numCamaras: "", tipoMira: "",
    acaoSimples: true, acaoDupla: true, tamborGira: true, indexacaoCorreta: true,
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
    sistemaAcionamento: "", tamanhoCamara: "", tipoRaiamento: "", materialQuadro: "",
    naFlags: [], tipoProd: "", serialEstado: "", quantidade: "", diametroMin: "", massa: "",
    origemProjetil: "", origemProjetilRef: "", regiaoColeta: "", deformacoesAcidentais: "", estadoProjetil: "", alturaProjetil: "",
    estadoCartucho: "", estadoEstojo: "",
    tipoPolvora: "", cor: "", tipoEspoleta: "",
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
                        + NOVO REP
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
                    <div className="text-xl font-black text-[#f0d08a]">Novo REP</div>
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
                        <div className="text-lg font-black text-[#f0d08a]">Novo REP</div>
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
                          <select value={form.examYear} onChange={handleField("examYear")}
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
                      <div className="mb-5 border-b border-[#d3c3a4] pb-3 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                        Peças do exame
                      </div>
                      <div className="space-y-2">
                        {savedPieces.map((p, i) => (
                          <div key={i} className="overflow-hidden rounded-2xl border border-[#c8b47e] bg-white shadow-sm">
                            <div className="flex items-stretch">
                              {/* Card clicável para editar */}
                              <button
                                type="button"
                                onClick={() => openEditPiece(i)}
                                className="flex flex-1 items-center gap-3 px-4 py-4 text-left transition active:bg-[#f5efe3]"
                              >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a] shadow-sm">
                                  <PieceIcon type={p.type} className="h-5 w-auto max-w-[28px]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#b89a58]">{p.type}</div>
                                  <div className="truncate text-[14px] font-black text-[#26221b]">
                                    {p.brand || <span className="font-medium italic text-[#b8a070]">Identificação não informada</span>}
                                  </div>
                                  {p.model && (
                                    <div className="truncate text-[12px] font-medium text-[#6b5838]">{p.model}</div>
                                  )}
                                </div>
                                <Pencil className="h-4 w-4 shrink-0 text-[#c8a96e]" />
                              </button>
                              {/* Divisor */}
                              <div className="my-3 w-px shrink-0 bg-[#e8dfc8]" />
                              {/* Botão excluir */}
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePieceIdx(i)}
                                className="flex w-14 shrink-0 items-center justify-center text-[#c87070] transition active:bg-[#fdf0f0]"
                                title="Remover peça"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                            {/* Rodapé com número de série */}
                            <div className="border-t border-[#f0e8d8] bg-[#fdfaf5] px-4 py-2">
                              <span className="text-[11px] font-semibold text-[#9e8255]">Nº série: </span>
                              <span className="text-[11px] font-black text-[#50442f]">{p.serial || <span className="font-medium italic text-[#c4ac82]">não informado</span>}</span>
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
                        {(["PROJÉTIL","CARTUCHO","ESTOJO","ESPOLETA","PÓLVORA"] as WeaponType[]).map((type) => (
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
                    <div>
                      <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#8d7854]">Arma branca</div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {(["FACA"] as WeaponType[]).map((type) => (
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
                        "PROJÉTIL":    "Origem do projétil",
                        "CARTUCHO":    "Origem do cartucho",
                        "ESTOJO":      "Origem do estojo",
                        "FACA":        "Origem da faca",
                        "REVÓLVER":    "Origem do revólver",
                        "PISTOLA":     "Origem da pistola",
                        "ESPINGARDA":  "Origem da espingarda",
                        "CARABINA":    "Origem da carabina",
                        "FUZIL":       "Origem do fuzil",
                        "METRALHADORA":"Origem da metralhadora",
                        "PÓLVORA":     "Origem da pólvora",
                        "ESPOLETA":    "Origem da espoleta",
                      }
                      const label = origemLabel[activeWeapon?.type as WeaponType] ?? "Origem"
                      return (
                        <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                          <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8d7854]">{label}</div>
                          <div className={`grid gap-2 ${(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","PÓLVORA","ESPOLETA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? "grid-cols-2" : "grid-cols-3"}`}>
                            {(
                              (["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","PÓLVORA","ESPOLETA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType)
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
                        </div>
                      )
                    })()}
                  </div>

                  {/* ── Campos base ── */}
                  {!(["PROJÉTIL","PÓLVORA","ESPOLETA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && <div className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      {activeWeapon?.type !== "FACA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            {activeWeapon?.type === "CARTUCHO" ? "Tipo" : "Modelo"}
                            <HelpBtn title={activeWeapon?.type === "CARTUCHO" ? "Tipo" : "Modelo"} text={
                              activeWeapon?.type === "CARTUCHO" ? "Tipo construtivo da munição. Ex.: FMJ (encamisado), HP (ponta oca), Slug (projétil único para espingarda)." :
                              "Designação comercial ou nomenclatura do armamento. Ex.: GP100, M1911, AR-15."
                            } />
                          </label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder={
                              (["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? "Ex.: GP100, M1911, AR-15…" :
                              activeWeapon?.type === "CARTUCHO" ? "Ex.: FMJ, HP, Slug…" :
                              "Ex.: RT 627"
                            } />
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            {activeWeapon?.type === "ESTOJO" ? "Identificação" : "Fabricante"}
                            <HelpBtn title={activeWeapon?.type === "ESTOJO" ? "Identificação" : "Fabricante"} text={
                              activeWeapon?.type === "ESTOJO" ? "Marca gravada no headstamp (base do estojo). Ex.: CBC, RP, FC." :
                              "Empresa responsável pela fabricação. Ex.: Taurus, Glock, CBC, Remington."
                            } />
                          </label>
                          <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder={activeWeapon?.type === "ESTOJO" ? "Ex.: CBC, Sellier & Bellot…" : activeWeapon?.type === "CARTUCHO" ? "Ex.: CBC, Sellier & Bellot…" : "Ex.: Taurus, Glock, Colt…"} />
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Calibre
                            <HelpBtn title="Calibre" text="Designação nominal da munição compatível com a arma ou peça. Ex.: .38 SPL, 9 mm Luger, 12 Ga. Para projéteis deflagrados, utilize o campo de diâmetro medido." />
                          </label>
                          <input value={activeWeapon?.caliber ?? ""} onChange={handleWeaponField("caliber")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder={
                              activeWeapon?.type === "ESPINGARDA" ? "Ex.: 12 Ga, 20 Ga…" :
                              (["CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? "Ex.: 5,56 mm, 7,62 mm…" :
                              (["ESTOJO","CARTUCHO"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? "Ex.: 9 mm Luger, .38 SPL…" :
                              "Ex.: .38 SPL, 9 mm…"
                            } />
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            País de fabricação
                            <HelpBtn title="País de fabricação" text="País onde a peça foi fabricada, conforme indicação do fabricante ou marcação na arma. Ex.: Brasil, EUA, Alemanha." />
                          </label>
                          <input value={activeWeapon?.paisFabricacao ?? ""} onChange={handleWeaponField("paisFabricacao")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: Brasil" />
                        </div>
                      )}
                    </div>

                    {/* Tipo de produção — apenas armas de fogo */}
                    {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
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
                            <div className="grid grid-cols-2 gap-2">
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

                    {/* Número de série simples — para peças que não são armas de fogo nem PROJÉTIL */}
                    {!(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","PROJÉTIL","ESTOJO","CARTUCHO","FACA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                          Número de série / identificação
                        </label>
                        <input value={activeWeapon?.serial ?? ""} onChange={handleWeaponField("serial")}
                          className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                          placeholder="Informar identificação" />
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
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de mira</label>
                          <input value={activeWeapon?.tipoMira ?? ""} onChange={handleWeaponField("tipoMira")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: aberta fixada" />
                        </div>
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
                            ["tipoMira",             "Tipo de mira",         "Ex.: aberta, telescópica"],
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
                            ["tipoMira",             "Tipo de mira",            "Ex.: ajustável, ponto branco"],
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
                            ["tipoMira",             "Tipo de mira",         "Ex.: bead, aberta"],
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
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar material…"}</span>
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
                            ["tipoMira",             "Tipo de mira",          "Ex.: aberta, óptica, red dot"],
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
                            ["compCano",             "Comprimento do cano",  "Ex.: 260 mm"],
                            ["compTotal",            "Comprimento total",    "Ex.: 690 mm"],
                            ["capacidadeCarregador", "Capacidade (munições)","Ex.: Cem"],
                            ["tipoMira",             "Tipo de mira",         "Ex.: aberta, óptica"],
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
                        {/* Fabricante */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Fabricante</label>
                          <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: CBC, Sellier & Bellot…" />
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
                            const parseVal = (v: string) => parseFloat(String(v ?? "").replace(",", ".").replace(/[^\d.]/g, ""))
                            const max = parseVal(activeWeapon?.diametro ?? "")
                            const min = parseVal(activeWeapon?.diametroMin ?? "")
                            if (isNaN(max) || isNaN(min)) return null
                            const mediaNum = (max + min) / 2
                            const media = mediaNum.toFixed(2).replace(".", ",")
                            const familias: { min: number; max: number; nome: string; nominal: string }[] = [
                              { min: 5.4,  max: 5.9,  nome: "Vinte e dois (.22)",           nominal: ".22 LR / .22 Short" },
                              { min: 6.1,  max: 6.6,  nome: "Vinte e cinco (.25)",          nominal: ".25 ACP / 6,35mm Browning" },
                              { min: 7.4,  max: 7.7,  nome: "Trinta e dois (.32)",          nominal: ".32 ACP / 7,65mm Browning" },
                              { min: 7.7,  max: 7.95, nome: "Trinta e dois (.32)",          nominal: ".32 S&W Long" },
                              { min: 8.4,  max: 9.3,  nome: "Nove milímetros (9 mm / .38)", nominal: "9mm Luger / .38TPC" },
                              { min: 9.9,  max: 10.5, nome: "Quarenta (.40 / 10 mm)",       nominal: ".40 S&W / 10mm Auto" },
                              { min: 11.0, max: 11.35, nome: "Quarenta e quatro (.44)",     nominal: ".44 Magnum / .44 S&W Special" },
                              { min: 11.35, max: 11.7, nome: "Quarenta e cinco (.45)",      nominal: ".45 ACP / .45 Colt" },
                            ]
                            const familia = familias.find(f => mediaNum >= f.min && mediaNum <= f.max)
                            return (
                              <div className="mt-3 space-y-2">
                                <div className="rounded-xl border border-[#b89a58]/40 bg-[#f0e8d4] px-4 py-3">
                                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre real (média)</div>
                                  <div className="text-lg font-black text-[#1d2433]">{media} mm</div>
                                </div>
                                {familia && (
                                  <div className="rounded-xl border border-[#7d9b6a]/40 bg-[#eef4e8] px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5a7a48]">Família do calibre</div>
                                    <div className="text-base font-black text-[#1d2433]">{familia.nome}</div>
                                  </div>
                                )}
                                {familia && (
                                  <div className="rounded-xl border border-[#4a6fa5]/30 bg-[#eaf0f8] px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a5a80]">Provável calibre nominal</div>
                                    <div className="text-base font-black text-[#1d2433]">{familia.nominal}</div>
                                  </div>
                                )}
                                {!familia && (
                                  <div className="rounded-xl border border-[#b89a58]/25 bg-[#f5f0e8] px-4 py-2.5">
                                    <div className="text-[11px] text-[#8d7854]">Família não identificada para {media} mm</div>
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
                          <button
                            type="button"
                            onClick={() => setDeformacoesPickerOpen(true)}
                            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-left transition focus:border-[#9e7f45]"
                          >
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
                    </div>
                  )}

                  {/* ── PÓLVORA ── */}
                  {activeWeapon?.type === "PÓLVORA" && (
                    <div className="space-y-4">

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
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Fabricante</label>
                          <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CBC, CCI, Federal, Remington…" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">País de fabricação</label>
                          <input value={activeWeapon?.paisFabricacao ?? ""} onChange={handleWeaponField("paisFabricacao")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: Brasil" />
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
                            <input value={activeWeapon?.caliber ?? ""} onChange={handleWeaponField("caliber")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 9 mm, .38 SPL…" />
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
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ...(activeWeapon?.estadoCartucho === "ÍNTEGRO" ? [["quantidade", "Quantidade", "Ex.: 12"]] : []),
                            ["compTotal",  "Comprimento total", "Ex.: 29,7 mm"],
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
                  <div className="grid grid-cols-2 gap-3 border-t border-[#d3c3a4] pt-5">
                    <button
                      type="button"
                      onClick={() => { resetPieceForm() }}
                      className="rounded-2xl border border-[#a8894c] bg-[#efe1b5] py-3 text-sm font-black tracking-[0.14em] text-[#4b3b21] transition hover:brightness-95"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="button"
                      onClick={savePiece}
                      className="rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3 text-sm font-black tracking-[0.16em] text-[#f0d08a] shadow-[0_12px_24px_rgba(0,0,0,.28)] transition hover:brightness-110"
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
                      {(photoSlotsByType[weaponType] ?? []).map((slot) => (
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
                      {activeWeapon?.type === "ESTOJO" ? "Tipo de rebordo" : "Formato do projétil"}
                    </span>
                    <button type="button" onClick={() => setFormatoPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {(activeWeapon?.type === "ESTOJO" ? [
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
                    "Ação simples (SA)",
                    "Ação dupla (DA)",
                    "Ação dupla exclusiva (DAO)",
                  ] : activeWeapon?.type === "PISTOLA" ? [
                    "Ação simples (SA)",
                    "Ação dupla / ação simples (DA/SA)",
                    "Ação dupla exclusiva (DAO)",
                    "Striker-fired (percussor armado)",
                    "DA com desamartilhador",
                    "DA com trava de serrilha",
                  ] : activeWeapon?.type === "ESPINGARDA" ? [
                    "Ferrolho deslizante / pump-action",
                    "Semi-automático (autocarregável)",
                    "Ferrolho giratório (bolt-action)",
                    "Alavanca (lever-action)",
                    "Canos tombantes (break-action)",
                    "Duplo gatilho",
                    "Gatilho seletivo",
                  ] : activeWeapon?.type === "CARABINA" ? [
                    "Ferrolho giratório (bolt-action)",
                    "Alavanca (lever-action)",
                    "Ferrolho deslizante / pump-action",
                    "Semi-automático (autocarregável)",
                    "Tiro a tiro (single-shot)",
                  ] : activeWeapon?.type === "FUZIL" ? [
                    "Semi-automático",
                    "Automático",
                    "Semi/automático seletivo",
                    "Rajada de 3 tiros",
                    "Ferrolho giratório (bolt-action)",
                    "Tiro a tiro (single-shot)",
                  ] : activeWeapon?.type === "METRALHADORA" ? [
                    "Automático (open bolt)",
                    "Automático (closed bolt)",
                    "Semi/automático seletivo",
                    "Rajada de 3 tiros",
                    "Automático contínuo",
                  ] : [
                    "Indeterminado",
                  ]).map((opt, idx, arr) => {
                    const selected = activeWeapon?.sistemaAcionamento === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("sistemaAcionamento", selected ? "" : opt); setSistemaAcionamentoPickerOpen(false) }}
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
                  {["Polímero sintético","Madeira (mogno)","Madeira (faia)","Madeira laminada","Fibra de vidro","Fibra de carbono","Metal (dobrável)","Plástico reforçado","Indeterminado"].map((opt, idx, arr) => {
                    const selected = activeWeapon?.acabamento === opt
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("acabamento", selected ? "" : opt); setMaterialCoronhaPickerOpen(false) }}
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
