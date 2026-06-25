import { Crosshair, Database, Download, FolderKanban, RefreshCw } from "lucide-react"
import { cn } from "../utils/cn"

export type Section = "inicio" | "exames" | "registros" | "importar" | "sincronizar" | "dados"

type Tab = { id: Section; label: string; Icon: React.ElementType }

const TABS: Tab[] = [
  { id: "exames",      label: "Exames",       Icon: Crosshair    },
  { id: "registros",   label: "Registros",    Icon: FolderKanban },
  { id: "importar",    label: "Importar",     Icon: Download     },
  { id: "sincronizar", label: "Exportar",     Icon: RefreshCw    },
  { id: "dados",       label: "Dados",        Icon: Database     },
]

type Props = {
  active: Section
  onChange: (s: Section) => void
}

export function BottomTabBar({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 xl:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Linha dourada no topo */}
      <div className="h-[2px] bg-[linear-gradient(90deg,transparent_0%,#b79248_20%,#f0d08a_50%,#b79248_80%,transparent_100%)]" />

      <div className="flex bg-[#0d1a31]/95 backdrop-blur-md px-2 pt-1 pb-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = id === active
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative flex flex-1 flex-col items-center gap-1 py-2 transition-all duration-200"
            >
              {/* Pílula de fundo no item ativo */}
              {isActive && (
                <span className="absolute inset-x-2 top-1 bottom-1 rounded-2xl bg-[#f0d08a]/10" />
              )}

              {/* Ícone */}
              <span className={cn(
                "relative z-10 transition-all duration-200",
                isActive ? "text-[#f0d08a] scale-110" : "text-[#4e607a]"
              )}>
                <Icon className={cn("transition-all duration-200", isActive ? "h-6 w-6" : "h-5 w-5")} />
              </span>

              {/* Label */}
              <span className={cn(
                "relative z-10 text-[10px] font-bold tracking-wide transition-all duration-200",
                isActive ? "text-[#f0d08a]" : "text-[#4e607a]"
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
