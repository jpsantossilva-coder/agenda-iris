import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, ClockProvider, RepoProvider } from '../app/context'
import type { AuthPort } from '../auth/AuthGate'
import { makeMemoryRepos } from '../data/memoryRepos'
import type { Repos } from '../data/repos'

/** Segunda-feira, 09/11/2026, 08:00 em Brasília. */
export const SEGUNDA_8H = new Date('2026-11-09T11:00:00Z')

const authPadrao: AuthPort = {
  getSession: async () => true,
  onChange: () => () => {},
  signIn: async () => ({}),
  signOut: async () => {},
}

export function renderApp(
  ui: ReactElement,
  {
    repos = makeMemoryRepos(),
    now = SEGUNDA_8H,
    route = '/',
    auth = authPadrao,
  }: { repos?: Repos; now?: Date; route?: string; auth?: AuthPort } = {},
) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <ClockProvider now={() => now}>
        <AuthProvider port={auth}>
          <RepoProvider repos={repos}>{ui}</RepoProvider>
        </AuthProvider>
      </ClockProvider>
    </MemoryRouter>,
  )
  return repos
}
