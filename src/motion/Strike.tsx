import type { ReactNode } from 'react'
import { MOTION_MS, useMotion } from './useMotion'

/** Uma canetinha risca o texto. */
export default function Strike({ play, onEnd, children }: { play: boolean; onEnd?: () => void; children?: ReactNode }) {
  const { running } = useMotion(play, MOTION_MS.strike, onEnd)
  return (
    <span className={`mi-strike${running ? ' go' : ''}`}>
      {children}
      {running && (
        <>
          <i className="mi-strike-line" aria-hidden />
          <i className="mi-pen" aria-hidden>✏️</i>
        </>
      )}
    </span>
  )
}
