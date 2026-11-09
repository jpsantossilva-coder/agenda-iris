import { describe, it, expect, vi } from 'vitest'
import { makeHandler, type Db, type Payload, type PushSub } from './send-reminders'
import { mkTask } from '../src/test/factories'
import type { Task } from '../src/domain/types'
import { DEFAULT_SETTINGS } from '../src/data/repos'

const SECRET = 's3gredo'
const mkPush = (r: 'sent' | 'gone') => vi.fn(async (_sub: PushSub, _payload: Payload) => r)
const sub: PushSub = { endpoint: 'https://push.example/1', p256dh: 'p', auth: 'a' }

function fakeDb(tasks: Task[], settings = DEFAULT_SETTINGS) {
  const claimed = new Set<string>()
  const removed: string[] = []
  const db: Db = {
    usersWithSubscriptions: async () => ['u1'],
    tasks: async () => tasks,
    settings: async () => settings,
    subscriptions: async () => [sub],
    claim: async (kind, refId, fireAt) => {
      const k = `${kind}|${refId}|${fireAt}`
      if (claimed.has(k)) return false
      claimed.add(k)
      return true
    },
    removeSubscription: async (endpoint) => {
      removed.push(endpoint)
    },
  }
  return { db, removed }
}

function run(h: ReturnType<typeof makeHandler>, now: string, auth: string | null = `Bearer ${SECRET}`) {
  const res = { statusCode: 0, body: undefined as unknown }
  const resp = {
    status(c: number) {
      res.statusCode = c
      return resp
    },
    json(b: unknown) {
      res.body = b
      return resp
    },
  }
  return h({ headers: auth === null ? {} : { authorization: auth } } as never, resp as never, new Date(now)).then(() => res)
}

const tarefa = mkTask({ title: 'Conferir folha', date: '2026-11-12', time: '10:00', remindMinBefore: 15 })

describe('send-reminders', () => {
  it('responde 401 sem o segredo e não envia nada', async () => {
    const push = mkPush('sent')
    const { db } = fakeDb([tarefa])
    const h = makeHandler({ db, push, secret: SECRET })
    expect((await run(h, '2026-11-12T12:45:10Z', null)).statusCode).toBe(401)
    expect((await run(h, '2026-11-12T12:45:10Z', 'Bearer errado')).statusCode).toBe(401)
    expect(push).not.toHaveBeenCalled()
  })

  it('manda o lembrete 15 min antes da tarefa, uma única vez (Review Focus 3)', async () => {
    const push = mkPush('sent')
    const { db } = fakeDb([tarefa])
    const h = makeHandler({ db, push, secret: SECRET })
    await run(h, '2026-11-12T12:45:10Z')
    expect(push).toHaveBeenCalledTimes(1)
    expect(push.mock.calls[0][1]).toMatchObject({ title: 'Conferir folha' })
    // o cron roda de novo no mesmo minuto e ainda dentro da janela
    await run(h, '2026-11-12T12:45:40Z')
    await run(h, '2026-11-12T12:46:20Z')
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('um cron atrasado em alguns minutos ainda manda o lembrete', async () => {
    const push = mkPush('sent')
    const { db } = fakeDb([tarefa])
    const h = makeHandler({ db, push, secret: SECRET })
    await run(h, '2026-11-12T12:49:00Z') // 4 min depois da hora certa (12:45Z)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('não manda nada fora da janela do lembrete', async () => {
    const push = mkPush('sent')
    const { db } = fakeDb([tarefa])
    const h = makeHandler({ db, push, secret: SECRET })
    await run(h, '2026-11-12T12:30:00Z')
    await run(h, '2026-11-12T13:10:00Z')
    expect(push).not.toHaveBeenCalled()
  })

  it('anotação sem horário nunca gera notificação (Review Focus 1)', async () => {
    const push = mkPush('sent')
    const { db } = fakeDb([mkTask({ date: '2026-11-12' }), mkTask()])
    const h = makeHandler({ db, push, secret: SECRET })
    await run(h, '2026-11-12T12:45:10Z')
    expect(push).not.toHaveBeenCalled()
  })

  it('manda o resumo da manhã às 07:00 locais, uma vez só', async () => {
    const push = mkPush('sent')
    const a = mkTask({ title: 'Lançar atestados', date: '2026-11-12' })
    const b = mkTask({ title: 'Conferir folha', date: '2026-11-12', time: '10:00' })
    const { db } = fakeDb([a, b], { displayName: 'Iris', morningTime: '07:00', defaultRemindMin: 15 })
    const h = makeHandler({ db, push, secret: SECRET })
    await run(h, '2026-11-12T10:00:20Z')
    await run(h, '2026-11-12T10:00:50Z')
    expect(push).toHaveBeenCalledTimes(1)
    const payload = push.mock.calls[0][1]
    expect(payload.title).toBe('Bom dia, Iris')
    expect(payload.body).toContain('Hoje você tem 2 coisas')
    expect(payload.body).toContain('Lançar atestados')
  })

  it('sem nada marcado no dia, o resumo da manhã não é enviado', async () => {
    const push = mkPush('sent')
    const { db } = fakeDb([])
    const h = makeHandler({ db, push, secret: SECRET })
    await run(h, '2026-11-12T10:00:20Z')
    expect(push).not.toHaveBeenCalled()
  })

  it('inscrição que o servidor de push diz que acabou é apagada', async () => {
    const push = mkPush('gone')
    const { db, removed } = fakeDb([tarefa])
    const h = makeHandler({ db, push, secret: SECRET })
    await run(h, '2026-11-12T12:45:10Z')
    expect(removed).toEqual([sub.endpoint])
  })

  it('a resposta diz quantas notificações saíram', async () => {
    const push = mkPush('sent')
    const { db } = fakeDb([tarefa])
    const h = makeHandler({ db, push, secret: SECRET })
    const res = await run(h, '2026-11-12T12:45:10Z')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ sent: 1 })
  })
})
