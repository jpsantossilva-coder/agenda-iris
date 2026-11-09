// Protótipos das microinterações novas: desenhos em SVG + gestos com física (Motion).
// Só para desenvolvimento. Abra em /dev/prototipos.html
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/700.css'
import '../src/styles/tokens.css'
import '../src/styles/atelie.css'
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Etiqueta from '../src/components/Etiqueta'
import type { Task } from '../src/domain/types'
import { Agulha, BotaoCostura, Carimbo, Lapis, Tesoura } from './desenhos'

const tarefa = (id: string, title: string, time: string, area: Task['area'], estimateMin: number): Task => ({
  id, title, area, date: '2026-11-12', time, estimateMin, doneDates: [], doneAt: null, remindMinBefore: 15, repeat: null, deletedAt: null,
})

const MOLA = { type: 'spring', stiffness: 520, damping: 30 } as const

/* ---------------------------------------------------------------- 1 · Arrastar a peça */
function PecaArrastavel({ task, onCortada }: { task: Task; onCortada: (t: Task) => void }) {
  const x = useMotionValue(0)
  const [feita, setFeita] = useState(false)
  const costura = useTransform(x, [0, 140], [0, 1])
  const agulhaX = useTransform(x, [0, 160], [20, 180])
  const abre = useTransform(x, [0, -130], [4, 34])
  const [grau, setGrau] = useState(4)
  useEffect(() => abre.on('change', setGrau), [abre])
  const fundoFeito = useTransform(x, [0, 90], [0, 1])
  const fundoCorte = useTransform(x, [0, -90], [0, 1])

  async function soltou() {
    const v = x.get()
    if (v > 110) {
      setFeita((f) => !f)
      await animate(x, 0, { type: 'spring', stiffness: 260, damping: 14 })
    } else if (v < -110) {
      await animate(x, -420, { type: 'spring', stiffness: 200, damping: 26 })
      onCortada(task)
    } else {
      animate(x, 0, MOLA)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <motion.div style={{ opacity: fundoFeito }} className="fundo fundo-feito" aria-hidden>
        <svg width="100%" height="100%" viewBox="0 0 320 70" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <motion.path d="M10 35 H300" stroke="#fff" strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" style={{ pathLength: costura }} />
        </svg>
        <motion.svg width="320" height="70" viewBox="0 0 320 70" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <motion.g style={{ x: agulhaX }} transform="translate(0 35)">
            <Agulha cor="#fff" />
          </motion.g>
        </motion.svg>
        <span className="rotulo-fundo">concluir</span>
      </motion.div>
      <motion.div style={{ opacity: fundoCorte }} className="fundo fundo-corte" aria-hidden>
        <svg width="90" height="70" viewBox="-50 -35 100 70" style={{ position: 'absolute', right: 18, top: 0 }}>
          <Tesoura abertura={grau} transform="scale(1.1)" />
        </svg>
        <span className="rotulo-fundo" style={{ right: 100, left: 'auto' }}>excluir</span>
      </motion.div>
      <motion.div
        className="linha-tarefa"
        style={{ x, touchAction: 'pan-y', position: 'relative' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.55}
        onDragEnd={soltou}
        whileTap={{ scale: 0.985 }}
      >
        <button type="button" className="check" aria-label="concluir" onClick={() => setFeita((f) => !f)}>
          {feita ? '✓' : ''}
        </button>
        <Etiqueta task={task} done={feita} />
      </motion.div>
    </div>
  )
}

function CartaoArrastar() {
  const [lista, setLista] = useState([
    tarefa('1', 'Lançar atestados', '09:00', 'fechamento', 40),
    tarefa('2', 'Conferir folha', '10:30', 'fechamento', 60),
    tarefa('3', 'Reunião do go-live SAP', '14:00', 'trabalho', 60),
  ])
  const [apagada, setApagada] = useState<Task | null>(null)
  const original = useRef(lista)
  useEffect(() => {
    if (!apagada) return
    const id = setTimeout(() => setApagada(null), 5000)
    return () => clearTimeout(id)
  }, [apagada])
  return (
    <div className="cartao">
      <h2>1 · Arrastar a peça</h2>
      <p>Arraste para a <b>direita</b>: a agulha costura e conclui. Para a <b>esquerda</b>: a tesoura abre e corta. Solte antes do fim e ela volta com mola.</p>
      <div className="palco" style={{ display: 'grid', gap: 10 }}>
        <AnimatePresence initial={false}>
          {lista.map((t) => (
            <motion.div key={t.id} layout exit={{ opacity: 0, height: 0, marginTop: -10 }} transition={{ duration: 0.25 }}>
              <PecaArrastavel
                task={t}
                onCortada={(x) => {
                  setLista((l) => l.filter((i) => i.id !== x.id))
                  setApagada(x)
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {apagada && (
            <motion.div className="undo-toast" style={{ position: 'static', transform: 'none', justifySelf: 'center' }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <span>Tarefa excluída</span>
              <button
                type="button"
                onClick={() => {
                  setLista(original.current.filter((t) => t.id === apagada.id || lista.some((l) => l.id === t.id)))
                  setApagada(null)
                }}
              >
                Desfazer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {lista.length === 0 && !apagada && <button type="button" className="link" onClick={() => setLista(original.current)}>recomeçar</button>}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 2 · Lápis riscando */
const TRACO = 'M4 15 C40 6 70 22 110 12 S 170 20 214 10'
function CartaoLapis() {
  const [feito, setFeito] = useState(false)
  const caminho = useRef<SVGPathElement>(null)
  const [ponta, setPonta] = useState<{ x: number; y: number } | null>(null)
  const prog = useMotionValue(0)

  function alternar() {
    if (feito) {
      setFeito(false)
      prog.set(0)
      setPonta(null)
      return
    }
    setFeito(true)
    const p = caminho.current
    if (!p) return
    const len = p.getTotalLength()
    animate(0, 1, {
      duration: 0.75,
      ease: [0.45, 0, 0.3, 1],
      onUpdate: (v) => {
        prog.set(v)
        const pt = p.getPointAtLength(v * len)
        setPonta({ x: pt.x, y: pt.y })
      },
      onComplete: () => setPonta(null),
    })
  }

  return (
    <div className="cartao">
      <h2>2 · Lápis riscando</h2>
      <p>Toque no círculo. Um lápis de verdade desenha um risco levemente torto, a mão levanta no fim e o texto esmaece.</p>
      <div className="palco linha-tarefa">
        <button type="button" className="check" aria-label="concluir" onClick={alternar}>{feito ? '✓' : ''}</button>
        <div className="etiqueta" style={{ ['--area' as string]: 'var(--area-fechamento)', flex: 1 }}>
          <i className="fio" aria-hidden />
          <span className="hora">{feito ? 'feito' : '9h'}</span>
          <b style={{ position: 'relative', opacity: feito ? 0.55 : 1, transition: 'opacity .5s .5s' }}>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              Lançar atestados
              <svg width="218" height="22" viewBox="0 0 218 22" style={{ position: 'absolute', left: -2, top: 2, overflow: 'visible', pointerEvents: 'none' }}>
                <motion.path ref={caminho} d={TRACO} fill="none" stroke="#1f7a6f" strokeWidth="2.6" strokeLinecap="round" style={{ pathLength: prog }} />
                {ponta && <Lapis transform={`translate(${ponta.x} ${ponta.y})`} />}
              </svg>
            </span>
          </b>
          <small>40 min</small>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 3 · O "+" */
function CartaoMais() {
  const [aberto, setAberto] = useState(false)
  const [costurando, setCosturando] = useState(false)
  const ang = useMotionValue(0)
  const [pos, setPos] = useState({ x: 0, y: 0, a: 0 })
  const R = 30

  function abrir() {
    setCosturando(true)
    animate(0, 1, {
      duration: 0.7,
      ease: 'easeInOut',
      onUpdate: (v) => {
        ang.set(v)
        const a = -Math.PI / 2 + v * Math.PI * 2
        setPos({ x: Math.cos(a) * R, y: Math.sin(a) * R, a: (a * 180) / Math.PI + 90 })
      },
      onComplete: () => setCosturando(false),
    })
    setTimeout(() => setAberto(true), 450)
  }

  return (
    <div className="cartao">
      <h2>3 · O botão "+"</h2>
      <p>A agulha dá uma volta de pontos ao redor do botão enquanto a folha sobe com mola, sem atrasar o texto.</p>
      <div className="palco" style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50%', top: 60, transform: 'translate(-50%,0)' }}>
          <svg width="120" height="120" viewBox="-60 -60 120 120" style={{ position: 'absolute', left: -60, top: -60, overflow: 'visible', pointerEvents: 'none' }}>
            <motion.circle r={R} fill="none" stroke="#e9726b" strokeWidth="2.4" strokeDasharray="0.1 7" strokeLinecap="round" style={{ pathLength: ang, rotate: -90 }} />
            {costurando && <g transform={`translate(${pos.x} ${pos.y}) rotate(${pos.a})`}><Agulha transform="scale(.6)" /></g>}
          </svg>
          <motion.button type="button" className="bar-plus" style={{ border: 0, background: 'none', padding: 0 }} whileTap={{ scale: 0.9, rotate: -8 }} onClick={() => (aberto ? setAberto(false) : abrir())} aria-label="Novo">
            <span className="circ" style={{ marginTop: 0 }}>+</span>
          </motion.button>
        </div>
        <AnimatePresence>
          {aberto && (
            <motion.div
              className="sheet"
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxWidth: 'none', borderRadius: '18px 18px 0 0' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            >
              <div className="sheet-handle" />
              <b>Nova atividade</b>
              <div style={{ opacity: 0.6, fontSize: 13, marginTop: 4 }}>toque no "+" de novo para fechar</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 4 · Carimbo */
function CartaoCarimbo() {
  const [n, setN] = useState(0)
  const [batida, setBatida] = useState(false)
  async function bater() {
    setBatida(false)
    setN((v) => v + 1)
    await new Promise((r) => setTimeout(r, 380))
    setBatida(true)
  }
  return (
    <div className="cartao">
      <h2>4 · Carimbo "FEITO"</h2>
      <p>O carimbo desce, bate com mola, deixa a tinta com borda irregular e o papel dá um tremidinho.</p>
      <div className="palco" style={{ display: 'grid', placeItems: 'center' }}>
        <motion.div key={n} animate={batida ? { x: [0, -2.5, 2, -1, 0], y: [0, 2, 0] } : {}} transition={{ duration: 0.25 }} className="postit" style={{ background: '#ffe7a8', width: 250, height: 90, position: 'relative' }}>
          ligar pro contador
          <svg width="150" height="150" viewBox="-75 -100 150 150" style={{ position: 'absolute', right: -20, top: -30, overflow: 'visible' }}>
            <defs>
              <filter id="tinta"><feTurbulence baseFrequency="0.9" numOctaves="2" result="r" /><feDisplacementMap in="SourceGraphic" in2="r" scale="2.4" /></filter>
            </defs>
            {batida && (
              <motion.g initial={{ scale: 1.25, opacity: 0 }} animate={{ scale: 1, opacity: 0.92 }} transition={{ type: 'spring', stiffness: 700, damping: 16 }} style={{ transformOrigin: '0px -30px' }} filter="url(#tinta)">
                <circle cx="0" cy="-30" r="30" fill="none" stroke="#e9726b" strokeWidth="3.2" />
                <circle cx="0" cy="-30" r="25" fill="none" stroke="#e9726b" strokeWidth="1" />
                <text x="0" y="-25" textAnchor="middle" fontFamily="Bricolage Grotesque Variable" fontWeight="800" fontSize="16" fill="#e9726b" transform="rotate(-12 0 -30)">FEITO</text>
              </motion.g>
            )}
            <motion.g key={`c${n}`} initial={{ y: -90, rotate: -8 }} animate={{ y: [-90, -26, -30, -70], rotate: [-8, 0, 0, -4] }} transition={{ duration: 0.85, times: [0, 0.42, 0.5, 1], ease: ['easeIn', 'easeOut', 'easeInOut'] }}>
              <Carimbo transform="translate(0 -4)" />
            </motion.g>
          </svg>
        </motion.div>
        <button type="button" className="link" style={{ marginTop: 14 }} onClick={bater}>carimbar</button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 5 · Dia fechado */
const CORES = ['#1f7a6f', '#d2693d', '#b5476b', '#c98f1f', '#5b78b4', '#7552b8', '#e9726b']
function CartaoChuva() {
  const [n, setN] = useState(0)
  const botoes = Array.from({ length: 16 }, (_, i) => ({ i, x: 6 + ((i * 37) % 88), cor: CORES[i % CORES.length], atraso: (i * 0.07) % 0.6, giro: ((i * 53) % 90) - 45 }))
  return (
    <div className="cartao">
      <h2>5 · Dia fechado</h2>
      <p>Os botões caem, quicam no chão e ficam espalhados um instante, com a mensagem por cima. Fim das tarefas do dia.</p>
      <div className="palco" style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
        <div key={n}>
          {botoes.map((b) => (
            <motion.div key={b.i} style={{ position: 'absolute', left: `${b.x}%`, top: 0 }} initial={{ y: -50, rotate: 0, opacity: 1 }} animate={{ y: 160 - (b.i % 3) * 10, rotate: b.giro }} transition={{ type: 'spring', bounce: 0.5, duration: 1.1, delay: b.atraso }}>
              <BotaoCostura cor={b.cor} tamanho={30} />
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--fonte-mao)', fontSize: 30, fontWeight: 700, pointerEvents: 'none' }}>
            Dia fechado ♡
          </motion.div>
        </div>
        <button type="button" className="link" style={{ position: 'absolute', left: 8, bottom: 6 }} onClick={() => setN((v) => v + 1)}>de novo</button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 6 · Carregando */
function CartaoCarregando() {
  const caminho = useRef<SVGPathElement>(null)
  const [pt, setPt] = useState({ x: 20, y: 50, a: 0 })
  const prog = useMotionValue(0)
  useEffect(() => {
    const p = caminho.current
    if (!p) return
    const len = p.getTotalLength()
    const ctl = animate(0, 1, {
      duration: 1.8,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'linear',
      onUpdate: (v) => {
        prog.set(v)
        const a = p.getPointAtLength(v * len)
        const b = p.getPointAtLength(Math.min(len, v * len + 2))
        setPt({ x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI })
      },
    })
    return () => ctl.stop()
  }, [prog])
  return (
    <div className="cartao">
      <h2>6 · Carregando</h2>
      <p>A agulha vai e volta no pano deixando pontos de verdade, em ondas, em vez de uma barra.</p>
      <div className="palco" style={{ display: 'grid', placeItems: 'center', height: 150 }}>
        <svg width="260" height="90" viewBox="0 0 260 90" style={{ overflow: 'visible' }}>
          <path d="M10 50 C 50 10, 90 90, 130 50 S 210 10, 250 50" fill="none" stroke="#1f2d5722" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" />
          <motion.path ref={caminho} d="M10 50 C 50 10, 90 90, 130 50 S 210 10, 250 50" fill="none" stroke="#e9726b" strokeWidth="3" strokeDasharray="8 7" strokeLinecap="round" style={{ pathLength: prog }} />
          <g transform={`translate(${pt.x} ${pt.y}) rotate(${pt.a})`}><Agulha transform="scale(.7)" /></g>
        </svg>
        <div style={{ fontFamily: 'var(--fonte-mao)', fontSize: 22 }}>preparando seu dia…</div>
      </div>
    </div>
  )
}

function Pagina() {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '22px 18px 60px' }}>
      <h1>Microinterações novas</h1>
      <p style={{ margin: '0 0 18px', opacity: 0.75 }}>Desenhos próprios em SVG e gestos com física. Toque, arraste e compare. Nada disso está no app ainda.</p>
      <CartaoArrastar />
      <CartaoLapis />
      <CartaoMais />
      <CartaoCarimbo />
      <CartaoChuva />
      <CartaoCarregando />
    </div>
  )
}

const css = document.createElement('style')
css.textContent = `
.cartao{margin:0 0 26px}
.cartao h2{margin:0 0 4px}
.cartao p{margin:0 0 10px;font-size:13.5px;opacity:.8}
.palco{padding:14px;border:1.5px dashed var(--tinta-suave);border-radius:6px 18px 6px 18px;background:#fffdf7aa}
.fundo{position:absolute;inset:0;border-radius:10px;overflow:hidden}
.fundo-feito{background:var(--area-fechamento)}
.fundo-corte{background:var(--giz)}
.rotulo-fundo{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-family:var(--fonte-mao);font-size:22px;font-weight:700;color:#fff}
`
document.head.appendChild(css)
createRoot(document.getElementById('root')!).render(<Pagina />)
