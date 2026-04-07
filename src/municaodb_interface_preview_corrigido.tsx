import React, { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import logo from "./assets/logo.png" 
import {
  BarChart3,
  Building2,
  CalendarDays,
  Camera,
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

type WeaponType = "REVÓLVER" | "PISTOLA" | "CARABINA"

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

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="rounded-[26px] border border-[#8e7340] bg-[linear-gradient(180deg,#14233f_0%,#0b1730_100%)] p-5 shadow-[0_16px_40px_rgba(0,0,0,.24)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-2xl border border-[#8e7340] bg-[#0f1e39] p-3 text-[#f0d08a]">
          {icon}
        </div>
        <span className="text-xs uppercase tracking-[0.24em] text-[#ccb780]">Painel</span>
      </div>
      <div className="text-4xl font-extrabold tracking-tight text-[#f0d08a]">{value}</div>
      <div className="mt-1 text-base text-[#eadab0]">{label}</div>
    </div>
  )
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

  const [form, setForm] = useState({
    examNumber: "2026",
    unit: "Núcleo de Polícia Científica",
    expert: "Perito responsável",
    date: "26/03/2026",
    brand: "",
    model: "",
    serial: "",
    caliber: "",
    tamborGira: true,
    acaoSimples: true,
    acaoDupla: true,
    caoFuncional: true,
    observacoes: "",
  })

  const filteredRecords = useMemo(() => {
    return recordsSeed.filter((item) => {
      const numberOk =
        !numberFilter ||
        item.number.toLowerCase().includes(numberFilter.toLowerCase()) ||
        item.model.toLowerCase().includes(numberFilter.toLowerCase())
      const yearOk = !yearFilter || item.year.includes(yearFilter)
      return numberOk && yearOk
    })
  }, [numberFilter, yearFilter])

  const titleByType: Record<WeaponType, string> = {
    "REVÓLVER": "Exame de Revólver",
    "PISTOLA": "Exame de Pistola",
    "CARABINA": "Exame de Carabina",
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

  const sidebarDesktop = (
    <aside className="hidden w-[300px] shrink-0 border-r border-[#8e7340] bg-[linear-gradient(180deg,#0d1a31_0%,#11203c_58%,#0b1730_100%)] xl:block">
      <SidebarContent />
    </aside>
  )

  const sidebarMobile = (
    <div className="h-full bg-[linear-gradient(180deg,#0d1a31_0%,#11203c_58%,#0b1730_100%)]">
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
            <div className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
              <section className="space-y-6">
                <div className="rounded-[28px] border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] p-6 shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-[#f0d08a] md:text-4xl">
                        Cadastro e gestão de exames em armas
                      </h2>
                      <p className="mt-2 max-w-3xl text-[15px] text-[#eadab0]">
                        Interface preparada para uso desktop e móvel, com foco em fluxo pericial, rastreabilidade e
                        futura integração com base local, câmera e armazenamento estruturado.
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => setShowTypeSelector((v) => !v)}
                        className="flex items-center gap-2 rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#e1c580_0%,#caa65c_100%)] px-6 py-3 text-sm font-black tracking-wide text-[#1d2433] shadow transition hover:brightness-105 md:text-base"
                      >
                        <Plus className="h-4 w-4" />
                        NOVO REP
                      </button>

                      <AnimatePresence>
                        {showTypeSelector && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.18 }}
                            className="flex flex-col gap-2 rounded-2xl border border-[#8e7340] bg-[#0f1e39] p-3 shadow-[0_12px_32px_rgba(0,0,0,.32)]"
                          >
                            <div className="mb-1 px-1 text-xs font-bold uppercase tracking-[0.22em] text-[#b89a58]">
                              Selecionar tipo de arma
                            </div>
                            {(["REVÓLVER", "PISTOLA", "CARABINA"] as WeaponType[]).map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setWeaponType(type)
                                  setShowTypeSelector(false)
                                }}
                                className={cn(
                                  "rounded-xl border px-5 py-2.5 text-sm font-black tracking-wide transition",
                                  weaponType === type
                                    ? "border-[#f1d58d] bg-[linear-gradient(180deg,#e1c580_0%,#caa65c_100%)] text-[#1d2433]"
                                    : "border-[#8e7340] bg-[#162541] text-[#f0d08a] hover:bg-[#1a2c4f]",
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
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

                      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] text-sm font-black tracking-[0.16em] text-[#f8e3b3] shadow-[0_10px_18px_rgba(66,50,24,.22)]">
                        <Search className="h-4 w-4" />
                        BUSCAR
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f7f1e5] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
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
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={<Database className="h-6 w-6" />} value="198" label="Registros periciais" />
                  <StatCard icon={<CircleDot className="h-6 w-6" />} value="29" label="Calibres cadastrados" />
                  <StatCard icon={<Building2 className="h-6 w-6" />} value="21" label="Fabricantes" />
                  <StatCard icon={<Crosshair className="h-6 w-6" />} value="74" label="Armas vinculadas" />
                </div>
              </section>

              <section>
                <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f5efe3] text-[#26221b] shadow-[0_20px_44px_rgba(0,0,0,.28)]">
                  <div className="border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-[#f0d08a]">{titleByType[weaponType]}</h3>
                      <div className="rounded-xl border border-[#8e7340] bg-[#162541] p-2 text-[#f0d08a]">
                        <Camera className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 p-5 md:p-6">
                    <div>
                      <div className="mb-4 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                        Identificação do exame
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Número do exame
                          </label>
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                            <input
                              value={form.examNumber}
                              onChange={handleField("examNumber")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Data do exame
                          </label>
                          <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                            <input
                              value={form.date}
                              onChange={handleField("date")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Unidade
                          </label>
                          <div className="relative">
                            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                            <input
                              value={form.unit}
                              onChange={handleField("unit")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Perito
                          </label>
                          <div className="relative">
                            <User2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                            <input
                              value={form.expert}
                              onChange={handleField("expert")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-4 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                        Dados da arma
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Marca
                          </label>
                          <input
                            value={form.brand}
                            onChange={handleField("brand")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: Taurus"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Modelo
                          </label>
                          <input
                            value={form.model}
                            onChange={handleField("model")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: RT 627"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Número de série
                          </label>
                          <input
                            value={form.serial}
                            onChange={handleField("serial")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Informar identificação"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Calibre
                          </label>
                          <input
                            value={form.caliber}
                            onChange={handleField("caliber")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: .38 SPL"
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 rounded-2xl border border-[#d5c7aa] bg-[#fbf8f3] p-4">
                        {[
                          ["tamborGira", "Tambor gira"],
                          ["acaoSimples", "Ação simples funcional"],
                          ["acaoDupla", "Ação dupla funcional"],
                          ["caoFuncional", "Cão funcional"],
                        ].map(([key, label]) => (
                          <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                            <input
                              type="checkbox"
                              checked={Boolean(form[key as keyof typeof form])}
                              onChange={handleField(key as keyof typeof form)}
                              className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

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

                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                        Observações
                      </label>
                      <textarea
                        value={form.observacoes}
                        onChange={handleField("observacoes")}
                        className="min-h-[140px] w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Inserir observações técnicas, estado geral, particularidades e demais elementos relevantes."
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#d3c3a4] pt-5">
                      <button className="rounded-2xl border border-[#a8894c] bg-[#efe1b5] px-5 py-3 text-sm font-black tracking-[0.14em] text-[#4b3b21] transition hover:brightness-95">
                        LIMPAR
                      </button>
                      <button className="rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] px-7 py-3 text-sm font-black tracking-[0.16em] text-[#f8e3b3] shadow-[0_12px_24px_rgba(66,50,24,.22)] transition hover:brightness-105">
                        SALVAR EXAME
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>

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
                className="fixed left-0 top-0 z-50 h-full w-[300px] overflow-y-auto border-r border-[#8e7340] shadow-[0_20px_40px_rgba(0,0,0,.28)] xl:hidden"
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
