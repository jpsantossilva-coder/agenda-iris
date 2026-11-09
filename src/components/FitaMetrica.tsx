import type { ReactNode } from 'react'
import type { Task } from '../domain/types'

/** A lista de peças do dia. */
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
        <li key={t.id}>{render(t)}</li>
      ))}
    </ol>
  )
}
