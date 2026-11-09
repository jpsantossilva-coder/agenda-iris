# Agenda da Iris: plano de construção

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um site instalável (PWA) para iPhone, em português, que é a agenda pessoal da namorada do João: anotar em 2 toques, ver o dia numa fita métrica, marcar home office, receber lembretes e um resumo toda manhã.

**Architecture:** React + TypeScript (Vite) no celular, com regras de negócio puras em `src/domain/` (testadas primeiro). Dados no Supabase (Postgres + login por e-mail e senha, uma usuária só). Notificações por web push: um endpoint em Vercel, chamado a cada minuto por um cron externo gratuito (o cron da Vercel no plano grátis roda só 1 vez por dia).

**Tech Stack:** Vite, React, TypeScript, React Router, Vitest + Testing Library, vite-plugin-pwa, Supabase (`@supabase/supabase-js`), Vercel (funções em `api/`), `web-push`.

**Spec:** `docs/superpowers/specs/2026-11-09-agenda-iris-design.md`. Mockups aprovados em `docs/superpowers/specs/mockups/` (`mistura-home-office.html` para o visual, `microinteracoes.html` para as animações). Nos mockups, **ignorar** blocos de trajeto e o aviso de home office que fala de trajeto.

## Global Constraints

- Site instalável no iPhone (iOS 16.4 ou mais novo para notificação). Sem app de loja. Funciona no computador, mas o celular é o foco.
- Toda a interface em português do Brasil. Fuso fixo America/Sao_Paulo (UTC-3, sem horário de verão).
- Só online. Sem modo offline na primeira versão.
- Login simples só para ela (e-mail e senha), sem cadastro público. O João não tem acesso aos dados. Há exportação dos dados em "Eu".
- Barra de baixo com 5 itens, nesta ordem: Hoje, Agenda, "+" (centro), Tarefas, Eu.
- Visual: modelo A "Ateliê" com post-its (linho, fita métrica, etiquetas de tecido com borda pontilhada, botões de costura, borda serrilhada na barra). Etiquetas são tarefas e horários; post-its são anotações soltas.
- Cores de linho `#efe4d0`, marrom `#4a3526`, terracota `#c9733a` e `#b8541c`, verde `#2f7f7a`, fita `#f3d977`, post-it `#fff3a8`.
- Áreas: Trabalho, Fechamento, Costura, Família, Descanso, Leitura, Saúde, cada uma com cor.
- Nunca vermelho de alerta, contador de atrasadas nem texto de cobrança. Tarefa vencida vira "adiada".
- Sem campos para dados sensíveis (CPF, salário, CID). Só um texto de aviso no campo de anotação, sem bloqueio nem detecção.
- Lembrete padrão 15 min antes da tarefa com horário. Notificação diária de manhã (padrão 07:00, configurável).
- Toda tarefa, evento, anotação e lançamento pode ser editado e excluído, com "Desfazer" por 5 segundos.
- Microinterações curtas (menos de 1 s, exceto o carregamento) e respeitando "reduzir movimento".
- Sem integração com SAP, folha ou sistema da Prio. Sem mascote nesta versão.

## Review Focus

1. Anotação sem data e sem horário aparece só em Tarefas e nunca gera lembrete.
2. Tarefa que se repete (curso de costura, sábados) nunca vira "adiada" nem some depois de concluída num dia.
3. O cron rodando duas vezes no mesmo minuto não manda a mesma notificação duas vezes.
4. Dia sem registro é presencial; trocar presencial por home office e voltar mantém as tarefas do dia.
5. Sem permissão de notificação, ou iPhone sem o app instalado na tela inicial: uma tela explica e o resto do app segue funcionando.

---

## File Structure

