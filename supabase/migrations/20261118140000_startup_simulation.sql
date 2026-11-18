-- Startups phase 2: "the company lives".
-- Every startup has numbers that change day by day: customers, cash (the
-- company's own money, in coins), reputation (0-100), team size, and a
-- valuation computed from them. Once a day the founder answers a "decision of
-- the day" (cards are in src/lib/startup-decisions.ts); the server applies the
-- card's effects through jfb_apply_startup_decision, plus the day's revenue
-- and costs. Missing days costs a little reputation and customers, so it pays
-- to come back. Coins invested by other children go into the company's cash.

create or replace function public.jfb_startup_valuation(
  p_cash integer, p_customers integer, p_reputation integer, p_team integer
) returns integer language sql immutable as $$
  select greatest(p_cash, 0) + p_customers * 15 + p_reputation * 10 + p_team * 40;
$$;

alter table public.startups
  add column if not exists customers integer not null default 0,
  add column if not exists cash integer not null default 100,
  add column if not exists reputation integer not null default 50,
  add column if not exists team integer not null default 1,
  add column if not exists valuation integer not null default 640,
  add column if not exists ceo_streak integer not null default 0,
  add column if not exists last_decision_date date;

alter table public.startups drop constraint if exists startups_metrics_check;
alter table public.startups add constraint startups_metrics_check check (
  customers >= 0 and cash >= 0 and reputation between 0 and 100 and team between 1 and 50
);

-- Existing startups: the coins already raised are in the company's cash.
update public.startups
set cash = 100 + coins_raised,
    valuation = public.jfb_startup_valuation(100 + coins_raised, customers, reputation, team);

-- One decision per startup per day, with what it changed.
create table if not exists public.jfb_startup_decisions (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  day date not null,
  card_id text not null,
  choice integer not null,
  effects jsonb not null,
  created_at timestamptz not null default now(),
  unique (startup_id, day)
);
create index if not exists jfb_startup_decisions_recent on public.jfb_startup_decisions (startup_id, day desc);

-- The company's numbers at the end of each played day (for the chart).
create table if not exists public.jfb_startup_history (
  startup_id uuid not null references public.startups(id) on delete cascade,
  day date not null,
  valuation integer not null,
  customers integer not null,
  cash integer not null,
  reputation integer not null,
  primary key (startup_id, day)
);

alter table public.jfb_startup_decisions enable row level security;
alter table public.jfb_startup_history enable row level security;
revoke all on public.jfb_startup_decisions from anon, authenticated;
revoke all on public.jfb_startup_history from anon, authenticated;
-- The value chart is public like the pitch; decisions are read by the server.
grant select on public.jfb_startup_history to anon, authenticated;
drop policy if exists "read startup history" on public.jfb_startup_history;
create policy "read startup history" on public.jfb_startup_history for select using (true);

-- Applies one day's decision. Called only by the server (service role), which
-- checks that the caller owns the startup and takes the effects from the card.
create or replace function public.jfb_apply_startup_decision(
  p_startup_id uuid, p_day date, p_card_id text, p_choice integer,
  p_customers integer, p_cash integer, p_reputation integer, p_team integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s startups%rowtype;
  v_missed integer;
  v_customers integer;
  v_reputation integer;
  v_team integer;
  v_cash integer;
  v_revenue integer;
  v_costs integer;
  v_streak integer;
  v_valuation integer;
  v_effects jsonb;
begin
  select * into s from startups where id = p_startup_id for update;
  if s.id is null then raise exception 'Unknown startup'; end if;
  if exists (select 1 from jfb_startup_decisions where startup_id = p_startup_id and day = p_day) then
    raise exception 'Already decided today';
  end if;

  -- Days the founder didn't show up (at most 7 count).
  v_missed := least(greatest(p_day - coalesce(s.last_decision_date, p_day - 1) - 1, 0), 7);
  v_reputation := s.reputation - 3 * v_missed;
  v_customers := floor(s.customers * (1 - 0.05 * v_missed));

  -- The decision.
  v_customers := greatest(v_customers + p_customers, 0);
  v_reputation := least(greatest(v_reputation + p_reputation, 0), 100);
  v_team := least(greatest(s.team + p_team, 1), 50);
  v_cash := s.cash + p_cash;

  -- The day's business: each customer brings 2 coins, each team member costs 8.
  v_revenue := v_customers * 2;
  v_costs := v_team * 8;
  v_cash := greatest(v_cash + v_revenue - v_costs, 0);

  v_streak := case when s.last_decision_date = p_day - 1 then s.ceo_streak + 1 else 1 end;
  v_valuation := jfb_startup_valuation(v_cash, v_customers, v_reputation, v_team);

  update startups set
    customers = v_customers, reputation = v_reputation, team = v_team, cash = v_cash,
    valuation = v_valuation, ceo_streak = v_streak, last_decision_date = p_day
  where id = p_startup_id;

  v_effects := jsonb_build_object(
    'customers', p_customers, 'cash', p_cash, 'reputation', p_reputation, 'team', p_team,
    'revenue', v_revenue, 'costs', v_costs, 'missed', v_missed,
    'valuationBefore', s.valuation, 'valuationAfter', v_valuation
  );
  insert into jfb_startup_decisions (startup_id, day, card_id, choice, effects)
  values (p_startup_id, p_day, p_card_id, p_choice, v_effects);

  insert into jfb_startup_history (startup_id, day, valuation, customers, cash, reputation)
  values (p_startup_id, p_day, v_valuation, v_customers, v_cash, v_reputation)
  on conflict (startup_id, day) do update set
    valuation = excluded.valuation, customers = excluded.customers,
    cash = excluded.cash, reputation = excluded.reputation;

  return v_effects || jsonb_build_object('streak', v_streak);
end;
$$;
revoke all on function public.jfb_apply_startup_decision(uuid, date, text, integer, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.jfb_apply_startup_decision(uuid, date, text, integer, integer, integer, integer, integer) to service_role;

-- Investing now also puts the coins into the company's cash.
create or replace function public.jfb_invest_in_startup(p_startup_id uuid, p_coins integer)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_child jfb_children%rowtype;
  v_startup startups%rowtype;
  v_already integer;
  v_balance integer;
begin
  select * into v_child from jfb_children where user_id = auth.uid() limit 1;
  if v_child.id is null then
    raise exception 'Only a child account can invest' using errcode = '42501';
  end if;
  if p_coins is null or p_coins < 1 or p_coins > 100 then
    raise exception 'Invalid amount';
  end if;

  select * into v_startup from startups where id = p_startup_id for update;
  if v_startup.id is null then raise exception 'Unknown startup'; end if;
  if v_startup.child_id = v_child.id then raise exception 'Own startup'; end if;

  select coalesce(sum(coins), 0) into v_already
  from startup_investments where startup_id = p_startup_id and child_id = v_child.id;
  if v_already + p_coins > jfb_startup_invest_limit() then
    raise exception 'Startup limit reached';
  end if;

  v_balance := jfb_apply_coins(v_child.id, -p_coins, 'investment',
    'Επένδυση στο startup ' || left(v_startup.name, 40), '🚀');

  insert into startup_investments (startup_id, investor_name, coins, child_id)
  values (p_startup_id, v_child.name, p_coins, v_child.id);

  update startups set
    coins_raised = coins_raised + p_coins,
    cash = cash + p_coins,
    valuation = jfb_startup_valuation(cash + p_coins, customers, reputation, team)
  where id = p_startup_id;
  return v_balance;
end;
$$;
revoke all on function public.jfb_invest_in_startup(uuid, integer) from public, anon;
grant execute on function public.jfb_invest_in_startup(uuid, integer) to authenticated;

-- Notifications can now know which child a browser belongs to (founder reminders).
alter table public.push_subscriptions
  add column if not exists child_id uuid references public.jfb_children(id) on delete set null;

notify pgrst, 'reload schema';
