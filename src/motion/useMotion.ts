import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Duração de cada microinteração, em ms. Todas abaixo de 1 s, menos a chuva de botões. */
export const MOTION_MS = {
  strike: 700,
  stamp: 450,
  sewing: 700,
  home: 700,
  postit: 800,
  rain: 2200,
  cut: 900,
} as const

/**
 * Roda uma animação quando `play` vira verdadeiro e chama `onEnd` no fim.
 * Com "reduzir movimento", não anima e chama `onEnd` na hora.
 */
export function useMotion(play: boolean, ms: number, onEnd?: () => void) {
  const reduced = usePrefersReducedMotion()
  const [running, setRunning] = useState(false)
  const endRef = useRef(onEnd)
  endRef.current = onEnd

  useEffect(() => {
    if (!play) {
      setRunning(false)
      return
    }
    if (reduced) {
      setRunning(false)
      endRef.current?.()
      return
    }
    setRunning(true)
    const id = setTimeout(() => {
      setRunning(false)
      endRef.current?.()
    }, ms)
    return () => clearTimeout(id)
  }, [play, reduced, ms])

  return { running, reduced }
}
