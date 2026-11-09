import type { ReactNode } from 'react'
import { MOTION_MS, useMotion } from './useMotion'

/** A casinha dá um pulinho feliz ao marcar home office. */
export default function HomeBounce({ play, onEnd, children }: { play: boolean; onEnd?: () => void; children?: ReactNode }) {
  const { running } = useMotion(play, MOTION_MS.home, onEnd)
  return <span className={`mi-home${running ? ' go' : ''}`}>{children}</span>
}
