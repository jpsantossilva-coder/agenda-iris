import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import FechamentoEditor from './FechamentoEditor'
import { renderApp } from '../../test/render'
import { makeMemoryRepos } from '../../data/memoryRepos'

async function adicionar(nome: string, data: string) {
  await userEvent.type(screen.getByLabelText('Nome da etapa'), nome)
  fireEvent.change(screen.getByLabelText('Data'), { target: { value: data } })
  await userEvent.click(screen.getByRole('button', { name: 'Adicionar etapa' }))
}

describe('FechamentoEditor', () => {
  it('adiciona uma etapa e grava no ciclo do mês', async () => {
    const repos = renderApp(<FechamentoEditor month="2026-11" />)
    await adicionar('Lançar atestados', '2026-11-12')
    await waitFor(async () => expect((await repos.closing.get('2026-11'))?.steps).toHaveLength(1))
    const [s] = (await repos.closing.get('2026-11'))!.steps
    expect(s).toMatchObject({ label: 'Lançar atestados', date: '2026-11-12' })
    expect(await screen.findByText('Lançar atestados')).toBeInTheDocument()
  })

  it('não adiciona etapa sem nome ou sem data', async () => {
    renderApp(<FechamentoEditor month="2026-11" />)
    expect(await screen.findByRole('button', { name: 'Adicionar etapa' })).toBeDisabled()
  })

  it('editar a data de uma etapa grava a mudança', async () => {
    const repos = makeMemoryRepos()
    await repos.closing.save({ month: '2026-11', steps: [{ id: 'a', label: 'Lançar atestados', date: '2026-11-12' }] })
    renderApp(<FechamentoEditor month="2026-11" />, { repos })
    await userEvent.click(await screen.findByRole('button', { name: 'Editar etapa Lançar atestados' }))
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-11-18' } })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar etapa' }))
    await waitFor(async () => expect((await repos.closing.get('2026-11'))?.steps[0].date).toBe('2026-11-18'))
  })

  it('excluir mostra Desfazer e desfazer devolve a etapa', async () => {
    const repos = makeMemoryRepos()
    await repos.closing.save({ month: '2026-11', steps: [{ id: 'a', label: 'Lançar atestados', date: '2026-11-12' }] })
    renderApp(<FechamentoEditor month="2026-11" />, { repos })
    await userEvent.click(await screen.findByRole('button', { name: 'Excluir etapa Lançar atestados' }))
    expect((await repos.closing.get('2026-11'))?.steps).toHaveLength(0)
    await userEvent.click(await screen.findByRole('button', { name: 'Desfazer' }))
    await waitFor(async () => expect((await repos.closing.get('2026-11'))?.steps).toHaveLength(1))
  })

  it('etapa que cai em dezembro continua no ciclo de novembro e aparece ordenada', async () => {
    const repos = renderApp(<FechamentoEditor month="2026-11" />)
    await adicionar('Virada', '2026-12-02')
    await userEvent.type(screen.getByLabelText('Nome da etapa'), 'Primeira')
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-11-20' } })
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar etapa' }))
    await waitFor(async () => expect((await repos.closing.get('2026-11'))?.steps).toHaveLength(2))
    const nomes = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(nomes[0]).toContain('Primeira')
    expect(nomes[1]).toContain('Virada')
  })

  it('dá para navegar entre meses e editar etapa de novembro que cai em dezembro', async () => {
    const repos = makeMemoryRepos()
    await repos.closing.save({ month: '2026-11', steps: [{ id: 'v', label: 'Virada', date: '2026-12-02' }] })
    renderApp(<FechamentoEditor month="2026-12" />, { repos })
    expect(await screen.findByRole('heading', { name: 'Fechamento de dezembro de 2026' })).toBeInTheDocument()
    expect(screen.queryByText('Virada')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }))
    expect(await screen.findByText('Virada')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Excluir etapa Virada' }))
    expect((await repos.closing.get('2026-11'))?.steps).toHaveLength(0)
  })

  it('prepara o ciclo do mês que vem', async () => {
    const repos = renderApp(<FechamentoEditor month="2026-11" />)
    await userEvent.click(await screen.findByRole('button', { name: 'Próximo mês' }))
    expect(screen.getByRole('heading', { name: 'Fechamento de dezembro de 2026' })).toBeInTheDocument()
    await adicionar('Lançar atestados', '2026-12-10')
    await waitFor(async () => expect((await repos.closing.get('2026-12'))?.steps).toHaveLength(1))
  })
})
