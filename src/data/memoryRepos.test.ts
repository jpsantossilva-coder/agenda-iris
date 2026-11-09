import { describe, it, expect } from 'vitest'
import { makeMemoryRepos } from './memoryRepos'
import { DEFAULT_SETTINGS } from './repos'
import { tasksForDay } from '../domain/tasks'

const novo = {
  title: 'Lançar atestados',
  area: 'fechamento' as const,
  date: '2026-11-12',
  time: null,
  estimateMin: 40,
  remindMinBefore: 15,
  repeat: null,
}

describe('memoryRepos', () => {
  it('remove esconde a tarefa do dia e restore traz de volta', async () => {
    const { tasks } = makeMemoryRepos()
    const t = await tasks.create(novo)
    expect(tasksForDay(await tasks.list(), '2026-11-12')).toHaveLength(1)
    await tasks.remove(t.id)
    expect(tasksForDay(await tasks.list(), '2026-11-12')).toHaveLength(0)
    await tasks.restore(t.id)
    expect(tasksForDay(await tasks.list(), '2026-11-12')).toHaveLength(1)
  })

  it('create preenche id, doneDates vazio e deletedAt nulo', async () => {
    const { tasks } = makeMemoryRepos()
    const t = await tasks.create(novo)
    expect(t.id).toBeTruthy()
    expect(t.doneDates).toEqual([])
    expect(t.doneAt).toBeNull()
    expect(t.deletedAt).toBeNull()
  })

  it('update altera só o que foi pedido', async () => {
    const { tasks } = makeMemoryRepos()
    const t = await tasks.create(novo)
    const u = await tasks.update(t.id, { title: 'Conferir folha' })
    expect(u.title).toBe('Conferir folha')
    expect(u.date).toBe('2026-11-12')
  })

  it('dayModes.get de um dia sem registro devolve presencial', async () => {
    const { dayModes } = makeMemoryRepos()
    expect(await dayModes.get('2026-11-11')).toBe('presencial')
    await dayModes.set('2026-11-11', 'home')
    expect(await dayModes.get('2026-11-11')).toBe('home')
    expect(await dayModes.range('2026-11-09', '2026-11-13')).toEqual({ '2026-11-11': 'home' })
  })

  it('settings começa com os padrões e salva', async () => {
    const { settings } = makeMemoryRepos()
    expect(await settings.get()).toEqual(DEFAULT_SETTINGS)
    await settings.save({ ...DEFAULT_SETTINGS, displayName: 'Iris' })
    expect((await settings.get()).displayName).toBe('Iris')
  })

  it('closing guarda o ciclo por mês', async () => {
    const { closing } = makeMemoryRepos()
    expect(await closing.get('2026-11')).toBeNull()
    await closing.save({ month: '2026-11', steps: [] })
    expect(await closing.get('2026-11')).toEqual({ month: '2026-11', steps: [] })
  })

  it('notes e money têm o mesmo ciclo de remover e restaurar', async () => {
    const { notes, money } = makeMemoryRepos()
    const n = await notes.create({ text: 'ligar pro contador', color: '#fff3a8', date: '2026-11-12' })
    const m = await money.create({ text: 'mercado', amount: 42.5 })
    await notes.remove(n.id)
    await money.remove(m.id)
    expect(await notes.list()).toHaveLength(0)
    expect(await money.list()).toHaveLength(0)
    await notes.restore(n.id)
    expect(await notes.list()).toHaveLength(1)
  })
})
