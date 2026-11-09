import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import NotificacoesCard from './NotificacoesCard'

describe('NotificacoesCard', () => {
  it('no iPhone sem instalar, explica como adicionar à Tela de Início', async () => {
    render(<NotificacoesCard subscribe={vi.fn(async () => 'needs-install' as const)} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ativar notificações' }))
    expect(await screen.findByText(/Adicionar à Tela de Início/)).toBeInTheDocument()
  })

  it('permissão negada explica como mudar nos Ajustes, sem culpa', async () => {
    render(<NotificacoesCard subscribe={vi.fn(async () => 'denied' as const)} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ativar notificações' }))
    expect(await screen.findByText(/Ajustes/)).toBeInTheDocument()
  })

  it('sem suporte avisa que o app segue funcionando', async () => {
    render(<NotificacoesCard subscribe={vi.fn(async () => 'unsupported' as const)} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ativar notificações' }))
    expect(await screen.findByText(/continua funcionando/)).toBeInTheDocument()
  })

  it('autorizado confirma', async () => {
    render(<NotificacoesCard subscribe={vi.fn(async () => 'granted' as const)} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ativar notificações' }))
    expect(await screen.findByText('Notificações ativadas.')).toBeInTheDocument()
  })

  it('erro inesperado mostra mensagem calma e não quebra a tela', async () => {
    render(<NotificacoesCard subscribe={vi.fn(async () => { throw new Error('boom') })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ativar notificações' }))
    expect(await screen.findByText(/Não deu para ativar agora/)).toBeInTheDocument()
  })
})
