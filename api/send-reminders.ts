// Chamado a cada minuto por um cron externo: manda os lembretes de tarefas e o resumo da manhã.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { localToUtc, utcToLocal } from '../src/domain/dates'
import { dueReminders, isMorningTime, morningSummary } from '../src/domain/reminders'
import type { Task } from '../src/domain/types'
import type { Settings } from '../src/data/repos'

export type PushSub = { endpoint: string; p256dh: string; auth: string }
export type Payload = { title: string; body: string; url?: string }
export type Push = (sub: PushSub, payload: Payload) => Promise<'sent' | 'gone'>

export interface Db {
  usersWithSubscriptions(): Promise<string[]>
  tasks(userId: string): Promise<Task[]>
  settings(userId: string): Promise<Settings>
  subscriptions(userId: string): Promise<PushSub[]>
  /** Registra o envio. Devolve false se esse mesmo aviso já tinha sido registrado (evita duplicar). */
  claim(kind: 'reminder' | 'morning', refId: string, fireAt: string): Promise<boolean>
  removeSubscription(endpoint: string): Promise<void>
}

/** O cron gratuito pode atrasar alguns minutos; a janela cobre isso e o `claim` impede repetição. */
const WINDOW_MIN = 5

type Job = { kind: 'reminder' | 'morning'; refId: string; fireAt: string; payload: Payload }

export function makeHandler({ db, push, secret }: { db: Db; push: Push; secret: string }) {
  return async (req: VercelRequest, res: VercelResponse, now: Date = new Date()) => {
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'não autorizado' })
    }

    let sent = 0
    for (const userId of await db.usersWithSubscriptions()) {
      const [tasks, settings, subs] = await Promise.all([db.tasks(userId), db.settings(userId), db.subscriptions(userId)])
      const jobs: Job[] = []

      for (const r of dueReminders(tasks, now, WINDOW_MIN)) {
        const min = r.task.remindMinBefore
        jobs.push({
          kind: 'reminder',
          refId: r.task.id,
          fireAt: r.fireAt,
          payload: { title: r.task.title, body: min === 0 ? 'Agora' : `Daqui a ${min} min`, url: '/' },
        })
      }

      if (isMorningTime(settings.morningTime, now, WINDOW_MIN)) {
        const date = utcToLocal(now).date
        const resumo = morningSummary(tasks, date)
        if (resumo.count > 0) {
          const nome = settings.displayName.trim()
          jobs.push({
            kind: 'morning',
            refId: userId,
            fireAt: localToUtc(date, settings.morningTime).toISOString(),
            payload: {
              title: nome ? `Bom dia, ${nome}` : 'Bom dia',
              body: `Hoje você tem ${resumo.count} ${resumo.count === 1 ? 'coisa' : 'coisas'}: ${resumo.titles.slice(0, 3).join(', ')}${resumo.count > 3 ? '…' : ''}`,
              url: '/',
            },
          })
        }
      }

      for (const job of jobs) {
        if (!(await db.claim(job.kind, job.refId, job.fireAt))) continue
        for (const sub of subs) {
          try {
            if ((await push(sub, job.payload)) === 'gone') await db.removeSubscription(sub.endpoint)
            else sent += 1
          } catch (err) {
            console.error('falha ao enviar notificação', err)
          }
        }
      }
    }
    return res.status(200).json({ sent })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { makeRealDeps } = await import('./lib/real')
  return makeHandler(makeRealDeps())(req, res)
}
