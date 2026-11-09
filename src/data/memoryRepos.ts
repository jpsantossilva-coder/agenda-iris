import type { ClosingCycle, DayMode } from '../domain/types'
import {
  DEFAULT_SETTINGS,
  type ClosingRepo,
  type Crud,
  type DayModesRepo,
  type MoneyNote,
  type NewMoney,
  type NewNote,
  type NewTask,
  type Note,
  type Repos,
  type Settings,
  type SettingsRepo,
} from './repos'
import type { Task } from '../domain/types'

let counter = 0
const newId = () => globalThis.crypto?.randomUUID?.() ?? `id-${++counter}`

function memoryCrud<T extends { id: string; deletedAt: string | null }, N>(
  build: (input: N, id: string) => T,
): Crud<T, N> {
  const rows = new Map<string, T>()
  const find = (id: string): T => {
    const row = rows.get(id)
    if (!row) throw new Error(`Não encontrado: ${id}`)
    return row
  }
  return {
    async list() {
      return [...rows.values()].filter((r) => r.deletedAt === null)
    },
    async create(input) {
      const id = newId()
      const row = build(input, id)
      rows.set(id, row)
      return row
    },
    async update(id, patch) {
      const next = { ...find(id), ...patch }
      rows.set(id, next)
      return next
    },
    async remove(id) {
      rows.set(id, { ...find(id), deletedAt: new Date().toISOString() })
    },
    async restore(id) {
      rows.set(id, { ...find(id), deletedAt: null })
    },
  }
}

export function makeMemoryRepos(): Repos {
  const modes = new Map<string, DayMode>()
  const cycles = new Map<string, ClosingCycle>()
  let settings: Settings = { ...DEFAULT_SETTINGS }

  const dayModes: DayModesRepo = {
    async get(date) {
      return modes.get(date) ?? 'presencial'
    },
    async set(date, mode) {
      if (mode === 'presencial') modes.delete(date)
      else modes.set(date, mode)
    },
    async range(from, to) {
      const out: Record<string, DayMode> = {}
      for (const [d, m] of modes) if (d >= from && d <= to) out[d] = m
      return out
    },
  }
  const closing: ClosingRepo = {
    async get(month) {
      return cycles.get(month) ?? null
    },
    async save(cycle) {
      cycles.set(cycle.month, cycle)
    },
  }
  const settingsRepo: SettingsRepo = {
    async get() {
      return settings
    },
    async save(s) {
      settings = s
    },
  }

  return {
    tasks: memoryCrud<Task, NewTask>((i, id) => ({ ...i, id, doneDates: [], doneAt: null, deletedAt: null })),
    notes: memoryCrud<Note, NewNote>((i, id) => ({ ...i, id, createdAt: new Date().toISOString(), deletedAt: null })),
    money: memoryCrud<MoneyNote, NewMoney>((i, id) => ({ ...i, id, createdAt: new Date().toISOString(), deletedAt: null })),
    dayModes,
    closing,
    settings: settingsRepo,
  }
}
