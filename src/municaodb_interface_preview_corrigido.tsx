import React, { createContext, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  ChevronRight,
  Plus,
  Bell,
  Database,
  BarChart3,
  CalendarDays,
  User,
  Building2,
  Camera,
  Image as ImageIcon,
  Save,
  X,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  ReceiptText,
  BookOpenText,
  Landmark,
} from "lucide-react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "icon";
};
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

type RecordItem = {
  id: string;
  type: string;
  weapon: string;
  updated: string;
  status: string;
  city: string;
};

const records: RecordItem[] = [];

const quickActions = [
  {
    label: "Nova REP",
    icon: ReceiptText,
    description: "Criar requisição com fluxo visual moderno",
    tone: "from-[#e0c27a]/20 to-transparent",
  },
  {
    label: "Exames de armas",
    icon: Shield,
    description: "Área operacional para revisão e edição",
    tone: "from-[#8fb7ff]/20 to-transparent",
  },
  {
    label: "Base referencial",
    icon: BookOpenText,
    description: "Consulta técnica e histórico de padrões",
    tone: "from-[#79d7c5]/20 to-transparent",
  },
  {
    label: "Painel estatístico",
    icon: BarChart3,
    description: "Indicadores consolidados por unidade e período",
    tone: "from-[#d69cff]/20 to-transparent",
  },
];

