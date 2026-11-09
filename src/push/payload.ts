export type PushPayload = { title: string; body: string; url: string }

const GENERICO = 'Agenda da Iris'

/** Lê o que o servidor mandou. Aceita JSON; qualquer outro texto vira o corpo da notificação. */
export function parsePushPayload(raw: string | null): PushPayload {
  if (!raw) return { title: GENERICO, body: '', url: '/' }
  try {
    const j = JSON.parse(raw) as Partial<PushPayload>
    return { title: j.title ?? GENERICO, body: j.body ?? '', url: j.url ?? '/' }
  } catch {
    return { title: GENERICO, body: raw, url: '/' }
  }
}
