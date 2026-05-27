import { useState } from "react"
import { Shield, Eye, EyeOff } from "lucide-react"

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
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onLogin()
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5efe3]">
      {/* Cabeçalho */}
      <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 pb-10 pt-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0d08a]/15 ring-2 ring-[#f0d08a]/30">
          <Shield className="h-8 w-8 text-[#f0d08a]" />
        </div>
        <h1 className="text-2xl font-black tracking-[0.12em] text-[#f0d08a]">MunicaoDB</h1>
        <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#ccb780]">
          Sistema de Registro Balístico
        </p>
      </div>

      {/* Card */}
      <div className="mx-auto w-full max-w-md flex-1 px-4 -mt-6">
        <div className="rounded-3xl border border-[#d3c4a8] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,.10)]">
          <h2 className="mb-6 text-lg font-black text-[#1d2433]">Acesse sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* E-mail */}
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">
                E-mail
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-12 w-full rounded-xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 text-[16px] text-[#50442f] outline-none transition focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/15"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  autoComplete="current-password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 pr-12 text-[16px] text-[#50442f] outline-none transition focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#b89a58]"
                >
                  {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <p className="rounded-xl border border-[#f0b8b8] bg-[#fdf0f0] px-4 py-2.5 text-sm font-semibold text-[#b03030]">
                {erro}
              </p>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.2em] text-[#f8e3b3] shadow-[0_8px_20px_rgba(66,50,24,.22)] transition active:brightness-95 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "AGUARDE…" : "ENTRAR"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.18em] text-[#a89474]">
          Polícia Científica do Paraná
        </p>
      </div>
    </div>
  )
}
