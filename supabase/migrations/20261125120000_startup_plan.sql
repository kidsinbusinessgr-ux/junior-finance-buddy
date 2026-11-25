-- Startup business plan (the Kids in Business workbook, made interactive):
-- competitors and USP from the builder, the costing with break-even, and the
-- founder's ad. Everyone can read it with the startup (public pitch page).
--
-- Only the server writes it (saveStartupPlan / createStartup), after checking
-- that the signed-in child owns the startup and the texts are polite. The
-- browser has no insert/update rights on startups.

alter table public.startups
  add column if not exists plan jsonb not null default '{}'::jsonb;

alter table public.startups
  drop constraint if exists startups_plan_size;
alter table public.startups
  add constraint startups_plan_size
  check (jsonb_typeof(plan) = 'object' and pg_column_size(plan) <= 20000);

notify pgrst, 'reload schema';
