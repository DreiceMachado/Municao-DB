import { createClient } from "@supabase/supabase-js"

// Preencha após configurar o Supabase (cloud ou self-hosted)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ""
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

export const supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null  // null enquanto o servidor não estiver configurado

export function supabaseDisponivel() {
  return supabase !== null && SUPABASE_URL !== ""
}
