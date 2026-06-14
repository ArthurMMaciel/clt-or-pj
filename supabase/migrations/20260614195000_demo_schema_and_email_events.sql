create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  email_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  purpose text not null check (purpose in ('email_confirmation', 'password_reset')),
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_tokens_lookup_idx
  on public.auth_tokens (token_hash, purpose, expires_at)
  where used_at is null;

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete set null,
  email text not null,
  event_type text not null check (event_type in ('confirmation_sent', 'confirmation_confirmed', 'password_reset_sent')),
  provider text,
  provider_message_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_events_user_created_idx
  on public.email_events (user_id, created_at desc);

create index if not exists email_events_email_created_idx
  on public.email_events (email, created_at desc);

create table if not exists public.calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete set null,
  type text not null check (type in ('compare', 'clt_to_pj', 'pj_to_clt')),
  input_json jsonb not null,
  result_json jsonb not null,
  recommendation text not null check (recommendation in ('clt', 'pj', 'neutral')),
  calculation_version text not null,
  created_at timestamptz not null default now()
);

create index if not exists calculations_user_created_idx
  on public.calculations (user_id, created_at desc);

alter table public.app_users enable row level security;
alter table public.auth_tokens enable row level security;
alter table public.email_events enable row level security;
alter table public.calculations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'app_users'
      and policyname = 'service role can manage app users'
  ) then
    create policy "service role can manage app users"
      on public.app_users
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'auth_tokens'
      and policyname = 'service role can manage auth tokens'
  ) then
    create policy "service role can manage auth tokens"
      on public.auth_tokens
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'email_events'
      and policyname = 'service role can manage email events'
  ) then
    create policy "service role can manage email events"
      on public.email_events
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'calculations'
      and policyname = 'service role can manage calculations'
  ) then
    create policy "service role can manage calculations"
      on public.calculations
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end
$$;