const menuItems = [
  { label: "Início", icon: LayoutDashboard, active: true, description: "Visão geral do sistema" },
  { label: "Exames de Armas", icon: Shield, description: "Cadastros e revisões" },
  { label: "Requisições REP", icon: ReceiptText, description: "Solicitações periciais" },
  { label: "Meus Registros", icon: FolderKanban, description: "Itens vinculados ao perito" },
  { label: "Base de Referência", icon: Database, description: "Consulta histórica e técnica" },
  { label: "Indicadores", icon: Activity, description: "Métricas e desempenho" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Card({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("rounded-3xl border", className)} {...props}>
      {children}
    </div>
  );
}

function CardHeader({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

function CardContent({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

function Button({ children, className, variant = "default", size = "default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 transition focus:outline-none";
  const variants = {
    default: "border border-transparent",
    outline: "border",
  };
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 px-3 py-2 text-sm",
    icon: "h-10 w-10",
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

function Input({ className, ...props }: InputProps) {
  return <input className={cn("w-full", className)} {...props} />;
}

function Badge({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", className)} {...props}>
      {children}
    </span>
  );
}

function ScrollArea({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("overflow-y-auto", className)} {...props}>
      {children}
    </div>
  );
}

type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

function Tabs({ children, value, onValueChange, className, ...props }: DivProps & { value: string; onValueChange: (value: string) => void }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("inline-grid rounded-2xl border border-white/10 p-1", className)} {...props}>
      {children}
    </div>
  );
}

function TabsTrigger({ children, value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-[#d7b76f] text-[#111827]" : "text-zinc-300 hover:bg-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function statusTone(status: string) {
  if (status === "Concluído") return "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
  if (status === "Em análise") return "bg-amber-500/15 text-amber-200 border-amber-400/20";
  if (status === "Aguardando fotos") return "bg-sky-500/15 text-sky-200 border-sky-400/20";
  return "bg-white/10 text-zinc-200 border-white/10";
}

export default function MunicaoDBInterfacePreview() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [repOpen, setRepOpen] = useState(true);
  const [tab, setTab] = useState("todos");

  const filtered = useMemo(() => {
    if (tab === "todos") return records;
    return records.filter((r) => r.type.toLowerCase() === tab);
  }, [tab]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(223,190,113,0.14),_transparent_24%),radial-gradient(circle_at_right,_rgba(89,116,172,0.14),_transparent_28%),linear-gradient(180deg,#07101d_0%,#0b1322_38%,#09111c_100%)] text-zinc-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#d5b46a_0.75px,transparent_0.75px)] [background-size:18px_18px]" />

        <header className="sticky top-0 z-30 border-b border-[#d7b76f]/15 bg-[#09111f]/70 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMenuOpen(true)}
                className="h-11 w-11 rounded-2xl border-[#d7b76f]/25 bg-white/[0.04] text-[#f1d79a] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:bg-white/[0.08]"
              >
                {menuOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-3">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-[22px] border border-[#d7b76f]/30 bg-gradient-to-br from-[#253a61] via-[#162846] to-[#0c1626] shadow-[0_0_0_1px_rgba(215,183,111,0.08),0_18px_40px_rgba(0,0,0,0.4)]">
                  <Shield className="h-7 w-7 text-[#f0d08a]" />
                  <div className="absolute -right-1 -top-1 rounded-full border border-[#d7b76f]/30 bg-[#0f1c31] px-1.5 py-0.5 text-[10px] font-medium text-[#f3d78f]">
                    V2
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="bg-gradient-to-r from-[#f7e2a7] via-[#efcf7e] to-[#c9a75f] bg-clip-text text-xl font-semibold tracking-tight text-transparent md:text-3xl">
                      MunicaoDB
                    </h1>
                    <Badge className="hidden border-[#d7b76f]/25 bg-[#d7b76f]/10 text-[#f3d78f] md:inline-flex">Conceito premium</Badge>
                  </div>
                  <p className="text-xs text-zinc-300 md:text-sm">Perícia Balística • Sistema de Exames e Banco de Dados • Polícia Científica do Paraná</p>
                </div>
              </div>
            </div>

            <div className="hidden flex-1 items-center justify-center px-4 xl:flex">
              <div className="flex w-full max-w-3xl items-center gap-2 rounded-[24px] border border-white/10 bg-white/[0.045] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.03),0_20px_35px_rgba(0,0,0,.18)]">
                <Search className="ml-1 h-4 w-4 text-zinc-400" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                  placeholder="Buscar por REP, arma, calibre, fabricante, unidade, perito ou observação"
                />
                <Button variant="outline" className="rounded-2xl border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/10">
                  <Filter className="mr-2 h-4 w-4" /> Filtros
                </Button>
                <Button size="sm" className="rounded-2xl bg-[#d7b76f] px-5 text-[#111827] hover:bg-[#e6c980]">
                  Buscar
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" className="hidden rounded-2xl border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/10 md:inline-flex">
                <Landmark className="mr-2 h-4 w-4" /> Unidade central
              </Button>
              <Button onClick={() => setRepOpen(true)} className="rounded-2xl bg-[#d7b76f] px-4 text-[#111827] shadow-[0_16px_28px_rgba(215,183,111,0.2)] hover:bg-[#ebcf8a]">
                <Plus className="mr-2 h-4 w-4" /> Nova REP
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-[1680px] gap-4 px-4 py-4 md:px-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)] lg:gap-6 lg:px-8 lg:py-6">
          <div className="space-y-4 lg:space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="group relative overflow-hidden rounded-[28px] border-[#d7b76f]/14 bg-[linear-gradient(180deg,rgba(19,31,50,.96),rgba(11,20,34,.98))] text-zinc-50 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.tone} opacity-100`} />
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f3d78f]/40 to-transparent" />
                      <CardContent className="relative p-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-[#d7b76f]/20 bg-white/[0.05] text-[#f3d78f] shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-zinc-500 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#f3d78f]" />
                        </div>
                        <div className="text-base font-semibold tracking-tight text-white">{item.label}</div>
                        <div className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-[#d7b76f]/20 bg-[linear-gradient(180deg,rgba(18,31,51,.95),rgba(11,21,36,.97))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-2xl text-[#f3d78f]">Painel inicial</CardTitle>
                      <p className="mt-1 text-sm text-zinc-400">Visão moderna para gestão pericial de armas e requisições</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10">
                        <Filter className="mr-2 h-4 w-4" /> Filtros
                      </Button>
                      <Button className="bg-[#d7b76f] text-[#111827] hover:bg-[#e8cb84]">Nova consulta</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      ["REP em aberto", "38", "+6 hoje"],
                      ["Exames concluídos", "214", "mês atual"],
                      ["Pendências fotográficas", "12", "exigem revisão"],
                    ].map(([title, value, sub]) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm text-zinc-400">{title}</div>
                        <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
                        <div className="mt-1 text-xs text-[#f3d78f]">{sub}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-[#d7b76f]/15 bg-gradient-to-r from-[#101b2e] via-[#13213a] to-[#0f1729] p-4 md:p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[#f3d78f]">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm font-medium">Tela inicial premium</span>
                        </div>
                        <h2 className="mt-2 text-xl font-semibold">Estrutura pensada para desktop e mobile</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                          Menu lateral sobreposto, centro com visão operacional e painel direito dedicado a criação de nova REP como drawer/modal.
                        </p>
                      </div>
                      <Button onClick={() => setRepOpen(true)} className="rounded-2xl bg-[#f3d78f] px-5 text-[#0d1320] hover:bg-[#ffe2a1]">
                        Abrir cadastro REP
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#d7b76f]/20 bg-[linear-gradient(180deg,rgba(18,31,51,.95),rgba(11,21,36,.97))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                <CardHeader>
                  <CardTitle className="text-[#f3d78f]">Atividade recente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "REP 1452/2026 recebeu atualização de imagens",
                    "Exame de pistola finalizado e enviado",
                    "Novo fabricante cadastrado na base",
                    "Perito vinculado a requisição em Curitiba",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#f3d78f]" />
                      <div className="text-sm text-zinc-300">{item}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <Card className="border-[#d7b76f]/20 bg-[linear-gradient(180deg,rgba(18,31,51,.95),rgba(11,21,36,.97))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
              <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-[#f3d78f] md:text-2xl">Exames e requisições recentes</CardTitle>
                    <p className="mt-1 text-sm text-zinc-400">Lista pensada para leitura rápida, filtros visuais e boa experiência em touch</p>
                  </div>
                  <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-4 bg-white/5 md:w-[420px]">
                      <TabsTrigger value="todos">Todos</TabsTrigger>
                      <TabsTrigger value="revólver">Revólver</TabsTrigger>
                      <TabsTrigger value="pistola">Pistola</TabsTrigger>
                      <TabsTrigger value="carabina">Carabina</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filtered.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7b76f]/20 bg-[#d7b76f]/10 text-[#f3d78f]">
                        <Database className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-white">Nenhum registro carregado</h3>
                      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                        A interface está preparada para receber os dados diretamente da base depois. Nesta etapa, a listagem permanece vazia de propósito, sem dados mockados fixos.
                      </p>
                    </div>
                  ) : (
                    filtered.map((record, i) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-[#d7b76f]/25 hover:bg-white/[0.07]"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-lg font-semibold text-white">{record.id}</div>
                              <Badge className={statusTone(record.status)}>{record.status}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
                              <span>{record.type}</span>
                              <span>{record.weapon}</span>
                              <span>{record.city}</span>
                              <span>Atualizado {record.updated}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10">Visualizar</Button>
                            <Button className="bg-[#d7b76f] text-[#111827] hover:bg-[#e9cc85]">Editar</Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="hidden lg:block">
            <Card className="sticky top-24 overflow-hidden rounded-[32px] border-[#d7b76f]/15 bg-[linear-gradient(180deg,rgba(18,31,51,.97),rgba(11,21,36,.99))] shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f3d78f]/40 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7b76f]/20 bg-[#d7b76f]/10 px-3 py-1 text-xs text-[#f3d78f]">
                      <ReceiptText className="h-3.5 w-3.5" /> Cadastro lateral inteligente
                    </div>
                    <CardTitle className="mt-3 text-[28px] tracking-tight text-[#f3d78f]">Nova REP</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">Drawer lateral moderno para cadastro rápido, com estrutura pensada para integração futura com banco e API.</p>
                  </div>
                  <Badge className="border-[#d7b76f]/30 bg-[#d7b76f]/10 text-[#f3d78f]">desktop</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm text-zinc-400">Número do exame</label>
                    <Input placeholder="Será preenchido pela base ou manualmente" className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white placeholder:text-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Unidade</label>
                    <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.05] px-3">
                      <Building2 className="h-4 w-4 text-zinc-400" />
                      <input placeholder="Curitiba" className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-zinc-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Perito</label>
                    <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.05] px-3">
                      <User className="h-4 w-4 text-zinc-400" />
                      <input placeholder="Nome do perito" className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-zinc-500" />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm text-zinc-400">Data do exame</label>
                    <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.05] px-3">
                      <CalendarDays className="h-4 w-4 text-zinc-400" />
                      <input className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-zinc-500" placeholder="Seleção posterior" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-white">Tipo de exame</div>
                    <div className="text-xs text-zinc-500">Seleção única</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["Revólver", true],
                      ["Pistola", false],
                      ["Carabina", false],
                    ].map(([label, active]) => (
                      <button
                        key={String(label)}
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-sm transition",
                          active
                            ? "border-[#d7b76f]/50 bg-[#d7b76f]/15 text-[#f3d78f] shadow-[0_10px_18px_rgba(215,183,111,.08)]"
                            : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">Dados do armamento</div>
                    <Badge className="border-white/10 bg-white/[0.04] text-zinc-300">bloco configurável</Badge>
                  </div>
                  {[
                    "Marca",
                    "Tambor gira",
                    "Ação simples funcional",
                    "Ação dupla funcional",
                    "Cão funcional",
                  ].map((label, idx) => (
                    <div key={label} className="flex items-center gap-3 rounded-2xl border border-transparent px-1 py-1 text-sm text-zinc-300 transition hover:bg-white/[0.03]">
                      {idx === 0 ? <Circle className="h-4 w-4 text-[#f3d78f]" /> : <div className="h-4 w-4 rounded border border-white/20" />}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button className="rounded-[26px] border border-dashed border-[#d7b76f]/35 bg-[#d7b76f]/[0.08] p-5 text-left transition hover:bg-[#d7b76f]/[0.12]">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7b76f]/12 text-[#f3d78f]">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div className="font-medium text-white">Tirar foto</div>
                    <div className="mt-1 text-sm text-zinc-400">Captura imediata do item</div>
                  </button>
                  <button className="rounded-[26px] border border-dashed border-white/15 bg-white/[0.04] p-5 text-left transition hover:bg-white/10">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-zinc-200">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div className="font-medium text-white">Galeria</div>
                    <div className="mt-1 text-sm text-zinc-400">Anexar mídia e documentação</div>
                  </button>
                </div>

                <div className="rounded-[24px] border border-[#d7b76f]/15 bg-[#d7b76f]/[0.08] p-4">
                  <div className="mb-2 text-sm font-medium text-[#f3d78f]">Estratégia de integração</div>
                  <p className="text-sm leading-6 text-zinc-300">
                    O formulário já está organizado em blocos independentes, favorecendo bind com banco local, API REST, camada de validação e estado global depois.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Observações</label>
                  <textarea
                    className="min-h-[130px] w-full rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-sm text-white outline-none placeholder:text-zinc-500"
                    placeholder="Informações preliminares da requisição pericial"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/10">
                    Salvar rascunho
                  </Button>
                  <Button className="h-12 rounded-2xl bg-[#d7b76f] text-base font-semibold text-[#111827] hover:bg-[#ecd08a]">
                    <Save className="mr-2 h-4 w-4" /> Salvar REP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: -420, opacity: 0.9 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -420, opacity: 0.9 }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className="fixed left-0 top-0 z-50 flex h-full w-[90vw] max-w-[400px] flex-col border-r border-[#d7b76f]/15 bg-[linear-gradient(180deg,#09111f_0%,#0f1b30_100%)] shadow-[30px_0_80px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d7b76f]/25 bg-[#d7b76f]/10 text-[#f3d78f]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#f3d78f]">Polícia Científica</div>
                      <div className="text-xs text-zinc-400">Navegação sobreposta premium</div>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setMenuOpen(false)} className="rounded-2xl border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/10">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="mb-5 rounded-[24px] border border-[#d7b76f]/15 bg-[#d7b76f]/10 p-4">
                    <div className="text-sm font-medium text-[#f3d78f]">Fluxo principal</div>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      Menu sobreposto, preservando o foco operacional da área central e favorecendo o uso em telas menores.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-[22px] px-4 py-3 text-left transition",
                            item.active
                              ? "border border-[#d7b76f]/25 bg-[#d7b76f]/10 text-[#f3d78f]"
                              : "border border-transparent bg-transparent text-zinc-300 hover:bg-white/[0.05]",
                          )}
                        >
                          <Icon className="mt-0.5 h-5 w-5" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="mt-1 text-xs text-zinc-500">{item.description}</div>
                          </div>
                          <ChevronRight className="mt-0.5 h-4 w-4 opacity-60" />
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {repOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
                onClick={() => setRepOpen(false)}
              />
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] rounded-t-[32px] border border-white/10 bg-[linear-gradient(180deg,#101b2e_0%,#0b1424_100%)] p-4 shadow-[0_-24px_80px_rgba(0,0,0,0.45)] lg:hidden"
              >
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/15" />
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7b76f]/20 bg-[#d7b76f]/10 px-3 py-1 text-xs text-[#f3d78f]">
                      <ReceiptText className="h-3.5 w-3.5" /> Cadastro mobile
                    </div>
                    <div className="mt-3 text-xl font-semibold tracking-tight text-[#f3d78f]">Nova REP</div>
                    <div className="text-sm text-zinc-400">Drawer otimizado para toque e empacotamento mobile</div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setRepOpen(false)} className="rounded-2xl border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/10">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="grid gap-3">
                  <Input placeholder="Número do exame" className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white placeholder:text-zinc-500" />
                  <Input placeholder="Unidade" className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white placeholder:text-zinc-500" />
                  <Input placeholder="Perito" className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white placeholder:text-zinc-500" />
                  <div className="grid grid-cols-3 gap-2">
                    <button className="rounded-2xl border border-[#d7b76f]/50 bg-[#d7b76f]/15 px-3 py-3 text-sm text-[#f3d78f]">Revólver</button>
                    <button className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-zinc-300">Pistola</button>
                    <button className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-zinc-300">Carabina</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="rounded-[24px] border border-dashed border-[#d7b76f]/35 bg-[#d7b76f]/[0.08] p-4 text-left">
                      <Camera className="mb-2 h-5 w-5 text-[#f3d78f]" />
                      <div className="text-sm font-medium text-white">Tirar foto</div>
                    </button>
                    <button className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.04] p-4 text-left">
                      <ImageIcon className="mb-2 h-5 w-5 text-zinc-200" />
                      <div className="text-sm font-medium text-white">Galeria</div>
                    </button>
                  </div>
                  <textarea className="min-h-[120px] rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-sm text-white outline-none placeholder:text-zinc-500" placeholder="Observações" />
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/10">Rascunho</Button>
                    <Button className="h-12 rounded-2xl bg-[#d7b76f] text-base font-semibold text-[#111827] hover:bg-[#ecd08a]">Salvar REP</Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