```
index.html, vite.config.ts, package.json, tsconfig.json, vercel.json
public/ (ícones, sw.js)
supabase/migrations/0001_init.sql
api/send-reminders.ts
src/
  main.tsx, App.tsx
  styles/tokens.css, styles/atelie.css
  domain/        tipos e regras puras (sem React, sem Supabase)
  data/          repositórios (interface + Supabase + versão em memória para testes)
  auth/          AuthGate, LoginScreen
  shell/         BottomBar, Sheet, rotas
  screens/       Hoje/, Agenda/, Tarefas/, Eu/
  components/    Etiqueta, PostIt, FitaMetrica, WeekStrip, Botao
  motion/        microinterações e usePrefersReducedMotion
  push/          subscribe.ts, InstalarNoIphone.tsx
  test/setup.ts
```

---

### Task 1: Projeto, PWA e tema

**Files:**
- Create: `package.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/test/setup.ts`, `public/icon-192.png`, `public/icon-512.png`, `.env.example`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `npm test`, `npm run dev`, `npm run build`; variáveis CSS (`--linho`, `--marrom`, `--terracota`, `--verde`, `--fita`, `--postit`, `--area-trabalho` … `--area-saude`) em `tokens.css`.

- [ ] **Step 1: Write the failing test** `src/App.test.tsx`: renderiza `<App />` e espera `screen.getByText('Hoje')` no documento.
- [ ] **Step 2: Run** `npm test` (depois de `npm install`); expected: FAIL (App não existe).
- [ ] **Step 3: Scaffold** Vite + React + TS com Vitest (`jsdom`, `setupFiles: src/test/setup.ts`), `vite-plugin-pwa` (nome "Agenda da Iris", `lang: 'pt-BR'`, `display: 'standalone'`, `theme_color: '#4a3526'`, `background_color: '#efe4d0'`, ícones 192 e 512). `App` renderiza só a palavra "Hoje" por enquanto. `tokens.css` com os valores de Global Constraints.
- [ ] **Step 4: Run** `npm test` e `npm run build`; expected: PASS e `dist/manifest.webmanifest` contém `"display":"standalone"`.
- [ ] **Step 5: Commit** `git add -A && git commit -m "chore: scaffold PWA project"`

---

### Task 2: Regras de negócio puras

**Files:**
- Create: `src/domain/types.ts`, `src/domain/dates.ts`, `src/domain/tasks.ts`, `src/domain/reminders.ts`, `src/domain/closing.ts`, `src/domain/suggest.ts`
- Test: `src/domain/tasks.test.ts`, `reminders.test.ts`, `closing.test.ts`, `suggest.test.ts`

**Interfaces:**
- Produces (em `types.ts`):
  - `type Area = 'trabalho'|'fechamento'|'costura'|'familia'|'descanso'|'leitura'|'saude'`
  - `type Repeat = { freq: 'daily'|'weekly'; weekdays?: number[]; until?: string }` (weekdays 0=domingo)
  - `type Task = { id: string; title: string; area: Area; date: string|null; time: string|null; estimateMin: number|null; doneDates: string[]; doneAt: string|null; remindMinBefore: number; repeat: Repeat|null; deletedAt: string|null }` (datas `YYYY-MM-DD`, hora `HH:mm`; para tarefa que se repete, `doneDates` guarda os dias concluídos e `doneAt` fica nulo)
  - `type DayMode = 'presencial'|'home'`
  - `type ClosingCycle = { month: string; steps: { id: string; label: string; date: string }[] }`
  - em `tasks.ts`: `occursOn(task: Task, date: string): boolean`, `isDoneOn(task: Task, date: string): boolean`, `tasksForDay(tasks: Task[], date: string): Task[]` (com horário em ordem, sem horário por último, exclui apagadas), `postponed(tasks: Task[], today: string): Task[]`, `dayLoad(tasks: Task[], date: string): { totalMin: number; tight: boolean }` (`tight` quando `totalMin >= 420`), `allDoneOn(tasks: Task[], date: string): boolean`
  - em `reminders.ts`: `dueReminders(tasks: Task[], nowUtc: Date, windowMin: number): { task: Task; fireAt: string }[]`, `morningSummary(tasks: Task[], date: string): { count: number; titles: string[] }`, `isMorningTime(morningTime: string, nowUtc: Date, windowMin: number): boolean`
  - em `closing.ts`: `closingStatus(cycle: ClosingCycle|null, today: string): { daysLeft: number; nextLabel: string }|null`
  - em `suggest.ts`: `suggestFromText(text: string, today: string): { date?: string; area?: Area }`

