import logo from "../assets/logo.png"
import {
  BarChart3,
  Crosshair,
  FolderKanban,
  LayoutDashboard,
  Settings,
  User2,
} from "lucide-react"
import { cn } from "../utils/cn"
import type { Section } from "./BottomTabBar"

type Props = {
  activeSection: Section
  onSectionChange: (s: Section) => void
  onOpenProfile: () => void
}

export function SidebarContent({ activeSection, onSectionChange, onOpenProfile }: Props) {
  const item = "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[17px] font-medium transition"
  const icon = "h-5 w-5"

  const navItem = (id: Section, label: string, Icon: React.ElementType) => (
    <button
      onClick={() => onSectionChange(id)}
      className={cn(
        item,
        activeSection === id
          ? "bg-[#d7b76f]/12 text-[#f4dda2] shadow-inner shadow-[#d7b76f]/10"
          : "text-[#f3e8c3] hover:bg-[#d7b76f]/10"
      )}
    >
      <Icon className={icon} />
      {label}
    </button>
  )

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
          {navItem("inicio",    "Início",          LayoutDashboard)}
          {navItem("exames",    "Exames de Armas", Crosshair)}
          {navItem("registros", "Registros",       FolderKanban)}
          {navItem("dados",     "Dados",           BarChart3)}
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
