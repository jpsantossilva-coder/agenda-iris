import { addDays, weekdayOf } from './dates'
import { normalize } from './text'
import type { Area } from './types'

const WEEKDAYS: [string, number][] = [
  ['domingo', 0], ['segunda', 1], ['terca', 2], ['quarta', 3],
  ['quinta', 4], ['sexta', 5], ['sabado', 6],
]

const AREA_HINTS: [RegExp, Area][] = [
  [/\b(costura|costurar|tecido|molde)\b/, 'costura'],
  [/\b(leitura|livro|ler)\b/, 'leitura'],
  [/\b(familia|aniversario|festa)\b/, 'familia'],
  [/\b(remedio|medico|consulta|dentista)\b/, 'saude'],
  [/\b(fechamento)\b/, 'fechamento'],
]

export function suggestFromText(text: string, today: string): { date?: string; area?: Area } {
  const t = normalize(text)
  const out: { date?: string; area?: Area } = {}

  if (/\bhoje\b/.test(t)) out.date = today
  else if (/\bamanha\b/.test(t)) out.date = addDays(today, 1)
  else {
    for (const [name, wd] of WEEKDAYS) {
      if (new RegExp(`\\b${name}\\b`).test(t)) {
        out.date = addDays(today, (wd - weekdayOf(today) + 7) % 7)
        break
      }
    }
  }

  for (const [re, area] of AREA_HINTS) {
    if (re.test(t)) {
      out.area = area
      break
    }
  }
  return out
}
