export type PushResult = 'granted' | 'denied' | 'unsupported' | 'needs-install'

export type PushSubscriptionData = { endpoint: string; keys: { p256dh: string; auth: string } }

/** Tudo o que o navegador oferece, em um objeto que dá para trocar nos testes. */
export interface PushEnv {
  userAgent: string
  standalone: boolean
  supported: boolean
  requestPermission(): Promise<'granted' | 'denied' | 'default'>
  subscribe(): Promise<PushSubscriptionData>
  save(sub: PushSubscriptionData): Promise<void>
}

/**
 * Pede permissão e guarda a inscrição de notificações.
 * No iPhone, notificação só funciona com o app salvo na Tela de Início (iOS 16.4 ou mais novo).
 */
export async function subscribeToPush(env: PushEnv): Promise<PushResult> {
  const iOS = /iPhone|iPad|iPod/.test(env.userAgent)
  if (iOS && !env.standalone) return 'needs-install'
  if (!env.supported) return 'unsupported'
  const permission = await env.requestPermission()
  if (permission !== 'granted') return 'denied'
  await env.save(await env.subscribe())
  return 'granted'
}
