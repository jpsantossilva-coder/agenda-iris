// Conversões linha do banco <-> objetos do app. Puro (sem Supabase), para o navegador e o servidor usarem.
import type { Task } from '../domain/types'
import type { MoneyNote, NewMoney, NewNote, NewTask, Note } from './repos'

export type Row = Record<string, unknown>

const defined = (o: Row): Row => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))

export const taskToRow = (t: Partial<Task> | NewTask): Row => {
  const x = t as Partial<Task>
  return defined({
    title: x.title, area: x.area, date: x.date, time: x.time,
    estimate_min: x.estimateMin, done_dates: x.doneDates, done_at: x.doneAt,
    remind_min_before: x.remindMinBefore, repeat: x.repeat, deleted_at: x.deletedAt,
  })
}

export const taskFromRow = (r: Row): Task => ({
  id: r.id as string, title: r.title as string, area: r.area as Task['area'],
  date: (r.date as string) ?? null, time: (r.time as string) ?? null,
  estimateMin: (r.estimate_min as number) ?? null,
  doneDates: (r.done_dates as string[]) ?? [], doneAt: (r.done_at as string) ?? null,
  remindMinBefore: (r.remind_min_before as number) ?? 15,
  repeat: (r.repeat as Task['repeat']) ?? null, deletedAt: (r.deleted_at as string) ?? null,
})

export const noteToRow = (n: Partial<Note> | NewNote): Row => {
  const x = n as Partial<Note>
  return defined({ text: x.text, color: x.color, date: x.date, deleted_at: x.deletedAt })
}
export const noteFromRow = (r: Row): Note => ({
  id: r.id as string, text: r.text as string, color: r.color as string, date: r.date as string,
  createdAt: r.created_at as string, deletedAt: (r.deleted_at as string) ?? null,
})

export const moneyToRow = (m: Partial<MoneyNote> | NewMoney): Row => {
  const x = m as Partial<MoneyNote>
  return defined({ text: x.text, amount: x.amount, deleted_at: x.deletedAt })
}
export const moneyFromRow = (r: Row): MoneyNote => ({
  id: r.id as string, text: r.text as string,
  amount: r.amount === null || r.amount === undefined ? null : Number(r.amount),
  createdAt: r.created_at as string, deletedAt: (r.deleted_at as string) ?? null,
})
