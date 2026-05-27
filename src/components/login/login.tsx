import { useState } from "react"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha e-mail e senha.")
      return
    }
    setErro("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    onLogin()
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b1526]">

      {/* Ornamentos de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#f0d08a]/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-[#1b2947]/80 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-[#f0d08a]/5" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-[#f0d08a]/20 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-[#f0d08a]/25 bg-[#f0d08a]/10">
              <img
                src="/logo-pc-pr.png"
                alt="PC-PR"
                className="h-12 w-12 object-contain"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
              />
              {/* Fallback: brasão textual */}
              <span className="absolute text-[28px] font-black text-[#f0d08a]" style={{ fontFamily: "serif" }}>⚖</span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-black tracking-[0.16em] text-[#f0d08a]">MunicaoDB</h1>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-[#7a8faf]">
              Polícia Científica do Paraná
            </p>
          </div>
        </div>

        {/* Card do formulário */}
        <div className="w-full rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur-md">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a8faf]">
            Acesso restrito
          </p>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {/* E-mail */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8faf]" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErro("") }}
                placeholder="E-mail institucional"
                className="h-13 w-full rounded-2xl border border-white/10 bg-white/7 py-3.5 pl-11 pr-4 text-[15px] text-white placeholder:text-[#4a5a78] outline-none transition focus:border-[#f0d08a]/40 focus:bg-white/10 focus:ring-1 focus:ring-[#f0d08a]/20"
              />
            </div>

            {/* Senha */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8faf]" />
              <input
                type={showSenha ? "text" : "password"}
                autoComplete="current-password"
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro("") }}
                placeholder="Senha"
                className="h-13 w-full rounded-2xl border border-white/10 bg-white/7 py-3.5 pl-11 pr-12 text-[15px] text-white placeholder:text-[#4a5a78] outline-none transition focus:border-[#f0d08a]/40 focus:bg-white/10 focus:ring-1 focus:ring-[#f0d08a]/20"
              />
              <button
                type="button"
                onClick={() => setShowSenha(v => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-[#4a5a78] transition active:text-[#f0d08a]"
              >
                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Erro */}
            {erro && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[13px] font-semibold text-red-300">
                {erro}
              </div>
            )}

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={loading}
              className="relative mt-1 w-full overflow-hidden rounded-2xl py-4 text-sm font-black tracking-[0.22em] text-[#12213d] shadow-[0_8px_32px_rgba(240,208,138,.15)] transition active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f0d08a 0%, #d4a832 50%, #f0d08a 100%)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  AGUARDE…
                </span>
              ) : "ENTRAR"}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#3a4a62]">Sistema Interno</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>
      </div>
    </div>
  )
}
