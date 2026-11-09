import { WEEKDAY_LONG, WEEKDAY_SHORT, weekdayOf } from '../domain/dates'
import type { DayMode } from '../domain/types'
import HomeBounce from '../motion/HomeBounce'

export default function WeekStrip({
  days,
  today,
  modes,
  onPick,
  bounceDay,
  onBounceEnd,
}: {
  days: string[]
  today: string
  modes: Record<string, DayMode>
  onPick: (date: string) => void
  bounceDay?: string
  onBounceEnd?: () => void
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
            <span className="botao-dia">
              {home ? <HomeBounce play={bounceDay === d} onEnd={onBounceEnd}>🏠</HomeBounce> : n}
            </span>
          </button>
        )
      })}
    </div>
  )
}
