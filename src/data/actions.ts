import { isDoneOn } from '../domain/tasks'
import type { Task } from '../domain/types'
import type { TasksRepo } from './repos'

/** Conclui ou reabre. Tarefa que se repete guarda só o dia; a simples guarda o instante. */
export async function toggleDone(repo: TasksRepo, task: Task, date: string, now: Date): Promise<Task> {
  const done = isDoneOn(task, date)
  if (task.repeat) {
    const doneDates = done ? task.doneDates.filter((d) => d !== date) : [...task.doneDates, date]
    return repo.update(task.id, { doneDates })
  }
  return repo.update(task.id, { doneAt: done ? null : now.toISOString() })
}
