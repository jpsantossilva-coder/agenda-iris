import { useState, type FormEvent } from 'react'

/** Traduz o erro do servidor em uma frase calma. Nunca mostra o texto técnico. */
export function loginErrorMessage(raw: string): string {
  const m = raw.toLowerCase()
  if (m.includes('confirm')) return 'Esse e-mail ainda não foi confirmado. Peça ao João para confirmar.'
  if (m.includes('fetch') || m.includes('network')) return 'Sem internet por aqui. Confira a conexão e tente de novo.'
  if (m.includes('api key')) return 'O app não conseguiu se conectar. Avise o João.'
  return 'E-mail ou senha não conferem.'
}

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
    const res = await onSignIn(email.trim().toLowerCase(), password)
    setBusy(false)
    if (res.error) setError(loginErrorMessage(res.error))
  }

  return (
    <main style={{ maxWidth: 360, margin: '0 auto', padding: '64px 24px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Agenda da Iris</h1>
      <form onSubmit={submit} method="post" style={{ display: 'grid', gap: 12 }}>
        <label>
          E-mail
          <input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, boxSizing: 'border-box', fontSize: 16 }}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, boxSizing: 'border-box', fontSize: 16 }}
          />
        </label>
        {error && <p role="alert" style={{ margin: 0 }}>{error}</p>}
        <button type="submit" disabled={busy} style={{ padding: 12, borderRadius: 12, border: 0, background: 'var(--terracota-forte)', color: '#fff', fontSize: 16 }}>
          Entrar
        </button>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
          Você continua conectada neste aparelho. Se o iPhone oferecer, deixe ele salvar a senha.
        </p>
      </form>
    </main>
  )
}
