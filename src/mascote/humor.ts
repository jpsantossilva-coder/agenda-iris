import type { EventoMascote } from './eventos'

export type Humor = 'oi' | 'parada' | 'dorme' | 'acorda' | 'pulo' | 'vitoria' | 'reverencia'
export type Gatilho = EventoMascote | 'abriu' | 'tocou' | 'tocou-na-gata'

/** Quanto tempo a reação dura (depois ela volta a ficar parada) e o que diz no balão. */
export type Reacao = { humor: Humor; ms: number; fala?: string }

/** Sem nenhum toque na tela por este tempo, ela deita e dorme. */
export const SONO_MS = 60_000
/** O balão fica pelo menos este tempo, para dar para ler. */
export const FALA_MIN_MS = 2600

export function reacaoPara(gatilho: Gatilho, humor: Humor, nome = ''): Reacao | null {
  const oi = nome.trim() ? `Oi, ${nome.trim()}!` : 'Oi!'
  switch (gatilho) {
    case 'abriu':
      return { humor: 'oi', ms: 2400, fala: oi }
    case 'tocou-na-gata':
      return { humor: 'oi', ms: 2200, fala: oi }
    case 'tocou':
      return humor === 'dorme' ? { humor: 'acorda', ms: 1500 } : null
    case 'concluiu':
      return { humor: 'pulo', ms: 720, fala: 'Feito!' }
    case 'fechou-o-dia':
      return { humor: 'vitoria', ms: 2800, fala: 'Missão cumprida!' }
    case 'agendou':
      return { humor: 'reverencia', ms: 2400, fala: 'Tudo certo, agendado!' }
    case 'anotou':
      return { humor: 'reverencia', ms: 2400, fala: 'Anotado!' }
  }
}
