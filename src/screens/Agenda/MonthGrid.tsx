import { MONTH_LONG, monthGrid } from '../../domain/dates'
import { tasksForDay } from '../../domain/tasks'
import type { DayMode, Task } from '../../domain/types'

export default function MonthGrid({
  month,
  today,
  selected,
  tasks,
  modes,
  onPick,
}: {
  month: string // qualquer data do mês
  today: string
  selected: string
  tasks: Task[]
  modes: Record<string, DayMode>
  onPick: (date: string) => void
}) {
  const days = monthGrid(month)
  const monthKey = month.slice(0, 7)
  return (
    <div className="mes" role="group" aria-label="Calendário">
      {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((d) => (
        <small key={d} className="mes-cab">{d}</small>
      ))}
      {days.map((d) => {
        const dentro = d.startsWith(monthKey)
        const n = Number(d.slice(8))
        const mesNome = MONTH_LONG[Number(d.slice(5, 7)) - 1]
        const home = modes[d] === 'home'
        const do_dia = tasksForDay(tasks, d)
        const areas = [...new Set(do_dia.map((t) => t.area))].slice(0, 3)
        return (
          <button
            key={d}
            type="button"
            className={`mes-dia${dentro ? '' : ' fora'}${d === today ? ' hoje' : ''}${d === selected ? ' sel' : ''}`}
            aria-label={`${n} de ${mesNome}${home ? ', home office' : ''}`}
            onClick={() => onPick(d)}
          >
            <span>{home ? '🏠' : n}</span>
            <span className="pontos">
              {areas.map((a) => (
                <i key={a} className="ponto" style={{ ['--area' as string]: `var(--area-${a})` }} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
