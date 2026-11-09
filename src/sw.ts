// Service worker: guarda os arquivos do app e mostra as notificações que chegam por push.
import { precacheAndRoute } from 'workbox-precaching'
import { parsePushPayload } from './push/payload'

type ExtendableEventLike = { waitUntil(p: Promise<unknown>): void }
interface WorkerScope {
  __WB_MANIFEST: { url: string; revision: string | null }[]
  registration: { showNotification(title: string, opts: Record<string, unknown>): Promise<void> }
  clients: {
    matchAll(opts: { type: 'window' }): Promise<{ focus(): Promise<unknown>; navigate?(url: string): Promise<unknown> }[]>
    openWindow(url: string): Promise<unknown>
  }
  addEventListener(type: string, listener: (e: never) => void): void
}
// O plugin procura exatamente `self.__WB_MANIFEST` para injetar a lista de arquivos.
declare const self: WorkerScope

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', ((e: ExtendableEventLike & { data?: { text(): string } }) => {
  const p = parsePushPayload(e.data?.text() ?? null)
  e.waitUntil(self.registration.showNotification(p.title, { body: p.body, icon: '/icon-192.png', data: { url: p.url } }))
}) as (e: never) => void)

self.addEventListener('notificationclick', ((e: ExtendableEventLike & { notification: { close(): void; data?: { url?: string } } }) => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/'
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((open) => (open.length > 0 ? open[0].focus() : self.clients.openWindow(url))),
  )
}) as (e: never) => void)
