import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import LoginScreen, { loginErrorMessage } from './LoginScreen'

describe('LoginScreen: campos para o iPhone salvar a senha', () => {
  it('o e-mail pede teclado de e-mail, sem maiúscula automática e com preenchimento de usuário', () => {
    render(<LoginScreen onSignIn={async () => ({})} />)
    const email = screen.getByLabelText('E-mail')
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('name', 'email')
    expect(email).toHaveAttribute('autocomplete', 'username')
    expect(email).toHaveAttribute('autocapitalize', 'none')
    expect(email).toHaveAttribute('autocorrect', 'off')
  })

  it('a senha usa o preenchimento de senha atual', () => {
    render(<LoginScreen onSignIn={async () => ({})} />)
    const senha = screen.getByLabelText('Senha')
    expect(senha).toHaveAttribute('type', 'password')
    expect(senha).toHaveAttribute('name', 'password')
    expect(senha).toHaveAttribute('autocomplete', 'current-password')
  })

  it('os campos ficam dentro de um formulário que entra com Enter', async () => {
    const onSignIn = vi.fn(async () => ({}))
    render(<LoginScreen onSignIn={onSignIn} />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo{enter}')
    expect(onSignIn).toHaveBeenCalledTimes(1)
  })

  it('o e-mail vai para o servidor sem espaços e em minúsculas', async () => {
    const onSignIn = vi.fn(async () => ({}))
    render(<LoginScreen onSignIn={onSignIn} />)
    await userEvent.type(screen.getByLabelText('E-mail'), '  Iris@Gmail.COM ')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(onSignIn).toHaveBeenCalledWith('iris@gmail.com', 'segredo')
  })

  it('avisa que ela continua conectada neste aparelho', () => {
    render(<LoginScreen onSignIn={async () => ({})} />)
    expect(screen.getByText(/continua conectada neste aparelho/)).toBeInTheDocument()
  })
})

describe('loginErrorMessage', () => {
  it('credenciais erradas', () => {
    expect(loginErrorMessage('Invalid login credentials')).toBe('E-mail ou senha não conferem.')
  })
  it('e-mail não confirmado', () => {
    expect(loginErrorMessage('Email not confirmed')).toMatch(/não foi confirmado/)
  })
  it('sem internet', () => {
    expect(loginErrorMessage('Failed to fetch')).toMatch(/internet/)
  })
  it('chave de configuração inválida avisa para chamar o João, sem culpar a senha', () => {
    expect(loginErrorMessage('Invalid API key')).toMatch(/João/)
  })
  it('qualquer outro erro vira a mensagem de senha, em tom calmo', () => {
    expect(loginErrorMessage('invalid')).toBe('E-mail ou senha não conferem.')
  })
})
