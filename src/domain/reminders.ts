import { addDays, localToUtc, utcToLocal } from './dates'
import { isDoneOn, occursOn, tasksForDay } from './tasks'
import type { Task } from './types'

export function dueReminders(
  tasks: Task[],
  nowUtc: Date,
  windowMin: number,
): { task: Task; fireAt: string }[] {
  const today = utcToLocal(nowUtc).date
  const result: { task: Task; fireAt: string }[] = []
  for (const task of tasks) {
    if (task.deletedAt !== null || task.time === null) continue
    for (const date of [today, addDays(today, 1)]) {
      if (!occursOn(task, date) || isDoneOn(task, date)) continue
      const fire = localToUtc(date, task.time).getTime() - task.remindMinBefore * 60_000
      const elapsed = nowUtc.getTime() - fire
      if (elapsed >= 0 && elapsed < windowMin * 60_000) {
        result.push({ task, fireAt: new Date(fire).toISOString() })
      }
    }
  }
  return result
}

export function morningSummary(tasks: Task[], date: string): { count: number; titles: string[] } {
  const open = tasksForDay(tasks, date).filter((t) => !isDoneOn(t, date))
  return { count: open.length, titles: open.map((t) => t.title) }
}

export function isMorningTime(morningTime: string, nowUtc: Date, windowMin: number): boolean {
  const { date } = utcToLocal(nowUtc)
  const elapsed = nowUtc.getTime() - localToUtc(date, morningTime).getTime()
  return elapsed >= 0 && elapsed < windowMin * 60_000
}
