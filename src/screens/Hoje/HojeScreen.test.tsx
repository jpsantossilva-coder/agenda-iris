import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, afterEach } from 'vitest'
import { clearMatchMedia, mockReducedMotion } from '../../test/motion'
import HojeScreen from './HojeScreen'
import { utcToLocal } from '../../domain/dates'
import { ClockProvider, RepoProvider } from '../../app/context'
import { makeMemoryRepos } from '../../data/memoryRepos'
import type { NewTask } from '../../data/repos'

const TERCA_8H = new Date('2026-11-10T11:00:00Z') // 08:00 em Brasília
const TERCA_13H = new Date('2026-11-10T16:00:00Z')

const base: NewTask = {
  title: 'x', area: 'trabalho', date: '2026-11-10', time: null,
  estimateMin: null, remindMinBefore: 15, repeat: null,
}

function setup(now = TERCA_8H) {
  const repos = makeMemoryRepos()
  render(
    <MemoryRouter>
      <ClockProvider now={() => now}>
        <RepoProvider repos={repos}>
          <HojeScreen />
        </RepoProvider>
      </ClockProvider>
    </MemoryRouter>,
  )
  return repos
}

afterEach(() => clearMatchMedia())

describe('HojeScreen', () => {
  it('cumprimenta pelo nome e pelo horário', async () => {
    const repos = makeMemoryRepos()
    await repos.settings.save({ displayName: 'Iris', morningTime: '07:00', defaultRemindMin: 15 })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_13H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: 'Boa tarde, Iris' })).toBeInTheDocument()
  })

  it('mostra a data de hoje por extenso abaixo da saudação', async () => {
    setup()
    expect(await screen.findByText('terça, 10 de novembro')).toBeInTheDocument()
  })

  it('sem nome cumprimenta só com Bom dia', async () => {
    setup()
    expect(await screen.findByRole('heading', { name: 'Bom dia' })).toBeInTheDocument()
  })

  it('lista as tarefas de hoje em ordem de horário, com tempo estimado, e sem horário por último', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Conferir folha', time: '10:30', estimateMin: 60 })
    await repos.tasks.create({ ...base, title: 'Lançar atestados', time: '09:00', estimateMin: 40 })
    await repos.tasks.create({ ...base, title: 'Ideia solta' })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    const fita = await screen.findByRole('list', { name: 'Dia' })
    const itens = within(fita).getAllByRole('listitem')
    expect(itens.map((li) => li.textContent)).toEqual([
      expect.stringContaining('Lançar atestados'),
      expect.stringContaining('Conferir folha'),
      expect.stringContaining('Ideia solta'),
    ])
    expect(itens[0]).toHaveTextContent('40 min')
    expect(itens[1]).toHaveTextContent('1h')
  })

  it('com 420 min mostra aviso calmo, sem estilo de alerta', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Grande', estimateMin: 420 })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    const aviso = await screen.findByText(/Hoje é um dia cheio/)
    expect(aviso.className).not.toMatch(/alert|erro|perigo|vermelho/i)
  })

  it('mostra a soma do que o dia exige', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'A', estimateMin: 60 })
    await repos.tasks.create({ ...base, title: 'B', estimateMin: 90 })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    expect(await screen.findByText('Hoje: 2h30 de coisas')).toBeInTheDocument()
  })

  it('com pouca coisa não mostra o aviso de dia cheio', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Pequena', estimateMin: 30 })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    await screen.findByText('Pequena')
    expect(screen.queryByText(/Hoje é um dia cheio/)).not.toBeInTheDocument()
  })

  it('mostra tarefas adiadas com convite gentil, e nada quando não há', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'A', date: '2026-11-08' })
    await repos.tasks.create({ ...base, title: 'B', date: '2026-11-07' })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    const link = await screen.findByRole('link', { name: '2 tarefas adiadas, quer reagendar?' })
    expect(link.className).not.toMatch(/alert|erro|perigo|vermelho/i)
  })

  it('sem adiadas, nenhum convite aparece', async () => {
    setup()
    await screen.findByRole('heading', { name: 'Bom dia' })
    expect(screen.queryByText(/adiada/)).not.toBeInTheDocument()
  })

  it('marca home office com um toque, mantém as tarefas e dá para voltar a presencial (Review Focus 4)', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Conferir folha', time: '10:30' })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    await screen.findByText('Conferir folha')
    expect(screen.getByRole('button', { name: 'Presencial' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Home office' }))
    await waitFor(async () => expect(await repos.dayModes.get('2026-11-10')).toBe('home'))
    expect(await screen.findByRole('button', { name: /terça 10, home office/ })).toBeInTheDocument()
    expect(screen.getByText('Conferir folha')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Presencial' }))
    await waitFor(async () => expect(await repos.dayModes.get('2026-11-10')).toBe('presencial'))
    expect(screen.getByText('Conferir folha')).toBeInTheDocument()
  })

  it('mostra as anotações de hoje como post-its, e não as de outros dias', async () => {
    const repos = makeMemoryRepos()
    await repos.notes.create({ text: 'ligar pro contador', color: '#fff3a8', date: '2026-11-10' })
    await repos.notes.create({ text: 'outra data', color: '#fff3a8', date: '2026-11-11' })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    expect(await screen.findByText('ligar pro contador')).toBeInTheDocument()
    expect(screen.queryByText('outra data')).not.toBeInTheDocument()
  })

  it('o ciclo de novembro continua valendo no começo de dezembro', async () => {
    const repos = makeMemoryRepos()
    await repos.closing.save({ month: '2026-11', steps: [{ id: 'v', label: 'Virada', date: '2026-12-02' }] })
    render(
      <MemoryRouter><ClockProvider now={() => new Date('2026-12-01T11:00:00Z')}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    expect(await screen.findByText('Fechamento: falta 1 dia · Virada')).toBeInTheDocument()
  })

  it('mostra a contagem do fechamento de folha', async () => {
    const repos = makeMemoryRepos()
    await repos.closing.save({ month: '2026-11', steps: [{ id: 'a', label: 'Lançar atestados', date: '2026-11-12' }] })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    expect(await screen.findByText('Fechamento: faltam 2 dias · Lançar atestados')).toBeInTheDocument()
  })

  it('concluir na Hoje risca a tarefa com a caneta', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'A', time: '09:00' })
    await repos.tasks.create({ ...base, title: 'B', time: '10:00' })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Concluir A' }))
    await waitFor(async () => expect((await repos.tasks.list()).find((t) => t.title === 'A')?.doneAt).not.toBeNull())
    expect(screen.getByText('A').closest('.mi-strike')).toHaveClass('go')
    expect(screen.queryByText('Dia fechado! ♡')).not.toBeInTheDocument()
  })

  it('só a última tarefa do dia dispara a chuva de botões', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'A', time: '09:00' })
    await repos.tasks.create({ ...base, title: 'B', time: '10:00' })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Concluir A' }))
    await waitFor(async () => expect((await repos.tasks.list()).find((t) => t.title === 'A')?.doneAt).not.toBeNull())
    expect(screen.queryByText('Dia fechado! ♡')).not.toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Concluir B' }))
    expect(await screen.findByText('Dia fechado! ♡')).toBeInTheDocument()
  })

  it('dar baixa num post-it bate o carimbo, tira a nota e oferece Desfazer', async () => {
    mockReducedMotion(true)
    const repos = makeMemoryRepos()
    await repos.notes.create({ text: 'ligar pro contador', color: '#fff3a8', date: '2026-11-10' })
    render(
      <MemoryRouter><ClockProvider now={() => TERCA_8H}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Dar baixa em ligar pro contador' }))
    await waitFor(async () => expect(await repos.notes.list()).toHaveLength(0))
    await userEvent.click(await screen.findByRole('button', { name: 'Desfazer' }))
    await waitFor(async () => expect(await repos.notes.list()).toHaveLength(1))
  })

  it('post-it recém criado cai na tela; os antigos já aparecem parados', async () => {
    const hoje = utcToLocal(new Date()).date
    const repos = makeMemoryRepos()
    const velho = await repos.notes.create({ text: 'velho', color: '#fff3a8', date: hoje })
    await repos.notes.update(velho.id, { createdAt: '2026-01-01T10:00:00Z' })
    await repos.notes.create({ text: 'novo', color: '#fff3a8', date: hoje })
    render(
      <MemoryRouter><ClockProvider now={() => new Date()}><RepoProvider repos={repos}><HojeScreen /></RepoProvider></ClockProvider></MemoryRouter>,
    )
    const novo = await screen.findByText('novo')
    await waitFor(() => expect(novo.closest('.mi-drop')).toHaveClass('go'))
    expect(screen.getByText('velho').closest('.mi-drop')).not.toHaveClass('go')
  })
})
