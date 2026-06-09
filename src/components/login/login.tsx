import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldCheck, User, ChevronLeft, BadgeCheck } from "lucide-react"
import logoBalisticaDB from "../../assets/logo-balisticaDB.png"
import { supabase, supabaseAtivo } from "../../lib/supabase"

interface LoginProps {
  onLogin: () => void
}

type View = "welcome" | "login" | "register"

const slideVariants = {
  enterFromRight: { x: "100%", opacity: 0 },
  enterFromLeft:  { x: "-100%", opacity: 0 },
  center:         { x: 0, opacity: 1 },
  exitToLeft:     { x: "-100%", opacity: 0 },
  exitToRight:    { x: "100%", opacity: 0 },
}

/* ── Fundo compartilhado ── */
function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(#f0d08a 1px,transparent 1px),linear-gradient(90deg,#f0d08a 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#1b2947] opacity-70 blur-[80px]" />
      <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#f0d08a]/10 blur-[60px]" />
      <div className="absolute bottom-1/3 -left-20 h-60 w-60 rounded-full bg-[#3a5a9a]/25 blur-[50px]" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f0d08a]/8 to-transparent" />
    </div>
  )
}

/* ── Logo ── */
function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-[#f0d08a]/10 blur-3xl" />
        <img
          src={logoBalisticaDB}
          alt="BalísticaDB"
          className="relative z-10 w-72 object-contain drop-shadow-[0_0_28px_rgba(240,208,138,.18)]"
        />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white">
        Polícia Científica do Paraná
      </p>
    </div>
  )
}

