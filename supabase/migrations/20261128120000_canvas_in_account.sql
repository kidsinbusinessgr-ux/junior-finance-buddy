-- The Business Model Canvas is kept in the account, not only on the device,
-- so a child who fills it at school finds it at home and on /build.
-- One canvas per login (post-its, the problem sentence and the checks).

create table if not exists public.jfb_canvases (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) <= 30000),
  updated_at timestamptz not null default now()
);

alter table public.jfb_canvases enable row level security;

drop policy if exists own_canvas on public.jfb_canvases;
create policy own_canvas on public.jfb_canvases
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.jfb_canvases from anon;
grant select, insert, update on public.jfb_canvases to authenticated;

notify pgrst, 'reload schema';
