import { describe, it, expect, vi } from 'vitest'
import { subscribeToPush, type PushEnv } from './subscribe'

function env(over: Partial<PushEnv> = {}): PushEnv {
  return {
    userAgent: 'Mozilla/5.0 (Macintosh) Chrome',
    standalone: false,
    supported: true,
    requestPermission: vi.fn(async () => 'granted' as const),
    subscribe: vi.fn(async () => ({ endpoint: 'https://push.example/abc', keys: { p256dh: 'p', auth: 'a' } })),
    save: vi.fn(async () => {}),
    ...over,
  }
}

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit Safari'

describe('subscribeToPush', () => {
  it('iPhone fora da tela inicial: precisa instalar primeiro', async () => {
    const e = env({ userAgent: IPHONE, standalone: false, supported: false })
    expect(await subscribeToPush(e)).toBe('needs-install')
    expect(e.requestPermission).not.toHaveBeenCalled()
    expect(e.save).not.toHaveBeenCalled()
  })

  it('iPhone com o app instalado pede permissão e salva a inscrição', async () => {
    const e = env({ userAgent: IPHONE, standalone: true })
    expect(await subscribeToPush(e)).toBe('granted')
    expect(e.save).toHaveBeenCalledWith({ endpoint: 'https://push.example/abc', keys: { p256dh: 'p', auth: 'a' } })
  })

  it('navegador sem suporte devolve unsupported', async () => {
    expect(await subscribeToPush(env({ supported: false }))).toBe('unsupported')
  })

  it('permissão negada devolve denied e não salva nada', async () => {
    const e = env({ requestPermission: vi.fn(async () => 'denied' as const) })
    expect(await subscribeToPush(e)).toBe('denied')
    expect(e.save).not.toHaveBeenCalled()
  })

  it('fechar o pedido de permissão sem escolher também não salva', async () => {
    const e = env({ requestPermission: vi.fn(async () => 'default' as const) })
    expect(await subscribeToPush(e)).toBe('denied')
    expect(e.save).not.toHaveBeenCalled()
  })
})
