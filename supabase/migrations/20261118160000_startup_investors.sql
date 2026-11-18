-- Startups phase 3: investors own shares.
--
-- Every startup starts with 1000 founder shares. Share price = valuation /
-- total shares. Investing buys new shares at that price (the founder's
-- percentage shrinks: dilution). An investor's stake is worth shares × price,
-- so it rises and falls with the founder's decisions. Investors can sell their
-- stake back to the company if it has the cash (liquidity). Founders can pay a
-- dividend from the company's cash at most once a week (investors only, capped)
-- and open a 7-day funding round with a goal; reaching it boosts reputation.

alter table public.startups
  add column if not exists total_shares numeric not null default 1000,
  add column if not exists last_dividend_at timestamptz,
  add column if not exists round_goal integer,
  add column if not exists round_raised integer not null default 0,
  add column if not exists round_ends_at timestamptz,
  add column if not exists rounds_won integer not null default 0;

alter table public.startup_investments add column if not exists shares numeric;

-- Who holds how many shares of which startup (one row per child and startup).
create table if not exists public.jfb_startup_holdings (
  child_id uuid not null references public.jfb_children(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  shares numeric not null check (shares > 0),
  invested integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (child_id, startup_id)
);
create index if not exists jfb_startup_holdings_startup on public.jfb_startup_holdings (startup_id);
alter table public.jfb_startup_holdings enable row level security;
revoke all on public.jfb_startup_holdings from anon, authenticated;
grant select on public.jfb_startup_holdings to authenticated;
drop policy if exists "child reads own holdings" on public.jfb_startup_holdings;
create policy "child reads own holdings" on public.jfb_startup_holdings
  for select to authenticated using (public.jfb_is_child(child_id) or public.jfb_is_parent_of(child_id));

create table if not exists public.jfb_startup_dividends (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  total integer not null,
  investors integer not null,
  paid_at timestamptz not null default now()
);
alter table public.jfb_startup_dividends enable row level security;
revoke all on public.jfb_startup_dividends from anon, authenticated;
grant select on public.jfb_startup_dividends to anon, authenticated;
drop policy if exists "read dividends" on public.jfb_startup_dividends;
create policy "read dividends" on public.jfb_startup_dividends for select using (true);

-- The signed-in child's id, or an error.
create or replace function public.jfb_current_child() returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from jfb_children where user_id = auth.uid() limit 1;
  if v_id is null then raise exception 'Only a child account can do this' using errcode = '42501'; end if;
  return v_id;
end;
$$;
revoke all on function public.jfb_current_child() from public, anon;
grant execute on function public.jfb_current_child() to authenticated;

-- Invest: buys new shares at the current price.
create or replace function public.jfb_invest_in_startup(p_startup_id uuid, p_coins integer)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_child jfb_children%rowtype;
  s startups%rowtype;
  v_invested integer;
  v_price numeric;
  v_shares numeric;
  v_balance integer;
  v_round_open boolean;
begin
  select * into v_child from jfb_children where user_id = auth.uid() limit 1;
  if v_child.id is null then
    raise exception 'Only a child account can invest' using errcode = '42501';
  end if;
  if p_coins is null or p_coins < 1 or p_coins > 100 then
    raise exception 'Invalid amount';
  end if;

  select * into s from startups where id = p_startup_id for update;
  if s.id is null then raise exception 'Unknown startup'; end if;
  if s.child_id = v_child.id then raise exception 'Own startup'; end if;

  select coalesce(invested, 0) into v_invested
  from jfb_startup_holdings where child_id = v_child.id and startup_id = p_startup_id;
  if coalesce(v_invested, 0) + p_coins > jfb_startup_invest_limit() then
    raise exception 'Startup limit reached';
  end if;

  v_price := greatest(s.valuation, 1)::numeric / s.total_shares;
  v_shares := round(p_coins / v_price, 4);

  v_balance := jfb_apply_coins(v_child.id, -p_coins, 'investment',
    'Επένδυση στο startup ' || left(s.name, 40), '🚀');

  insert into startup_investments (startup_id, investor_name, coins, child_id, shares)
  values (p_startup_id, v_child.name, p_coins, v_child.id, v_shares);

  insert into jfb_startup_holdings (child_id, startup_id, shares, invested)
  values (v_child.id, p_startup_id, v_shares, p_coins)
  on conflict (child_id, startup_id) do update set
    shares = jfb_startup_holdings.shares + excluded.shares,
    invested = jfb_startup_holdings.invested + excluded.invested,
    updated_at = now();

  v_round_open := s.round_goal is not null and s.round_ends_at > now();
  update startups set
    coins_raised = coins_raised + p_coins,
    cash = cash + p_coins,
    total_shares = total_shares + v_shares,
    valuation = jfb_startup_valuation(cash + p_coins, customers, reputation, team),
    round_raised = case when v_round_open then round_raised + p_coins else round_raised end
  where id = p_startup_id;

  -- Funding round reached its goal: reputation boost, round closes.
  if v_round_open and s.round_raised < s.round_goal and s.round_raised + p_coins >= s.round_goal then
    update startups set
      reputation = least(reputation + 10, 100),
      valuation = jfb_startup_valuation(cash, customers, least(reputation + 10, 100), team),
      rounds_won = rounds_won + 1,
      round_ends_at = now()
    where id = p_startup_id;
    if s.child_id is not null then
      insert into jfb_notifications (child_id, type, message)
      values (s.child_id, 'startup', '🎉 Ο γύρος χρηματοδότησης της ' || left(s.name, 40) || ' πέτυχε τον στόχο του!');
    end if;
  end if;
  return v_balance;
end;
$$;
revoke all on function public.jfb_invest_in_startup(uuid, integer) from public, anon;
grant execute on function public.jfb_invest_in_startup(uuid, integer) to authenticated;

-- Sell the whole stake back to the company at the current price.
-- Returns {payout, balance}.
create or replace function public.jfb_sell_startup_stake(p_startup_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_child uuid := jfb_current_child();
  s startups%rowtype;
  h jfb_startup_holdings%rowtype;
  v_payout integer;
  v_balance integer;
begin
  select * into s from startups where id = p_startup_id for update;
  if s.id is null then raise exception 'Unknown startup'; end if;
  select * into h from jfb_startup_holdings where child_id = v_child and startup_id = p_startup_id for update;
  if h.child_id is null then raise exception 'No stake'; end if;

  v_payout := floor(h.shares * greatest(s.valuation, 1)::numeric / s.total_shares);
  if v_payout > s.cash then raise exception 'Company has no cash'; end if;

  if v_payout > 0 then
    v_balance := jfb_apply_coins(v_child, v_payout, 'investment',
      'Πώληση μεριδίου στο startup ' || left(s.name, 40), '💸');
  else
    select coins into v_balance from jfb_children where id = v_child;
  end if;

  delete from jfb_startup_holdings where child_id = v_child and startup_id = p_startup_id;
  update startups set
    cash = cash - v_payout,
    total_shares = greatest(total_shares - h.shares, 1000),
    valuation = jfb_startup_valuation(cash - v_payout, customers, reputation, team)
  where id = p_startup_id;

  return jsonb_build_object('payout', v_payout, 'invested', h.invested, 'balance', v_balance);
end;
$$;
revoke all on function public.jfb_sell_startup_stake(uuid) from public, anon;
grant execute on function public.jfb_sell_startup_stake(uuid) to authenticated;

-- Founder pays a dividend: p_percent (5 or 10) of the company's cash, at most
-- 100 coins, at most once every 7 days. Only investors are paid (by their
-- share of the company); the founder's part stays in the company.
create or replace function public.jfb_pay_startup_dividend(p_startup_id uuid, p_percent integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_child uuid := jfb_current_child();
  s startups%rowtype;
  v_pool integer;
  v_paid integer := 0;
  v_count integer := 0;
  v_amount integer;
  h record;
begin
  if p_percent not in (5, 10) then raise exception 'Invalid percent'; end if;
  select * into s from startups where id = p_startup_id for update;
  if s.id is null or s.child_id is distinct from v_child then
    raise exception 'Only the founder can do this' using errcode = '42501';
  end if;
  if s.last_dividend_at is not null and s.last_dividend_at > now() - interval '7 days' then
    raise exception 'Dividend too soon';
  end if;

  v_pool := least(floor(s.cash * p_percent / 100.0), 100);
  for h in select child_id, shares from jfb_startup_holdings where startup_id = p_startup_id loop
    v_amount := floor(v_pool * h.shares / s.total_shares);
    if v_amount > 0 then
      perform jfb_apply_coins(h.child_id, v_amount, 'dividend',
        'Μέρισμα από το startup ' || left(s.name, 40), '💰');
      insert into jfb_notifications (child_id, type, message)
      values (h.child_id, 'startup', '💰 Πήρες μέρισμα ' || v_amount || ' coins από την ' || left(s.name, 40) || '!');
      v_paid := v_paid + v_amount;
      v_count := v_count + 1;
    end if;
  end loop;
  if v_count = 0 then raise exception 'No investors to pay'; end if;

  update startups set
    cash = cash - v_paid,
    reputation = least(reputation + 3, 100),
    valuation = jfb_startup_valuation(cash - v_paid, customers, least(reputation + 3, 100), team),
    last_dividend_at = now()
  where id = p_startup_id;
  insert into jfb_startup_dividends (startup_id, total, investors) values (p_startup_id, v_paid, v_count);

  return jsonb_build_object('paid', v_paid, 'investors', v_count);
end;
$$;
revoke all on function public.jfb_pay_startup_dividend(uuid, integer) from public, anon;
grant execute on function public.jfb_pay_startup_dividend(uuid, integer) to authenticated;

-- Founder opens a 7-day funding round with a goal of 100–1000 coins.
create or replace function public.jfb_open_funding_round(p_startup_id uuid, p_goal integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_child uuid := jfb_current_child();
  s startups%rowtype;
begin
  if p_goal not in (100, 200, 500, 1000) then raise exception 'Invalid goal'; end if;
  select * into s from startups where id = p_startup_id for update;
  if s.id is null or s.child_id is distinct from v_child then
    raise exception 'Only the founder can do this' using errcode = '42501';
  end if;
  if s.round_goal is not null and s.round_ends_at > now() then raise exception 'Round already open'; end if;
  update startups set round_goal = p_goal, round_raised = 0, round_ends_at = now() + interval '7 days'
  where id = p_startup_id;
end;
$$;
revoke all on function public.jfb_open_funding_round(uuid, integer) from public, anon;
grant execute on function public.jfb_open_funding_round(uuid, integer) to authenticated;

-- How many children hold shares of a startup (holdings themselves are private).
create or replace function public.jfb_startup_investor_count(p_startup_id uuid) returns integer
language sql stable security definer set search_path = public as $
  select count(*)::int from jfb_startup_holdings where startup_id = p_startup_id;
$;
grant execute on function public.jfb_startup_investor_count(uuid) to anon, authenticated;

-- Dividends are their own kind of transaction.
alter table public.jfb_transactions drop constraint if exists jfb_transactions_type_check;
alter table public.jfb_transactions add constraint jfb_transactions_type_check
  check (type = any (array['chore', 'lesson', 'investment', 'reward', 'deposit', 'withdrawal', 'dividend']));

notify pgrst, 'reload schema';
