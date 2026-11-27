-- "Το πλάνο των χρημάτων μου" (Junior CEO Financial Tracker), the worksheet
-- made interactive on /money: one plan per child and month, with the pocket
-- money, the savings goal and what it is for, how the money left over is
-- shared into three piggy banks (needs, wants, savings), and notes for the
-- next month. The month's expenses come from jfb_ledger. Private to the child.

create table if not exists public.jfb_money_plans (
  child_id uuid not null references public.jfb_children(id) on delete cascade,
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  allowance_cents integer check (allowance_cents is null or allowance_cents between 0 and 10000000),
  goal_cents integer check (goal_cents is null or goal_cents between 0 and 10000000),
  goal_for text check (goal_for is null or char_length(goal_for) <= 60),
  needs_cents integer not null default 0 check (needs_cents between 0 and 10000000),
  wants_cents integer not null default 0 check (wants_cents between 0 and 10000000),
  savings_cents integer not null default 0 check (savings_cents between 0 and 10000000),
  notes text check (notes is null or char_length(notes) <= 300),
  updated_at timestamptz not null default now(),
  primary key (child_id, month)
);

alter table public.jfb_money_plans enable row level security;

drop policy if exists child_own_plans on public.jfb_money_plans;
create policy child_own_plans on public.jfb_money_plans
  for all
  using (child_id in (select id from public.jfb_children where user_id = auth.uid()))
  with check (child_id in (select id from public.jfb_children where user_id = auth.uid()));

revoke all on public.jfb_money_plans from anon;
grant select, insert, update on public.jfb_money_plans to authenticated;

notify pgrst, 'reload schema';
