import { describe, it, expect, vi } from 'vitest'
import { exportData } from './exportData'
import { makeMemoryRepos } from '../../data/memoryRepos'

describe('exportData', () => {
  it('só pede ao banco datas que o Postgres aceita (ano 0000 não existe)', async () => {
    const repos = makeMemoryRepos()
    const spy = vi.spyOn(repos.dayModes, 'range')
    await exportData(repos)
    const [from, to] = spy.mock.calls[0]
    expect(Number(from.slice(0, 4))).toBeGreaterThanOrEqual(1900)
    expect(Number(to.slice(0, 4))).toBeLessThanOrEqual(9999)
  })

  it('exporta tudo o que existe e deixa de fora o que foi excluído', async () => {
    const repos = makeMemoryRepos()
    const novo = { title: 'a', area: 'trabalho' as const, date: '2026-11-09', time: null, estimateMin: null, remindMinBefore: 15, repeat: null }
    const manter = await repos.tasks.create({ ...novo, title: 'manter' })
    const apagar = await repos.tasks.create({ ...novo, title: 'apagar' })
    await repos.tasks.remove(apagar.id)
    await repos.notes.create({ text: 'nota', color: '#fff3a8', date: '2026-11-09' })
    await repos.money.create({ text: 'mercado', amount: 10 })
    await repos.dayModes.set('2026-11-11', 'home')
    await repos.closing.save({ month: '2026-11', steps: [{ id: 'a', label: 'x', date: '2026-11-12' }] })
    await repos.settings.save({ displayName: 'Iris', morningTime: '07:00', defaultRemindMin: 15 })

    const data = JSON.parse(await exportData(repos))
    expect(data.tasks.map((t: { id: string }) => t.id)).toEqual([manter.id])
    expect(data.notes).toHaveLength(1)
    expect(data.money).toHaveLength(1)
    expect(data.dayModes).toEqual({ '2026-11-11': 'home' })
    expect(data.closing).toHaveLength(1)
    expect(data.settings.displayName).toBe('Iris')
    expect(JSON.stringify(data)).not.toContain('user_id')
  })
})