- [ ] **Step 1: Write the failing tests** (todas as asserções abaixo):
  - `occursOn`: tarefa semanal `weekdays:[6]` ocorre em `2026-11-14` (sábado) e não em `2026-11-13`; respeita `until`.
  - `postponed(tasks, '2026-11-12')` devolve tarefa com `date:'2026-11-10'` não concluída e **não** devolve tarefa que se repete nem tarefa sem data (Review Focus 1 e 2).
  - `tasksForDay` ordena `09:00` antes de `10:30` e põe sem horário por último; ignora `deletedAt`.
  - `dayLoad`: tarefas de 60 + 360 min somam 420 e `tight` é `true`; 419 dá `false`.
  - `dueReminders`: tarefa em `2026-11-12` às `10:00` com `remindMinBefore:15` dispara em `2026-11-12T09:45:00-03:00` (= `12:45Z`); com `nowUtc = 12:45:20Z` e `windowMin = 1` está na lista; às `12:47Z` não. Tarefa sem `time` nunca dispara (Review Focus 1).
  - `morningSummary` conta só tarefas do dia que não estão concluídas.
  - `isMorningTime('07:00', 10:00:30Z, 1)` é `true` (07:00 em UTC-3 = 10:00Z).
  - `closingStatus`: hoje `2026-11-10`, etapas em `2026-11-12` e `2026-11-20` → `{ daysLeft: 2, nextLabel }` da primeira; sem etapas futuras → `null`.
  - `suggestFromText('atestado do João, lançar até quinta', '2026-11-09')` → `{ date: '2026-11-12' }`; `'amanhã'` → dia seguinte; texto com "costura" sugere `area:'costura'`; sem pista devolve `{}`.
- [ ] **Step 2: Run** `npx vitest run src/domain`; expected: FAIL.
- [ ] **Step 3: Implement** as funções acima. Hora local sempre com deslocamento fixo `-03:00`; sem biblioteca de datas externa.
- [ ] **Step 4: Run** `npx vitest run src/domain`; expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: domain rules for tasks, reminders, closing"`

---

### Task 3: Banco de dados, login e repositórios

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `src/lib/supabase.ts`, `src/auth/AuthGate.tsx`, `src/auth/LoginScreen.tsx`, `src/data/repos.ts`, `src/data/supabaseRepos.ts`, `src/data/memoryRepos.ts`
- Test: `src/auth/AuthGate.test.tsx`, `src/data/memoryRepos.test.ts`

**Interfaces:**
- Consumes: tipos de `src/domain/types.ts`.
- Produces (em `repos.ts`): `interface TasksRepo { list(): Promise<Task[]>; create(input: Omit<Task,'id'|'deletedAt'|'doneDates'|'doneAt'>): Promise<Task>; update(id: string, patch: Partial<Task>): Promise<Task>; remove(id: string): Promise<void>; restore(id: string): Promise<void> }` (remover = `deletedAt` preenchido). Mesmo formato para `NotesRepo` (`{id,text,color,createdAt,deletedAt}`), `DayModesRepo { get(date): Promise<DayMode>; set(date, mode): Promise<void>; range(from, to): Promise<Record<string, DayMode>> }` (sem registro = `'presencial'`), `ClosingRepo { get(month): Promise<ClosingCycle|null>; save(cycle): Promise<void> }`, `MoneyRepo` (`{id,text,amount: number|null,createdAt,deletedAt}`), `SettingsRepo { get(): Promise<Settings>; save(s: Settings): Promise<void> }` com `type Settings = { displayName: string; morningTime: string; defaultRemindMin: number }` (padrões `''`, `'07:00'`, `15`).
- Produces: `AuthGate({children})`, `makeMemoryRepos(): Repos` para testes.
- Migração: tabelas `tasks`, `notes`, `day_modes`, `closing_cycles`, `money_notes`, `settings`, `push_subscriptions`, `reminder_log` (com `unique(kind, ref_id, fire_at)`); todas com `user_id uuid references auth.users` e RLS `using (user_id = auth.uid())`.

