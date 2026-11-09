import { useCallback, useEffect, useState } from 'react'
import { useRepos } from '../../app/context'
import type { Task } from '../../domain/types'

export function useTasks() {
  const { tasks: repo } = useRepos()
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const reload = useCallback(async () => setTasks(await repo.list()), [repo])
  useEffect(() => {
    void reload()
  }, [reload])
  return { tasks, reload }
}
