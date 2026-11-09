import { useState, type FormEvent } from 'react'

export default function LoginScreen({
  onSignIn,
}: {
  onSignIn: (email: string, password: string) => Promise<{ error?: string }>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await onSignIn(email.trim(), password)
    setBusy(false)
    if (res.error) setError('E-mail ou senha não conferem.')
  }

  return (
    <main style={{ maxWidth: 360, margin: '0 auto', padding: '64px 24px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Agenda da Iris</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>
          E-mail
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, boxSizing: 'border-box' }} />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, boxSizing: 'border-box' }} />
        </label>
        {error && <p role="alert" style={{ margin: 0 }}>{error}</p>}
        <button type="submit" disabled={busy} style={{ padding: 12, borderRadius: 12, border: 0, background: 'var(--terracota-forte)', color: '#fff', fontSize: 16 }}>
          Entrar
        </button>
      </form>
    </main>
  )
}