- [ ] **Step 1: Write the failing tests:** `AuthGate` mostra `LoginScreen` (campo "E-mail", campo "Senha", botão "Entrar") quando não há sessão e mostra os filhos quando há; `memoryRepos`: `remove` esconde a tarefa de `list()` do dia e `restore` traz de volta; `DayModesRepo.get` de um dia sem registro devolve `'presencial'`.
- [ ] **Step 2: Run** `npx vitest run src/auth src/data`; expected: FAIL.
- [ ] **Step 3: Implement** a migração, o cliente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), os repositórios Supabase e em memória, `AuthGate` e `LoginScreen`. A tela de login não tem "Criar conta". Mensagens de erro em tom calmo ("E-mail ou senha não conferem.").
- [ ] **Step 4: Run** os testes; expected: PASS. Depois, no SQL Editor do Supabase com o usuário dela logado, conferir que um `select` em `tasks` de outro `user_id` volta vazio (RLS).
- [ ] **Step 5: Commit** `git commit -m "feat: schema, auth gate and repositories"`

---

### Task 4: Estrutura do app (barra de baixo e "+")

**Files:**
- Create: `src/shell/BottomBar.tsx`, `src/shell/Sheet.tsx`, `src/shell/AppShell.tsx`, `src/styles/atelie.css`, `src/components/Botao.tsx`
- Modify: `src/App.tsx`
- Test: `src/shell/AppShell.test.tsx`

**Interfaces:**
- Produces: `BottomBar` com os itens "Hoje", "Agenda", "+", "Tarefas", "Eu" (rotas `/`, `/agenda`, `/tarefas`, `/eu`); `Sheet({open, onClose, title, children})`; o "+" abre `Sheet` com as opções "Nova atividade" e "Anotação rápida" (callbacks `onNovaAtividade`, `onNovaAnotacao` fornecidos por `AppShell`).

- [ ] **Step 1: Write the failing test:** os 5 itens aparecem na ordem Hoje, Agenda, "+", Tarefas, Eu; tocar em "Agenda" mostra a tela Agenda; tocar em "+" abre a folha com "Nova atividade" e "Anotação rápida".
- [ ] **Step 2: Run** `npx vitest run src/shell`; expected: FAIL.
- [ ] **Step 3: Implement** com React Router. Botões de costura como ícones (CSS do mockup `mistura-home-office.html`), "+" laranja maior, borda serrilhada com `clip-path`, `env(safe-area-inset-bottom)` para o iPhone. Telas são placeholders por enquanto.
- [ ] **Step 4: Run** testes; expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: app shell with bottom bar"`

---

### Task 5: Tela Hoje

**Files:**
- Create: `src/screens/Hoje/HojeScreen.tsx`, `src/components/FitaMetrica.tsx`, `src/components/Etiqueta.tsx`, `src/components/PostIt.tsx`, `src/components/WeekStrip.tsx`, `src/screens/Hoje/hooks.ts`
- Test: `src/screens/Hoje/HojeScreen.test.tsx`

**Interfaces:**
- Consumes: `tasksForDay`, `postponed`, `dayLoad`, `closingStatus`, `DayModesRepo`, `NotesRepo`, `SettingsRepo`.
- Produces: `HojeScreen({ today: string })`; `WeekStrip({ days: string[]; today: string; modes: Record<string, DayMode>; onPick(date): void })`.

