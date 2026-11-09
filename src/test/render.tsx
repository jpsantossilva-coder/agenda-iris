import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ClockProvider, RepoProvider } from '../app/context'
import { makeMemoryRepos } from '../data/memoryRepos'
import type { Repos } from '../data/repos'

/** Segunda-feira, 09/11/2026, 08:00 em Brasília. */
export const SEGUNDA_8H = new Date('2026-11-09T11:00:00Z')

export function renderApp(
  ui: ReactElement,
  { repos = makeMemoryRepos(), now = SEGUNDA_8H, route = '/' }: { repos?: Repos; now?: Date; route?: string } = {},
) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <ClockProvider now={() => now}>
        <RepoProvider repos={repos}>{ui}</RepoProvider>
      </ClockProvider>
    </MemoryRouter>,
  )
  return repos
}
