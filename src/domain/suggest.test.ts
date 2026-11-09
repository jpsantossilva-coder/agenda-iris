import { describe, it, expect } from 'vitest'
import { suggestFromText } from './suggest'

describe('suggestFromText', () => {
  it('"até quinta" numa segunda aponta para quinta', () => {
    expect(suggestFromText('atestado do João, lançar até quinta', '2026-11-09')).toEqual({ date: '2026-11-12' })
  })
  it('amanhã e hoje', () => {
    expect(suggestFromText('ligar pro contador amanhã', '2026-11-09').date).toBe('2026-11-10')
    expect(suggestFromText('enviar hoje', '2026-11-09').date).toBe('2026-11-09')
  })
  it('sábado com acento e sem acento', () => {
    expect(suggestFromText('levar tecido no sábado', '2026-11-09').date).toBe('2026-11-14')
    expect(suggestFromText('levar tecido no sabado', '2026-11-09').date).toBe('2026-11-14')
  })
  it('costura sugere a área costura', () => {
    expect(suggestFromText('comprar linha de costura', '2026-11-09').area).toBe('costura')
  })
  it('sem pista devolve vazio', () => {
    expect(suggestFromText('pensar na vida', '2026-11-09')).toEqual({})
  })
})
