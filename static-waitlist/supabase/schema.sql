create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  profile text,
  goal text,
  source text not null default 'static-waitlist',
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

drop policy if exists "Anyone can join the waitlist" on public.waitlist_signups;

create policy "Anyone can join the waitlist"
on public.waitlist_signups
for insert
to anon
with check (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(email) <= 254
  and length(coalesce(name, '')) <= 80
  and length(coalesce(profile, '')) <= 40
  and length(coalesce(goal, '')) <= 180
  and length(coalesce(source, '')) <= 40
);

revoke all on public.waitlist_signups from anon;
grant insert on public.waitlist_signups to anon;
