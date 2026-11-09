import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import AgendaScreen from './AgendaScreen'
import { renderApp } from '../../test/render'
import { makeMemoryRepos } from '../../data/memoryRepos'
import type { NewTask } from '../../data/repos'

const base: NewTask = {
  title: 'x', area: 'trabalho', date: '2026-11-09', time: null,
  estimateMin: null, remindMinBefore: 15, repeat: null,
}

describe('AgendaScreen', () => {
  it('tocar no dia da faixa abre a folha e escolher Home office grava e mostra a casinha', async () => {
    const repos = renderApp(<AgendaScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'quarta 11' }))
    const folha = screen.getByRole('dialog', { name: 'Como vai ser a quarta, dia 11?' })
    expect(within(folha).getByRole('button', { name: 'Presencial' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(within(folha).getByRole('button', { name: 'Home office' }))
    await waitFor(async () => expect(await repos.dayModes.get('2026-11-11')).toBe('home'))
    expect(await screen.findByRole('button', { name: 'quarta 11, home office' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^11 de novembro, home office/ })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('fim de semana usa o artigo certo na pergunta', async () => {
    renderApp(<AgendaScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'sábado 14' }))
    expect(screen.getByRole('dialog', { name: 'Como vai ser o sábado, dia 14?' })).toBeInTheDocument()
  })

  it('o curso de costura semanal aparece em todos os sábados do mês', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Curso de costura', area: 'costura', date: '2026-11-07', repeat: { freq: 'weekly', weekdays: [6] } })
    renderApp(<AgendaScreen />, { repos })
    for (const d of [7, 14, 21, 28]) {
      const cel = await screen.findByRole('button', { name: new RegExp(`^${d} de novembro`) })
      expect(cel.querySelector('.ponto')).not.toBeNull()
    }
    expect(screen.getByRole('button', { name: /^13 de novembro/ }).querySelector('.ponto')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /^21 de novembro/ }))
    expect(within(screen.getByRole('list', { name: 'Dia' })).getByText('Curso de costura')).toBeInTheDocument()
  })

  it('evento de Família usa a cor da família', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Festa da vó', area: 'familia', date: '2026-11-15' })
    renderApp(<AgendaScreen />, { repos })
    const cel = await screen.findByRole('button', { name: /^15 de novembro/ })
    expect((cel.querySelector('.ponto') as HTMLElement).getAttribute('style')).toContain('--area-familia')
    await userEvent.click(cel)
    const etiqueta = screen.getByText('Festa da vó').closest('.etiqueta') as HTMLElement
    expect(etiqueta.getAttribute('style')).toContain('--area-familia')
  })

  it('tocar num dia lista as tarefas dele e permite criar uma atividade com essa data', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Reunião', date: '2026-11-20', time: '14:00' })
    renderApp(<AgendaScreen />, { repos })
    await userEvent.click(await screen.findByRole('button', { name: /^20 de novembro/ }))
    expect(within(screen.getByRole('list', { name: 'Dia' })).getByText('Reunião')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Nova atividade neste dia' }))
    await userEvent.keyboard('levar tecido')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(async () => expect((await repos.tasks.list()).map((t) => t.date)).toContain('2026-11-20'))
    expect((await repos.tasks.list()).find((t) => t.title === 'levar tecido')?.date).toBe('2026-11-20')
  })

  it('o parâmetro ?dia= seleciona o dia vindo da tela Hoje', async () => {
    const repos = makeMemoryRepos()
    await repos.tasks.create({ ...base, title: 'Só dia 12', date: '2026-11-12' })
    renderApp(<AgendaScreen />, { repos, route: '/agenda?dia=2026-11-12' })
    expect(await screen.findByText('Só dia 12')).toBeInTheDocument()
  })

  it('navega entre meses', async () => {
    renderApp(<AgendaScreen />)
    expect(await screen.findByRole('heading', { name: 'novembro de 2026' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(screen.getByRole('heading', { name: 'dezembro de 2026' })).toBeInTheDocument()
  })
})
