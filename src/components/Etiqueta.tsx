import { formatMin } from '../domain/dates'
import type { Task } from '../domain/types'

/** Etiqueta de tecido: uma tarefa ou horário. A borda pontilhada leva a cor da área. */
export default function Etiqueta({ task, done }: { task: Task; done?: boolean }) {
  return (
    <div className={`etiqueta${done ? ' feita' : ''}`} style={{ ['--area' as string]: `var(--area-${task.area})` }}>
      <b>{task.title}</b>
      {task.estimateMin !== null && <small>{formatMin(task.estimateMin)}</small>}
    </div>
  )
}
