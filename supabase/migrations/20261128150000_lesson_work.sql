-- What the child makes in each lesson's workshop (mind map, idea board, and
-- the ones to come), kept in the account so it follows them between devices.
-- One row per login and workshop; private by RLS. The Business Model Canvas
-- keeps its own table (jfb_canvases).
--
-- The idea board can hold a few small pictures (shrunk in the browser), so
-- the limit is higher than for text alone.

create table if not exists public.jfb_lesson_work (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  workshop text not null check (workshop ~ '^[a-z0-9_-]{2,40}$'),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) <= 900000),
  updated_at timestamptz not null default now(),
  primary key (user_id, workshop)
);

alter table public.jfb_lesson_work enable row level security;

drop policy if exists own_lesson_work on public.jfb_lesson_work;
create policy own_lesson_work on public.jfb_lesson_work
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.jfb_lesson_work from anon;
grant select, insert, update on public.jfb_lesson_work to authenticated;

notify pgrst, 'reload schema';
