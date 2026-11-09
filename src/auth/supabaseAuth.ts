import { supabase } from '../lib/supabase'
import type { AuthPort } from './AuthGate'

export const supabaseAuth: AuthPort = {
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session !== null
  },
  onChange(cb) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session !== null))
    return () => data.subscription.unsubscribe()
  },
  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  },
  async signOut() {
    await supabase.auth.signOut()
  },
}
