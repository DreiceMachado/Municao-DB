import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, LogOut, Shield } from "lucide-react"
import type { ProfileView } from "../types"
import { supabase, supabaseAtivo } from "../lib/supabase"

type Props = {
  profileView: ProfileView
  setProfileView: (view: ProfileView) => void
  onLogout: () => void
}

export function ProfilePanel({ profileView, setProfileView, onLogout }: Props) {
  const open = !!profileView
  const [nome, setNome]   = useState("Perito Responsável")
  const [email, setEmail] = useState("")
  const [iniciais, setIniciais] = useState("PC")

  useEffect(() => {
    if (!supabaseAtivo || !supabase) return
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const n = user.user_metadata?.nome as string | undefined
      const e = user.email ?? ""
      if (n) {
        setNome(n)
        // iniciais: até 2 primeiras letras das palavras do nome
        const partes = n.trim().split(" ").filter(Boolean)
        setIniciais(
          partes.length >= 2
            ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
            : partes[0]?.slice(0, 2).toUpperCase() ?? "PC"
        )
      }
      setEmail(e)
    })
  }, [])

  return (
    <>
      {/* Backdrop desktop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[129] hidden bg-black/40 lg:block"
            onClick={() => setProfileView(null)}
          />
        )}
      </AnimatePresence>

      {/* Painel lateral */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="profile-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[130] flex w-full flex-col bg-[#f5efe3] text-[#26221b] lg:w-[400px] lg:shadow-[-24px_0_64px_rgba(0,0,0,.3)]"
          >
            {/* Header */}
            <div className="shrink-0 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProfileView(null)}
                  className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="text-lg font-black text-[#f0d08a]">Perfil</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-4">

              {/* Card do perito */}
              <div className="rounded-3xl border border-[#d3c4a8] bg-white p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] ring-4 ring-[#f0d08a]/20">
                  <span className="text-lg font-black text-[#f0d08a]">{iniciais}</span>
                </div>
                <div className="text-sm font-black text-[#1d2433]">{nome}</div>
                <div className="mt-0.5 text-xs text-[#8d7854]">{email || "—"}</div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e8dfc8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6b5838]">
                  <Shield className="h-3 w-3" />
                  Polícia Científica do Paraná
                </div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
