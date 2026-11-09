import { useCallback, useEffect, useState } from 'react'
import { useRepos, useToday } from '../../app/context'
import { weekOf } from '../../domain/dates'
import type { ClosingCycle, DayMode, Task } from '../../domain/types'
import type { Note, Settings } from '../../data/repos'

export type DayData = {
  tasks: Task[]
  notes: Note[]
  closing: ClosingCycle | null
  settings: Settings
  modes: Record<string, DayMode>
}

export function useDayData() {
  const repos = useRepos()
  const today = useToday()
  const [data, setData] = useState<DayData | null>(null)

  const reload = useCallback(async () => {
    const week = weekOf(today)
    const [tasks, notes, closing, settings, modes] = await Promise.all([
      repos.tasks.list(),
      repos.notes.list(),
      repos.closing.get(today.slice(0, 7)),
      repos.settings.get(),
      repos.dayModes.range(week[0], week[6]),
    ])
    setData({ tasks, notes, closing, settings, modes })
  }, [repos, today])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, reload, today }
}
