import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import AppShell from './AppShell'
import { RepoProvider } from '../app/context'
import { makeMemoryRepos } from '../data/memoryRepos'

function renderShell() {
  return render(
    <MemoryRouter>
      <RepoProvider repos={makeMemoryRepos()}>
        <AppShell />
      </RepoProvider>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('a barra de baixo tem Hoje, Agenda, "+", Tarefas, Eu, nessa ordem', () => {
    renderShell()
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    const names = [...nav.querySelectorAll('a,button')].map((el) => el.getAttribute('aria-label') ?? el.textContent?.trim())
    expect(names).toEqual(['Hoje', 'Agenda', 'Novo', 'Tarefas', 'Eu'])
  })

  it('tocar em Agenda mostra a tela Agenda', async () => {
    renderShell()
    await userEvent.click(screen.getByRole('link', { name: 'Agenda' }))
    expect(screen.getByRole('heading', { name: 'Agenda' })).toBeInTheDocument()
  })

  it('o "+" abre a folha com Nova atividade e Anotação rápida', async () => {
    renderShell()
    await userEvent.click(screen.getByRole('button', { name: 'Novo' }))
    const sheet = screen.getByRole('dialog')
    expect(within(sheet).getByRole('button', { name: 'Nova atividade' })).toBeInTheDocument()
    expect(within(sheet).getByRole('button', { name: 'Anotação rápida' })).toBeInTheDocument()
  })

  it('fechar a folha a esconde', async () => {
    renderShell()
    await userEvent.click(screen.getByRole('button', { name: 'Novo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
