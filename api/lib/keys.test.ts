import { describe, it, expect } from 'vitest'
import { cleanKey, describeKey } from './keys'

describe('cleanKey', () => {
  it('tira espaços, quebras de linha e aspas coladas junto', () => {
    expect(cleanKey('  "BAbc-_123"\n')).toBe('BAbc-_123')
    expect(cleanKey("'BAbc'")).toBe('BAbc')
  })
  it('tira o "=" de preenchimento do fim', () => {
    expect(cleanKey('BAbc==')).toBe('BAbc')
  })
  it('tira o rótulo se a pessoa colou a linha inteira do gerador', () => {
    expect(cleanKey('Public Key: BAbc')).toBe('BAbc')
    expect(cleanKey('VAPID_PUBLIC_KEY=BAbc')).toBe('BAbc')
  })
  it('valor ausente vira texto vazio', () => {
    expect(cleanKey(undefined)).toBe('')
  })
})

describe('describeKey', () => {
  it('diz só o tamanho, nunca o valor', () => {
    const msg = describeKey('VAPID_PUBLIC_KEY', 'segredo123', 87)
    expect(msg).toContain('VAPID_PUBLIC_KEY')
    expect(msg).toContain('10')
    expect(msg).toContain('87')
    expect(msg).not.toContain('segredo123')
  })
})
