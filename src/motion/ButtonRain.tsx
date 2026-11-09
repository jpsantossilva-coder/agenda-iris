import { MOTION_MS, useMotion } from './useMotion'

const BOTOES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37) % 90 + 2,
  delay: (i * 83) % 600,
}))

/** Chuva de botões de costura quando ela conclui tudo do dia. */
export default function ButtonRain({ play, onEnd }: { play: boolean; onEnd?: () => void }) {
  const { running } = useMotion(play, MOTION_MS.rain, onEnd)
  if (!running) return null
  return (
    <div className="mi-rain go" role="status">
      <b>Dia fechado! ♡</b>
      {BOTOES.map((b, i) => (
        <span key={i} className="mi-fall" aria-hidden style={{ left: `${b.left}%`, animationDelay: `${b.delay}ms` }} />
      ))}
    </div>
  )
}
