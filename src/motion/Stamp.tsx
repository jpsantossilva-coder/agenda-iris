import { MOTION_MS, useMotion } from './useMotion'

/** Carimbo "FEITO" batendo no post-it. */
export default function Stamp({ play, onEnd }: { play: boolean; onEnd?: () => void }) {
  const { running } = useMotion(play, MOTION_MS.stamp, onEnd)
  if (!play) return null
  return <i className={`mi-stamp${running ? ' go' : ' on'}`} aria-hidden>FEITO</i>
}
