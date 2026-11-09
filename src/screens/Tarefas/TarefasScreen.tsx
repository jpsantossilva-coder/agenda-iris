import { useState } from 'react'
import { useNow, useRepos, useToday } from '../../app/context'
import { toggleDone } from '../../data/actions'
import { normalize } from '../../domain/text'
import { isDoneOn, postponed } from '../../domain/tasks'
import type { Task } from '../../domain/types'
import { useUndo } from '../../components/UndoToast'
import Etiqueta from '../../components/Etiqueta'
import Sheet from '../../shell/Sheet'
import TaskEditor from './TaskEditor'
import { useTasks } from './useTasks'

export default function TarefasScreen() {
  const repos = useRepos()
  const now = useNow()
  const today = useToday()
  const { tasks, reload } = useTasks()
  const { show, node } = useUndo()
  const [tab, setTab] = useState<'abertas' | 'concluidas'>('abertas')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Task | null>(null)

  if (!tasks) return null

  const q = normalize(search.trim())
  const found = tasks.filter((t) => normalize(t.title).includes(q))
  const concluida = (t: Task) => !t.repeat && t.doneAt !== null
  const atrasadas = new Set(postponed(found, today).map((t) => t.id))
  const abertas = found.filter((t) => !concluida(t) && !atrasadas.has(t.id))
  const adiadas = found.filter((t) => atrasadas.has(t.id))
  const feitas = found.filter(concluida)

  async function concluir(t: Task) {
    await toggleDone(repos.tasks, t, today, now())
    await reload()
  }
  async function excluir(t: Task) {
    await repos.tasks.remove(t.id)
    await reload()
    show('Tarefa excluída', async () => {
      await repos.tasks.restore(t.id)
      await reload()
    })
  }

  const Linha = ({ t }: { t: Task }) => {
    const feita = isDoneOn(t, today)
    return (
      <li className="linha-tarefa">
        <button type="button" className="check" aria-label={`${feita ? 'Reabrir' : 'Concluir'} ${t.title}`} onClick={() => void concluir(t)}>
          {feita ? '✓' : ''}
        </button>
        <Etiqueta task={t} done={feita} />
        <button type="button" className="mini" aria-label={`Editar ${t.title}`} onClick={() => setEditing(t)}>✎</button>
        <button type="button" className="mini" aria-label={`Excluir ${t.title}`} onClick={() => void excluir(t)}>🗑</button>
      </li>
    )
  }

  return (
    <section>
      <h1>Tarefas</h1>
      <div role="tablist" className="abas">
        <button role="tab" aria-selected={tab === 'abertas'} onClick={() => setTab('abertas')}>Abertas</button>
        <button role="tab" aria-selected={tab === 'concluidas'} onClick={() => setTab('concluidas')}>Concluídas</button>
      </div>
      <label className="busca">
        Buscar
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>

      {tab === 'abertas' ? (
        <>
          <ul className="lista">{abertas.map((t) => <Linha key={t.id} t={t} />)}</ul>
          {adiadas.length > 0 && (
            <>
              <h2 className="adiadas">Adiadas</h2>
              <ul className="lista">{adiadas.map((t) => <Linha key={t.id} t={t} />)}</ul>
            </>
          )}
        </>
      ) : (
        <ul className="lista">{feitas.map((t) => <Linha key={t.id} t={t} />)}</ul>
      )}

      {node}

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title="Editar atividade">
        {editing && (
          <TaskEditor
            task={editing}
            onSave={async (patch) => {
              await repos.tasks.update(editing.id, patch)
              setEditing(null)
              await reload()
            }}
          />
        )}
      </Sheet>
    </section>
  )
}
