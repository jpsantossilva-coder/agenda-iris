import type { Repos } from '../../data/repos'

/** Todos os dados dela em JSON legível. Itens excluídos ficam de fora; nada de ids internos de conta. */
export async function exportData(repos: Repos): Promise<string> {
  const [tasks, notes, money, dayModes, closing, settings] = await Promise.all([
    repos.tasks.list(),
    repos.notes.list(),
    repos.money.list(),
    repos.dayModes.range('1900-01-01', '2999-12-31'),
    repos.closing.all(),
    repos.settings.get(),
  ])
  return JSON.stringify({ exportadoEm: new Date().toISOString(), tasks, notes, money, dayModes, closing, settings }, null, 2)
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
