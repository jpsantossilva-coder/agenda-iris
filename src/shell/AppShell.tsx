import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import BottomBar from './BottomBar'
import Sheet from './Sheet'
import HojeScreen from '../screens/Hoje/HojeScreen'
import AgendaScreen from '../screens/Agenda/AgendaScreen'
import TarefasScreen from '../screens/Tarefas/TarefasScreen'
import EuScreen from '../screens/Eu/EuScreen'
import '../styles/atelie.css'

type Modal = null | 'novo' | 'atividade' | 'anotacao'

export default function AppShell() {
  const [modal, setModal] = useState<Modal>(null)

  return (
    <div className="app">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HojeScreen />} />
          <Route path="/agenda" element={<AgendaScreen />} />
          <Route path="/tarefas" element={<TarefasScreen />} />
          <Route path="/eu" element={<EuScreen />} />
        </Routes>
      </main>
      <BottomBar onNovo={() => setModal('novo')} />
      <Sheet open={modal === 'novo'} onClose={() => setModal(null)} title="Novo">
        <div className="sheet-options">
          <button type="button" className="sheet-option" onClick={() => setModal('atividade')}>Nova atividade</button>
          <button type="button" className="sheet-option" onClick={() => setModal('anotacao')}>Anotação rápida</button>
        </div>
      </Sheet>
    </div>
  )
}
