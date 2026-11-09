import { describe, it, expect } from 'vitest'
import { closingStatus } from './closing'

const cycle = {
  month: '2026-11',
  steps: [
    { id: 'a', label: 'Lançar atestados', date: '2026-11-12' },
    { id: 'b', label: 'Fechar folha', date: '2026-11-20' },
  ],
}

describe('closingStatus', () => {
  it('conta os dias até a próxima etapa', () => {
    expect(closingStatus(cycle, '2026-11-10')).toEqual({ daysLeft: 2, nextLabel: 'Lançar atestados' })
  })
  it('passa para a etapa seguinte depois da primeira', () => {
    expect(closingStatus(cycle, '2026-11-13')).toEqual({ daysLeft: 7, nextLabel: 'Fechar folha' })
  })
  it('hoje conta como 0 dias', () => {
    expect(closingStatus(cycle, '2026-11-12')?.daysLeft).toBe(0)
  })
  it('sem etapas futuras ou sem ciclo devolve null', () => {
    expect(closingStatus(cycle, '2026-11-21')).toBeNull()
    expect(closingStatus(null, '2026-11-10')).toBeNull()
  })
  it('etapa em dezembro continua certa (usa a data completa)', () => {
    const c = { month: '2026-11', steps: [{ id: 'z', label: 'Virada', date: '2026-12-02' }] }
    expect(closingStatus(c, '2026-11-30')?.daysLeft).toBe(2)
  })
})
