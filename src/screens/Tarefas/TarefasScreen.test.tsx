import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import TarefasScreen from './TarefasScreen'
import { renderApp } from '../../test/render'
import { makeMemoryRepos } from '../../data/memoryRepos'
import type { NewTask } from '../../data/repos'

const base: NewTask = {
  title: 'x', area: 'trabalho', date: '2026-11-09', time: null,
  estimateMin: null, remindMinBefore: 15, repeat: null,
}

afterEach(() => vi.useRealTimers())

describe('TarefasScreen', () => {
  it('separa Abertas e Concluídas', async () => {
    const repos = makeMemoryRepos()
    const a = await repos.tasks.create({ ...base, title: 'Aberta' })
    const b = await repos.tasks.create({ ...base, title: 'Feita' })
    await repos.tasks.update(b.id, { doneAt: '2026-11-09T10:00:00Z' })
    renderApp(<TarefasScreen />, { repos })
    expect(await screen.findByText('Aberta')).toBeInTheDocument()
    expect(screen.queryByText('Feita')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: 'Concluídas' }))
    expect(screen.getByText('Feita')).toBeInTheDocument()
    expect(screen.queryByText(a.title)).not.toBeInTheDocument()
  })

  it('a busca filtra por título, sem diferenciar acento nem maiúscula', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Lançar atestados' })
    await repos.tasks.create({ ...base, title: 'Comprar linha' })
    renderApp(<TarefasScreen />, { repos })
    await screen.findByText('Comprar linha')
    await userEvent.type(screen.getByLabelText('Buscar'), 'ATESTADO')
    expect(screen.getByText('Lançar atestados')).toBeInTheDocument()
    expect(screen.queryByText('Comprar linha')).not.toBeInTheDocument()
  })

  it('tarefas vencidas aparecem numa seção discreta "Adiadas"', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Velha', date: '2026-11-05' })
    renderApp(<TarefasScreen />, { repos })
    const h = await screen.findByRole('heading', { name: 'Adiadas' })
    expect(h.className).not.toMatch(/alert|erro|perigo|vermelho/i)
    expect(screen.getByText('Velha')).toBeInTheDocument()
  })

  it('concluir tarefa simples a move para Concluídas', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Fazer' })
    renderApp(<TarefasScreen />, { repos })
    await userEvent.click(await screen.findByRole('button', { name: 'Concluir Fazer' }))
    await waitFor(async () => expect((await repos.tasks.list())[0].doneAt).not.toBeNull())
    expect(screen.queryByText('Fazer')).not.toBeInTheDocument()
  })

  it('concluir uma tarefa que se repete grava só o dia de hoje (Review Focus 2)', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Curso de costura', date: '2026-11-07', repeat: { freq: 'weekly', weekdays: [6] } })
    renderApp(<TarefasScreen />, { repos, now: new Date('2026-11-14T17:00:00Z') })
    await userEvent.click(await screen.findByRole('button', { name: 'Concluir Curso de costura' }))
    await waitFor(async () => expect((await repos.tasks.list())[0].doneDates).toEqual(['2026-11-14']))
    expect((await repos.tasks.list())[0].doneAt).toBeNull()
    expect(screen.getByText('Curso de costura')).toBeInTheDocument()
  })

  it('excluir mostra Desfazer por 5 segundos; desfazer restaura', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Apagar' })
    renderApp(<TarefasScreen />, { repos })
    fireEvent.click(await screen.findByRole('button', { name: 'Excluir Apagar' }))
    const desfazer = await screen.findByRole('button', { name: 'Desfazer' })
    // A tesoura corta primeiro: a etiqueta só some depois do corte, mas o Desfazer já está lá.
    expect(screen.getByText('Apagar')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Apagar')).not.toBeInTheDocument(), { timeout: 2500 })
    fireEvent.click(desfazer)
    expect(await screen.findByText('Apagar')).toBeInTheDocument()
    expect(await repos.tasks.list()).toHaveLength(1)
  })

  it('passados 5 segundos o Desfazer some e a tarefa continua apagada', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Apagar' })
    renderApp(<TarefasScreen />, { repos })
    const botao = await screen.findByRole('button', { name: 'Excluir Apagar' })
    vi.useFakeTimers()
    fireEvent.click(botao)
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })
    expect(screen.getByRole('button', { name: 'Desfazer' })).toBeInTheDocument()
    await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
    expect(screen.queryByRole('button', { name: 'Desfazer' })).not.toBeInTheDocument()
    expect(await repos.tasks.list()).toHaveLength(0)
  })

  it('editar abre o formulário preenchido e salva a mudança', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Antigo' })
    renderApp(<TarefasScreen />, { repos })
    await userEvent.click(await screen.findByRole('button', { name: 'Editar Antigo' }))
    const campo = screen.getByLabelText('Título')
    expect(campo).toHaveValue('Antigo')
    await userEvent.clear(campo)
    await userEvent.type(campo, 'Novo título')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Novo título')).toBeInTheDocument()
    expect((await repos.tasks.list())[0].title).toBe('Novo título')
  })
})
