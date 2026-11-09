import { createContext, useContext, type ReactNode } from 'react'
import type { AuthPort } from '../auth/AuthGate'
import type { Repos } from '../data/repos'
import { utcToLocal } from '../domain/dates'

const RepoContext = createContext<Repos | null>(null)

export function RepoProvider({ repos, children }: { repos: Repos; children: ReactNode }) {
  return <RepoContext.Provider value={repos}>{children}</RepoContext.Provider>
}

export function useRepos(): Repos {
  const repos = useContext(RepoContext)
  if (!repos) throw new Error('RepoProvider ausente')
  return repos
}

/** Relógio injetável para os testes. */
const ClockContext = createContext<() => Date>(() => new Date())

export function ClockProvider({ now, children }: { now: () => Date; children: ReactNode }) {
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>
}

export function useNow(): () => Date {
  return useContext(ClockContext)
}

/** Dia de hoje, em "YYYY-MM-DD" no horário de Brasília. */
export function useToday(): string {
  return utcToLocal(useNow()()).date
}

const AuthContext = createContext<AuthPort | null>(null)

export function AuthProvider({ port, children }: { port: AuthPort; children: ReactNode }) {
  return <AuthContext.Provider value={port}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthPort {
  const port = useContext(AuthContext)
  if (!port) throw new Error('AuthProvider ausente')
  return port
}
