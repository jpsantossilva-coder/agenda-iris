import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import EuScreen from './EuScreen'
import { renderApp } from '../../test/render'
import { makeMemoryRepos } from '../../data/memoryRepos'
import type { AuthPort } from '../../auth/AuthGate'

describe('EuScreen: configurações', () => {
  it('salva nome, horário do resumo da manhã e lembrete padrão', async () => {
    const repos = renderApp(<EuScreen />)
    const nome = await screen.findByLabelText('Seu nome')
    expect(screen.getByLabelText('Horário do resumo da manhã')).toHaveValue('07:00')
    await userEvent.type(nome, 'Iris')
    fireEvent.change(screen.getByLabelText('Horário do resumo da manhã'), { target: { value: '06:45' } })
    fireEvent.change(screen.getByLabelText('Lembrete padrão (min antes)'), { target: { value: '20' } })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar configurações' }))
    await waitFor(async () =>
      expect(await repos.settings.get()).toEqual({ displayName: 'Iris', morningTime: '06:45', defaultRemindMin: 20 }),
    )
  })

  it('o atalho de leitura cria uma tarefa da área leitura', async () => {
    const repos = renderApp(<EuScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Adicionar bloco de leitura' }))
    await waitFor(async () => expect(await repos.tasks.list()).toHaveLength(1))
    expect((await repos.tasks.list())[0]).toMatchObject({ area: 'leitura', date: '2026-11-09' })
  })

  it('o atalho de descanso cria uma tarefa da área descanso', async () => {
    const repos = renderApp(<EuScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Adicionar bloco de descanso' }))
    await waitFor(async () => expect((await repos.tasks.list())[0]?.area).toBe('descanso'))
  })

  it('Sair encerra a sessão', async () => {
    const auth: AuthPort = { getSession: async () => true, onChange: () => () => {}, signIn: async () => ({}), signOut: vi.fn(async () => {}) }
    renderApp(<EuScreen />, { auth })
    await userEvent.click(await screen.findByRole('button', { name: 'Sair' }))
    expect(auth.signOut).toHaveBeenCalled()
  })
})

describe('EuScreen: finanças mínimas', () => {
  it('anota um gasto com valor (aceita vírgula) e sem valor', async () => {
    const repos = renderApp(<EuScreen />)
    await userEvent.type(await screen.findByLabelText('O que você quer anotar?'), 'mercado')
    await userEvent.type(screen.getByLabelText('Valor (opcional)'), '42,5')
    await userEvent.click(screen.getByRole('button', { name: 'Anotar' }))
    await userEvent.type(screen.getByLabelText('O que você quer anotar?'), 'pagar boleto da costura')
    await userEvent.click(screen.getByRole('button', { name: 'Anotar' }))
    await waitFor(async () => expect(await repos.money.list()).toHaveLength(2))
    const [a, b] = await repos.money.list()
    expect(a).toMatchObject({ text: 'mercado', amount: 42.5 })
    expect(b).toMatchObject({ text: 'pagar boleto da costura', amount: null })
    expect(await screen.findByText('R$ 42,50')).toBeInTheDocument()
  })

  it('não tem categorias nem total', async () => {
    renderApp(<EuScreen />)
    await screen.findByLabelText('O que você quer anotar?')
    expect(screen.queryByText(/categoria/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/total/i)).not.toBeInTheDocument()
  })

  it('edita e exclui com Desfazer', async () => {
    const repos = makeMemoryRepos()
    await repos.money.create({ text: 'mercado', amount: 10 })
    renderApp(<EuScreen />, { repos })
    await userEvent.click(await screen.findByRole('button', { name: 'Editar mercado' }))
    const campo = screen.getByLabelText('O que você quer anotar?')
    await userEvent.clear(campo)
    await userEvent.type(campo, 'feira')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar anotação' }))
    await waitFor(async () => expect((await repos.money.list())[0].text).toBe('feira'))
    await userEvent.click(await screen.findByRole('button', { name: 'Excluir feira' }))
    expect(await repos.money.list()).toHaveLength(0)
    await userEvent.click(await screen.findByRole('button', { name: 'Desfazer' }))
    await waitFor(async () => expect(await repos.money.list()).toHaveLength(1))
  })
})
