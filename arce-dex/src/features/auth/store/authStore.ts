import { create } from 'zustand'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { getSupabase, hasStoredSession, isSupabaseConfigured } from '@/shared/services/supabase/client'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

type AuthStore = {
  status: AuthStatus
  session: Session | null
  user: User | null
}

// Only a visitor with a saved session starts out "loading"; everyone else is anonymous right
// away and never downloads supabase-js unless they open the login form.
const startsWithSession = isSupabaseConfigured && hasStoredSession()

export const useAuthStore = create<AuthStore>(() => ({
  status: startsWithSession ? 'loading' : 'anonymous',
  session: null,
  user: null,
}))

let listening = false

/** Loads the Supabase client (if needed) and starts tracking the session. Safe to call often. */
export async function connectAuth(): Promise<SupabaseClient | null> {
  const client = await getSupabase()

  if (client && !listening) {
    listening = true
    client.auth.onAuthStateChange((_event, session) => {
      useAuthStore.setState({
        status: session ? 'authenticated' : 'anonymous',
        session,
        user: session?.user ?? null,
      })
    })
  }

  return client
}

if (startsWithSession) {
  void connectAuth()
}