- [ ] **Step 1: Write the failing tests** (com repositórios em memória):
  - mostra "Bom dia, Iris" quando `displayName` é "Iris" e a hora é antes das 12h (e "Boa tarde"/"Boa noite" depois); sem nome mostra só "Bom dia".
  - tarefas de hoje aparecem como etiquetas em ordem de horário, cada uma com tempo estimado ("40 min").
  - com 420 min no dia aparece o aviso "Hoje é um dia cheio" (texto calmo) e o elemento **não** tem classe de alerta vermelho.
  - com 2 tarefas adiadas aparece "2 tarefas adiadas, quer reagendar?"; com 0, nada aparece.
  - um dia em `home` mostra a casinha 🏠 na `WeekStrip`; tocar "Home office" na tela Hoje chama `DayModesRepo.set(today, 'home')` e tocar de novo em "Presencial" volta (Review Focus 4: as tarefas do dia continuam na lista).
  - anotações do dia aparecem como post-its; tarefa sem horário aparece depois das com horário.
  - com um ciclo de fechamento, mostra "Fechamento: faltam 2 dias · {etapa}".
- [ ] **Step 2: Run** `npx vitest run src/screens/Hoje`; expected: FAIL.
- [ ] **Step 3: Implement** seguindo `mistura-home-office.html` (fita métrica com horas à esquerda, etiquetas de tecido com furo e borda pontilhada, cor da área na borda). Sem trajeto.
- [ ] **Step 4: Run** testes; expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: Hoje screen"`

---

### Task 6: Anotar em 2 toques, Tarefas, editar, excluir e desfazer

**Files:**
- Create: `src/screens/Tarefas/TarefasScreen.tsx`, `src/screens/Tarefas/QuickAdd.tsx`, `src/screens/Tarefas/TaskForm.tsx`, `src/components/UndoToast.tsx`, `src/screens/Tarefas/useUndo.ts`
- Modify: `src/shell/AppShell.tsx`
- Test: `src/screens/Tarefas/QuickAdd.test.tsx`, `TarefasScreen.test.tsx`

**Interfaces:**
- Consumes: `suggestFromText`, `TasksRepo`, `NotesRepo`, `Settings.defaultRemindMin`.
- Produces: `QuickAdd({ onSaved })` (um campo de texto e o botão "Salvar"); `TaskForm({ initial?: Task; onSubmit(task) })` com campos título, área, data, hora, tempo estimado, lembrete (minutos antes), repetição; `UndoToast({ message; onUndo; durationMs = 5000 })`.

- [ ] **Step 1: Write the failing tests:**
  - **2 toques:** tocar em "+", tocar em "Nova atividade", digitar "atestado do João, lançar até quinta" e tocar "Salvar" cria uma tarefa com `area:'trabalho'`, `date` = próxima quinta, `remindMinBefore:15`; nenhum outro campo é obrigatório. (O "+" e "Salvar" são os 2 toques; o tipo de entrada é o padrão.)
  - "Mais detalhes" revela os campos completos; preencher hora `10:00` e salvar grava `time:'10:00'`.
  - "Anotação rápida" cria um post-it com o texto; abaixo do campo há o aviso "Evite colocar CPF, salário ou dados de saúde de colegas." (apenas texto).
  - `TarefasScreen`: abas "Abertas" e "Concluídas" separam por `doneAt`/`isDoneOn`; a busca "atestado" filtra por título; a lista de adiadas aparece como seção discreta "Adiadas" (sem vermelho).
  - concluir uma tarefa que se repete grava o dia em `doneDates` e **não** conclui os outros sábados.
  - excluir mostra "Desfazer" por 5 s; tocar "Desfazer" restaura; passados 5 s a tarefa continua apagada (com `vi.useFakeTimers`).
  - editar abre `TaskForm` preenchido e salva a mudança.
- [ ] **Step 2: Run** `npx vitest run src/screens/Tarefas`; expected: FAIL.
- [ ] **Step 3: Implement.** Sugestão de data/área mostrada como chips que ela pode tirar com um toque. Editar e excluir por toque longo ou menu "⋯" na etiqueta.
- [ ] **Step 4: Run** testes; expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: quick add, tasks, edit and undo"`

