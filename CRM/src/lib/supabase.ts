import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://ewagpvjsimhsxykqsddo.supabase.co"

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ""

/**
 * Standard Supabase client using public / publishable anon key.
 * Safe for client-side or public server actions.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey || supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

/**
 * Supabase Admin client with service_role / secret privileges.
 * Server-only; use for administrative functions, batch tasks, or bypass RLS.
 */
export function getSupabaseAdmin() {
  const key = supabaseSecretKey || supabaseAnonKey
  if (!key) {
    throw new Error("SUPABASE_SECRET_KEY or SUPABASE_PUBLISHABLE_KEY must be provided")
  }
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
