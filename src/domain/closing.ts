import { diffDays } from './dates'
import type { ClosingCycle } from './types'

export function closingStatus(
  cycle: ClosingCycle | null,
  today: string,
): { daysLeft: number; nextLabel: string } | null {
  if (!cycle) return null
  const next = cycle.steps
    .filter((s) => s.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))[0]
  return next ? { daysLeft: diffDays(today, next.date), nextLabel: next.label } : null
}
