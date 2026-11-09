// Prévia da mascote (gatinha cavaleira) em 3 lugares do app. Só para desenvolvimento.
// Abra em /dev/mascote.html. Nada daqui foi aplicado no app.
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/700.css'
import '../src/styles/tokens.css'
import '../src/styles/atelie.css'
import './mascote.css'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Etiqueta from '../src/components/Etiqueta'
import Icon from '../src/components/Icon'
import type { Task } from '../src/domain/types'
import p1 from './mascote/recorte/pose-1.png'
import p2 from './mascote/recorte/pose-2.png'
import p3 from './mascote/recorte/pose-3.png'
import p4 from './mascote/recorte/pose-4.png'
import p5 from './mascote/recorte/pose-5.png'
import p6 from './mascote/recorte/pose-6.png'
import p7 from './mascote/recorte/pose-7.png'
import p8 from './mascote/recorte/pose-8.png'

type PoseEmPe = 1 | 2 | 3 | 4 | 6 | 7 | 8
const IMG: Record<number, string> = { 1: p1, 2: p2, 3: p3, 4: p4, 5: p5, 6: p6, 7: p7, 8: p8 }

// Lâmina da espada em cada pose (fração do quadro 765x1024): [guarda x, guarda y, ponta x, ponta y]
const LAMINA: Record<PoseEmPe, [number, number, number, number]> = {
  1: [0.398, 0.47, 0.395, 0.07],
  7: [0.398, 0.47, 0.395, 0.07],
  3: [0.285, 0.36, 0.36, 0.07],
  4: [0.285, 0.36, 0.36, 0.07],
  2: [0.732, 0.62, 0.732, 0.93],
  6: [0.732, 0.62, 0.732, 0.93],
  8: [0.732, 0.62, 0.732, 0.93],
}

// Parte do quadro que a gata ocupa (o resto é vazio transparente)
const TOPO = 0.27
const ESQ = 0.26
const ALT = 0.7
const LARG = 0.6

function Gata({
  pose,
  altura,
  vivo,
  piscar = false,
  brilho = false,
  children,
}: {
  pose: PoseEmPe
  altura: number
  vivo: boolean
  piscar?: boolean
  brilho?: boolean
  children?: React.ReactNode
}) {
  const hf = altura / ALT
  const wf = (hf * 765) / 1024
  const quadro = { left: -ESQ * wf, top: -TOPO * hf, width: wf, height: hf }
  const [gx, gy, tx, ty] = LAMINA[pose]
  const x = (f: number) => f * wf - ESQ * wf - 7
  const y = (f: number) => f * hf - TOPO * hf - 7

  return (
    <div className={`gata ${vivo ? 'viva' : 'parada'}`} style={{ width: wf * LARG, height: altura }}>
      <span className="gata-sombra" />
      <div className="gata-corpo">
        <AnimatePresence initial={false}>
          <motion.img
            key={pose}
            src={IMG[pose]}
            alt=""
            style={quadro}
            draggable={false}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: vivo ? 0.14 : 0 }}
          />
        </AnimatePresence>
        {piscar && pose === 1 && <img className="gata-piscada" src={IMG[7]} alt="" style={quadro} />}
        {brilho && vivo && (
          <motion.svg
            key={`brilho-${pose}`}
            className="gata-brilho"
            viewBox="0 0 14 14"
            initial={{ opacity: 0 }}
            animate={{ x: [x(gx), x(tx)], y: [y(gy), y(ty)], opacity: [0, 1, 1, 0], scale: [0.3, 1, 0.9, 0.3], rotate: [0, 90] }}
            transition={{ duration: 1.4, times: [0, 0.25, 0.75, 1], ease: 'easeInOut', repeat: Infinity, repeatDelay: 5, delay: 1.2 }}
          >
            <path d="M7 0C7.6 4.5 9.5 6.4 14 7 9.5 7.6 7.6 9.5 7 14 6.4 9.5 4.5 7.6 0 7 4.5 6.4 6.4 4.5 7 0Z" fill="#fff" />
          </motion.svg>
        )}
      </div>
      {children}
    </div>
  )
}

