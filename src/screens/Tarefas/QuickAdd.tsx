import { useState } from 'react'
import { useRepos, useToday } from '../../app/context'
import { suggestFromText } from '../../domain/suggest'
import type { Area } from '../../domain/types'
import TaskFields, { toNewTask, type FormValues } from './TaskFields'

const POSTIT = '#fff3a8'
const AVISO = 'Evite colocar CPF, salário ou dados de saúde de colegas.'

type Touched = Partial<Record<keyof FormValues, boolean>>

/** Anotar em 2 toques: abrir, digitar, Salvar. Data e área vêm do texto; o resto é opcional. */
export default function QuickAdd({ onSaved, initialDate }: { onSaved: () => void; initialDate?: string }) {
  const repos = useRepos()
  const today = useToday()
  const [tipo, setTipo] = useState<'atividade' | 'anotacao'>('atividade')
  const [detalhes, setDetalhes] = useState(false)
  // Quando a pessoa já escolheu um dia (ex.: tocou no calendário), a data vem dele e não do texto.
  const [touched, setTouched] = useState<Touched>(initialDate ? { date: true } : {})
  const [v, setV] = useState<FormValues>({
    title: '', area: 'trabalho', date: initialDate ?? today, time: '', estimate: '', remind: '15', repeat: 'none',
  })
  const [busy, setBusy] = useState(false)

  const sug = suggestFromText(v.title, today)
  const area: Area = touched.area ? v.area : sug.area ?? 'trabalho'
  const date = touched.date ? v.date : sug.date ?? today
  const effective: FormValues = { ...v, area, date }

  function change(patch: Partial<FormValues>) {
    setV((cur) => ({ ...cur, ...patch }))
    setTouched((cur) => ({ ...cur, ...Object.fromEntries(Object.keys(patch).map((k) => [k, true])) }))
  }

  async function save() {
    const title = v.title.trim()
    if (!title) return
    setBusy(true)
    try {
      if (tipo === 'anotacao') {
        await repos.notes.create({ text: title, color: POSTIT, date: today })
      } else {
        const settings = await repos.settings.get()
        const input = toNewTask({ ...effective, remind: touched.remind ? v.remind : String(settings.defaultRemindMin) })
        await repos.tasks.create(input)
      }
      onSaved()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      className="quick-add"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <div className="tipo" role="group" aria-label="Tipo">
        <button type="button" aria-pressed={tipo === 'atividade'} onClick={() => setTipo('atividade')}>Nova atividade</button>
        <button type="button" aria-pressed={tipo === 'anotacao'} onClick={() => setTipo('anotacao')}>Anotação rápida</button>
      </div>

      <label>
        O que você precisa fazer?
        <textarea
          autoFocus
          rows={2}
          value={v.title}
          onChange={(e) => setV((cur) => ({ ...cur, title: e.target.value }))}
        />
      </label>
      <p className="aviso-sensivel">{AVISO}</p>

      {tipo === 'atividade' && (
        <>
          {(sug.date || sug.area) && !detalhes && (
            <p className="sugestao">
              {sug.date && <span>Para {sug.date.split('-').reverse().slice(0, 2).join('/')}</span>}
              {sug.area && <span>Área: {sug.area}</span>}
            </p>
          )}
          <button type="button" className="link" onClick={() => setDetalhes((d) => !d)}>Mais detalhes</button>
          {detalhes && <TaskFields value={effective} onChange={change} />}
        </>
      )}

      <button type="submit" className="salvar" disabled={busy || v.title.trim() === ''}>Salvar</button>
    </form>
  )
}