---

### Task 7: Agenda, home office e eventos que se repetem

**Files:**
- Create: `src/screens/Agenda/AgendaScreen.tsx`, `src/screens/Agenda/MonthGrid.tsx`, `src/screens/Agenda/DayModeSheet.tsx`
- Test: `src/screens/Agenda/AgendaScreen.test.tsx`

**Interfaces:**
- Consumes: `WeekStrip`, `DayModesRepo`, `TasksRepo`, `occursOn`, `tasksForDay`.
- Produces: `AgendaScreen({ today })` com faixa da semana e calendário do mês; `DayModeSheet({ date; mode; onChange(mode) })` com as opções "Presencial" e "Home office".

- [ ] **Step 1: Write the failing tests:**
  - tocar no botão do dia 11 abre a folha "Como vai ser a quarta, dia 11?" e escolher "Home office" chama `DayModesRepo.set('2026-11-11','home')`; a casinha aparece na faixa e no calendário.
  - dia sem registro mostra "Presencial" selecionado.
  - tarefa semanal aos sábados (curso de costura, área `costura`) aparece em todos os sábados do mês no calendário e na lista do dia.
  - evento da área `familia` aparece com a cor da família.
  - tocar num dia lista as tarefas dele e permite criar uma atividade já com aquela data.
- [ ] **Step 2: Run** `npx vitest run src/screens/Agenda`; expected: FAIL.
- [ ] **Step 3: Implement** reaproveitando `WeekStrip`; calendário mensal com pontinhos coloridos por área.
- [ ] **Step 4: Run** testes; expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: agenda with home office and recurring events"`

---

### Task 8: Ciclo de fechamento de folha

**Files:**
- Create: `src/screens/Eu/FechamentoEditor.tsx`
- Modify: `src/screens/Hoje/HojeScreen.tsx`
- Test: `src/screens/Eu/FechamentoEditor.test.tsx`

**Interfaces:**
- Consumes: `ClosingRepo`, `closingStatus`.
- Produces: `FechamentoEditor({ month })`: lista de etapas com nome e data, botões "Adicionar etapa", editar e excluir (com "Desfazer").

- [ ] **Step 1: Write the failing tests:** adicionar a etapa "Lançar atestados" em `2026-11-12` grava o ciclo do mês; editar a data atualiza a contagem na tela Hoje; excluir uma etapa mostra "Desfazer"; um ciclo cujas etapas passam do dia 30 para dezembro continua contando certo (usa a data completa, não só o mês).
- [ ] **Step 2: Run** `npx vitest run src/screens/Eu`; expected: FAIL.
- [ ] **Step 3: Implement.** Sem etapas pré-definidas: ela mesma cria.
- [ ] **Step 4: Run** testes; expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: payroll closing cycle"`

---

### Task 9: Tela Eu (configurações, finanças mínimas, exportar)

**Files:**
- Create: `src/screens/Eu/EuScreen.tsx`, `src/screens/Eu/FinancasMinimas.tsx`, `src/screens/Eu/exportData.ts`
- Test: `src/screens/Eu/EuScreen.test.tsx`, `src/screens/Eu/exportData.test.ts`

**Interfaces:**
- Consumes: `SettingsRepo`, `MoneyRepo`, todos os repositórios.
- Produces: `exportData(repos: Repos): Promise<string>` (JSON com tasks, notes, dayModes, closing, money, settings, sem campos internos como `user_id`).

- [ ] **Step 1: Write the failing tests:** mudar o horário da notificação da manhã para `06:45` e o lembrete para 20 min grava em `Settings`; finanças mínimas: salvar "mercado" com valor `42,5` grava `amount: 42.5`; valor vazio grava `null`; não existem categorias nem total na tela; editar e excluir com "Desfazer" funcionam; `exportData` devolve JSON que **não** inclui tarefas apagadas; botão "Sair" encerra a sessão.
- [ ] **Step 2: Run** `npx vitest run src/screens/Eu`; expected: FAIL.
- [ ] **Step 3: Implement.** Blocos de descanso e leitura são tarefas das áreas `descanso` e `leitura` criadas por atalho ("Adicionar bloco de leitura").
- [ ] **Step 4: Run** testes; expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: settings, minimal finance notes and export"`