function GataDormindo({ largura, vivo }: { largura: number; vivo: boolean }) {
  const wf = largura / 0.86
  const hf = (wf * 765) / 1024
  return (
    <div className={`gata dorme ${vivo ? 'viva' : 'parada'}`} style={{ width: largura, height: hf * 0.54 }}>
      <div className="gata-corpo">
        <img src={IMG[5]} alt="" draggable={false} style={{ left: -0.07 * wf, top: -0.33 * hf, width: wf, height: hf }} />
      </div>
      <span className="zzz" aria-hidden="true">
        <i>z</i>
        <i>z</i>
        <i>z</i>
      </span>
    </div>
  )
}

const tarefa = (id: string, title: string, time: string, area: Task['area'], estimateMin: number): Task => ({
  id, title, area, date: '2026-11-09', time, estimateMin, doneDates: [], doneAt: null, remindMinBefore: 15, repeat: null, deletedAt: null,
})
const TAREFAS = [tarefa('a', 'Cortar o molde da saia', '09:30', 'costura', 45), tarefa('b', 'Conferir notas do mês', '14:00', 'fechamento', 30)]

/* ---------------------------------------------------------------- 1 · Saudação da tela Hoje */
function CenaSaudacao({ vivo, noite }: { vivo: boolean; noite: boolean }) {
  const [estado, setEstado] = useState<'oi' | 'parada' | 'pulo'>('oi')
  const [feitas, setFeitas] = useState<Set<string>>(new Set())
  const relogio = useRef<number | undefined>(undefined)

  function por(agora: 'oi' | 'pulo', ms: number) {
    window.clearTimeout(relogio.current)
    setEstado(agora)
    relogio.current = window.setTimeout(() => setEstado('parada'), ms)
  }
  useEffect(() => {
    if (!noite) por('oi', 2600)
    return () => window.clearTimeout(relogio.current)
  }, [noite])

  function concluir(id: string) {
    const jaFeita = feitas.has(id)
    setFeitas((s) => {
      const n = new Set(s)
      if (jaFeita) n.delete(id)
      else n.add(id)
      return n
    })
    if (!jaFeita && !noite) por('pulo', 720)
  }

  const pose: PoseEmPe = estado === 'oi' ? 2 : estado === 'pulo' ? 3 : 1

  return (
    <div className="cena">
      <header className="saud">
        <div>
          <h1>{noite ? 'Boa noite, Iris' : 'Bom dia, Iris'}</h1>
          <p className="data-hoje">segunda-feira, 9 de novembro</p>
        </div>
        {noite ? (
          <div className="saud-gata noite" role="img" aria-label="Mascote dormindo">
            <GataDormindo largura={128} vivo={vivo} />
          </div>
        ) : (
          <button type="button" className="saud-gata" aria-label="Dar oi para a mascote" onClick={() => por('oi', 2200)}>
            <motion.div
              animate={estado === 'pulo' && vivo ? { y: [0, -26, 0] } : estado === 'oi' && vivo ? { rotate: [0, -3, 2.5, -2, 0] } : { y: 0, rotate: 0 }}
              transition={estado === 'pulo' ? { duration: 0.6, times: [0, 0.42, 1], ease: ['easeOut', 'easeIn'] } : { duration: 1.3, delay: 0.25 }}
              style={{ transformOrigin: '50% 100%' }}
            >
              <Gata pose={pose} altura={108} vivo={vivo} piscar brilho={estado === 'parada'} />
            </motion.div>
          </button>
        )}
      </header>

      <div className="modo" role="group" aria-label="Como é o dia de hoje">
        <button type="button" aria-pressed="true">Presencial</button>
        <button type="button" aria-pressed="false">Home office</button>
      </div>
      <p className="soma-dia">Hoje: 1h15 de coisas</p>

      <ul className="fita">
        {TAREFAS.map((t) => {
          const feita = feitas.has(t.id)
          return (
            <li key={t.id} className="linha-tarefa">
              <button type="button" className="check" aria-label={`${feita ? 'Reabrir' : 'Concluir'} ${t.title}`} onClick={() => concluir(t.id)}>
                {feita ? '✓' : ''}
              </button>
              <Etiqueta task={t} done={feita} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------- 2 · Tela vazia */
function CenaVazia({ vivo }: { vivo: boolean }) {
  return (
    <div className="cena">
      <div className="vazio">
        <Gata pose={6} altura={176} vivo={vivo}>
          <span className="pensa" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </Gata>
        <p className="vazio-mao">Nada marcado para hoje.</p>
        <p className="vazio-dica">Toque no + para alinhavar a primeira tarefa.</p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 3 · Dia fechado */
function CenaFechado({ vivo }: { vivo: boolean }) {
  const [vez, setVez] = useState(0)
  const [reverencia, setReverencia] = useState(false)
  useEffect(() => {
    setReverencia(false)
    const t = window.setTimeout(() => setReverencia(true), 2800)
    return () => window.clearTimeout(t)
  }, [vez])

  return (
    <div className="cena">
      <div className="fechado">
        <motion.div
          key={vez}
          initial={vivo ? { y: 22, scale: 0.9, opacity: 0 } : false}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          style={{ transformOrigin: '50% 100%' }}
        >
          <Gata pose={reverencia ? 8 : 4} altura={184} vivo={vivo} brilho />
        </motion.div>
        <p className="fechado-mao">Dia fechado! ♡</p>
        <p className="vazio-dica">Tudo riscado. Pode guardar a espada.</p>
        <button type="button" className="link" onClick={() => setVez((v) => v + 1)}>
          Ver de novo
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 0 · No cantinho, reagindo ao uso */
type Estilo = 'etiqueta' | 'alfinete' | 'giz'

function Balao({ estilo, texto, vivo }: { estilo: Estilo; texto: string; vivo: boolean }) {
  const parado = { opacity: 1, x: 0, y: 0, rotate: estilo === 'giz' ? -3 : -2, scale: 1 }
  const entrada =
    estilo === 'etiqueta'
      ? { opacity: 0, x: 34, rotate: 7 } // puxada pela linha
      : estilo === 'alfinete'
        ? { opacity: 0, rotate: -14 } // balança no alfinete
        : { opacity: 0, y: 6 } // escrita a giz
  return (
    <motion.div
      className={`balao balao-${estilo}`}
      role="status"
      initial={vivo ? entrada : { opacity: 0 }}
      animate={parado}
      exit={{ opacity: 0, transition: { duration: vivo ? 0.2 : 0 } }}
      transition={vivo ? (estilo === 'alfinete' ? { type: 'spring', stiffness: 170, damping: 6 } : { type: 'spring', stiffness: 320, damping: 20 }) : { duration: 0 }}
    >
      {estilo === 'etiqueta' && (
        <>
          <svg className="balao-linha" viewBox="0 0 40 30" aria-hidden="true">
            <path d="M2 6 C16 2 30 10 38 28" />
          </svg>
          <span className="balao-papel">{texto}</span>
        </>
      )}
      {estilo === 'alfinete' && (
        <>
          <i className="balao-pino" aria-hidden="true" />
          {texto}
        </>
      )}
      {estilo === 'giz' && (
        <>
          {texto}
          <svg className="balao-risco" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M3 7 C30 2 52 11 78 5 S112 8 117 4"
              initial={{ pathLength: vivo ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: vivo ? 0.5 : 0, delay: vivo ? 0.15 : 0 }}
            />
          </svg>
        </>
      )}
    </motion.div>
  )
}

type Humor = 'oi' | 'parada' | 'dorme' | 'acorda' | 'pulo' | 'vitoria' | 'reverencia'
const POSE_DO_HUMOR: Record<Exclude<Humor, 'dorme'>, PoseEmPe> = { oi: 2, parada: 1, acorda: 4, pulo: 3, vitoria: 4, reverencia: 8 }
const TAMANHOS = { P: 68, M: 84, G: 100 } as const
const SONO_MS = 8000 // na prévia; no app seria perto de 1 minuto

function CenaCantinho({ vivo }: { vivo: boolean }) {
  const [humor, setHumor] = useState<Humor>('oi')
  const [fala, setFala] = useState<string | null>('Oi, Iris!')
  const [tam, setTam] = useState<keyof typeof TAMANHOS>('M')
  const [estilo, setEstilo] = useState<Estilo>('etiqueta')
  const [feitas, setFeitas] = useState<Set<string>>(new Set())
  const tHumor = useRef<number | undefined>(undefined)
  const tFala = useRef<number | undefined>(undefined)
  const tSono = useRef<number | undefined>(undefined)
  const humorRef = useRef<Humor>('oi')
  humorRef.current = humor

  function vigiarSono() {
    window.clearTimeout(tSono.current)
    tSono.current = window.setTimeout(() => {
      window.clearTimeout(tHumor.current)
      setHumor('dorme')
      setFala(null)
    }, SONO_MS)
  }
  function reagir(h: Humor, ms: number, texto?: string) {
    window.clearTimeout(tHumor.current)
    setHumor(h)
    tHumor.current = window.setTimeout(() => setHumor('parada'), ms)
    if (texto) {
      window.clearTimeout(tFala.current)
      setFala(texto)
      tFala.current = window.setTimeout(() => setFala(null), Math.max(ms, 2600))
    }
    vigiarSono()
  }
  // qualquer toque na tela conta como "ela mexeu"
  function mexeu() {
    if (humorRef.current === 'dorme') reagir('acorda', 1500)
    else vigiarSono()
  }
  useEffect(() => {
    reagir('oi', 2400, 'Oi, Iris!')
    return () => {
      window.clearTimeout(tHumor.current)
      window.clearTimeout(tFala.current)
      window.clearTimeout(tSono.current)
    }
  }, [])

  function concluir(id: string) {
    const jaFeita = feitas.has(id)
    const novas = new Set(feitas)
    if (jaFeita) novas.delete(id)
    else novas.add(id)
    setFeitas(novas)
    if (jaFeita) return
    if (novas.size === TAREFAS.length) reagir('vitoria', 2800, 'Dia fechado! ♡')
    else reagir('pulo', 720, 'Feito!')
  }

  const altura = TAMANHOS[tam]
  return (
    <>
      <div className="controles controles-cena">
        <div className="modo" role="group" aria-label="Tamanho da mascote">
          {(Object.keys(TAMANHOS) as (keyof typeof TAMANHOS)[]).map((k) => (
            <button key={k} type="button" aria-pressed={tam === k} onClick={() => setTam(k)}>{k}</button>
          ))}
        </div>
        <div className="modo" role="group" aria-label="Formato do balão">
          {(['etiqueta', 'alfinete', 'giz'] as const).map((e) => (
            <button key={e} type="button" aria-pressed={estilo === e} onClick={() => { setEstilo(e); reagir('oi', 2000, 'Oi, Iris!') }}>
              {e === 'etiqueta' ? 'A · etiqueta' : e === 'alfinete' ? 'B · alfinete' : 'C · giz'}
            </button>
          ))}
        </div>
      </div>

      <div className="cena cena-canto" onPointerDownCapture={mexeu}>
        <h1>Bom dia, Iris</h1>
        <p className="data-hoje">segunda-feira, 9 de novembro</p>
        <p className="soma-dia">Hoje: 1h15 de coisas</p>
        <ul className="fita">
          {TAREFAS.map((t) => {
            const feita = feitas.has(t.id)
            return (
              <li key={t.id} className="linha-tarefa">
                <button type="button" className="check" aria-label={`${feita ? 'Reabrir' : 'Concluir'} ${t.title} (cantinho)`} onClick={() => concluir(t.id)}>
                  {feita ? '✓' : ''}
                </button>
                <Etiqueta task={t} done={feita} />
              </li>
            )
          })}
        </ul>
        <button type="button" className="link agendar-demo" onClick={() => reagir('reverencia', 2400, 'Tudo certo, agendado!')}>
          Simular: agendar uma tarefa
        </button>

        <div className="canto" style={{ ['--gata' as string]: `${altura}px` }}>
          <AnimatePresence>{fala && <Balao key={`${estilo}-${fala}`} estilo={estilo} texto={fala} vivo={vivo} />}</AnimatePresence>
          <button type="button" className="canto-gata" aria-label="Mascote: tocar para dar oi" onClick={() => reagir('oi', 2200, 'Oi, Iris!')}>
            {humor === 'dorme' ? (
              <GataDormindo largura={altura * 1.2} vivo={vivo} />
            ) : (
              <motion.div
                animate={
                  !vivo ? { y: 0, rotate: 0 }
                    : humor === 'pulo' ? { y: [0, -22, 0] }
                    : humor === 'oi' ? { rotate: [0, -3, 2.5, -2, 0] }
                    : humor === 'acorda' || humor === 'vitoria' ? { y: [6, -8, 0], scale: [0.94, 1.04, 1] }
                    : { y: 0, rotate: 0, scale: 1 }
                }
                transition={humor === 'pulo' ? { duration: 0.6, times: [0, 0.42, 1] } : humor === 'oi' ? { duration: 1.3, delay: 0.2 } : { duration: 0.5 }}
                style={{ transformOrigin: '50% 100%' }}
              >
                <Gata pose={POSE_DO_HUMOR[humor]} altura={altura} vivo={vivo} piscar brilho={humor === 'parada' || humor === 'vitoria'} />
              </motion.div>
            )}
          </button>
        </div>

        <nav className="bottom-bar" aria-label="Principal (demonstração)">
          <span className="bar-item on"><Icon name="home" />Hoje</span>
          <span className="bar-item"><Icon name="calendar" />Agenda</span>
          <span className="bar-item bar-plus"><span className="circ" aria-hidden><Icon name="plus" /></span></span>
          <span className="bar-item"><Icon name="check" />Tarefas</span>
          <span className="bar-item"><Icon name="user" />Eu</span>
        </nav>
      </div>
    </>
  )
}

const NOMES = ['parada', 'dando oi', 'pulando', 'vitória', 'dormindo', 'pensando', 'piscando', 'reverência']

function Previa() {
  const sistema = useReducedMotion()
  const [reduzir, setReduzir] = useState(false)
  const [noite, setNoite] = useState(false)
  const vivo = !(sistema || reduzir)

  return (
    <main className="previa">
      <h1>Mascote</h1>
      <p className="previa-sub">prévia em três lugares, nada aplicado no app ainda</p>

      <div className="controles">
        <div className="modo" role="group" aria-label="Hora do dia">
          <button type="button" aria-pressed={!noite} onClick={() => setNoite(false)}>Dia</button>
          <button type="button" aria-pressed={noite} onClick={() => setNoite(true)}>Noite</button>
        </div>
        <div className="modo" role="group" aria-label="Movimento">
          <button type="button" aria-pressed={!reduzir} onClick={() => setReduzir(false)}>Com movimento</button>
          <button type="button" aria-pressed={reduzir} onClick={() => setReduzir(true)}>Movimento reduzido</button>
        </div>
      </div>

      <div className="cenas">
        <section className="cena-bloco">
          <h2 className="cena-nome">★ No cantinho, reagindo<small>fique 8 s sem tocar na tela e ela dorme; toque e ela acorda</small></h2>
          <CenaCantinho vivo={vivo} />
        </section>
        <section className="cena-bloco">
          <h2 className="cena-nome">1 · Saudação da tela Hoje<small>conclua uma tarefa ou toque na gata</small></h2>
          <CenaSaudacao vivo={vivo} noite={noite} />
        </section>
        <section className="cena-bloco">
          <h2 className="cena-nome">2 · Nenhuma tarefa</h2>
          <CenaVazia vivo={vivo} />
        </section>
        <section className="cena-bloco">
          <h2 className="cena-nome">3 · Dia fechado</h2>
          <CenaFechado vivo={vivo} />
        </section>
      </div>

      <section className="poses">
        <h2 className="cena-nome">As 8 poses recortadas</h2>
        <ul className="poses-lista">
          {NOMES.map((nome, i) => (
            <li key={nome}>
              <img src={IMG[i + 1]} alt={`Mascote ${nome}`} />
              {i + 1} · {nome}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Previa />)
