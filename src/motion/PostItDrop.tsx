import type { ReactNode } from 'react'
import { MOTION_MS, useMotion } from './useMotion'

/** O post-it cai na tela e a fita adesiva cola. */
export default function PostItDrop({ play, onEnd, children }: { play: boolean; onEnd?: () => void; children?: ReactNode }) {
  const { running } = useMotion(play, MOTION_MS.postit, onEnd)
  return <div className={`mi-drop${running ? ' go' : ''}`}>{children}</div>
}
