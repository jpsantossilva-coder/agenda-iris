import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeMemoryRepos } from '../data/memoryRepos'
import { clearMatchMedia, mockReducedMotion } from '../test/motion'
import { renderApp } from '../test/render'
import { avisarMascote } from './eventos'
import { SONO_MS } from './humor'
import Mascote from './Mascote'

async function montar(nome = 'Iris') {
  const repos = makeMemoryRepos()
  await repos.settings.save({ displayName: nome, morningTime: '07:00', defaultRemindMin: 15 })
  renderApp(<Mascote />, { repos })
  await act(async () => {}) // deixa o nome carregar
  return screen.getByRole('button', { name: 'Mascote' })
}
const passar = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('Mascote', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    clearMatchMedia()
  })

  it('ao abrir, dá oi pelo nome e depois fica parada, sem balão', async () => {
    const gata = await montar()
    expect(gata).toHaveAttribute('data-humor', 'oi')
    expect(screen.getByRole('status')).toHaveTextContent('Oi, Iris!')
    passar(3000)
    expect(gata).toHaveAttribute('data-humor', 'parada')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('agendar mostra o balão "Tudo certo, agendado!" e a reverência', async () => {
    const gata = await montar()
    passar(3000)
    act(() => avisarMascote('agendou'))
    expect(gata).toHaveAttribute('data-humor', 'reverencia')
    expect(screen.getByRole('status')).toHaveTextContent('Tudo certo, agendado!')
    passar(3000)
    expect(gata).toHaveAttribute('data-humor', 'parada')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('concluir uma tarefa faz o pulinho', async () => {
    const gata = await montar()
    passar(3000)
    act(() => avisarMascote('concluiu'))
    expect(gata).toHaveAttribute('data-humor', 'pulo')
    expect(screen.getByRole('status')).toHaveTextContent('Feito!')
  })

  it('dorme depois de 1 minuto sem toque e acorda erguendo a espada', async () => {
    const gata = await montar()
    passar(SONO_MS + 3000)
    expect(gata).toHaveAttribute('data-humor', 'dorme')
    fireEvent.pointerDown(document.body)
    expect(gata).toHaveAttribute('data-humor', 'acorda')
    passar(2000)
    expect(gata).toHaveAttribute('data-humor', 'parada')
  })

  it('tocar na tela adia o sono', async () => {
    const gata = await montar()
    passar(SONO_MS - 5000)
    fireEvent.pointerDown(document.body)
    passar(10_000)
    expect(gata).toHaveAttribute('data-humor', 'parada')
  })

  it('tocar nela faz dar oi de novo', async () => {
    const gata = await montar()
    passar(3000)
    fireEvent.click(gata)
    expect(gata).toHaveAttribute('data-humor', 'oi')
    expect(screen.getByRole('status')).toHaveTextContent('Oi, Iris!')
  })

  it('com "reduzir movimento" continua reagindo, mas marcada como sem animação', async () => {
    mockReducedMotion(true)
    const gata = await montar()
    expect(gata).toHaveClass('sem-movimento')
    act(() => avisarMascote('agendou'))
    expect(screen.getByRole('status')).toHaveTextContent('Tudo certo, agendado!')
  })
})
