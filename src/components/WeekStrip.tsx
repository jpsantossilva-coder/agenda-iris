import { WEEKDAY_LONG, WEEKDAY_SHORT, weekdayOf } from '../domain/dates'
import type { DayMode } from '../domain/types'

export default function WeekStrip({
  days,
  today,
  modes,
  onPick,
}: {
  days: string[]
  today: string
  modes: Record<string, DayMode>
  onPick: (date: string) => void
}) {
  return (
    <div className="week" role="group" aria-label="Semana">
      {days.map((d) => {
        const wd = weekdayOf(d)
        const home = modes[d] === 'home'
        const n = Number(d.slice(8))
        return (
          <button
            key={d}
            type="button"
            className={`week-day${d === today ? ' hoje' : ''}${home ? ' home' : ''}`}
            aria-label={`${WEEKDAY_LONG[wd]} ${n}${home ? ', home office' : ''}`}
            onClick={() => onPick(d)}
          >
            <small>{WEEKDAY_SHORT[wd]}</small>
            <span className="botao-dia">{home ? '🏠' : n}</span>
          </button>
        )
      })}
    </div>
  )
}
