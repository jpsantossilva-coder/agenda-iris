import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import AuthGate from './AuthGate'
import type { AuthPort } from './AuthGate'

function fakePort(initial: boolean, signInError?: string): AuthPort & { emit(v: boolean): void } {
  let session = initial
  const subs = new Set<(has: boolean) => void>()
  return {
    getSession: async () => session,
    onChange(cb) {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    signIn: async () => {
      if (signInError) return { error: signInError }
      session = true
      subs.forEach((cb) => cb(true))
      return {}
    },
    signOut: async () => {
      session = false
      subs.forEach((cb) => cb(false))
    },
    emit(v) {
      session = v
      subs.forEach((cb) => cb(v))
    },
  }
}

describe('AuthGate', () => {
  it('sem sessão mostra o login e não os filhos', async () => {
    render(<AuthGate port={fakePort(false)}><p>conteúdo</p></AuthGate>)
    expect(await screen.findByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
    expect(screen.queryByText(/criar conta/i)).not.toBeInTheDocument()
  })

  it('com sessão mostra os filhos', async () => {
    render(<AuthGate port={fakePort(true)}><p>conteúdo</p></AuthGate>)
    expect(await screen.findByText('conteúdo')).toBeInTheDocument()
  })

  it('login com erro mostra mensagem calma e continua no login', async () => {
    render(<AuthGate port={fakePort(false, 'invalid')}><p>conteúdo</p></AuthGate>)
    await userEvent.type(await screen.findByLabelText('E-mail'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'errada')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('E-mail ou senha não conferem.')).toBeInTheDocument()
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
  })

  it('login certo libera o conteúdo e sessão expirada volta ao login', async () => {
    const port = fakePort(false)
    render(<AuthGate port={port}><p>conteúdo</p></AuthGate>)
    await userEvent.type(await screen.findByLabelText('E-mail'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'certa')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('conteúdo')).toBeInTheDocument()
    act(() => port.emit(false))
    await waitFor(() => expect(screen.getByLabelText('E-mail')).toBeInTheDocument())
  })
})
