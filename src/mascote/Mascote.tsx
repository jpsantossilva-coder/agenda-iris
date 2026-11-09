import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useRepos } from '../app/context'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'
import { ouvirMascote } from './eventos'
import { FALA_MIN_MS, reacaoPara, SONO_MS, type Gatilho, type Humor } from './humor'
import p1 from './img/pose-1.png'
import p2 from './img/pose-2.png'
import p3 from './img/pose-3.png'
import p4 from './img/pose-4.png'
import p5 from './img/pose-5.png'
import p7 from './img/pose-7.png'
import p8 from './img/pose-8.png'
import './mascote.css'

type PoseEmPe = 1 | 2 | 3 | 4 | 8
const POSES: [PoseEmPe, string][] = [[1, p1], [2, p2], [3, p3], [4, p4], [8, p8]]
const POSE_DO_HUMOR: Record<Exclude<Humor, 'dorme'>, PoseEmPe> = { oi: 2, parada: 1, acorda: 4, pulo: 3, vitoria: 4, reverencia: 8 }

// Tamanho M: 84 pontos de altura em pé. As fotos têm espaço vazio em volta; o quadro compensa.
const ALTURA = 84
const HF = ALTURA / 0.7
const WF = (HF * 765) / 1024
const QUADRO: CSSProperties = { left: -0.26 * WF, top: -0.27 * HF, width: WF, height: HF }
const LARGURA_DEITADA = 100
const WD = LARGURA_DEITADA / 0.86
const HD = (WD * 765) / 1024
const QUADRO_DEITADA: CSSProperties = { left: -0.07 * WD, top: -0.33 * HD, width: WD, height: HD }

// Lâmina da espada em cada pose (fração do quadro): da guarda até a ponta. O brilho corre por ela.
const LAMINA: Record<PoseEmPe, [number, number, number, number]> = {
  1: [0.398, 0.47, 0.395, 0.07],
  2: [0.732, 0.62, 0.732, 0.93],
  3: [0.285, 0.36, 0.36, 0.07],
  4: [0.285, 0.36, 0.36, 0.07],
  8: [0.732, 0.62, 0.732, 0.93],
}
function trilhaDoBrilho(pose: PoseEmPe): CSSProperties {
  const [gx, gy, tx, ty] = LAMINA[pose]
  const x = (f: number) => `${(f - 0.26) * WF - 7}px`
  const y = (f: number) => `${(f - 0.27) * HF - 7}px`
  return { ['--x0' as string]: x(gx), ['--y0' as string]: y(gy), ['--x1' as string]: x(tx), ['--y1' as string]: y(ty) }
}

/**
 * A gatinha cavaleira no cantinho, em pé sobre a barra de baixo.
 * Dá oi ao abrir, dorme se ninguém toca na tela, acorda erguendo a espada,
 * pula quando uma tarefa é concluída e avisa pelo balão quando algo foi agendado.
 */
export default function Mascote() {
  const repos = useRepos()
  const semMovimento = usePrefersReducedMotion()
  const [humor, setHumor] = useState<Humor>('parada')
  const [fala, setFala] = useState<{ texto: string; vez: number } | null>(null)
  const humorRef = useRef<Humor>('parada')
  const nomeRef = useRef('')
  const tHumor = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tFala = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tSono = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const acontecerRef = useRef<(g: Gatilho) => void>(() => {})

  useEffect(() => {
    let vivo = true
    const mudar = (h: Humor) => {
      humorRef.current = h
      setHumor(h)
    }
    const vigiarSono = () => {
      clearTimeout(tSono.current)
      tSono.current = setTimeout(() => {
        clearTimeout(tHumor.current)
        clearTimeout(tFala.current)
        setFala(null)
        mudar('dorme')
      }, SONO_MS)
    }
    const acontecer = (gatilho: Gatilho) => {
      vigiarSono()
      const r = reacaoPara(gatilho, humorRef.current, nomeRef.current)
      if (!r) return
      clearTimeout(tHumor.current)
      mudar(r.humor)
      tHumor.current = setTimeout(() => mudar('parada'), r.ms)
      if (r.fala) {
        const texto = r.fala
        clearTimeout(tFala.current)
        setFala((f) => ({ texto, vez: (f?.vez ?? 0) + 1 }))
        tFala.current = setTimeout(() => setFala(null), Math.max(r.ms, FALA_MIN_MS))
      }
    }
    acontecerRef.current = acontecer

    void repos.settings.get().then(
      (s) => {
        if (!vivo) return
        nomeRef.current = s.displayName
        acontecer('abriu')
      },
      () => vivo && acontecer('abriu'),
    )
    const tocou = () => acontecer('tocou')
    window.addEventListener('pointerdown', tocou, true)
    window.addEventListener('keydown', tocou, true)
    const parar = ouvirMascote(acontecer)
    return () => {
      vivo = false
      parar()
      window.removeEventListener('pointerdown', tocou, true)
      window.removeEventListener('keydown', tocou, true)
      clearTimeout(tHumor.current)
      clearTimeout(tFala.current)
      clearTimeout(tSono.current)
    }
  }, [repos])

  const dorme = humor === 'dorme'
  const pose = dorme ? 1 : POSE_DO_HUMOR[humor]

  return (
    <div className="mascote">
      {fala && (
        <p key={fala.vez} className={`mascote-balao${semMovimento ? ' sem-movimento' : ''}`} role="status">
          <svg className="mascote-linha" viewBox="0 0 40 30" aria-hidden="true">
            <path d="M2 6 C16 2 30 10 38 28" />
          </svg>
          <span className="mascote-papel">{fala.texto}</span>
        </p>
      )}
      <button
        type="button"
        className={`mascote-gata${semMovimento ? ' sem-movimento' : ''}`}
        aria-label="Mascote"
        data-humor={humor}
        onClick={() => acontecerRef.current('tocou-na-gata')}
      >
        <span className="gata-em-pe" hidden={dorme} style={{ width: WF * 0.6, height: ALTURA }}>
          <span className="gata-move">
            <span className="gata-corpo">
              {POSES.map(([n, src]) => (
                <img key={n} className={`gata-pose${n === pose ? ' on' : ''}`} src={src} alt="" style={QUADRO} draggable={false} />
              ))}
              <img className="gata-piscada" src={p7} alt="" style={QUADRO} draggable={false} />
              <svg className="gata-brilho" viewBox="0 0 14 14" style={trilhaDoBrilho(pose)} aria-hidden="true">
                <path d="M7 0C7.6 4.5 9.5 6.4 14 7 9.5 7.6 7.6 9.5 7 14 6.4 9.5 4.5 7.6 0 7 4.5 6.4 6.4 4.5 7 0Z" />
              </svg>
            </span>
          </span>
        </span>
        <span className="gata-deitada" hidden={!dorme} style={{ width: LARGURA_DEITADA, height: HD * 0.54 }}>
          <span className="gata-corpo">
            <img src={p5} alt="" style={QUADRO_DEITADA} draggable={false} />
          </span>
          <span className="gata-zzz" aria-hidden="true">
            <i>z</i>
            <i>z</i>
            <i>z</i>
          </span>
        </span>
      </button>
    </div>
  )
}
