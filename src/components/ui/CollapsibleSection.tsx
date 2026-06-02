import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../utils/cn"

type Props = {
  title: string
  extra?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSection({ title, extra, children, defaultOpen = true }: Props) {
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
