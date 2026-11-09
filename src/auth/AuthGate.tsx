import { useEffect, useState, type ReactNode } from 'react'
import LoginScreen from './LoginScreen'

export interface AuthPort {
  getSession(): Promise<boolean>
  onChange(cb: (hasSession: boolean) => void): () => void
  signIn(email: string, password: string): Promise<{ error?: string }>
  signOut(): Promise<void>
}

export default function AuthGate({ port, children }: { port: AuthPort; children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'in' | 'out'>('loading')

  useEffect(() => {
    let alive = true
    port.getSession().then((has) => alive && setState(has ? 'in' : 'out'))
    const off = port.onChange((has) => setState(has ? 'in' : 'out'))
    return () => {
      alive = false
      off()
    }
  }, [port])

  if (state === 'loading') return <p style={{ padding: 24 }}>Carregando…</p>
  if (state === 'out') return <LoginScreen onSignIn={port.signIn} />
  return <>{children}</>
}
