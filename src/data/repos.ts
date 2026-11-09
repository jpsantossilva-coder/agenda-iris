import type { ClosingCycle, DayMode, Task } from '../domain/types'

export type NewTask = Omit<Task, 'id' | 'deletedAt' | 'doneDates' | 'doneAt'>

export type Note = {
  id: string
  text: string
  color: string
  date: string
  createdAt: string
  deletedAt: string | null
}
export type NewNote = { text: string; color: string; date: string }

export type MoneyNote = {
  id: string
  text: string
  amount: number | null
  createdAt: string
  deletedAt: string | null
}
export type NewMoney = { text: string; amount: number | null }

export type Settings = { displayName: string; morningTime: string; defaultRemindMin: number }
export const DEFAULT_SETTINGS: Settings = { displayName: '', morningTime: '07:00', defaultRemindMin: 15 }

/** Remover = marcar `deletedAt`; `list()` só devolve o que não foi removido. */
export interface Crud<T, New> {
  list(): Promise<T[]>
  create(input: New): Promise<T>
  update(id: string, patch: Partial<T>): Promise<T>
  remove(id: string): Promise<void>
  restore(id: string): Promise<void>
}

export type TasksRepo = Crud<Task, NewTask>
export type NotesRepo = Crud<Note, NewNote>
export type MoneyRepo = Crud<MoneyNote, NewMoney>

export interface DayModesRepo {
  /** Dia sem registro é presencial. */
  get(date: string): Promise<DayMode>
  set(date: string, mode: DayMode): Promise<void>
  range(from: string, to: string): Promise<Record<string, DayMode>>
}

export interface ClosingRepo {
  get(month: string): Promise<ClosingCycle | null>
  all(): Promise<ClosingCycle[]>
  save(cycle: ClosingCycle): Promise<void>
}

export interface SettingsRepo {
  get(): Promise<Settings>
  save(settings: Settings): Promise<void>
}

export type Repos = {
  tasks: TasksRepo
  notes: NotesRepo
  money: MoneyRepo
  dayModes: DayModesRepo
  closing: ClosingRepo
  settings: SettingsRepo
}
