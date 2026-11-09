import { useState } from 'react'
import { browserEnv } from './browserEnv'
import InstalarNoIphone from './InstalarNoIphone'
import { subscribeToPush, type PushResult } from './subscribe'

export default function NotificacoesCard({
  subscribe = () => subscribeToPush(browserEnv()),
}: {
  subscribe?: () => Promise<PushResult>
}) {
  const [result, setResult] = useState<PushResult | 'error' | null>(null)

  async function ativar() {
    try {
      setResult(await subscribe())
    } catch {
      setResult('error')
    }
  }

  return (
    <section className="notificacoes">
      <h2>Notificações</h2>
      <button type="button" className="sheet-option" onClick={() => void ativar()}>Ativar notificações</button>
      {result === 'granted' && <p role="status">Notificações ativadas.</p>}
      {result === 'needs-install' && <InstalarNoIphone />}
      {result === 'denied' && (
        <p role="status">As notificações estão desligadas. Se quiser ativar, vá em Ajustes do iPhone, procure o app e permita notificações.</p>
      )}
      {result === 'unsupported' && <p role="status">Este navegador não recebe notificações, mas o app continua funcionando normalmente.</p>}
      {result === 'error' && <p role="status">Não deu para ativar agora. Tente de novo daqui a pouco.</p>}
    </section>
  )
}
