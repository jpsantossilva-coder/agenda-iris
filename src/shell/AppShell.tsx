import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import BottomBar from './BottomBar'
import Sheet from './Sheet'
import HojeScreen from '../screens/Hoje/HojeScreen'
import AgendaScreen from '../screens/Agenda/AgendaScreen'
import TarefasScreen from '../screens/Tarefas/TarefasScreen'
import EuScreen from '../screens/Eu/EuScreen'
import QuickAdd from '../screens/Tarefas/QuickAdd'
import '../styles/atelie.css'

export default function AppShell() {
  const [novo, setNovo] = useState(false)
  // Depois de salvar, as telas recarregam (remontam) para mostrar o que acabou de entrar.
  const [version, setVersion] = useState(0)

  return (
    <div className="app">
      <main className="app-main" key={version}>
        <Routes>
          <Route path="/" element={<HojeScreen />} />
          <Route path="/agenda" element={<AgendaScreen />} />
          <Route path="/tarefas" element={<TarefasScreen />} />
          <Route path="/eu" element={<EuScreen />} />
        </Routes>
      </main>
      <BottomBar onNovo={() => setNovo(true)} />
      <Sheet open={novo} onClose={() => setNovo(false)} title="Novo">
        <QuickAdd
          onSaved={() => {
            setNovo(false)
            setVersion((v) => v + 1)
          }}
        />
      </Sheet>
    </div>
  )
}
