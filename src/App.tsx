import { useMemo } from 'react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import AuthGate, { type AuthPort } from './auth/AuthGate'
import { supabaseAuth } from './auth/supabaseAuth'
import { RepoProvider } from './app/context'
import { makeSupabaseRepos } from './data/supabaseRepos'
import type { Repos } from './data/repos'
import AppShell from './shell/AppShell'

export default function App({ auth = supabaseAuth, repos }: { auth?: AuthPort; repos?: Repos }) {
  const r = useMemo(() => repos ?? makeSupabaseRepos(), [repos])
  // Nos testes (repos injetados) usa roteador em memória; no navegador, o de endereço.
  const Router = repos ? MemoryRouter : BrowserRouter
  return (
    <AuthGate port={auth}>
      <RepoProvider repos={r}>
        <Router>
          <AppShell />
        </Router>
      </RepoProvider>
    </AuthGate>
  )
}
