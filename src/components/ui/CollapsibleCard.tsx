import React, { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../utils/cn"

type Props = {
  title: string
  children: React.ReactNode
  // Quando este número muda (e é > 0), o card abre. Usado para expandir os
  // cards preenchidos ao aplicar a ficha do catálogo (no celular vêm recolhidos).
  expandSignal?: number
}

export function CollapsibleCard({ title, children, expandSignal }: Props) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (expandSignal && expandSignal > 0) setOpen(true)
  }, [expandSignal])
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d5c7aa] bg-[#fbf8f3]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 md:cursor-default"
      >
        <span className="text-sm font-black uppercase tracking-[0.14em] text-[#50442f] md:text-xs md:tracking-[0.18em] md:text-[#6b5838]">
          {title}
        </span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e8dfc8] text-[#6b5838] shadow-sm md:hidden">
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      <div className={cn("px-5 pb-6 md:!block", open ? "block" : "hidden")}>{children}</div>
    </div>
  )
}
