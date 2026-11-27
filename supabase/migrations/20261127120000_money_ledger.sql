-- The child's own book of real income and expenses, in euros (page /money).
--
-- This is separate from the KidsCoins of the game: the child types what really
-- came in (pocket money, gifts, a small job) and what they spent, and sets a
-- monthly budget per expense category. Nothing is linked to a bank.
--
-- Private to the child: parents and teachers do not see these rows, so that a
-- teenager writes down what they really spend.

create table if not exists public.jfb_ledger (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.jfb_children(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  amount_cents integer not null check (amount_cents between 1 and 10000000),
  category text not null check (char_length(category) between 1 and 30),
  note text check (note is null or char_length(note) <= 80),
  is_need boolean,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists jfb_ledger_child_date_idx on public.jfb_ledger(child_id, occurred_on desc);

create table if not exists public.jfb_ledger_budgets (
  child_id uuid not null references public.jfb_children(id) on delete cascade,
  category text not null check (char_length(category) between 1 and 30),
  amount_cents integer not null check (amount_cents between 1 and 10000000),
  primary key (child_id, category)
);

alter table public.jfb_ledger enable row level security;
alter table public.jfb_ledger_budgets enable row level security;

drop policy if exists child_own_ledger on public.jfb_ledger;
create policy child_own_ledger on public.jfb_ledger
  for all
  using (child_id in (select id from public.jfb_children where user_id = auth.uid()))
  with check (child_id in (select id from public.jfb_children where user_id = auth.uid()));

drop policy if exists child_own_budgets on public.jfb_ledger_budgets;
create policy child_own_budgets on public.jfb_ledger_budgets
  for all
  using (child_id in (select id from public.jfb_children where user_id = auth.uid()))
  with check (child_id in (select id from public.jfb_children where user_id = auth.uid()));

revoke all on public.jfb_ledger, public.jfb_ledger_budgets from anon;
grant select, insert, delete on public.jfb_ledger to authenticated;
grant select, insert, update, delete on public.jfb_ledger_budgets to authenticated;

notify pgrst, 'reload schema';
