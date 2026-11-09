import { useEffect, useState, type FormEvent } from 'react'
import { useAuth, useRepos, useToday } from '../../app/context'
import { DEFAULT_SETTINGS, type Settings } from '../../data/repos'
import FechamentoEditor from './FechamentoEditor'
import FinancasMinimas from './FinancasMinimas'
import { downloadText, exportData } from './exportData'

export default function EuScreen() {
  const repos = useRepos()
  const auth = useAuth()
  const today = useToday()
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void repos.settings.get().then(setS)
  }, [repos])

  async function salvar(e: FormEvent) {
    e.preventDefault()
    await repos.settings.save({ ...s, displayName: s.displayName.trim() })
    setSaved(true)
  }

  async function bloco(area: 'leitura' | 'descanso') {
    await repos.tasks.create({
      title: area === 'leitura' ? 'Leitura' : 'Descanso',
      area,
      date: today,
      time: null,
      estimateMin: 30,
      remindMinBefore: s.defaultRemindMin,
      repeat: null,
    })
  }

  return (
    <section>
      <h1>Eu</h1>

      <form className="quick-add" onSubmit={salvar}>
        <h2>Configurações</h2>
        <label>
          Seu nome
          <input value={s.displayName} onChange={(e) => { setSaved(false); setS({ ...s, displayName: e.target.value }) }} />
        </label>
        <label>
          Horário do resumo da manhã
          <input type="time" value={s.morningTime} onChange={(e) => { setSaved(false); setS({ ...s, morningTime: e.target.value }) }} />
        </label>
        <label>
          Lembrete padrão (min antes)
          <input type="number" min="0" inputMode="numeric" value={s.defaultRemindMin} onChange={(e) => { setSaved(false); setS({ ...s, defaultRemindMin: Number(e.target.value) }) }} />
        </label>
        <button type="submit" className="salvar">Salvar configurações</button>
        {saved && <p role="status">Salvo.</p>}
      </form>

      <div className="atalhos">
        <button type="button" className="sheet-option" onClick={() => void bloco('leitura')}>Adicionar bloco de leitura</button>
        <button type="button" className="sheet-option" onClick={() => void bloco('descanso')}>Adicionar bloco de descanso</button>
      </div>

      <FechamentoEditor month={today.slice(0, 7)} />
      <FinancasMinimas />

      <div className="atalhos">
        <button type="button" className="sheet-option" onClick={async () => downloadText('agenda-dados.json', await exportData(repos))}>Exportar dados</button>
        <button type="button" className="sheet-option" onClick={() => void auth.signOut()}>Sair</button>
      </div>
    </section>
  )
}
