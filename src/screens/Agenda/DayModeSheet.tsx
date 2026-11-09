import { WEEKDAY_LONG, weekdayOf } from '../../domain/dates'
import type { DayMode } from '../../domain/types'
import Sheet from '../../shell/Sheet'

export default function DayModeSheet({
  date,
  mode,
  onChange,
  onClose,
}: {
  date: string | null
  mode: DayMode
  onChange: (mode: DayMode) => void
  onClose: () => void
}) {
  if (!date) return null
  const wd = weekdayOf(date)
  const artigo = wd === 0 || wd === 6 ? 'o' : 'a'
  const title = `Como vai ser ${artigo} ${WEEKDAY_LONG[wd]}, dia ${Number(date.slice(8))}?`
  return (
    <Sheet open onClose={onClose} title={title}>
      <div className="sheet-options">
        {(['presencial', 'home'] as const).map((m) => (
          <button key={m} type="button" className="sheet-option" aria-pressed={mode === m} onClick={() => onChange(m)}>
            {m === 'home' ? 'Home office' : 'Presencial'}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
