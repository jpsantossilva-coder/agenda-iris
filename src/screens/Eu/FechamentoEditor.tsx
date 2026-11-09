import { useCallback, useEffect, useState } from 'react'
import { useRepos } from '../../app/context'
import { MONTH_LONG } from '../../domain/dates'
import type { ClosingCycle } from '../../domain/types'
import { useUndo } from '../../components/UndoToast'

type Step = ClosingCycle['steps'][number]
const newId = () => globalThis.crypto?.randomUUID?.() ?? `etapa-${Date.now()}-${Math.random()}`
const byDate = (a: Step, b: Step) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

/** Etapas do fechamento de folha do mês. Ela mesma define nomes e datas; o app só conta os dias. */
export default function FechamentoEditor({ month }: { month: string }) {
  const { closing } = useRepos()
  const { show, node } = useUndo()
  const [steps, setSteps] = useState<Step[]>([])
  const [label, setLabel] = useState('')
  const [date, setDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const cycle = await closing.get(month)
    setSteps([...(cycle?.steps ?? [])].sort(byDate))
  }, [closing, month])

  useEffect(() => {
    void load()
  }, [load])

  async function persist(next: Step[]) {
    const sorted = [...next].sort(byDate)
    await closing.save({ month, steps: sorted })
    setSteps(sorted)
  }

  async function submit() {
    if (!label.trim() || !date) return
    if (editingId) {
      await persist(steps.map((s) => (s.id === editingId ? { ...s, label: label.trim(), date } : s)))
    } else {
      await persist([...steps, { id: newId(), label: label.trim(), date }])
    }
    setLabel('')
    setDate('')
    setEditingId(null)
  }

  async function remove(step: Step) {
    await persist(steps.filter((s) => s.id !== step.id))
    show('Etapa excluída', async () => {
      const cycle = await closing.get(month)
      await persist([...(cycle?.steps ?? []), step])
    })
  }

  const mes = MONTH_LONG[Number(month.slice(5, 7)) - 1]

  return (
    <section className="fechamento">
      <h2>{`Fechamento de ${mes} de ${month.slice(0, 4)}`}</h2>
      <ul className="lista">
        {steps.map((s) => (
          <li key={s.id} className="linha-tarefa">
            <span className="etapa">
              <b>{s.label}</b> <small>{s.date.split('-').reverse().join('/')}</small>
            </span>
            <button
              type="button"
              className="mini"
              aria-label={`Editar etapa ${s.label}`}
              onClick={() => {
                setEditingId(s.id)
                setLabel(s.label)
                setDate(s.date)
              }}
            >
              ✎
            </button>
            <button type="button" className="mini" aria-label={`Excluir etapa ${s.label}`} onClick={() => void remove(s)}>🗑</button>
          </li>
        ))}
      </ul>

      <form
        className="quick-add"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <label>
          Nome da etapa
          <input value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label>
          Data
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="submit" className="salvar" disabled={!label.trim() || !date}>
          {editingId ? 'Salvar etapa' : 'Adicionar etapa'}
        </button>
      </form>
      {node}
    </section>
  )
}
