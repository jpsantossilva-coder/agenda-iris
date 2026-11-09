import { useState } from 'react'
import Icon from '../../components/Icon'
import { useNow, useRepos, useToday } from '../../app/context'
import { toggleDone } from '../../data/actions'
import { normalize } from '../../domain/text'
import { isDoneOn, postponed } from '../../domain/tasks'
import type { Task } from '../../domain/types'
import { useUndo } from '../../components/UndoToast'
import Etiqueta from '../../components/Etiqueta'
import Sheet from '../../shell/Sheet'
import ScissorsCut from '../../motion/ScissorsCut'
import { avisarMascote } from '../../mascote/eventos'
import NotasLista from './NotasLista'
import TaskEditor from './TaskEditor'
import { useTasks } from './useTasks'

export default function TarefasScreen() {
  const repos = useRepos()
  const now = useNow()
  const today = useToday()
  const { tasks, reload } = useTasks()
  const { show, node } = useUndo()
  const [tab, setTab] = useState<'abertas' | 'concluidas' | 'anotacoes'>('abertas')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Task | null>(null)
  const [cutting, setCutting] = useState<Set<string>>(new Set())

  if (!tasks) return null

  const q = normalize(search.trim())
  const found = tasks.filter((t) => normalize(t.title).includes(q))
  const concluida = (t: Task) => !t.repeat && t.doneAt !== null
  const atrasadas = new Set(postponed(found, today).map((t) => t.id))
  const abertas = found.filter((t) => !concluida(t) && !atrasadas.has(t.id))
  const adiadas = found.filter((t) => atrasadas.has(t.id))
  const feitas = found.filter(concluida)

  async function concluir(t: Task) {
    const updated = await toggleDone(repos.tasks, t, today, now())
    if (isDoneOn(updated, today)) avisarMascote('concluiu')
    await reload()
  }
  const stopCutting = (id: string) =>
    setCutting((c) => {
      const n = new Set(c)
      n.delete(id)
      return n
    })

  // A tesoura corta primeiro; o Desfazer já aparece. Quando o corte acaba, a lista recarrega sem a tarefa.
  async function excluir(t: Task) {
    await repos.tasks.remove(t.id)
    setCutting((c) => new Set(c).add(t.id))
    show('Tarefa excluída', async () => {
      await repos.tasks.restore(t.id)
      stopCutting(t.id)
      await reload()
    })
  }

  // Função (não componente) para as linhas não remontarem a cada render e a animação não reiniciar.
  const linha = (t: Task) => {
    const feita = isDoneOn(t, today)
    return (
      <li key={t.id}>
        <ScissorsCut
          play={cutting.has(t.id)}
          onEnd={() => {
            stopCutting(t.id)
            void reload()
          }}
        >
          <div className="linha-tarefa">
            <button type="button" className="check" aria-label={`${feita ? 'Reabrir' : 'Concluir'} ${t.title}`} onClick={() => void concluir(t)}>
              {feita ? '✓' : ''}
            </button>
            <Etiqueta task={t} done={feita} />
            <button type="button" className="mini" aria-label={`Editar ${t.title}`} onClick={() => setEditing(t)}><Icon name="pencil" /></button>
            <button type="button" className="mini" aria-label={`Excluir ${t.title}`} onClick={() => void excluir(t)}><Icon name="trash" /></button>
          </div>
        </ScissorsCut>
      </li>
    )
  }

  return (
    <section>
      <h1>Tarefas</h1>
      <div role="tablist" className="abas">
        <button role="tab" aria-selected={tab === 'abertas'} onClick={() => setTab('abertas')}>Abertas</button>
        <button role="tab" aria-selected={tab === 'concluidas'} onClick={() => setTab('concluidas')}>Concluídas</button>
        <button role="tab" aria-selected={tab === 'anotacoes'} onClick={() => setTab('anotacoes')}>Anotações</button>
      </div>
      <label className="busca">
        Buscar
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>

      {tab === 'abertas' ? (
        <>
          <ul className="lista">{abertas.map(linha)}</ul>
          {adiadas.length > 0 && (
            <>
              <h2 className="adiadas">Adiadas</h2>
              <ul className="lista">{adiadas.map(linha)}</ul>
            </>
          )}
        </>
      ) : tab === 'concluidas' ? (
        <ul className="lista">{feitas.map(linha)}</ul>
      ) : (
        <NotasLista search={search} />
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
