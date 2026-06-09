import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import BalisticaDB from './municaodb_interface_preview_corrigido'
import { Login } from './components/login/login'
import { supabase, supabaseAtivo } from './lib/supabase'
import { iniciarMonitorDeRede } from './lib/sync'
import './index.css'

function App() {
  // null = ainda verificando sessão | true = logado | false = deslogado
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    if (!supabaseAtivo || !supabase) {
      // Sem Supabase configurado — modo offline, entra direto
      setLoggedIn(false)
      return
    }

    // Verifica se já existe uma sessão salva no dispositivo
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session)
      if (session) iniciarMonitorDeRede()
    })

    // Escuta mudanças de autenticação (login, logout, token expirado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session)
        if (session) iniciarMonitorDeRede()
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (supabaseAtivo && supabase) {
      await supabase.auth.signOut()
    }
    setLoggedIn(false)
  }

  // Tela de carregamento enquanto verifica a sessão
  if (loggedIn === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080f1e]">
        <svg className="h-10 w-10 animate-spin text-[#f0d08a]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    )
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return <BalisticaDB onLogout={handleLogout} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
