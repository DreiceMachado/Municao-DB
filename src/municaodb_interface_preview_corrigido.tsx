import React, { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import logo from "./assets/logo.png"
import logoEscudo from "./assets/logo-escudo.png"
import {
  Building2,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Crosshair,
  Database,
  MapPin,
  Menu,
  Microscope,
  Pencil,
  Plus,
  Search,
  User2,
  X,
} from "lucide-react"

import type { ExamForm, ExamType, ProfileView, WeaponEntry, WeaponType } from "./types"
import { recordsSeed, titleByType, makeWeaponEntry } from "./data/constants"
import { cn } from "./utils/cn"
import { CollapsibleSection } from "./components/ui/CollapsibleSection"
import { CollapsibleCard } from "./components/ui/CollapsibleCard"
import { PieceIcon } from "./components/ui/PieceIcon"
import { TopTab } from "./components/ui/TopTab"
import { PhotoSlot } from "./components/PhotoSlot"
import { SidebarContent } from "./components/SidebarContent"
import { ProfilePanel } from "./components/ProfilePanel"
import { ConfirmDialogs } from "./components/ConfirmDialogs"
import { PhotosScreen } from "./components/PhotosScreen"
import { WeaponFormProvider } from "./context/WeaponFormContext"
import { AllPickers } from "./components/AllPickers"

// Types, constants, and utility components are now imported from their respective modules above.


export default function BalísticaDBInterfacePreview({ onLogout }: { onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [weaponType, setWeaponType] = useState<WeaponType | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(true)
  const [showGroupFirearms, setShowGroupFirearms] = useState(false)
  const [showGroupAmmo, setShowGroupAmmo] = useState(false)
  const [showGroupOthers, setShowGroupOthers] = useState(false)
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
  const [tamborPickerOpen, setTamborPickerOpen] = useState(false)
  const [canoSobresPickerOpen, setCanoSobresPickerOpen] = useState(false)
  const [calibrePickerOpen, setCalibrePickerOpen] = useState(false)
  // calibreCustomInput is now managed locally inside AllPickers
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
  // Profile email/password states are now local to ProfilePanel component

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

  const setWeaponDirect = (field: keyof Omit<WeaponEntry, "type">, value: string | boolean | null | string[]) => {
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
                    <div className="mb-3 border-b border-[#d3c3a4] pb-3 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Tipo de peça
                    </div>

                    {/* Grupo helper */}
                    {([
                      {
                        key: "firearms",
                        label: "Armas de fogo",
                        open: showGroupFirearms,
                        toggle: () => setShowGroupFirearms(o => !o),
                        types: ["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ARMA DE ANTECARGA"] as WeaponType[],
                      },
                      {
                        key: "ammo",
                        label: "Munição e componentes",
                        open: showGroupAmmo,
                        toggle: () => setShowGroupAmmo(o => !o),
                        types: ["PROJÉTIL","CARTUCHO","ESTOJO","ESPOLETA","PÓLVORA","CARREGADOR"] as WeaponType[],
                      },
                      {
                        key: "others",
                        label: "Outras armas",
                        open: showGroupOthers,
                        toggle: () => setShowGroupOthers(o => !o),
                        types: ["FACA","ARMA DE PRESSÃO"] as WeaponType[],
                      },
                    ]).map(({ key, label, open, toggle, types }) => (
                      <div key={key} className="mb-3 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                        {/* Header — área de toque grande */}
                        <button
                          type="button"
                          onClick={toggle}
                          className="flex h-14 w-full items-center justify-between px-4 active:bg-[#f5efe3]"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full transition-colors ${open ? "bg-[#9e7f45]" : "bg-[#cdbf9e]"}`} />
                            <span className="text-[13px] font-black uppercase tracking-[0.18em] text-[#50442f]">{label}</span>
                          </div>
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${open ? "bg-[#1b2947]" : "bg-[#ece6da]"}`}>
                            <ChevronDown className={`h-5 w-5 transition-all duration-200 ${open ? "rotate-180 text-[#f0d08a]" : "rotate-0 text-[#8d7854]"}`} />
                          </div>
                        </button>

                        {/* Conteúdo colapsável */}
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              key={`content-${key}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-3 p-3 pt-0">
                                {types.map((type) => (
                                  <button key={type} type="button"
                                    onClick={() => { setWeaponType(type); setWeapons([makeWeaponEntry(type)]); setActiveWeaponIdx(0); setPieceFormOpen(true) }}
                                    className="flex min-h-[52px] items-center justify-center rounded-xl border-2 border-[#e8dfc8] bg-[#fdfaf4] px-2 py-3 text-center transition active:scale-[.96] active:bg-[#ece6da]"
                                  >
                                    <span className="text-[12px] font-black uppercase leading-tight tracking-[0.05em] text-[#1a1410]">{type}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

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
                  {/* ── Tipo de peça ── */}
                  <div className="flex items-center gap-4 rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(135deg,#1b2947_0%,#12213d_100%)] px-5 py-4 shadow-[0_6px_22px_rgba(0,0,0,.28)]">
                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-[#0f1e39] p-3 text-[#f0d08a]">
                      <PieceIcon type={weaponType} className="h-12 w-auto max-w-[80px]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ccb780]">Tipo de peça</div>
                      <div className="text-lg font-black uppercase tracking-[0.1em] text-[#f0d08a]">{weaponType}</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                  <div className="space-y-3">
                    {/* Institucional — armas de fogo e antecarga */}
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
                    <div className="grid gap-5 md:grid-cols-2">
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

                      {/* Tambor sobressalente — apenas REVÓLVER */}
                      {activeWeapon?.type === "REVÓLVER" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Tambor sobressalente
                            <HelpBtn title="Tambor sobressalente" text="Tambor adicional apreendido junto com o revólver, com calibre diferente do original. Registrado como informação complementar; não altera o calibre nominal da arma." />
                          </label>
                          <button type="button" onClick={() => setTamborPickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.tamborSobressalente ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tamborSobressalente
                                ? `${activeWeapon.tamborSobressalente}${activeWeapon.tamborSobressalenteQtd ? ` · ${activeWeapon.tamborSobressalenteQtd} unid.` : ""}`
                                : "Sem tambor sobressalente"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}

                      {/* Cano sobressalente — apenas ESPINGARDA */}
                      {activeWeapon?.type === "ESPINGARDA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Cano sobressalente
                            <HelpBtn title="Cano sobressalente" text="Cano adicional apreendido junto com a espingarda, com calibre nominal diferente do original. Registrado como informação complementar; não altera o calibre nominal da arma." />
                          </label>
                          <button type="button" onClick={() => setCanoSobresPickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.canoSobressalente ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.canoSobressalente
                                ? [
                                    activeWeapon.canoSobressalente,
                                    activeWeapon.canoSobressalenteComp,
                                    activeWeapon.canoSobressalenteQtd && `${activeWeapon.canoSobressalenteQtd} unid.`,
                                  ].filter(Boolean).join(" · ")
                                : "Sem cano sobressalente"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && activeWeapon?.type !== "CARREGADOR" && activeWeapon?.type !== "ARMA DE ANTECARGA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Calibre
                            <HelpBtn title="Calibre" text="Designação nominal da munição compatível com a arma ou peça. Ex.: .38 SPL, 9 mm Luger, 12 Ga. Para projéteis deflagrados, utilize o campo de diâmetro medido." />
                          </label>
                          <button type="button" onClick={() => setCalibrePickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.caliber || "Selecionar calibre…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && activeWeapon?.type !== "CARREGADOR" && activeWeapon?.type !== "ARMA DE ANTECARGA" && (
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
                      <div>
                        <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                          Calibre (mm)
                          <HelpBtn title="Calibre" text="Diâmetro interno do cano em milímetros. Armas de antecarga utilizam calibres expressos em mm ou pol. (ex.: 9,14 mm = .36 cal; 11,17 mm = .44 cal)." />
                        </label>
                        <button type="button" onClick={() => setCalibreAntecargaPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.caliber || "Selecionar calibre…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
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
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">País de fabricação</label>
                          <button type="button" onClick={() => setPaisPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.paisFabricacao ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.paisFabricacao || "Selecionar país…"}</span>
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
                              <span className={`truncate text-[15px] ${activeWeapon?.tipoCarregador?.length ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.tipoCarregador?.length ? activeWeapon.tipoCarregador.join(", ") : "Selecionar tipo…"}
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
                  {(["REVÓLVER","PISTOLA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                    <div className="overflow-hidden rounded-2xl border border-[#d5c7aa] bg-[#fbf8f3]">
                      <div className="border-b border-[#e8dfc8] px-5 py-4">
                        <span className="text-sm font-black uppercase tracking-[0.14em] text-[#1a1410]">
                          {activeWeapon?.type === "ARMA DE ANTECARGA" ? "Mira" : "Mira e Carregador"}
                        </span>
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
                        {/* Carregador — não exibido para ARMA DE ANTECARGA */}
                        {activeWeapon?.type !== "ARMA DE ANTECARGA" && (
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


                  </div>{/* end space-y-6 body */}

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


        <PhotosScreen
          photosOpen={photosOpen}
          weaponType={weaponType}
          activeWeapon={activeWeapon}
          photoUrls={photoUrls}
          lacreNumero={lacreNumero}
          lacreSaidaNumero={lacreSaidaNumero}
          onClose={() => setPhotosOpen(false)}
          onCapture={handlePhotoCapture}
          onRemove={handlePhotoRemove}
          onView={setViewerPhoto}
          onLacreChange={setLacreNumero}
          onLacreSaidaChange={setLacreSaidaNumero}
        />

        <WeaponFormProvider value={{
          weapon: activeWeapon ?? makeWeaponEntry("REVÓLVER"),
          handleField: handleWeaponField,
          setDirect: setWeaponDirect,
          naToggle: handleWeaponNaToggle,
          HelpBtn: HelpBtn as (props: { title: string; text: string }) => React.ReactElement,
          fieldHelper,
          clearFieldHelper: () => setFieldHelper(null),
          openMaterialPicker: () => setMaterialPickerOpen(true),
          openAcabamentoPicker: () => setAcabamentoPickerOpen(true),
          openCalibrePicker: () => setCalibrePickerOpen(true),
          openCalibreAntecargaPicker: () => setCalibreAntecargaPickerOpen(true),
          openCalibreArmaPressaoPicker: () => setCalibreArmaPressaoPickerOpen(true),
          openPaisPicker: () => setPaisPickerOpen(true),
          openSistemaAcionamentoPicker: () => setSistemaAcionamentoPickerOpen(true),
          openTipoRaiamentoPicker: () => setTipoRaiamentoPickerOpen(true),
          openMaterialCoronhaPicker: () => setMaterialCoronhaPickerOpen(true),
          openMaterialQuadroPicker: () => setMaterialQuadroPickerOpen(true),
          openSentidoPicker: () => setSentidoPickerOpen(true),
          openDeformacoesPicker: () => setDeformacoesPickerOpen(true),
          openFormatoPicker: () => setFormatoPickerOpen(true),
          openTipoLaminaPicker: () => setTipoLaminaPickerOpen(true),
          openTipoGumePicker: () => setTipoGumePickerOpen(true),
          openTipoPolvoraPicker: () => setTipoPolvoraPickerOpen(true),
          openTipoEspoletaPicker: () => setTipoEspoletaPickerOpen(true),
          openMiraPicker: () => setMiraPickerOpen(true),
          openCarregadorPicker: () => setCarregadorPickerOpen(true),
        }}>
        <AllPickers
          materialPickerOpen={materialPickerOpen}
          formatoPickerOpen={formatoPickerOpen}
          miraPickerOpen={miraPickerOpen}
          carregadorPickerOpen={carregadorPickerOpen}
          sentidoPickerOpen={sentidoPickerOpen}
          deformacoesPickerOpen={deformacoesPickerOpen}
          tipoLaminaPickerOpen={tipoLaminaPickerOpen}
          tipoGumePickerOpen={tipoGumePickerOpen}
          tipoRaiamentoPickerOpen={tipoRaiamentoPickerOpen}
          sistemaAcionamentoPickerOpen={sistemaAcionamentoPickerOpen}
          paisPickerOpen={paisPickerOpen}
          calibrePickerOpen={calibrePickerOpen}
          calibreAntecargaPickerOpen={calibreAntecargaPickerOpen}
          calibreArmaPressaoPickerOpen={calibreArmaPressaoPickerOpen}
          materialCoronhaPickerOpen={materialCoronhaPickerOpen}
          materialQuadroPickerOpen={materialQuadroPickerOpen}
          acabamentoPickerOpen={acabamentoPickerOpen}
          tipoPolvoraPickerOpen={tipoPolvoraPickerOpen}
          tipoEspoletaPickerOpen={tipoEspoletaPickerOpen}
          onClose={(picker) => {
            const setters: Record<string, (v: boolean) => void> = {
              material: setMaterialPickerOpen, formato: setFormatoPickerOpen, mira: setMiraPickerOpen,
              carregador: setCarregadorPickerOpen, sentido: setSentidoPickerOpen,
              deformacoes: setDeformacoesPickerOpen, tipoLamina: setTipoLaminaPickerOpen,
              tipoGume: setTipoGumePickerOpen, tipoRaiamento: setTipoRaiamentoPickerOpen,
              sistemaAcionamento: setSistemaAcionamentoPickerOpen, pais: setPaisPickerOpen,
              calibre: setCalibrePickerOpen, calibreAntecarga: setCalibreAntecargaPickerOpen,
              calibreArmaPressao: setCalibreArmaPressaoPickerOpen,
              materialCoronha: setMaterialCoronhaPickerOpen, materialQuadro: setMaterialQuadroPickerOpen,
              acabamento: setAcabamentoPickerOpen, tipoPolvora: setTipoPolvoraPickerOpen,
              tipoEspoleta: setTipoEspoletaPickerOpen,
            };
            setters[picker]?.(false)
          }}
        />

        {/* ── Picker: Tambor sobressalente (revólver) ── */}
        <AnimatePresence>
          {tamborPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTamborPickerOpen(false)} />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Tambor sobressalente</span>
                    <button type="button" onClick={() => setTamborPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-[#8d7854]">Registra tambor extra apreendido. Não altera o calibre nominal da arma.</p>
                  <div className="mt-3">
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Quantidade de tambores</label>
                    <input
                      type="number"
                      min="1"
                      value={activeWeapon?.tamborSobressalenteQtd ?? ""}
                      onChange={handleWeaponField("tamborSobressalenteQtd" as keyof Omit<WeaponEntry,"type">)}
                      className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                      placeholder="Ex.: 1"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {([
                    { l: "Sem tambor sobressalente",      d: "Nenhum tambor adicional apreendido junto com a arma",                                caliber: "" },
                    { l: ".38 SPL",                       d: "Tambor .38 SPL; comum em revólveres .357 Magnum com câmaras menores",                caliber: ".38 SPL" },
                    { l: ".357 Magnum",                   d: "Tambor .357 Magnum; câmaras mais longas, aceita também .38 SPL",                    caliber: ".357 Magnum" },
                    { l: "9 mm Luger (moon clips)",       d: "Tambor adaptado para 9 mm com uso de moon clips; Taurus, S&W e outros",             caliber: "9 mm Luger (9×19mm)" },
                    { l: ".44 SPL",                       d: "Tambor para .44 SPL; câmaras menores que .44 Magnum",                               caliber: ".44 SPL" },
                    { l: ".44 Magnum",                    d: "Tambor .44 Magnum; câmaras maiores para maior pressão",                             caliber: ".44 Magnum" },
                    { l: ".45 ACP (moon clips)",          d: "Tambor .45 ACP com moon clips; comum em revólveres .45 Colt adaptados",             caliber: ".45 ACP" },
                    { l: ".45 Colt",                      d: "Tambor original de revólveres .45; câmaras clássicas",                              caliber: ".45 Colt" },
                    { l: ".22 LR",                        d: "Tambor rimfire .22 LR; usado em revólveres .22 WMR com tambor duplo",               caliber: ".22 LR" },
                    { l: ".22 WMR (.22 Mag)",             d: "Tambor .22 WMR; câmaras ligeiramente maiores que .22 LR",                          caliber: ".22 WMR (.22 Mag)" },
                    { l: ".32 H&R Magnum",                d: "Tambor .32 H&R Magnum; evolução do .32 S&W Long",                                  caliber: ".32 H&R Magnum" },
                    { l: ".32 S&W Long",                  d: "Tambor .32 S&W Long; calibre de revólveres compactos",                             caliber: ".32 S&W Long" },
                    { l: "Indeterminado",                 d: "Calibre do tambor sobressalente não pôde ser determinado",                          caliber: "" },
                  ] as { l: string; d: string; caliber: string }[]).map(({ l, d, caliber: cal }, idx, arr) => {
                    const selected = (activeWeapon?.tamborSobressalente || "") === l || (l === "Sem tambor sobressalente" && !activeWeapon?.tamborSobressalente)
                    return (
                      <button key={l} type="button"
                        onClick={() => {
                          setWeaponDirect("tamborSobressalente", l === "Sem tambor sobressalente" ? "" : l)
                          if (l === "Sem tambor sobressalente") setWeaponDirect("tamborSobressalenteQtd", "")
                          setTamborPickerOpen(false)
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{l}</div>
                          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{d}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Cano sobressalente (espingarda) ── */}
        <AnimatePresence>
          {canoSobresPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCanoSobresPickerOpen(false)} />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[85vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Cano sobressalente</span>
                    <button type="button" onClick={() => setCanoSobresPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-[#8d7854]">Registra cano extra apreendido junto com a espingarda. Não altera o calibre nominal da arma.</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={activeWeapon?.canoSobressalenteQtd ?? ""}
                        onChange={handleWeaponField("canoSobressalenteQtd" as keyof Omit<WeaponEntry,"type">)}
                        className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: 1"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Comprimento</label>
                      <input
                        value={activeWeapon?.canoSobressalenteComp ?? ""}
                        onChange={handleWeaponField("canoSobressalenteComp" as keyof Omit<WeaponEntry,"type">)}
                        className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: 660 mm"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Material</label>
                      <input
                        value={activeWeapon?.canoSobressalenteMaterial ?? ""}
                        onChange={handleWeaponField("canoSobressalenteMaterial" as keyof Omit<WeaponEntry,"type">)}
                        className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: Aço"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Acabamento</label>
                      <input
                        value={activeWeapon?.canoSobressalenteAcabamento ?? ""}
                        onChange={handleWeaponField("canoSobressalenteAcabamento" as keyof Omit<WeaponEntry,"type">)}
                        className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: Brunido"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Calibre nominal do cano sobressalente</p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {([
                    { l: "Sem cano sobressalente", d: "Nenhum cano adicional apreendido junto com a arma" },
                    { l: "12",                     d: "Calibre 12 (12 gauge) — o mais comum em espingardas" },
                    { l: "16",                     d: "Calibre 16 (16 gauge) — intermediário, menos comum atualmente" },
                    { l: "20",                     d: "Calibre 20 (20 gauge) — opção mais leve e compacta" },
                    { l: "28",                     d: "Calibre 28 (28 gauge) — espingardas leves de caça" },
                    { l: ".410 (36)",               d: "Calibre .410 bore / 36 — o menor calibre de espingarda convencional" },
                    { l: "Indeterminado",           d: "Calibre do cano sobressalente não pôde ser determinado" },
                  ]).map(({ l, d }, idx, arr) => {
                    const selected = (activeWeapon?.canoSobressalente || "") === l || (l === "Sem cano sobressalente" && !activeWeapon?.canoSobressalente)
                    return (
                      <button key={l} type="button"
                        onClick={() => {
                          setWeaponDirect("canoSobressalente", l === "Sem cano sobressalente" ? "" : l)
                          if (l === "Sem cano sobressalente") {
                            setWeaponDirect("canoSobressalenteQtd", "")
                            setWeaponDirect("canoSobressalenteComp", "")
                            setWeaponDirect("canoSobressalenteMaterial", "")
                            setWeaponDirect("canoSobressalenteAcabamento", "")
                          }
                          setCanoSobresPickerOpen(false)
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{l}</div>
                          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{d}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <ConfirmDialogs
          confirmDeletePieceIdx={confirmDeletePieceIdx}
          savedPieces={savedPieces}
          onDeletePiece={(idx) => { removeSavedPiece(idx); setConfirmDeletePieceIdx(null) }}
          onCancelDeletePiece={() => setConfirmDeletePieceIdx(null)}
          confirmDeleteMira={confirmDeleteMira}
          onDeleteMira={() => { setWeaponDirect("tipoMira", []); setConfirmDeleteMira(false) }}
          onCancelDeleteMira={() => setConfirmDeleteMira(false)}
          confirmDeleteCarregador={confirmDeleteCarregador}
          onDeleteCarregador={() => { setWeaponDirect("tipoCarregador", []); setConfirmDeleteCarregador(false) }}
          onCancelDeleteCarregador={() => setConfirmDeleteCarregador(false)}
        />

        <ProfilePanel
          profileView={profileView}
          setProfileView={setProfileView}
          onLogout={onLogout}
        />
        </WeaponFormProvider>

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
