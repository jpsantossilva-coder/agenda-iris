import { useState } from 'react'
import type { Task } from '../../domain/types'
import TaskFields, { fromTask, toNewTask, type FormValues } from './TaskFields'

export default function TaskEditor({ task, onSave }: { task: Task; onSave: (patch: Partial<Task>) => void | Promise<void> }) {
  const [v, setV] = useState<FormValues>(fromTask(task))
  return (
    <form
      className="quick-add"
      onSubmit={(e) => {
        e.preventDefault()
        if (!v.title.trim()) return
        void onSave(toNewTask(v))
      }}
    >
      <label>
        Título
        <input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      </label>
      <TaskFields value={v} onChange={(p) => setV({ ...v, ...p })} />
      <button type="submit" className="salvar" disabled={v.title.trim() === ''}>Salvar</button>
    </form>
  )
}
