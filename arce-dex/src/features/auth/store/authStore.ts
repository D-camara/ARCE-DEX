import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/shared/services/supabase/client'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

type AuthStore = {
  status: AuthStatus
  session: Session | null
  user: User | null
}

export const useAuthStore = create<AuthStore>(() => ({
  status: supabase ? 'loading' : 'anonymous',
  session: null,
  user: null,
}))

supabase?.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    status: session ? 'authenticated' : 'anonymous',
    session,
    user: session?.user ?? null,
  })
})
