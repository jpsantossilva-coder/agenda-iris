-- Agenda da Iris: esquema inicial. Rode no SQL Editor do Supabase.
-- Uma usuária só: o cadastro público deve ficar DESLIGADO (Authentication > Providers > Email > desligar "Allow new users to sign up").

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  area text not null default 'trabalho',
  date date,
  time text,
  estimate_min int,
  done_dates date[] not null default '{}',
  done_at timestamptz,
  remind_min_before int not null default 15,
  repeat jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  text text not null,
  color text not null default '#fff3a8',
  date date not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.day_modes (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  mode text not null check (mode in ('presencial', 'home')),
  primary key (user_id, date)
);

create table public.closing_cycles (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  month text not null,
  steps jsonb not null default '[]',
  primary key (user_id, month)
);

create table public.money_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  text text not null,
  amount numeric,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  display_name text not null default '',
  morning_time text not null default '07:00',
  default_remind_min int not null default 15
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Só o servidor (service role) escreve aqui; a usuária não precisa ler.
create table public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  ref_id text not null,
  fire_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (kind, ref_id, fire_at)
);

-- Segurança por linha: cada pessoa só enxerga o que é dela.
do $$
declare t text;
begin
  foreach t in array array['tasks','notes','day_modes','closing_cycles','money_notes','settings','push_subscriptions']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "dona" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

alter table public.reminder_log enable row level security; -- sem políticas: só a service role acessa
