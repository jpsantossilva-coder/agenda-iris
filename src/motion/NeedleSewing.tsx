import { MOTION_MS, useMotion } from './useMotion'

/** Uma agulha costura uma linha pontilhada de ponta a ponta. */
export default function NeedleSewing({ play, onEnd }: { play: boolean; onEnd?: () => void }) {
  const { running } = useMotion(play, MOTION_MS.sewing, onEnd)
  if (!running) return null
  return (
    <div className="mi-sewing go" aria-hidden>
      <i className="mi-thread" />
      <span className="mi-needle">🪡</span>
    </div>
  )
}
