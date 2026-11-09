import { useCallback, useEffect, useState } from 'react'
import { useRepos } from '../../app/context'
import type { Note } from '../../data/repos'
import { normalize } from '../../domain/text'
import { useUndo } from '../../components/UndoToast'
import Sheet from '../../shell/Sheet'

/** Todos os post-its, de qualquer dia: dá para editar e excluir (com Desfazer). */
export default function NotasLista({ search }: { search: string }) {
  const { notes: repo } = useRepos()
  const { show, node } = useUndo()
  const [notes, setNotes] = useState<Note[]>([])
  const [editing, setEditing] = useState<Note | null>(null)
  const [texto, setTexto] = useState('')

  const load = useCallback(async () => setNotes(await repo.list()), [repo])
  useEffect(() => {
    void load()
  }, [load])

  async function excluir(n: Note) {
    await repo.remove(n.id)
    await load()
    show('Anotação excluída', async () => {
      await repo.restore(n.id)
      await load()
    })
  }

  const q = normalize(search.trim())
  const visiveis = notes.filter((n) => normalize(n.text).includes(q))

  return (
    <>
      <ul className="lista">
        {visiveis.map((n) => (
          <li key={n.id} className="linha-tarefa">
            <div className="postit nota-lista" style={{ background: n.color }}>
              {n.text}
              <small>{n.date.split('-').reverse().join('/')}</small>
            </div>
            <button
              type="button"
              className="mini"
              aria-label={`Editar anotação ${n.text}`}
              onClick={() => {
                setEditing(n)
                setTexto(n.text)
              }}
            >
              ✎
            </button>
            <button type="button" className="mini" aria-label={`Excluir anotação ${n.text}`} onClick={() => void excluir(n)}>🗑</button>
          </li>
        ))}
      </ul>
      {node}
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title="Editar anotação">
        <form
          className="quick-add"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!editing || !texto.trim()) return
            await repo.update(editing.id, { text: texto.trim() })
            setEditing(null)
            await load()
          }}
        >
          <label>
            Texto da anotação
            <textarea rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} />
          </label>
          <button type="submit" className="salvar" disabled={!texto.trim()}>Salvar</button>
        </form>
      </Sheet>
    </>
  )
}
