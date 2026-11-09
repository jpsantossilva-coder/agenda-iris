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

function previousMonth(date: string): string {
  const y = Number(date.slice(0, 4))
  const m = Number(date.slice(5, 7))
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
}

export function useDayData() {
  const repos = useRepos()
  const today = useToday()
  const [data, setData] = useState<DayData | null>(null)

  const reload = useCallback(async () => {
    const week = weekOf(today)
    const [tasks, notes, current, previous, settings, modes] = await Promise.all([
      repos.tasks.list(),
      repos.notes.list(),
      repos.closing.get(today.slice(0, 7)),
      repos.closing.get(previousMonth(today)),
      repos.settings.get(),
      repos.dayModes.range(week[0], week[6]),
    ])
    // Etapas do ciclo do mês passado podem cair no mês seguinte (ex.: 02/12 num ciclo de novembro).
    const steps = [...(previous?.steps ?? []), ...(current?.steps ?? [])]
    const closing = steps.length > 0 ? { month: today.slice(0, 7), steps } : null
    setData({ tasks, notes, closing, settings, modes })
  }, [repos, today])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, reload, today }
}