---

### Task 10: Microinterações e tela de carregamento

**Files:**
- Create: `src/motion/usePrefersReducedMotion.ts`, `Strike.tsx`, `Stamp.tsx`, `NeedleSewing.tsx`, `HomeBounce.tsx`, `PostItDrop.tsx`, `ButtonRain.tsx`, `ScissorsCut.tsx`, `SplashLoader.tsx`, `src/motion/motion.css`
- Modify: `src/components/Etiqueta.tsx`, `src/components/PostIt.tsx`, `src/shell/BottomBar.tsx`, `src/screens/Hoje/HojeScreen.tsx`, `src/auth/AuthGate.tsx`
- Test: `src/motion/motion.test.tsx`

**Interfaces:**
- Consumes: `allDoneOn`; CSS e comportamento dos 8 demos de `docs/superpowers/specs/mockups/microinteracoes.html`.
- Produces: `usePrefersReducedMotion(): boolean`; cada componente recebe `play: boolean` e `onEnd?(): void`: `Strike` (caneta riscando ao concluir), `Stamp` (carimbo "FEITO" no post-it), `NeedleSewing` (ao tocar no "+"), `HomeBounce` (casinha ao marcar home office), `PostItDrop` (post-it novo), `ButtonRain` (ao concluir tudo do dia), `ScissorsCut` (ao excluir, antes do "Desfazer"), `SplashLoader` (enquanto a sessão e os dados carregam).

- [ ] **Step 1: Write the failing tests:** com `prefers-reduced-motion: reduce` (mock de `matchMedia`), cada componente chama `onEnd` imediatamente e não adiciona a classe de animação; sem a preferência, `onEnd` só é chamado depois da duração (fake timers); concluir a **última** tarefa do dia dispara `ButtonRain` e concluir qualquer outra não; excluir só some a etiqueta depois do corte, mas "Desfazer" já está visível; `SplashLoader` mostra "Preparando seu dia…".
- [ ] **Step 2: Run** `npx vitest run src/motion`; expected: FAIL.
- [ ] **Step 3: Implement** portando o CSS dos demos para `motion.css`; usar `onAnimationEnd` onde possível. Todas as animações com menos de 1 s, exceto `SplashLoader` (em loop).
- [ ] **Step 4: Run** `npx vitest run`; expected: PASS (suíte inteira).
- [ ] **Step 5: Commit** `git commit -m "feat: micro-interactions and splash loader"`

---

### Task 11: Notificações (push, lembretes e resumo da manhã)

**Files:**
- Create: `src/push/subscribe.ts`, `src/push/InstalarNoIphone.tsx`, `src/push/sw-push.ts` (tratador do service worker), `api/send-reminders.ts`, `api/lib/sendPush.ts`, `vercel.json`
- Modify: `vite.config.ts` (service worker com tratador de `push` e `notificationclick`), `src/screens/Eu/EuScreen.tsx` (botão "Ativar notificações")
- Test: `src/push/subscribe.test.ts`, `api/send-reminders.test.ts`

