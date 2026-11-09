# Agenda da Iris

Agenda pessoal para celular (site instalável no iPhone): anotar em 2 toques, ver o dia numa fita métrica, marcar home office, lembretes e um resumo toda manhã. Feita sob medida, com visual de ateliê de costura e post-its.

- Design: [`docs/superpowers/specs/2026-11-09-agenda-iris-design.md`](docs/superpowers/specs/2026-11-09-agenda-iris-design.md)
- Plano de construção: [`docs/superpowers/plans/2026-11-09-agenda-iris.md`](docs/superpowers/plans/2026-11-09-agenda-iris.md)
- Mockups aprovados: `docs/superpowers/specs/mockups/`

## Rodar no computador

```bash
npm install
npm test        # testes
npm run dev     # abre em http://localhost:5173
npm run build   # versão de produção em dist/
```

Sem as variáveis de ambiente (abaixo) o app abre, mas o login não funciona.

## Publicar (passo a passo)

### 1. Banco e login (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano grátis serve).
2. No **SQL Editor**, rode o arquivo [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. Em **Authentication > Providers > Email**, **desligue "Allow new users to sign up"** (o app é de uma pessoa só).
4. Em **Authentication > Users > Add user**, crie o usuário dela (e-mail e senha).
5. Em **Project Settings > API**, copie: Project URL, a chave `anon` e a chave `service_role` (esta última é segredo: nunca vai para o navegador).

### 2. Chaves de notificação

```bash
npx web-push generate-vapid-keys
```

Guarde a chave pública e a privada.

### 3. Hospedagem (Vercel)

1. Suba este repositório no GitHub (ver o final) e importe na [Vercel](https://vercel.com).
2. Em **Settings > Environment Variables**, cadastre (os nomes estão em `.env.example`):

| Variável | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | chave `anon` |
| `VITE_VAPID_PUBLIC_KEY` | chave pública VAPID |
| `SUPABASE_URL` | Project URL (mesmo valor) |
| `SUPABASE_SERVICE_ROLE_KEY` | chave `service_role` |
| `VAPID_PUBLIC_KEY` | chave pública VAPID (mesmo valor) |
| `VAPID_PRIVATE_KEY` | chave privada VAPID |
| `VAPID_SUBJECT` | `mailto:` com o seu e-mail |
| `CRON_SECRET` | uma senha longa inventada por você |

3. Faça o deploy.

### 4. Relógio dos lembretes (cron externo gratuito)

A Vercel grátis só roda tarefas agendadas 1 vez por dia, então um serviço externo chama o servidor todo minuto:

1. Crie uma conta em [cron-job.org](https://cron-job.org).
2. Novo cron job: URL `https://SEU-SITE.vercel.app/api/send-reminders`, a cada **1 minuto**, método GET.
3. Em **Headers**, adicione `Authorization` com o valor `Bearer SEU_CRON_SECRET`.

Sem isso o app funciona, mas nenhuma notificação sai.

### 5. Instalar no iPhone

1. Abra o site no **Safari**.
2. Toque em Compartilhar e depois em **Adicionar à Tela de Início**.
3. Abra pelo ícone novo, entre com e-mail e senha.
4. Em **Eu**, toque em **Ativar notificações** e permita. Precisa do iOS 16.4 ou mais novo.

## Conferir no iPhone (checklist)

- [ ] Abre pelo ícone, sem a barra do Safari.
- [ ] O login funciona.
- [ ] Anotar leva 2 toques (o "+" e Salvar).
- [ ] Marcar home office na tela Hoje e na Agenda.
- [ ] Concluir uma tarefa mostra a caneta; concluir a última do dia faz cair os botões.
- [ ] Chegou o lembrete 15 min antes de uma tarefa com horário (crie uma para daqui a 16 min).
- [ ] Chegou o resumo da manhã no horário configurado em Eu.
- [ ] Com "Reduzir movimento" ligado nos Ajustes de Acessibilidade, as animações somem.

Teste manual do servidor de notificações:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://SEU-SITE.vercel.app/api/send-reminders
```

Deve responder `{"sent":0}` (ou mais). Sem o cabeçalho, responde 401.

## Subir para o seu GitHub

```bash
git remote add origin https://github.com/SEU-USUARIO/agenda-iris.git
git push -u origin main
```

## Observações

- Datas e horas usam o fuso de Brasília (UTC-3, sem horário de verão).
- O app não guarda dados sensíveis de colegas (CPF, salário, saúde). Anote só lembretes curtos.
- Exportar dados: tela **Eu > Exportar dados** (JSON).
