import { weekdayOf } from './dates'
import type { Task } from './types'

export const TIGHT_DAY_MIN = 420

export function occursOn(task: Task, date: string): boolean {
  if (task.date === null) return false
  if (!task.repeat) return task.date === date
  if (date < task.date) return false
  if (task.repeat.until && date > task.repeat.until) return false
  if (task.repeat.freq === 'daily') return true
  const weekdays = task.repeat.weekdays ?? [weekdayOf(task.date)]
  return weekdays.includes(weekdayOf(date))
}

export function isDoneOn(task: Task, date: string): boolean {
  return task.repeat ? task.doneDates.includes(date) : task.doneAt !== null
}

export function tasksForDay(tasks: Task[], date: string): Task[] {
  return tasks
    .filter((t) => t.deletedAt === null && occursOn(t, date))
    .sort((a, b) => {
      if (a.time === b.time) return 0
      if (a.time === null) return 1
      if (b.time === null) return -1
      return a.time < b.time ? -1 : 1
    })
}

export function postponed(tasks: Task[], today: string): Task[] {
  return tasks.filter(
    (t) => t.deletedAt === null && !t.repeat && t.date !== null && t.date < today && t.doneAt === null,
  )
}

export function dayLoad(tasks: Task[], date: string): { totalMin: number; tight: boolean } {
  const totalMin = tasksForDay(tasks, date)
    .filter((t) => !isDoneOn(t, date))
    .reduce((sum, t) => sum + (t.estimateMin ?? 0), 0)
  return { totalMin, tight: totalMin >= TIGHT_DAY_MIN }
}

export function allDoneOn(tasks: Task[], date: string): boolean {
  const day = tasksForDay(tasks, date)
  return day.length > 0 && day.every((t) => isDoneOn(t, date))
}
