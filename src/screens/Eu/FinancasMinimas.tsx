import { useCallback, useEffect, useState } from 'react'
import { useRepos } from '../../app/context'
import type { MoneyNote } from '../../data/repos'
import { useUndo } from '../../components/UndoToast'

export function parseAmount(text: string): number | null {
  const t = text.trim()
  if (!t) return null
  const n = Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t)
  return Number.isFinite(n) ? n : null
}

export function formatBRL(n: number): string {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Só uma anotação: texto e valor opcional. Sem categorias, somas nem gráficos (o app Metas cuida disso). */
export default function FinancasMinimas() {
  const { money } = useRepos()
  const { show, node } = useUndo()
  const [items, setItems] = useState<MoneyNote[]>([])
  const [text, setText] = useState('')
  const [amount, setAmount] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => setItems(await money.list()), [money])
  useEffect(() => {
    void load()
  }, [load])

  async function submit() {
    if (!text.trim()) return
    const value = parseAmount(amount)
    if (editingId) await money.update(editingId, { text: text.trim(), amount: value })
    else await money.create({ text: text.trim(), amount: value })
    setText('')
    setAmount('')
    setEditingId(null)
    await load()
  }

  async function excluir(m: MoneyNote) {
    await money.remove(m.id)
    await load()
    show('Anotação excluída', async () => {
      await money.restore(m.id)
      await load()
    })
  }

  return (
    <section className="financas">
      <h2>Anotações financeiras</h2>
      <ul className="lista">
        {items.map((m) => (
          <li key={m.id} className="linha-tarefa">
            <span className="etapa">
              <b>{m.text}</b> {m.amount !== null && <small>{formatBRL(m.amount)}</small>}
            </span>
            <button
              type="button"
              className="mini"
              aria-label={`Editar ${m.text}`}
              onClick={() => {
                setEditingId(m.id)
                setText(m.text)
                setAmount(m.amount === null ? '' : String(m.amount).replace('.', ','))
              }}
            >
              ✎
            </button>
            <button type="button" className="mini" aria-label={`Excluir ${m.text}`} onClick={() => void excluir(m)}>🗑</button>
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
          O que você quer anotar?
          <input value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label>
          Valor (opcional)
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <button type="submit" className="salvar" disabled={!text.trim()}>
          {editingId ? 'Salvar anotação' : 'Anotar'}
        </button>
      </form>
      {node}
    </section>
  )
}
