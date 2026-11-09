import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'
import { makeMemoryRepos } from './data/memoryRepos'
import type { AuthPort } from './auth/AuthGate'

const signedIn: AuthPort = {
  getSession: async () => true,
  onChange: () => () => {},
  signIn: async () => ({}),
  signOut: async () => {},
}

describe('App', () => {
  it('logada, mostra a aba Hoje', async () => {
    render(<App auth={signedIn} repos={makeMemoryRepos()} />)
    expect(await screen.findByRole('link', { name: 'Hoje' })).toBeInTheDocument()
  })
})