**Interfaces:**
- Consumes: `dueReminders`, `morningSummary`, `isMorningTime`; variáveis `VITE_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.
- Produces: `subscribeToPush(): Promise<'granted'|'denied'|'unsupported'|'needs-install'>` (`needs-install` quando é iPhone fora da tela inicial); `handler(req, res)` em `api/send-reminders.ts`, que responde `401` sem `Authorization: Bearer ${CRON_SECRET}`, e `sendPush(sub, payload): Promise<'sent'|'gone'>`.

- [ ] **Step 1: Write the failing tests:**
  - `subscribeToPush` devolve `'needs-install'` com user agent de iPhone fora do modo `standalone` e `'denied'` quando a permissão é negada; nos dois casos a tela mostra `InstalarNoIphone` com os passos "Compartilhar → Adicionar à Tela de Início" e o resto do app continua usável (Review Focus 5).
  - `handler`: sem o segredo → 401; com tarefa às 10:00 e lembrete de 15 min, a chamada às `12:45:10Z` envia 1 notificação com título da tarefa; **a mesma chamada repetida** envia 0 (grava e confere `reminder_log`; Review Focus 3); às 07:00 locais envia 1 resumo "Hoje você tem N coisas" e uma segunda chamada no mesmo minuto envia 0; anotação sem data nunca é enviada (Review Focus 1); subscrição que responde `'gone'` é apagada.
- [ ] **Step 2: Run** `npx vitest run src/push api`; expected: FAIL.
- [ ] **Step 3: Implement** com `web-push`; janela de 1 minuto; texto das notificações calmo e curto. README (Task 12) explica como gerar as chaves (`npx web-push generate-vapid-keys`).
- [ ] **Step 4: Run** `npx vitest run`; expected: PASS. Depois, teste manual: com o app instalado na tela inicial do iPhone, ativar notificações e chamar o endpoint com `curl -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/send-reminders`; a notificação de uma tarefa criada para daqui a 16 minutos chega.
- [ ] **Step 5: Commit** `git commit -m "feat: web push reminders and morning summary"`

---

### Task 12: Publicar e entregar

**Files:**
- Create: `README.md`, `vercel.json` (se ainda não existir)
- Test: verificação manual (sem teste automatizado)

- [ ] **Step 1: Escrever o `README.md`** em português com: como criar o projeto no Supabase e rodar `0001_init.sql`; como criar o usuário dela (Auth → Add user, com cadastro público desligado); variáveis de ambiente (as de `.env.example`); como gerar as chaves VAPID; como criar na Vercel o projeto e as variáveis; como configurar o cron externo gratuito (cron-job.org, a cada 1 minuto, `GET /api/send-reminders` com o cabeçalho `Authorization: Bearer <CRON_SECRET>`); como subir o repositório (`git remote add origin <url>` e `git push -u origin main`); como ela instala no iPhone (Safari → Compartilhar → Adicionar à Tela de Início).
- [ ] **Step 2: Run** `npm test && npm run build`; expected: PASS e `dist/` gerado sem erros.
- [ ] **Step 3: Conferência no iPhone** (checklist no README): abre pelo ícone sem barra do Safari; login funciona; anotar em 2 toques; marcar home office; concluir uma tarefa mostra a caneta; chegou o lembrete de 15 min; chegou o resumo das 07:00; com "reduzir movimento" ligado nas Configurações do iPhone as animações somem.
- [ ] **Step 4: Commit** `git commit -m "docs: README and deploy instructions"`

---

## Auto-revisão

- **Cobertura da spec:** objetivos 1 a 5 → tarefas 4 a 6 e 10 (navegação, anotar em 2 toques, visual, microinterações); home office → 5 e 7; áreas e cores → 1, 5, 7; fechamento → 8; finanças mínimas, exportar, configurações → 9; lembretes e resumo da manhã → 11; editar, excluir e desfazer → 6, 8, 9; tarefas adiadas → 2 e 5; login e RLS → 3; sem trajeto e sem offline → Global Constraints. O aviso de dados sensíveis fica na Task 6 (só texto).
- **Pendências da spec fora deste plano de propósito:** mascote, nome final do projeto (o código usa "Agenda da Iris" e `displayName` configurável), assistente por frase, "esvaziar a cabeça" e projetos de costura.
- **Nomes:** `isDoneOn`, `allDoneOn`, `dueReminders`, `morningSummary`, `closingStatus`, `suggestFromText`, `DayModesRepo.set` e `Settings` usam as mesmas assinaturas em todas as tarefas.
