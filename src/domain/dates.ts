// Datas locais "YYYY-MM-DD" e horas "HH:mm" no fuso fixo de Brasília (UTC-3, sem horário de verão).
const OFFSET_MIN = -180
const DAY_MS = 86_400_000

function utcMidnight(date: string): number {
  return Date.parse(`${date}T00:00:00Z`)
}

export function addDays(date: string, n: number): string {
  return new Date(utcMidnight(date) + n * DAY_MS).toISOString().slice(0, 10)
}

export function diffDays(from: string, to: string): number {
  return Math.round((utcMidnight(to) - utcMidnight(from)) / DAY_MS)
}

/** 0 = domingo ... 6 = sábado */
export function weekdayOf(date: string): number {
  return new Date(utcMidnight(date)).getUTCDay()
}

export const WEEKDAY_LONG = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
export const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export const MONTH_LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

/** 42 dias (6 semanas, segunda a domingo) que cobrem o mês da data. */
export function monthGrid(date: string): string[] {
  const first = `${date.slice(0, 7)}-01`
  const start = weekOf(first)[0]
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** Segunda a domingo da semana que contém a data. */
export function weekOf(date: string): string[] {
  const monday = addDays(date, -((weekdayOf(date) + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function greetingFor(time: string): string {
  const hour = Number(time.slice(0, 2))
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** 40 -> "40 min", 60 -> "1h", 90 -> "1h30". */
export function formatMin(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

/** Instante UTC de uma data e hora locais de Brasília. */
export function localToUtc(date: string, time: string): Date {
  return new Date(Date.parse(`${date}T${time}:00-03:00`))
}

/** Data e hora locais de Brasília de um instante UTC. */
export function utcToLocal(nowUtc: Date): { date: string; time: string } {
  const shifted = new Date(nowUtc.getTime() + OFFSET_MIN * 60_000)
  const iso = shifted.toISOString()
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) }
}
