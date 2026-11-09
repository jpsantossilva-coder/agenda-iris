import { supabase } from '../lib/supabase'
import type { ClosingCycle, DayMode, Task } from '../domain/types'
import {
  DEFAULT_SETTINGS,
  type Crud,
  type MoneyNote,
  type NewMoney,
  type NewNote,
  type NewTask,
  type Note,
  type Repos,
} from './repos'
import { moneyFromRow, moneyToRow, noteFromRow, noteToRow, taskFromRow, taskToRow, type Row } from './rows'

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

function crud<T extends { id: string }, N>(
  table: string,
  toRow: (obj: Partial<T> | N) => Row,
  fromRow: (row: Row) => T,
): Crud<T, N> {
  return {
    async list() {
      const rows = check(await supabase.from(table).select('*').is('deleted_at', null).order('created_at'))
      return (rows as Row[]).map(fromRow)
    },
    async create(input) {
      return fromRow(check(await supabase.from(table).insert(toRow(input)).select().single()) as Row)
    },
    async update(id, patch) {
      return fromRow(check(await supabase.from(table).update(toRow(patch)).eq('id', id).select().single()) as Row)
    },
    async remove(id) {
      check(await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id))
    },
    async restore(id) {
      check(await supabase.from(table).update({ deleted_at: null }).eq('id', id))
    },
  }
}

export function makeSupabaseRepos(): Repos {
  return {
    tasks: crud<Task, NewTask>('tasks', taskToRow, taskFromRow),
    notes: crud<Note, NewNote>('notes', noteToRow, noteFromRow),
    money: crud<MoneyNote, NewMoney>('money_notes', moneyToRow, moneyFromRow),
    dayModes: {
      async get(date) {
        const row = check(await supabase.from('day_modes').select('mode').eq('date', date).maybeSingle()) as Row | null
        return (row?.mode as DayMode) ?? 'presencial'
      },
      async set(date, mode) {
        if (mode === 'presencial') {
          check(await supabase.from('day_modes').delete().eq('date', date))
        } else {
          const { data: u } = await supabase.auth.getUser()
          check(await supabase.from('day_modes').upsert({ user_id: u.user?.id, date, mode }, { onConflict: 'user_id,date' }))
        }
      },
      async range(from, to) {
        const rows = check(await supabase.from('day_modes').select('date,mode').gte('date', from).lte('date', to)) as Row[]
        return Object.fromEntries(rows.map((r) => [r.date as string, r.mode as DayMode]))
      },
    },
    closing: {
      async get(month) {
        const row = check(await supabase.from('closing_cycles').select('*').eq('month', month).maybeSingle()) as Row | null
        return row ? ({ month, steps: row.steps } as ClosingCycle) : null
      },
      async all() {
        const rows = check(await supabase.from('closing_cycles').select('*')) as Row[]
        return rows.map((r) => ({ month: r.month as string, steps: r.steps as ClosingCycle['steps'] }))
      },
      async save(cycle) {
        const { data: u } = await supabase.auth.getUser()
        check(await supabase.from('closing_cycles').upsert({ user_id: u.user?.id, month: cycle.month, steps: cycle.steps }, { onConflict: 'user_id,month' }))
      },
    },
    settings: {
      async get() {
        const row = check(await supabase.from('settings').select('*').maybeSingle()) as Row | null
        if (!row) return { ...DEFAULT_SETTINGS }
        return {
          displayName: (row.display_name as string) ?? '',
          morningTime: (row.morning_time as string) ?? DEFAULT_SETTINGS.morningTime,
          defaultRemindMin: (row.default_remind_min as number) ?? DEFAULT_SETTINGS.defaultRemindMin,
        }
      },
      async save(s) {
        const { data: u } = await supabase.auth.getUser()
        check(await supabase.from('settings').upsert({
          user_id: u.user?.id, display_name: s.displayName, morning_time: s.morningTime, default_remind_min: s.defaultRemindMin,
        }, { onConflict: 'user_id' }))
      },
    },
  }
}
