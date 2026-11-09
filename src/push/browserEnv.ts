import { supabase } from '../lib/supabase'
import type { PushEnv } from './subscribe'

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export function browserEnv(): PushEnv {
  return {
    userAgent: navigator.userAgent,
    standalone:
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      window.matchMedia?.('(display-mode: standalone)').matches === true,
    supported: 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window,
    requestPermission: () => Notification.requestPermission(),
    async subscribe() {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY ?? '') as BufferSource,
      })
      const j = sub.toJSON()
      return { endpoint: sub.endpoint, keys: { p256dh: j.keys?.p256dh ?? '', auth: j.keys?.auth ?? '' } }
    },
    async save(sub) {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth }, { onConflict: 'endpoint' })
      if (error) throw new Error(error.message)
    },
  }
}
