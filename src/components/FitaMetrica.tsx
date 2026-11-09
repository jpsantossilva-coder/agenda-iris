import type { ReactNode } from 'react'
import type { Task } from '../domain/types'

/** O dia numa fita métrica: as horas na fita e as etiquetas ao lado. */
export default function FitaMetrica({
  tasks,
  render,
}: {
  tasks: Task[]
  render: (task: Task) => ReactNode
}) {
  return (
    <ol className="fita" aria-label="Dia">
      {tasks.map((t) => (
        <li key={t.id}>
          <span className="fita-hora">{t.time ?? '·'}</span>
          {render(t)}
        </li>
      ))}
    </ol>
  )
}
