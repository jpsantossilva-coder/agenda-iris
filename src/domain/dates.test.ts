import { describe, it, expect } from 'vitest'
import { addDays, diffDays, localToUtc, utcToLocal, weekOf, greetingFor, monthGrid, formatLongDate, formatTimeLabel } from './dates'

describe('dates', () => {
  it('weekOf devolve segunda a domingo da semana da data', () => {
    expect(weekOf('2026-11-12')).toEqual([
      '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15',
    ])
    expect(weekOf('2026-11-15')[0]).toBe('2026-11-09')
    expect(weekOf('2026-11-09')[0]).toBe('2026-11-09')
  })
  it('monthGrid devolve 42 dias começando na segunda anterior ao dia 1', () => {
    const g = monthGrid('2026-11-15')
    expect(g).toHaveLength(42)
    expect(g[0]).toBe('2026-10-26')
    expect(g).toContain('2026-11-30')
    expect(g[41]).toBe('2026-12-06')
  })
  it('formatLongDate escreve o dia por extenso em português', () => {
    expect(formatLongDate('2026-11-12')).toBe('quinta, 12 de novembro')
    expect(formatLongDate('2026-12-01')).toBe('terça, 1 de dezembro')
  })
  it('formatTimeLabel tira o zero e usa "h"', () => {
    expect(formatTimeLabel('09:00')).toBe('9h')
    expect(formatTimeLabel('10:30')).toBe('10h30')
    expect(formatTimeLabel('00:05')).toBe('0h05')
  })
  it('addDays e diffDays atravessam o fim do mês', () => {
    expect(addDays('2026-11-30', 2)).toBe('2026-12-02')
    expect(diffDays('2026-11-30', '2026-12-02')).toBe(2)
  })
  it('utcToLocal e localToUtc são inversos no fuso de Brasília', () => {
    const l = utcToLocal(new Date('2026-11-13T02:30:00Z'))
    expect(l).toEqual({ date: '2026-11-12', time: '23:30' })
    expect(localToUtc(l.date, l.time).toISOString()).toBe('2026-11-13T02:30:00.000Z')
  })
  it('greetingFor muda ao longo do dia', () => {
    expect(greetingFor('08:00')).toBe('Bom dia')
    expect(greetingFor('13:00')).toBe('Boa tarde')
    expect(greetingFor('19:30')).toBe('Boa noite')
  })
})
