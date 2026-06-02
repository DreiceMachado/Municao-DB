import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  Shield,
} from "lucide-react"
import type { ProfileView } from "../types"

type Props = {
  profileView: ProfileView
  setProfileView: (view: ProfileView) => void
  onLogout: () => void
}

export function ProfilePanel({ profileView, setProfileView, onLogout }: Props) {
  const [email, setEmail] = useState("")
  const [emailConfirm, setEmailConfirm] = useState("")
  const [curPwd, setCurPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [newPwdConfirm, setNewPwdConfirm] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const inputClass = "h-12 w-full rounded-xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 text-[16px] text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/15"
  const labelClass = "mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]"
  const saveBtn = "w-full rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.2em] text-[#f8e3b3] shadow-[0_8px_20px_rgba(66,50,24,.22)] active:brightness-95"

  return (
    <AnimatePresence>
      {profileView && (
        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 200 }}
          className="fixed inset-0 z-[130] flex flex-col bg-[#f5efe3] text-[#26221b]"
        >
          <div className="shrink-0 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => profileView === "main" ? setProfileView(null) : setProfileView("main")}
                className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-lg font-black text-[#f0d08a]">
                {profileView === "main" ? "Perfil" : profileView === "changeEmail" ? "Alterar E-mail" : "Alterar Senha"}
              </div>
            </div>
          </div>

          {profileView === "main" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="rounded-3xl border border-[#d3c4a8] bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] ring-4 ring-[#f0d08a]/20">
                  <span className="text-2xl font-black text-[#f0d08a]">PC</span>
                </div>
                <div className="text-base font-black text-[#1d2433]">Perito Responsável</div>
                <div className="mt-0.5 text-sm text-[#8d7854]">perito@policiacientifica.pr.gov.br</div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e8dfc8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6b5838]">
                  <Shield className="h-3 w-3" />
                  Polícia Científica do Paraná
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-[#d3c4a8] bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => { setMsg(null); setProfileView("changeEmail") }}
                  className="flex w-full items-center gap-4 border-b border-[#e8dfc8] px-5 py-4 text-left active:bg-[#f5efe3]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                    <Mail className="h-5 w-5 text-[#8d7854]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#1d2433]">Alterar e-mail</div>
                    <div className="text-xs text-[#8d7854]">Mude seu endereço de acesso</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#b89a58]" />
                </button>
                <button
                  type="button"
                  onClick={() => { setMsg(null); setProfileView("changePassword") }}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left active:bg-[#f5efe3]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                    <KeyRound className="h-5 w-5 text-[#8d7854]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#1d2433]">Alterar senha</div>
                    <div className="text-xs text-[#8d7854]">Atualize sua senha de acesso</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#b89a58]" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setProfileView(null); onLogout() }}
                className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-[#e0b0b0] bg-[#fdf0f0] py-4 text-sm font-black tracking-[0.15em] text-[#b03030] active:brightness-95"
              >
                <LogOut className="h-4 w-4" />
                SAIR DA CONTA
              </button>
            </div>
          )}

          {profileView === "changeEmail" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4 rounded-3xl border border-[#d3c4a8] bg-white p-6 shadow-sm">
                <div>
                  <label className={labelClass}>Novo e-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="novo@email.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirmar e-mail</label>
                  <input
                    type="email"
                    value={emailConfirm}
                    onChange={e => setEmailConfirm(e.target.value)}
                    placeholder="novo@email.com"
                    className={inputClass}
                  />
                </div>
                {msg && (
                  <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${msg.type === "ok" ? "border border-green-200 bg-green-50 text-green-700" : "border border-[#f0b8b8] bg-[#fdf0f0] text-[#b03030]"}`}>
                    {msg.text}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!email || email !== emailConfirm) {
                      setMsg({ type: "err", text: "Os e-mails não coincidem." })
                      return
                    }
                    setMsg({ type: "ok", text: "E-mail atualizado com sucesso." })
                    setEmail(""); setEmailConfirm("")
                  }}
                  className={saveBtn}
                >
                  SALVAR E-MAIL
                </button>
              </div>
            </div>
          )}

          {profileView === "changePassword" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4 rounded-3xl border border-[#d3c4a8] bg-white p-6 shadow-sm">
                <div>
                  <label className={labelClass}>Senha atual</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={curPwd}
                      onChange={e => setCurPwd(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClass} pr-12`}
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#b89a58]">
                      {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Nova senha</label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirmar nova senha</label>
                  <input
                    type="password"
                    value={newPwdConfirm}
                    onChange={e => setNewPwdConfirm(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                {msg && (
                  <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${msg.type === "ok" ? "border border-green-200 bg-green-50 text-green-700" : "border border-[#f0b8b8] bg-[#fdf0f0] text-[#b03030]"}`}>
                    {msg.text}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!curPwd || !newPwd || newPwd !== newPwdConfirm) {
                      setMsg({ type: "err", text: "Verifique os campos e confirme a nova senha." })
                      return
                    }
                    if (newPwd.length < 6) {
                      setMsg({ type: "err", text: "A nova senha deve ter ao menos 6 caracteres." })
                      return
                    }
                    setMsg({ type: "ok", text: "Senha atualizada com sucesso." })
                    setCurPwd(""); setNewPwd(""); setNewPwdConfirm("")
                  }}
                  className={saveBtn}
                >
                  SALVAR SENHA
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
