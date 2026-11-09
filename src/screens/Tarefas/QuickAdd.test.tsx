import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import QuickAdd from './QuickAdd'
import { renderApp } from '../../test/render'
import { makeMemoryRepos } from '../../data/memoryRepos'

describe('QuickAdd', () => {
  it('anota uma atividade só com o texto: área trabalho, data sugerida, lembrete 15', async () => {
    const onSaved = vi.fn()
    const repos = renderApp(<QuickAdd onSaved={onSaved} />)
    await userEvent.type(screen.getByLabelText('O que você precisa fazer?'), 'atestado do João, lançar até quinta')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    const [t] = await repos.tasks.list()
    expect(t).toMatchObject({
      title: 'atestado do João, lançar até quinta',
      area: 'trabalho',
      date: '2026-11-12',
      time: null,
      remindMinBefore: 15,
    })
    expect(onSaved).toHaveBeenCalled()
  })

  it('sem pista de data a atividade fica para hoje', async () => {
    const repos = renderApp(<QuickAdd onSaved={() => {}} />)
    await userEvent.type(screen.getByLabelText('O que você precisa fazer?'), 'organizar a mesa')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect((await repos.tasks.list())[0].date).toBe('2026-11-09')
  })

  it('usa o lembrete padrão das configurações', async () => {
    const repos = makeMemoryRepos()
    await repos.settings.save({ displayName: '', morningTime: '07:00', defaultRemindMin: 20 })
    renderApp(<QuickAdd onSaved={() => {}} />, { repos })
    await userEvent.type(await screen.findByLabelText('O que você precisa fazer?'), 'ligar')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect((await repos.tasks.list())[0].remindMinBefore).toBe(20)
  })

  it('"Mais detalhes" mostra os campos completos e grava a hora', async () => {
    const repos = renderApp(<QuickAdd onSaved={() => {}} />)
    await userEvent.type(screen.getByLabelText('O que você precisa fazer?'), 'conferir folha')
    expect(screen.queryByLabelText('Hora')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Mais detalhes' }))
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '10:00' } })
    fireEvent.change(screen.getByLabelText('Tempo estimado (min)'), { target: { value: '45' } })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect((await repos.tasks.list())[0]).toMatchObject({ time: '10:00', estimateMin: 45 })
  })

  it('a sugestão de área aparece e a pessoa pode trocar à mão', async () => {
    const repos = renderApp(<QuickAdd onSaved={() => {}} />)
    await userEvent.type(screen.getByLabelText('O que você precisa fazer?'), 'comprar linha de costura')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect((await repos.tasks.list())[0].area).toBe('costura')
  })

  it('anotação rápida vira post-it de hoje, com aviso sobre dados sensíveis', async () => {
    const repos = renderApp(<QuickAdd onSaved={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Anotação rápida' }))
    expect(screen.getByText('Evite colocar CPF, salário ou dados de saúde de colegas.')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('O que você precisa fazer?'), 'ligar pro contador')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    const [n] = await repos.notes.list()
    expect(n).toMatchObject({ text: 'ligar pro contador', date: '2026-11-09' })
    expect(await repos.tasks.list()).toHaveLength(0)
  })

  it('Salvar fica desativado com o texto vazio', () => {
    renderApp(<QuickAdd onSaved={() => {}} />)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled()
  })
})
