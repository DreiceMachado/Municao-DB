import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, FileText, LogOut, Shield } from "lucide-react"
import type { ProfileView, RecordItem } from "../types"

type Props = {
  profileView: ProfileView
  setProfileView: (view: ProfileView) => void
  onLogout: () => void
  laudos: RecordItem[]
}

export function ProfilePanel({ profileView, setProfileView, onLogout, laudos }: Props) {
  const open = !!profileView

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
                  <span className="text-lg font-black text-[#f0d08a]">PC</span>
                </div>
                <div className="text-sm font-black text-[#1d2433]">Perito Responsável</div>
                <div className="mt-0.5 text-xs text-[#8d7854]">perito@policiacientifica.pr.gov.br</div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e8dfc8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6b5838]">
                  <Shield className="h-3 w-3" />
                  Polícia Científica do Paraná
                </div>
              </div>

              {/* Laudos registrados */}
              <div className="overflow-hidden rounded-3xl border border-[#d3c4a8] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e8dfc8] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#f0d08a]/70" />
                    <span className="text-sm font-black text-[#f0d08a]">Meus laudos</span>
                  </div>
                  <span className="rounded-full bg-[#f0d08a]/15 px-2.5 py-0.5 text-xs font-black text-[#f0d08a]">
                    {laudos.length}
                  </span>
                </div>

                {laudos.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-[#8d7854]">
                    Nenhum laudo registrado ainda.
                  </div>
                ) : (
                  <div className="divide-y divide-[#e8dfc8]">
                    {laudos.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-3 px-5 py-4">
                        <div className="min-w-0">
                          <div className="text-sm font-black text-[#1d2433]">
                            {item.number}/{item.year}
                          </div>
                          <div className="mt-0.5 text-xs text-[#8d7854] truncate">{item.unit}</div>
                          <div className="mt-0.5 text-xs text-[#b0a090] truncate">{item.model || "—"}</div>
                        </div>
                        <span className="shrink-0 rounded-full border border-[#d8c59b] bg-[#f2e4bc] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#5b4a2e]">
                          rascunho
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
