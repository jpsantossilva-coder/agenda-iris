// Ligações de verdade (Supabase com chave de serviço e web-push). Só roda no servidor.
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_SETTINGS, type Settings } from '../../src/data/repos'
import { taskFromRow, type Row } from '../../src/data/rows'
import type { Db, Push, PushSub } from '../send-reminders'

function need(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Variável de ambiente ausente: ${name}`)
  return v
}

export async function makeRealDeps(): Promise<{ db: Db; push: Push; secret: string }> {
  // web-push é um módulo ES: no servidor (CommonJS) só carrega com import() dinâmico.
  const { sendNotification, setVapidDetails } = await import('web-push')
  const supabase = createClient(need('SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })
  setVapidDetails(need('VAPID_SUBJECT'), need('VAPID_PUBLIC_KEY'), need('VAPID_PRIVATE_KEY'))

  const db: Db = {
    async usersWithSubscriptions() {
      const { data, error } = await supabase.from('push_subscriptions').select('user_id')
      if (error) throw new Error(error.message)
      return [...new Set((data ?? []).map((r) => r.user_id as string))]
    },
    async tasks(userId) {
      const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).is('deleted_at', null)
      if (error) throw new Error(error.message)
      return (data as Row[]).map(taskFromRow)
    },
    async settings(userId): Promise<Settings> {
      const { data, error } = await supabase.from('settings').select('*').eq('user_id', userId).maybeSingle()
      if (error) throw new Error(error.message)
      if (!data) return { ...DEFAULT_SETTINGS }
      return {
        displayName: (data.display_name as string) ?? '',
        morningTime: (data.morning_time as string) ?? DEFAULT_SETTINGS.morningTime,
        defaultRemindMin: (data.default_remind_min as number) ?? DEFAULT_SETTINGS.defaultRemindMin,
      }
    },
    async subscriptions(userId): Promise<PushSub[]> {
      const { data, error } = await supabase.from('push_subscriptions').select('endpoint,p256dh,auth').eq('user_id', userId)
      if (error) throw new Error(error.message)
      return (data ?? []) as PushSub[]
    },
    async claim(kind, refId, fireAt) {
      const { error } = await supabase.from('reminder_log').insert({ kind, ref_id: refId, fire_at: fireAt })
      if (!error) return true
      if (error.code === '23505') return false // já registrado: unique(kind, ref_id, fire_at)
      throw new Error(error.message)
    },
    async removeSubscription(endpoint) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    },
  }

  const push: Push = async (sub, payload) => {
    try {
      await sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      )
      return 'sent'
    } catch (err) {
      const code = (err as { statusCode?: number }).statusCode
      if (code === 404 || code === 410) return 'gone'
      throw err
    }
  }

  return { db, push, secret: need('CRON_SECRET') }
}
