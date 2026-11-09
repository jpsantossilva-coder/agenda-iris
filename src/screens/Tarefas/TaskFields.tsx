import { AREAS, type Area } from '../../domain/types'
import type { NewTask } from '../../data/repos'
import type { Task } from '../../domain/types'

export type FormValues = {
  title: string
  area: Area
  date: string
  time: string
  estimate: string
  remind: string
  repeat: 'none' | 'daily' | 'weekly'
}

export function fromTask(t: Task): FormValues {
  return {
    title: t.title,
    area: t.area,
    date: t.date ?? '',
    time: t.time ?? '',
    estimate: t.estimateMin === null ? '' : String(t.estimateMin),
    remind: String(t.remindMinBefore),
    repeat: t.repeat?.freq ?? 'none',
  }
}

export function toNewTask(v: FormValues): NewTask {
  const est = Number(v.estimate)
  return {
    title: v.title.trim(),
    area: v.area,
    date: v.date || null,
    time: v.time || null,
    estimateMin: v.estimate && est > 0 ? est : null,
    remindMinBefore: Number(v.remind) >= 0 && v.remind !== '' ? Number(v.remind) : 15,
    repeat: v.repeat === 'none' ? null : { freq: v.repeat },
  }
}

/** Campos completos de uma atividade (área, data, hora, tempo, lembrete, repetição). */
export default function TaskFields({
  value,
  onChange,
}: {
  value: FormValues
  onChange: (patch: Partial<FormValues>) => void
}) {
  return (
    <div className="campos">
      <label>
        Área
        <select value={value.area} onChange={(e) => onChange({ area: e.target.value as Area })}>
          {AREAS.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </label>
      <label>
        Data
        <input type="date" value={value.date} onChange={(e) => onChange({ date: e.target.value })} />
      </label>
      <label>
        Hora
        <input type="time" value={value.time} onChange={(e) => onChange({ time: e.target.value })} />
      </label>
      <label>
        Tempo estimado (min)
        <input type="number" min="0" inputMode="numeric" value={value.estimate} onChange={(e) => onChange({ estimate: e.target.value })} />
      </label>
      <label>
        Lembrete (min antes)
        <input type="number" min="0" inputMode="numeric" value={value.remind} onChange={(e) => onChange({ remind: e.target.value })} />
      </label>
      <label>
        Repetir
        <select value={value.repeat} onChange={(e) => onChange({ repeat: e.target.value as FormValues['repeat'] })}>
          <option value="none">Não repete</option>
          <option value="daily">Todo dia</option>
          <option value="weekly">Toda semana</option>
        </select>
      </label>
    </div>
  )
}
