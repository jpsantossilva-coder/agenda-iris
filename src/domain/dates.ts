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
