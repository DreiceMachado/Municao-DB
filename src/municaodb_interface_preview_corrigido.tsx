import React, { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import logo from "./assets/logo.png" 
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
  FolderKanban,
  Crosshair,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Shield,
  Target,
  User2,
  X,
} from "lucide-react"

type WeaponType =
  | "REVÓLVER" | "PISTOLA" | "ESPINGARDA" | "CARABINA" | "FUZIL" | "METRALHADORA"
  | "ESTOJO" | "PROJÉTIL" | "CARTUCHO" | "FACA"

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
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-[#6b5838] transition-transform md:hidden", open ? "rotate-180" : "")} />
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
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e8dfc8] text-[#6b5838] transition-transform md:hidden", open ? "rotate-180" : "")}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      <div className={cn("px-4 pb-4 md:!block", open ? "block" : "hidden")}>{children}</div>
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

function SidebarContent() {
  const item =
    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[17px] font-medium transition"
  const icon = "h-5 w-5"

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#8e7340]/60 px-6 py-6">
      <img
        src={logo}
        alt="Polícia Científica"
        className="mx-auto w-36 h-36 object-contain"
        style={{ background: "transparent" }}
      />


        <div className="mt-4 text-center">
          <div className="text-xl font-bold tracking-wide text-[#f4dda2]">
            POLÍCIA CIENTÍFICA
          </div>
          <div className="text-sm uppercase tracking-[0.32em] text-[#d3b971]">
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

      <div className="mt-auto border-t border-[#8e7340]/60 px-6 py-4 text-sm text-[#c8b27c]">
        v3.0 • Beta
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

export default function MunicaoDBInterfacePreview() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [weaponType, setWeaponType] = useState<WeaponType | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [numberFilter, setNumberFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("2026")
  const [unitFilter, setUnitFilter] = useState("")

  const [form, setForm] = useState({
    examNumber: "2026",
    unit: "Núcleo de Polícia Científica",
    expert: "Perito responsável",
    date: "26/03/2026",
    observacoes: "",
  })

  const [weapons, setWeapons] = useState<WeaponEntry[]>([])
  const [activeWeaponIdx, setActiveWeaponIdx] = useState(0)
  const [showAddWeaponSelector, setShowAddWeaponSelector] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [savedPieces, setSavedPieces] = useState<WeaponEntry[]>([])
  const [pieceFormOpen, setPieceFormOpen] = useState(false)
  const [examType, setExamType] = useState<"EFICIÊNCIA" | "CONSTATAÇÃO" | null>(null)

  const activeWeapon = weapons[activeWeaponIdx] ?? null

  const savePiece = () => {
    if (!activeWeapon) return
    setSavedPieces(prev => [...prev, { ...activeWeapon }])
    setWeaponType(null)
    setWeapons([])
    setActiveWeaponIdx(0)
    setPieceFormOpen(false)
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

  const addWeapon = (type: WeaponType) => {
    const newWeapon: WeaponEntry = {
      type,
      brand: "",
      model: "",
      caliber: "",
      serial: "",
      paisFabricacao: "",
      material: "",
      acabamento: "",
      compCano: "",
      numCamaras: "",
      tipoMira: "",
      acaoSimples: true,
      acaoDupla: true,
      tamborGira: true,
      indexacaoCorreta: true,
      caoFuncional: true,
      gatilhoFuncional: true,
      seguranca: true,
      ferrugem: false,
      ferrugemObs: "",
      desgaste: false,
      desgasteObs: "",
      danoEstruturais: false,
      danoEstruturaisObs: "",
      pecasFaltantes: false,
      pecasFaltantesObs: "",
      aptoDisparo: true,
      funcMunicaoReal: true,
      testePercussao: true,
      marcacaoPercussor: true,
      sistemaRepeticao: true,
      carregadorPresente: true,
      carregadorFuncional: true,
      ferrolhoFuncional: true,
      percussorFuncional: true,
      extratorFuncional: true,
      ejetorFuncional: true,
      retencaoFerrolho: true,
      alimentacaoFuncional: true,
      desgasteMecanico: false,
      desgasteMecanicoObs: "",
      danosAparentes: false,
      danosAparentesObs: "",
      extracaoFuncional: true,
      ejacaoFuncional: true,
      ciclagemFuncional: true,
    }
    setActiveWeaponIdx(weapons.length)
    setWeapons((prev) => [...prev, newWeapon])
  }

  const sidebarDesktop = (
    <aside className="hidden w-[300px] shrink-0 border-r border-[#8e7340] bg-[linear-gradient(180deg,#0d1a31_0%,#11203c_58%,#0b1730_100%)] xl:block">
      <SidebarContent />
    </aside>
  )

  const sidebarMobile = (
  <div className="min-h-screen bg-[linear-gradient(180deg,#0d1a31_0%,#11203c_58%,#0b1730_100%)]">
    <SidebarContent />
  </div>
  )



  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#09142a_0%,#0d1a34_50%,#091429_100%)] text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_15%_18%,rgba(245,211,128,.08),transparent_18%),radial-gradient(circle_at_90%_10%,rgba(245,211,128,.05),transparent_18%),linear-gradient(180deg,rgba(255,255,255,.01),rgba(255,255,255,0))]">
        <header className="border-b-[3px] border-[#b79248] bg-[linear-gradient(180deg,#13233f_0%,#10203b_100%)] shadow-[0_12px_28px_rgba(0,0,0,.28)]">
          <div className="border-b border-[#8e7340]/70 px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <div className="text-2xl font-bold text-[#f0d08a]">MunicaoDB</div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[#cfba81]">Balística</div>
                </div>
              </div>

              <div className="hidden items-center gap-5 lg:flex">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#d7b76f] bg-[radial-gradient(circle_at_30%_30%,#28456e,#10213f_65%,#0b1830)] shadow-[0_10px_24px_rgba(0,0,0,.24)]">
                  <Shield className="h-11 w-11 text-[#f0d08a]" />
                </div>
                <div>
                  <h1 className="text-5xl font-black tracking-tight text-[#f0d08a]">MunicaoDB</h1>
                  <p className="mt-1 text-lg text-[#f4e6be]">
                    Perícia Balística — Sistema de Exames e Banco de Dados
                  </p>
                  <p className="text-sm uppercase tracking-[0.28em] text-[#cfba81]">
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

          <main className="flex-1 px-4 py-5 lg:px-6 lg:py-6">
            <div className="grid gap-6">
              <section className="space-y-6">
                <div className="rounded-[28px] border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] p-6 shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-[#f0d08a] md:text-4xl">
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
                          setDrawerOpen(true)
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

                    <div className="space-y-4 p-5 text-[#27231c]">
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

              <AnimatePresence>
                {drawerOpen && (
                  <>
                    <motion.div
                      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setDrawerOpen(false)}
                    />
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", damping: 28, stiffness: 200 }}
                      className="fixed inset-0 z-50 overflow-y-auto"
                    >
                      <div className="min-h-full bg-[#f5efe3] text-[#26221b]">
                        <div className="sticky top-0 z-10 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-xl font-black text-[#f0d08a]">MuniçãoDB</h3>
                            <div className="flex items-center gap-2">
                              <div className="rounded-xl border border-[#8e7340] bg-[#162541] p-2 text-[#f0d08a]">
                                <Camera className="h-5 w-5" />
                              </div>
                              <button
                                onClick={() => setDrawerOpen(false)}
                                className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                  <div className="p-5 md:p-6">
                    <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#6b5838]">Tipo de exame</div>
                    <div className="mt-2 space-y-2">
                      {(["EFICIÊNCIA", "CONSTATAÇÃO"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setExamType(t)}
                          className="flex w-full items-center justify-between rounded-xl border border-[#d3c4a8] bg-[#fbf8f3] px-4 py-3 text-left transition hover:border-[#b89a58] hover:bg-[#ece6da] active:scale-[.98]"
                        >
                          <div>
                            <div className="text-sm font-black uppercase tracking-[0.14em] text-[#3d2e12]">{t}</div>
                            <div className="mt-0.5 text-xs text-[#8d7854]">
                              {t === "EFICIÊNCIA" ? "Exame de disparo e funcionamento" : "Constatação de características"}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[#8d7854]" />
                        </button>
                      ))}
                    </div>
                  </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* ── Formulário do REP ── */}
        <AnimatePresence>
          {examType !== null && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed inset-0 z-[60] overflow-y-auto"
            >
              <div className="min-h-full bg-[#f5efe3] text-[#26221b]">
                {/* header */}
                <div className="sticky top-0 z-10 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setExamType(null)}
                        className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <div className="text-xl font-black text-[#f0d08a]">Novo REP</div>
                        <div className="text-xs uppercase tracking-[0.22em] text-[#ccb780]">{examType}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setExamType(null); setDrawerOpen(false) }}
                      className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* conteúdo */}
                <div className="space-y-6 p-5 md:p-6">
                  {/* Identificação */}
                  <div>
                    <div className="mb-4 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Identificação do exame
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número do exame</label>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                          <input value={form.examNumber} onChange={handleField("examNumber")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Data do exame</label>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                          <input value={form.date} onChange={handleField("date")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Unidade</label>
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                          <input value={form.unit} onChange={handleField("unit")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Perito</label>
                        <div className="relative">
                          <User2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                          <input value={form.expert} onChange={handleField("expert")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Peças salvas */}
                  {savedPieces.length > 0 && (
                    <div>
                      <div className="mb-3 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                        Peças do exame
                      </div>
                      <div className="space-y-3">
                        {savedPieces.map((p, i) => (
                          <div key={i} className="flex items-center gap-4 rounded-2xl border border-[#c8b47e] bg-[#fbf8f3] px-4 py-3 shadow-sm">
                            <div className="flex shrink-0 items-center justify-center rounded-xl bg-[#12213d] p-2 text-[#f0d08a]">
                              <PieceIcon type={p.type} className="h-9 w-auto max-w-[60px]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b5838]">{p.type}</div>
                              <div className="truncate text-sm font-bold text-[#26221b]">{p.model || <span className="italic text-[#a89268]">modelo não informado</span>}</div>
                              <div className="text-xs text-[#6b5838]">Nº {p.serial || "—"}{p.caliber ? ` • ${p.caliber}` : ""}</div>
                            </div>
                            <button type="button" onClick={() => removeSavedPiece(i)}
                              className="shrink-0 rounded-lg border border-[#7a3535] bg-[#2a1515] p-1.5 text-[#f08a8a] hover:bg-[#3a1a1a]">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tipo de peça */}
                  <div>
                    <div className="mb-4 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Tipo de peça
                    </div>
                    <div className="grid grid-cols-2 min-[420px]:grid-cols-5 gap-2">
                      {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ESTOJO","PROJÉTIL","CARTUCHO","FACA"] as WeaponType[]).map((type) => (
                        <button key={type} type="button"
                          onClick={() => {
                            setWeaponType(type)
                            setWeapons([{ type, brand: "", model: "", caliber: "", serial: "", paisFabricacao: "", material: "", acabamento: "", compCano: "", numCamaras: "", tipoMira: "", acaoSimples: true, acaoDupla: true, tamborGira: true, indexacaoCorreta: true, caoFuncional: true, gatilhoFuncional: true, seguranca: true, ferrugem: false, ferrugemObs: "", desgaste: false, desgasteObs: "", danoEstruturais: false, danoEstruturaisObs: "", pecasFaltantes: false, pecasFaltantesObs: "", aptoDisparo: true, funcMunicaoReal: true, testePercussao: true, marcacaoPercussor: true, sistemaRepeticao: true, carregadorPresente: true, carregadorFuncional: true, ferrolhoFuncional: true, percussorFuncional: true, extratorFuncional: true, ejetorFuncional: true, retencaoFerrolho: true, alimentacaoFuncional: true, desgasteMecanico: false, desgasteMecanicoObs: "", danosAparentes: false, danosAparentesObs: "", extracaoFuncional: true, ejacaoFuncional: true, ciclagemFuncional: true }])
                            setActiveWeaponIdx(0)
                            setPieceFormOpen(true)
                          }}
                          className="rounded-xl border-2 border-[#d3c4a8] bg-[#fbf8f3] px-2 py-3 text-center text-[10px] font-black uppercase tracking-[0.1em] leading-tight text-[#50442f] transition hover:border-[#b89a58] hover:bg-[#ece6da]"
                        >
                          <div className="flex justify-center mb-1 text-[#3d3020]">
                            <PieceIcon type={type} className="h-8 w-auto max-w-[52px]" />
                          </div>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <div className="mb-4 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Observações
                    </div>
                    <textarea value={form.observacoes} onChange={handleField("observacoes")}
                      className="min-h-[120px] w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                      placeholder="Inserir observações técnicas, estado geral, particularidades e demais elementos relevantes." />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end border-t border-[#d3c3a4] pt-5">
                    <button className="rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] px-7 py-3 text-sm font-black tracking-[0.16em] text-[#f8e3b3] shadow-[0_12px_24px_rgba(66,50,24,.22)] transition hover:brightness-105">
                      SALVAR EXAME
                    </button>
                  </div>
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
                        onClick={() => { setPieceFormOpen(false); setWeaponType(null); setWeapons([]) }}
                        className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <div className="text-xl font-black text-[#f0d08a]">{weaponType}</div>
                        <div className="text-xs uppercase tracking-[0.22em] text-[#ccb780]">Dados da peça</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPieceFormOpen(false); setWeaponType(null); setWeapons([]); setDrawerOpen(false) }}
                      className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 p-5 md:p-6">
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

                  {/* ── Campos base ── */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Marca</label>
                      <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                        className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: Taurus" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Modelo</label>
                      <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                        className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: RT 627" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de série</label>
                      <input value={activeWeapon?.serial ?? ""} onChange={handleWeaponField("serial")}
                        className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Informar identificação" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Calibre</label>
                      <input value={activeWeapon?.caliber ?? ""} onChange={handleWeaponField("caliber")}
                        className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: .38 SPL" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">País de fabricação</label>
                      <input value={activeWeapon?.paisFabricacao ?? ""} onChange={handleWeaponField("paisFabricacao")}
                        className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: Brasil" />
                    </div>
                  </div>

                  {/* ── REVÓLVER ── */}
                  {activeWeapon?.type === "REVÓLVER" && (<>
                    <CollapsibleSection title="Características físicas" defaultOpen={false}>
                      <div className="grid gap-4 md:grid-cols-2">
                        {([
                          ["material",   "Material",             "Ex.: aço, inox"],
                          ["acabamento", "Acabamento",           "Ex.: oxidado, niquelado"],
                          ["compCano",   "Comprimento do cano",  "Ex.: 4 pol."],
                          ["numCamaras", "Número de câmaras",    "Ex.: 6"],
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
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["acaoSimples",      "Ação simples funcional"],
                            ["acaoDupla",        "Ação dupla funcional"],
                            ["tamborGira",       "Tambor gira livremente"],
                            ["indexacaoCorreta", "Indexação correta do tambor"],
                            ["caoFuncional",     "Cão funcional"],
                            ["gatilhoFuncional", "Gatilho funcional"],
                            ["seguranca",        "Sistema de segurança"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
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
                      <CollapsibleCard title="Funcionamento">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["sistemaRepeticao",   "Sistema de repetição funcional"],
                            ["ferrolhoFuncional",  "Ferrolho funcional"],
                            ["percussorFuncional", "Percussor funcional"],
                            ["extratorFuncional",  "Extrator funcional"],
                            ["ejetorFuncional",    "Ejetor funcional"],
                            ["gatilhoFuncional",   "Gatilho funcional"],
                            ["seguranca",          "Trava de segurança funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
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

                      <CollapsibleCard title="Teste de disparo">
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
                      <CollapsibleCard title="Funcionamento">
                        <div className="grid gap-3 sm:grid-cols-2">
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
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
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

                      <CollapsibleCard title="Teste de disparo">
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

                  {/* ── Imagens ── */}
                  <div>
                    <div className="mb-4 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Imagens
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button className="rounded-2xl border border-[#d3c4a8] bg-[#ece6da] p-4 text-center transition hover:bg-[#e8dfcf]">
                        <div className="flex h-20 items-center justify-center">
                          <Camera className="h-10 w-10 text-[#7b6c52]" />
                        </div>
                        <div className="rounded-xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] px-4 py-3 text-sm font-black tracking-[0.16em] text-[#f8e3b3]">
                          TIRAR FOTO
                        </div>
                      </button>
                      <button className="rounded-2xl border border-[#d3c4a8] bg-[#ece6da] p-4 text-center transition hover:bg-[#e8dfcf]">
                        <div className="flex h-20 items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-[#7b6c52]" />
                        </div>
                        <div className="rounded-xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] px-4 py-3 text-sm font-black tracking-[0.16em] text-[#f8e3b3]">
                          GALERIA
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* ── Footer ── */}
                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#d3c3a4] pt-5">
                    <button
                      type="button"
                      onClick={() => { setPieceFormOpen(false); setWeaponType(null); setWeapons([]) }}
                      className="rounded-2xl border border-[#a8894c] bg-[#efe1b5] px-5 py-3 text-sm font-black tracking-[0.14em] text-[#4b3b21] transition hover:brightness-95"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="button"
                      onClick={savePiece}
                      className="rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-7 py-3 text-sm font-black tracking-[0.16em] text-[#f0d08a] shadow-[0_12px_24px_rgba(0,0,0,.28)] transition hover:brightness-110"
                    >
                      SALVAR PEÇA
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {weaponType && !drawerOpen && (
            <motion.button
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              onClick={() => setDrawerOpen(true)}
              className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-3 shadow-[0_8px_28px_rgba(0,0,0,.4)] hover:brightness-110"
            >
              <div className="rounded-xl border border-[#8e7340] bg-[#0f1e39] p-2 text-[#f0d08a]">
                <Crosshair className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#ccb780]">Exame em andamento</div>
                <div className="text-sm font-black text-[#f0d08a]">{titleByType[weaponType]}</div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.button
                className="fixed inset-0 z-40 bg-black/55 xl:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: -340 }}
                animate={{ x: 0 }}
                exit={{ x: -340 }}
                transition={{ type: "spring", damping: 24, stiffness: 220 }}
                className="fixed left-0 top-0 z-50 h-screen w-screen max-w-[340px] overflow-y-auto border-r border-[#8e7340] bg-[linear-gradient(180deg,#0d1a31_0%,#11203c_58%,#0b1730_100%)] shadow-[0_20px_40px_rgba(0,0,0,.28)] xl:hidden"
              >
                <div className="flex items-center justify-between border-b border-[#8e7340]/70 bg-[#13233f] px-4 py-4">
                  <div className="text-lg font-black text-[#f0d08a]">MunicaoDB</div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {sidebarMobile}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
