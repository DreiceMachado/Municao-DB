import { createClient } from "@supabase/supabase-js"

const RAW_URL = import.meta.env.VITE_SUPABASE_URL ?? ""
// "@origin": app e banco no MESMO endereço (o servidor repassa /db → Supabase).
// Usado no build de produção (.env.production) para ter UM link só via ngrok.
// Resolvido no navegador a partir de window.location; vazio fora do navegador.
const SUPABASE_URL =
  RAW_URL === "@origin"
    ? (typeof window !== "undefined" ? `${window.location.origin}/db` : "")
    : RAW_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

// null quando .env não estiver configurado (modo offline puro)
export const supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,      // salva sessão no localStorage
        autoRefreshToken: true,    // renova token automaticamente
        detectSessionInUrl: false, // não usa OAuth redirect
      },
      global: {
        headers: {
          // Ignora a página de aviso do ngrok, que senão quebraria o sync
          // quando o Supabase é acessado por um túnel *.ngrok-free.app.
          // Inofensivo quando não se usa ngrok.
          "ngrok-skip-browser-warning": "true",
        },
      },
    })
  : null

export const supabaseAtivo = supabase !== null
