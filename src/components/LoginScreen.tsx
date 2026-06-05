import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react"
import logoEscudo from "../assets/logo-escudo.png"

type Props = {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: Props) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.")
      return
    }

    setLoading(true)
    // Simulação — substituir pela autenticação real (Supabase) futuramente
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    onLogin()
  }

  const input = "h-14 w-full rounded-2xl border border-[#d3c4a8] bg-[#fbf8f2] pl-12 pr-4 text-[16px] text-[#50442f] outline-none transition focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/20 shadow-sm"

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#09142a_0%,#0d1a34_50%,#091429_100%)] flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <img
          src={logoEscudo}
          alt="BalísticaDB"
          className="h-24 w-auto object-contain drop-shadow-[0_0_24px_rgba(240,208,138,.25)] mb-4"
        />
        <h1 className="text-2xl font-black tracking-tight text-[#f0d08a]">BalísticaDB</h1>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
          Polícia Científica do Paraná
        </p>
      </div>

      {/* Card de login */}
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#8e7340]/60 bg-[#f5efe3] shadow-[0_32px_80px_rgba(0,0,0,.55)]">
        {/* Topo */}
        <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#f0d08a]" />
            <span className="text-base font-black tracking-wide text-[#f0d08a]">Acesso ao sistema</span>
          </div>
          <p className="mt-0.5 text-[11px] text-[#ccb780] uppercase tracking-[0.18em]">
            Identifique-se para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* E-mail */}
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b89a58]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail institucional"
              autoComplete="email"
              className={input}
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b89a58]" />
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              className={`${input} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-[#b89a58]"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Erro */}
          {error && (
            <div className="rounded-xl border border-[#f0b8b8] bg-[#fdf0f0] px-4 py-2.5 text-sm font-semibold text-[#b03030]">
              {error}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.2em] text-[#f0d08a] shadow-[0_8px_20px_rgba(0,0,0,.3)] transition active:brightness-90 disabled:opacity-60"
          >
            {loading ? "VERIFICANDO…" : "ENTRAR"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-[10px] text-white/25 uppercase tracking-[0.2em]">
        v3.0 • Sistema restrito
      </p>
    </div>
  )
}
