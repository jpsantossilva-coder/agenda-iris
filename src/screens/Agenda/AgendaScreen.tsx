import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRepos, useToday } from '../../app/context'
import { MONTH_LONG, monthGrid, weekOf } from '../../domain/dates'
import { isDoneOn, tasksForDay } from '../../domain/tasks'
import type { DayMode, Task } from '../../domain/types'
import Etiqueta from '../../components/Etiqueta'
import FitaMetrica from '../../components/FitaMetrica'
import WeekStrip from '../../components/WeekStrip'
import Sheet from '../../shell/Sheet'
import QuickAdd from '../Tarefas/QuickAdd'
import DayModeSheet from './DayModeSheet'
import MonthGrid from './MonthGrid'

function shiftMonth(date: string, delta: number): string {
  const y = Number(date.slice(0, 4))
  const m = Number(date.slice(5, 7)) - 1 + delta
  const d = new Date(Date.UTC(y, m, 1))
  return d.toISOString().slice(0, 10)
}

export default function AgendaScreen() {
  const repos = useRepos()
  const today = useToday()
  const [params] = useSearchParams()
  const inicial = /^\d{4}-\d{2}-\d{2}$/.test(params.get('dia') ?? '') ? (params.get('dia') as string) : today
  const [selected, setSelected] = useState(inicial)
  const [month, setMonth] = useState(inicial)
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [modes, setModes] = useState<Record<string, DayMode>>({})
  const [modeDay, setModeDay] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    const grid = monthGrid(month)
    const week = weekOf(selected)
    const from = grid[0] < week[0] ? grid[0] : week[0]
    const to = grid[41] > week[6] ? grid[41] : week[6]
    const [t, m] = await Promise.all([repos.tasks.list(), repos.dayModes.range(from, to)])
    setTasks(t)
    setModes(m)
  }, [repos, month, selected])

  useEffect(() => {
    void load()
  }, [load])

  if (!tasks) return null

  async function setMode(date: string, mode: DayMode) {
    await repos.dayModes.set(date, mode)
    setModeDay(null)
    await load()
  }

  const monthDate = `${month.slice(0, 7)}-01`
  const noDia = tasksForDay(tasks, selected)

  return (
    <section>
      <h1>Agenda</h1>
      <WeekStrip days={weekOf(selected)} today={today} modes={modes} onPick={(d) => setModeDay(d)} />

      <div className="mes-nav">
        <button type="button" aria-label="Mês anterior" onClick={() => setMonth(shiftMonth(monthDate, -1))}>‹</button>
        <h2>{`${MONTH_LONG[Number(monthDate.slice(5, 7)) - 1]} de ${monthDate.slice(0, 4)}`}</h2>
        <button type="button" aria-label="Próximo mês" onClick={() => setMonth(shiftMonth(monthDate, 1))}>›</button>
      </div>
      <MonthGrid month={monthDate} today={today} selected={selected} tasks={tasks} modes={modes} onPick={setSelected} />

      <h3 className="dia-titulo">{`${Number(selected.slice(8))} de ${MONTH_LONG[Number(selected.slice(5, 7)) - 1]}`}</h3>
      <FitaMetrica tasks={noDia} render={(t) => <Etiqueta task={t} done={isDoneOn(t, selected)} />} />
      <button type="button" className="salvar" onClick={() => setAdding(true)}>Nova atividade neste dia</button>

      <DayModeSheet
        date={modeDay}
        mode={modeDay ? modes[modeDay] ?? 'presencial' : 'presencial'}
        onChange={(m) => modeDay && void setMode(modeDay, m)}
        onClose={() => setModeDay(null)}
      />
      <Sheet open={adding} onClose={() => setAdding(false)} title="Nova atividade">
        <QuickAdd
          initialDate={selected}
          onSaved={() => {
            setAdding(false)
            void load()
          }}
        />
      </Sheet>
    </section>
  )
}
