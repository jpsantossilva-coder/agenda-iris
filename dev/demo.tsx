// Só para desenvolvimento: abre o app com dados de exemplo, sem login e sem banco.
// Uso: npm run dev e abrir /dev/demo.html  (?rota=/agenda, /tarefas, /eu  ou  ?tela=login)
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/700.css'
import '../src/styles/tokens.css'
import '../src/motion/motion.css'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, RepoProvider } from '../src/app/context'
import type { AuthPort } from '../src/auth/AuthGate'
import LoginScreen from '../src/auth/LoginScreen'
import { makeMemoryRepos } from '../src/data/memoryRepos'
import { addDays, utcToLocal } from '../src/domain/dates'
import AppShell from '../src/shell/AppShell'

const auth: AuthPort = { getSession: async () => true, onChange: () => () => {}, signIn: async () => ({}), signOut: async () => {} }

async function seed() {
  const repos = makeMemoryRepos()
  const hoje = utcToLocal(new Date()).date
  const base = { estimateMin: null, remindMinBefore: 15, repeat: null, time: null as string | null }
  await repos.settings.save({ displayName: 'Iris', morningTime: '07:00', defaultRemindMin: 15 })
  await repos.tasks.create({ ...base, title: 'Lançar atestados', area: 'fechamento', date: hoje, time: '09:00', estimateMin: 40 })
  await repos.tasks.create({ ...base, title: 'Conferir folha', area: 'fechamento', date: hoje, time: '10:30', estimateMin: 60 })
  await repos.tasks.create({ ...base, title: 'Reunião do go-live SAP', area: 'trabalho', date: hoje, time: '14:00', estimateMin: 60 })
  await repos.tasks.create({ ...base, title: 'Leitura', area: 'leitura', date: hoje, time: '21:00', estimateMin: 30 })
  await repos.tasks.create({ ...base, title: 'Curso de costura', area: 'costura', date: addDays(hoje, -3), time: '14:00', repeat: { freq: 'weekly' } })
  await repos.tasks.create({ ...base, title: 'Festa da vó', area: 'familia', date: addDays(hoje, 3), time: '19:00' })
  await repos.tasks.create({ ...base, title: 'Pedir atestado ao RH', area: 'trabalho', date: addDays(hoje, -2) })
  await repos.notes.create({ text: 'ligar pro contador', color: '#ffe7a8', date: hoje })
  await repos.notes.create({ text: 'comprar linha azul', color: '#ffe7a8', date: addDays(hoje, -1) })
  await repos.money.create({ text: 'mercado', amount: 42.5 })
  await repos.closing.save({
    month: hoje.slice(0, 7),
    steps: [
      { id: 'a', label: 'Lançar atestados', date: addDays(hoje, 2) },
      { id: 'b', label: 'Fechar a folha', date: addDays(hoje, 8) },
    ],
  })
  await repos.dayModes.set(hoje, 'home')
  return repos
}

const params = new URLSearchParams(location.search)
const root = createRoot(document.getElementById('root')!)

if (params.get('tela') === 'login') {
  root.render(<LoginScreen onSignIn={async () => ({ error: params.get('erro') ?? undefined })} />)
} else {
  void seed().then((repos) =>
    root.render(
      <MemoryRouter initialEntries={[params.get('rota') ?? '/']}>
        <AuthProvider port={auth}>
          <RepoProvider repos={repos}>
            <AppShell />
          </RepoProvider>
        </AuthProvider>
      </MemoryRouter>,
    ),
  )
}