export function Login({ onLogin }: LoginProps) {
  const [view, setView] = useState<View>("welcome")
  const [prevView, setPrevView] = useState<View>("welcome")

  const goTo = (next: View) => {
    setPrevView(view)
    setView(next)
  }

  const direction = (prev: View, curr: View): "left" | "right" => {
    const order: View[] = ["welcome", "login", "register"]
    return order.indexOf(curr) > order.indexOf(prev) ? "left" : "right"
  }

  const dir = direction(prevView, view)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080f1e]">
      <Background />

      <AnimatePresence mode="wait">
        {view === "welcome" && (
          <motion.div key="welcome"
            className="relative z-10 flex w-full max-w-[360px] flex-col items-center px-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <WelcomeScreen onGoLogin={() => goTo("login")} onGoRegister={() => goTo("register")} />
          </motion.div>
        )}

        {view === "login" && (
          <motion.div key="login"
            className="relative z-10 flex w-full max-w-[360px] flex-col items-center px-5"
            variants={slideVariants}
            initial={dir === "left" ? "enterFromRight" : "enterFromLeft"}
            animate="center"
            exit={dir === "left" ? "exitToLeft" : "exitToRight"}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <LoginScreen onLogin={onLogin} onBack={() => goTo("welcome")} />
          </motion.div>
        )}

        {view === "register" && (
          <motion.div key="register"
            className="relative z-10 flex w-full max-w-[360px] flex-col items-center px-5"
            variants={slideVariants}
            initial={dir === "left" ? "enterFromRight" : "enterFromLeft"}
            animate="center"
            exit={dir === "left" ? "exitToLeft" : "exitToRight"}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <RegisterScreen onBack={() => goTo("welcome")} onSuccess={() => goTo("login")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════
   TELA DE BOAS-VINDAS
══════════════════════════════════════════ */
function WelcomeScreen({ onGoLogin, onGoRegister }: { onGoLogin: () => void; onGoRegister: () => void }) {
  return (
    <div className="flex w-full flex-col items-center">
      <Logo />

      <div className="mt-12 w-full space-y-3">
        {/* Entrar */}
        <button type="button" onClick={onGoLogin}
          className="w-full rounded-2xl py-[15px] text-[13px] font-black tracking-[0.24em] text-[#0d1829] shadow-[0_8px_32px_rgba(240,208,138,.22)] transition active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #f5dc98 0%, #d4a832 45%, #f0d08a 100%)" }}>
          ENTRAR
        </button>

        {/* Registrar */}
        <button type="button" onClick={onGoRegister}
          className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] py-[15px] text-[13px] font-black tracking-[0.24em] text-[#c8ddf0] transition active:scale-[0.98] active:bg-white/[0.1]">
          CRIAR CONTA
        </button>
      </div>

      <Footer />
    </div>
  )
}

/* ══════════════════════════════════════════
   TELA DE LOGIN
══════════════════════════════════════════ */
function LoginScreen({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [senhaFocused, setSenhaFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setErro("Informe o e-mail institucional."); return }
    if (!senha.trim()) { setErro("Informe a senha de acesso."); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErro("Formato de e-mail inválido."); return }
    setErro(""); setLoading(true)

    // Modo offline — Supabase não configurado
    if (!supabaseAtivo || !supabase) {
      setLoading(false)
      onLogin()
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    setLoading(false)

    if (error) {
      if (error.message.includes("Invalid login")) {
        setErro("E-mail ou senha incorretos.")
      } else if (error.message.includes("Email not confirmed")) {
        setErro("Confirme seu e-mail antes de entrar.")
      } else {
        setErro("Erro ao entrar. Tente novamente.")
      }
      return
    }

    onLogin()
  }

  return (
    <div className="w-full">
      {/* Voltar + Logo compacto */}
      <div className="mb-8 flex items-center gap-4">
        <button type="button" onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] text-[#8aa4c0] transition active:bg-white/[0.12]">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="text-[18px] font-black tracking-[0.1em] text-[#f0d08a]">Entrar</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#5a7090]">Acesso à conta</div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0f1c32] shadow-[0_24px_64px_rgba(0,0,0,.6)]">
        <div className="border-b border-white/[0.08] bg-white/[0.04] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-[#f0d08a]/60" />
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[#a0b4cc]">Acesso restrito</span>
          </div>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#8aa4c0]">E-mail</label>
              <div className={`relative transition-all duration-200 ${emailFocused ? "drop-shadow-[0_0_16px_rgba(240,208,138,.14)]" : ""}`}>
                <Mail className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${emailFocused ? "text-[#f0d08a]/80" : "text-[#6a80a0]"}`} />
                <input type="email" autoComplete="email" value={email}
                  onChange={e => { setEmail(e.target.value); setErro("") }}
                  onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                  placeholder="usuario@pcpr.pr.gov.br"
                  className="h-[52px] w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] pl-11 pr-4 text-[15px] text-white placeholder:text-[#4a6080] outline-none transition-all focus:border-[#f0d08a]/40 focus:bg-white/[0.1]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#8aa4c0]">Senha</label>
              <div className={`relative transition-all duration-200 ${senhaFocused ? "drop-shadow-[0_0_16px_rgba(240,208,138,.14)]" : ""}`}>
                <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${senhaFocused ? "text-[#f0d08a]/80" : "text-[#6a80a0]"}`} />
                <input type={showSenha ? "text" : "password"} autoComplete="current-password" value={senha}
                  onChange={e => { setSenha(e.target.value); setErro("") }}
                  onFocus={() => setSenhaFocused(true)} onBlur={() => setSenhaFocused(false)}
                  placeholder="••••••••"
                  className="h-[52px] w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] pl-11 pr-12 text-[15px] text-white placeholder:text-[#4a6080] outline-none transition-all focus:border-[#f0d08a]/40 focus:bg-white/[0.1]" />
                <button type="button" onClick={() => setShowSenha(v => !v)} tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-[#6a80a0] transition active:text-[#f0d08a]">
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[12px] font-semibold text-[#6a8aaa] transition active:text-[#f0d08a]">
                Esqueci minha senha
              </button>
            </div>

            <AnimatePresence>
              {erro && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-400/25 bg-red-500/15 px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span className="text-[13px] font-semibold text-red-300">{erro}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full rounded-2xl py-[15px] text-[13px] font-black tracking-[0.24em] text-[#0d1829] shadow-[0_8px_32px_rgba(240,208,138,.22)] transition active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f5dc98 0%,#d4a832 45%,#f0d08a 100%)" }}>
              <span className="flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    VERIFICANDO…
                  </>
                ) : "ENTRAR"}
              </span>
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

/* ══════════════════════════════════════════
   TELA DE REGISTRO
══════════════════════════════════════════ */
function RegisterScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [nome, setNome] = useState("")
  const [matricula, setMatricula] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirma, setConfirma] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) { setErro("Informe seu nome completo."); return }
    if (!matricula.trim()) { setErro("Informe a matrícula funcional."); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErro("E-mail inválido."); return }
    if (senha.length < 6) { setErro("A senha deve ter ao menos 6 caracteres."); return }
    if (senha !== confirma) { setErro("As senhas não coincidem."); return }
    setErro(""); setLoading(true)

    // Modo offline — Supabase não configurado
    if (!supabaseAtivo || !supabase) {
      localStorage.setItem("balisticadb_nome_perito", nome.trim())
      setLoading(false)
      setSucesso(true)
      await new Promise(r => setTimeout(r, 1500))
      onSuccess()
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: {
          nome: nome.trim(),
          matricula: matricula.trim(),
        },
      },
    })

    setLoading(false)

    if (error) {
      if (error.message.includes("already registered")) {
        setErro("Este e-mail já está cadastrado.")
        return
      }
      // Conta criada mas e-mail de confirmação falhou (servidor sem SMTP)
      // A conta existe no banco — confirmar via SQL e fazer login
      if (error.status === 500 || error.message.includes("sending confirmation")) {
        setSucesso(true)
        await new Promise(r => setTimeout(r, 1500))
        onSuccess()
        return
      }
      setErro("Erro ao criar conta. Tente novamente.")
      return
    }

    setSucesso(true)
    await new Promise(r => setTimeout(r, 1500))
    onSuccess()
  }

  if (sucesso) {
    return (
      <motion.div className="flex w-full flex-col items-center gap-6 py-8"
        initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#4caf80]/30 bg-[#1a3028] shadow-[0_0_40px_rgba(76,175,128,.15)]">
          <BadgeCheck className="h-10 w-10 text-[#4cca88]" />
        </div>
        <div className="text-center">
          <div className="text-[18px] font-black text-[#4cca88]">Conta criada!</div>
          <div className="mt-1 text-[13px] text-[#5a8070]">Redirecionando para o login…</div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      {/* Voltar */}
      <div className="mb-8 flex items-center gap-4">
        <button type="button" onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] text-[#8aa4c0] transition active:bg-white/[0.12]">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="text-[18px] font-black tracking-[0.1em] text-[#f0d08a]">Criar conta</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#5a7090]">Novo usuário</div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0f1c32] shadow-[0_24px_64px_rgba(0,0,0,.6)]">
        <div className="border-b border-white/[0.08] bg-white/[0.04] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-[#f0d08a]/60" />
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[#a0b4cc]">Cadastro de acesso</span>
          </div>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

            {/* Nome */}
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#8aa4c0]">Nome completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a80a0]" />
                <input type="text" autoComplete="name" value={nome}
                  onChange={e => { setNome(e.target.value); setErro("") }}
                  placeholder="Ex.: João da Silva"
                  className="h-[52px] w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] pl-11 pr-4 text-[15px] text-white placeholder:text-[#4a6080] outline-none transition-all focus:border-[#f0d08a]/40 focus:bg-white/[0.1]" />
              </div>
            </div>

            {/* Matrícula */}
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#8aa4c0]">Matrícula funcional</label>
              <div className="relative">
                <BadgeCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a80a0]" />
                <input type="text" value={matricula}
                  onChange={e => { setMatricula(e.target.value); setErro("") }}
                  placeholder="Ex.: 12345-6"
                  className="h-[52px] w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] pl-11 pr-4 text-[15px] text-white placeholder:text-[#4a6080] outline-none transition-all focus:border-[#f0d08a]/40 focus:bg-white/[0.1]" />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#8aa4c0]">E-mail institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a80a0]" />
                <input type="email" autoComplete="email" value={email}
                  onChange={e => { setEmail(e.target.value); setErro("") }}
                  placeholder="usuario@pcpr.pr.gov.br"
                  className="h-[52px] w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] pl-11 pr-4 text-[15px] text-white placeholder:text-[#4a6080] outline-none transition-all focus:border-[#f0d08a]/40 focus:bg-white/[0.1]" />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#8aa4c0]">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a80a0]" />
                <input type={showSenha ? "text" : "password"} autoComplete="new-password" value={senha}
                  onChange={e => { setSenha(e.target.value); setErro("") }}
                  placeholder="Mínimo 6 caracteres"
                  className="h-[52px] w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] pl-11 pr-12 text-[15px] text-white placeholder:text-[#4a6080] outline-none transition-all focus:border-[#f0d08a]/40 focus:bg-white/[0.1]" />
                <button type="button" onClick={() => setShowSenha(v => !v)} tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-[#6a80a0] transition active:text-[#f0d08a]">
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[#8aa4c0]">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a80a0]" />
                <input type={showSenha ? "text" : "password"} autoComplete="new-password" value={confirma}
                  onChange={e => { setConfirma(e.target.value); setErro("") }}
                  placeholder="Repita a senha"
                  className="h-[52px] w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] pl-11 pr-4 text-[15px] text-white placeholder:text-[#4a6080] outline-none transition-all focus:border-[#f0d08a]/40 focus:bg-white/[0.1]" />
              </div>
            </div>

            <AnimatePresence>
              {erro && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-400/25 bg-red-500/15 px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span className="text-[13px] font-semibold text-red-300">{erro}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full rounded-2xl py-[15px] text-[13px] font-black tracking-[0.24em] text-[#0d1829] shadow-[0_8px_32px_rgba(240,208,138,.22)] transition active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f5dc98 0%,#d4a832 45%,#f0d08a 100%)" }}>
              <span className="flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    CRIANDO CONTA…
                  </>
                ) : "CRIAR CONTA"}
              </span>
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

/* ── Rodapé ── */
function Footer() {
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Sistema Interno v1.0</span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
      </div>
      <p className="mt-2 text-[11px] font-bold tracking-wide text-white">© {new Date().getFullYear()} Polícia Científica do Paraná</p>
    </div>
  )
}
