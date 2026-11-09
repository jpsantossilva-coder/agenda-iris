import type { ReactNode } from 'react'
import { MOTION_MS, useMotion } from './useMotion'

/** Uma tesoura corta a etiqueta ao excluir. */
export default function ScissorsCut({ play, onEnd, children }: { play: boolean; onEnd?: () => void; children?: ReactNode }) {
  const { running } = useMotion(play, MOTION_MS.cut, onEnd)
  return (
    <div className={`mi-cut${running ? ' go' : ''}`}>
      {children}
      {running && <i className="mi-scissors" aria-hidden>✂️</i>}
    </div>
  )
}
