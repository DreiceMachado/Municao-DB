import { cn } from "../../utils/cn"

type Props = {
  label: string
  active?: boolean
}

export function TopTab({ label, active = false }: Props) {
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
