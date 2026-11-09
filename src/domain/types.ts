export type Area =
  | 'trabalho' | 'fechamento' | 'costura' | 'familia' | 'descanso' | 'leitura' | 'saude'

export const AREAS: { id: Area; label: string }[] = [
  { id: 'trabalho', label: 'Trabalho' },
  { id: 'fechamento', label: 'Fechamento' },
  { id: 'costura', label: 'Costura' },
  { id: 'familia', label: 'Família' },
  { id: 'descanso', label: 'Descanso' },
  { id: 'leitura', label: 'Leitura' },
  { id: 'saude', label: 'Saúde' },
]

export type Repeat = { freq: 'daily' | 'weekly'; weekdays?: number[]; until?: string }

export type Task = {
  id: string
  title: string
  area: Area
  date: string | null
  time: string | null
  estimateMin: number | null
  doneDates: string[]
  doneAt: string | null
  remindMinBefore: number
  repeat: Repeat | null
  deletedAt: string | null
}

export type DayMode = 'presencial' | 'home'

export type ClosingCycle = {
  month: string
  steps: { id: string; label: string; date: string }[]
}
