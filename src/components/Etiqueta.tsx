import { formatMin, formatTimeLabel } from '../domain/dates'
import type { Task } from '../domain/types'
import Strike from '../motion/Strike'

/**
 * Peça do dia, como uma peça de molde: seta de fio na cor da área, linha de corte pontilhada,
 * hora no canto. Concluída, a hora vira "feito".
 */
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
      <i className="fio" aria-hidden />
      {done ? <span className="hora">feito</span> : task.time && <span className="hora">{formatTimeLabel(task.time)}</span>}
      <b>
        <Strike play={!!strike} onEnd={onStrikeEnd}>{task.title}</Strike>
      </b>
      {task.estimateMin !== null && <small>{formatMin(task.estimateMin)}</small>}
    </div>
  )
}
