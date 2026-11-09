import { describe, it, expect } from 'vitest'
import { authOptions } from './authOptions'

describe('authOptions', () => {
  it('guarda a sessão no aparelho e renova sozinha, para ela não precisar entrar de novo', () => {
    expect(authOptions.persistSession).toBe(true)
    expect(authOptions.autoRefreshToken).toBe(true)
  })
  it('não procura sessão no endereço da página', () => {
    expect(authOptions.detectSessionInUrl).toBe(false)
  })
})
