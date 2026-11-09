import { formatMin } from '../domain/dates'
import type { Task } from '../domain/types'
import Strike from '../motion/Strike'

/** Etiqueta de tecido: uma tarefa ou horário. A borda pontilhada leva a cor da área. */
export default function Etiqueta({
  task,
  done,
  strike,
  onStrikeEnd,
}: {
  task: Task
  done?: boolean
  strike?: boolean
  onStrikeEnd?: () => void
}) {
  return (
    <div className={`etiqueta${done ? ' feita' : ''}`} style={{ ['--area' as string]: `var(--area-${task.area})` }}>
      <b>
        <Strike play={!!strike} onEnd={onStrikeEnd}>{task.title}</Strike>
      </b>
      {task.estimateMin !== null && <small>{formatMin(task.estimateMin)}</small>}
    </div>
  )
}
