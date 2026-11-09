import { Link, useNavigate } from 'react-router-dom'
import { useRepos, useNow } from '../../app/context'
import { greetingFor, utcToLocal, weekOf } from '../../domain/dates'
import { closingStatus } from '../../domain/closing'
import { dayLoad, isDoneOn, postponed, tasksForDay } from '../../domain/tasks'
import type { DayMode } from '../../domain/types'
import Etiqueta from '../../components/Etiqueta'
import FitaMetrica from '../../components/FitaMetrica'
import PostIt from '../../components/PostIt'
import WeekStrip from '../../components/WeekStrip'
import { useDayData } from './hooks'

export default function HojeScreen() {
  const repos = useRepos()
  const now = useNow()
  const navigate = useNavigate()
  const { data, reload, today } = useDayData()

  if (!data) return null

  const { tasks, notes, closing, settings, modes } = data
  const greeting = greetingFor(utcToLocal(now()).time)
  const name = settings.displayName.trim()
  const dia = tasksForDay(tasks, today)
  const load = dayLoad(tasks, today)
  const late = postponed(tasks, today).length
  const fechamento = closingStatus(closing, today)
  const mode: DayMode = modes[today] ?? 'presencial'

  async function choose(next: DayMode) {
    await repos.dayModes.set(today, next)
    await reload()
  }

  return (
    <section className="hoje">
      <h1>{name ? `${greeting}, ${name}` : greeting}</h1>

      <WeekStrip days={weekOf(today)} today={today} modes={modes} onPick={(d) => navigate(`/agenda?dia=${d}`)} />

      <div className="modo" role="group" aria-label="Como é o dia de hoje">
        {(['presencial', 'home'] as const).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => void choose(m)}>
            {m === 'home' ? 'Home office' : 'Presencial'}
          </button>
        ))}
      </div>

      {fechamento && (
        <p className="cartao-fechamento">
          {fechamento.daysLeft === 0
            ? `Fechamento: hoje · ${fechamento.nextLabel}`
            : `Fechamento: ${fechamento.daysLeft === 1 ? 'falta 1 dia' : `faltam ${fechamento.daysLeft} dias`} · ${fechamento.nextLabel}`}
        </p>
      )}

      {load.tight && <p className="aviso-calmo">Hoje é um dia cheio. Dá para ir por partes.</p>}

      <FitaMetrica
        tasks={dia}
        render={(t) => <Etiqueta task={t} done={isDoneOn(t, today)} />}
      />

      {late > 0 && (
        <Link to="/tarefas" className="convite-adiadas">
          {late === 1 ? '1 tarefa adiada, quer reagendar?' : `${late} tarefas adiadas, quer reagendar?`}
        </Link>
      )}

      <div className="postits">
        {notes.filter((n) => n.date === today).map((n) => (
          <PostIt key={n.id} note={n} />
        ))}
      </div>
    </section>
  )
}
