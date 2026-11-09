import type { Task } from '../domain/types'

let n = 0
export function mkTask(over: Partial<Task> = {}): Task {
  n += 1
  return {
    id: `t${n}`,
    title: `Tarefa ${n}`,
    area: 'trabalho',
    date: null,
    time: null,
    estimateMin: null,
    doneDates: [],
    doneAt: null,
    remindMinBefore: 15,
    repeat: null,
    deletedAt: null,
    ...over,
  }
}
