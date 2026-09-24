import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não configuradas — login e sync entre dispositivos ficam desligados.',
  )
}

let clientPromise: Promise<SupabaseClient | null> | null = null

/**
 * supabase-js is ~80 KB gzip — about a quarter of the app — and login is optional, so it is
 * loaded on demand (once) instead of in the main bundle. Resolves to null when not configured.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) {
    return Promise.resolve(null)
  }

  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(supabaseUrl, supabaseAnonKey),
  )
  return clientPromise
}

/** supabase-js persists the session in localStorage as `sb-<project-ref>-auth-token`. */
export function hasStoredSession(): boolean {
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key?.startsWith('sb-') && key.endsWith('-auth-token')) {
        return true
      }
    }
  } catch {
    // Storage blocked (private mode, disabled cookies): behave as logged out.
  }
  return false
}
