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

  it('anotar leva 2 toques: "+" e "Salvar" (o texto já está em foco)', async () => {
    const repos = makeMemoryRepos()
    render(
      <MemoryRouter>
        <RepoProvider repos={repos}>
          <AppShell />
        </RepoProvider>
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Novo' }))
    await userEvent.keyboard('ligar pro contador')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect((await repos.tasks.list())[0].title).toBe('ligar pro contador')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('salvar uma atividade faz a mascote dizer "Tudo certo, agendado!"', async () => {
    renderShell()
    await userEvent.click(screen.getByRole('button', { name: 'Novo' }))
    await userEvent.keyboard('ligar pro contador')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Tudo certo, agendado!')).toBeInTheDocument()
  })

  it('salvar uma anotação rápida faz a mascote dizer "Anotado!"', async () => {
    renderShell()
    await userEvent.click(screen.getByRole('button', { name: 'Novo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Anotação rápida' }))
    await userEvent.type(screen.getByRole('textbox'), 'comprar linha')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Anotado!')).toBeInTheDocument()
  })

  it('fechar a folha a esconde', async () => {
    renderShell()
    await userEvent.click(screen.getByRole('button', { name: 'Novo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
