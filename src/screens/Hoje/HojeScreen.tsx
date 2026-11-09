import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRepos, useNow } from '../../app/context'
import { toggleDone } from '../../data/actions'
import { formatLongDate, formatMin, greetingFor, utcToLocal, weekOf } from '../../domain/dates'
import { closingStatus } from '../../domain/closing'
import { allDoneOn, dayLoad, isDoneOn, postponed, tasksForDay } from '../../domain/tasks'
import type { DayMode, Task } from '../../domain/types'
import Etiqueta from '../../components/Etiqueta'
import FitaMetrica from '../../components/FitaMetrica'
import PostIt from '../../components/PostIt'
import WeekStrip from '../../components/WeekStrip'
import { useUndo } from '../../components/UndoToast'
import ButtonRain from '../../motion/ButtonRain'
import { useDayData } from './hooks'

const FRESH_MS = 3000

export default function HojeScreen() {
  const repos = useRepos()
  const now = useNow()
  const navigate = useNavigate()
  const { data, reload, today } = useDayData()
  const { show, node } = useUndo()
  const [striking, setStriking] = useState<Set<string>>(new Set())
  const [stamping, setStamping] = useState<Set<string>>(new Set())
  const [rain, setRain] = useState(false)
  const [bounce, setBounce] = useState<string | undefined>()

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
    if (next === 'home') setBounce(today)
    await reload()
  }

  async function concluir(t: Task) {
    const updated = await toggleDone(repos.tasks, t, today, now())
    const concluida = isDoneOn(updated, today)
    if (concluida) setStriking((s) => new Set(s).add(t.id))
    if (concluida && allDoneOn(tasks.map((x) => (x.id === updated.id ? updated : x)), today)) setRain(true)
    await reload()
  }

  async function darBaixa(id: string, text: string) {
    await repos.notes.remove(id)
    setStamping((s) => {
      const n = new Set(s)
      n.delete(id)
      return n
    })
    await reload()
    show('Anotação concluída', async () => {
      await repos.notes.restore(id)
      await reload()
      void text
    })
  }

  return (
    <section className="hoje">
      <h1>{name ? `${greeting}, ${name}` : greeting}</h1>
      <p className="data-hoje">{formatLongDate(today)}</p>

      <WeekStrip
        days={weekOf(today)}
        today={today}
        modes={modes}
        onPick={(d) => navigate(`/agenda?dia=${d}`)}
        bounceDay={bounce}
        onBounceEnd={() => setBounce(undefined)}
      />

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

      {load.totalMin > 0 && <p className="soma-dia">{`Hoje: ${formatMin(load.totalMin)} de coisas`}</p>}
      {load.tight && <p className="aviso-calmo">Hoje é um dia cheio. Dá para ir por partes.</p>}

      <FitaMetrica
        tasks={dia}
        render={(t) => {
          const feita = isDoneOn(t, today)
          return (
            <div className="linha-tarefa">
              <button type="button" className="check" aria-label={`${feita ? 'Reabrir' : 'Concluir'} ${t.title}`} onClick={() => void concluir(t)}>
                {feita ? '✓' : ''}
              </button>
              <Etiqueta
                task={t}
                done={feita}
                strike={striking.has(t.id)}
                onStrikeEnd={() =>
                  setStriking((s) => {
                    const n = new Set(s)
                    n.delete(t.id)
                    return n
                  })
                }
              />
            </div>
          )
        }}
      />

      {late > 0 && (
        <Link to="/tarefas" className="convite-adiadas">
          {late === 1 ? '1 tarefa adiada, quer reagendar?' : `${late} tarefas adiadas, quer reagendar?`}
        </Link>
      )}

      <div className="postits">
        {notes
          .filter((n) => n.date === today)
          .map((n) => (
            <PostIt
              key={n.id}
              note={n}
              fresh={now().getTime() - Date.parse(n.createdAt) < FRESH_MS}
              stamping={stamping.has(n.id)}
              onStamped={() => void darBaixa(n.id, n.text)}
              onDarBaixa={() => setStamping((s) => new Set(s).add(n.id))}
            />
          ))}
      </div>

      <ButtonRain play={rain} onEnd={() => setRain(false)} />
      {node}
    </section>
  )
}
