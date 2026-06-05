import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ""
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

// null quando .env não estiver configurado (modo offline puro)
export const supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,      // salva sessão no localStorage
        autoRefreshToken: true,    // renova token automaticamente
        detectSessionInUrl: false, // não usa OAuth redirect
      },
    })
  : null

export const supabaseAtivo = supabase !== null
