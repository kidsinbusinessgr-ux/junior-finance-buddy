-- Funding rounds become "all or nothing", like real crowdfunding.
-- While a round is open, an investment is a pledge: the coins (and any
-- investment capital) leave the child but are held aside, not given to the
-- company. If the round reaches its goal, every pledge turns into shares at
-- the same price and the money goes into the company's cash. If the deadline
-- passes first, every pledge is given back in full (coins and capital), with a
-- bell message. Investing when no round is open works as before.

create table if not exists public.jfb_round_pledges (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  child_id uuid not null references public.jfb_children(id) on delete cascade,
  coins integer not null check (coins > 0),
  from_capital integer not null default 0 check (from_capital >= 0),
  round_ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'converted', 'refunded')),
  created_at timestamptz not null default now()
);
create index if not exists jfb_round_pledges_open on public.jfb_round_pledges (startup_id, status);
alter table public.jfb_round_pledges enable row level security;
revoke all on public.jfb_round_pledges from anon, authenticated;
grant select on public.jfb_round_pledges to authenticated;
drop policy if exists "child reads own pledges" on public.jfb_round_pledges;
create policy "child reads own pledges" on public.jfb_round_pledges
  for select to authenticated using (public.jfb_is_child(child_id) or public.jfb_is_parent_of(child_id));

-- Turns all pending pledges of a startup's round into shares (round reached its goal).
create or replace function public.jfb_convert_round_pledges(p_startup_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  s startups%rowtype;
  v_price numeric;
  v_total integer := 0;
  v_shares_total numeric := 0;
  v_shares numeric;
  p record;
  v_name text;
begin
  select * into s from startups where id = p_startup_id for update;
  v_price := greatest(s.valuation, 1)::numeric / s.total_shares;
  for p in select * from jfb_round_pledges where startup_id = p_startup_id and status = 'pending' for update loop
    v_shares := round(p.coins / v_price, 4);
    select name into v_name from jfb_children where id = p.child_id;
    insert into startup_investments (startup_id, investor_name, coins, child_id, shares)
    values (p_startup_id, coalesce(v_name, ''), p.coins, p.child_id, v_shares);
    insert into jfb_startup_holdings (child_id, startup_id, shares, invested)
    values (p.child_id, p_startup_id, v_shares, p.coins)
    on conflict (child_id, startup_id) do update set
      shares = jfb_startup_holdings.shares + excluded.shares,
      invested = jfb_startup_holdings.invested + excluded.invested,
      updated_at = now();
    update jfb_round_pledges set status = 'converted' where id = p.id;
    insert into jfb_notifications (child_id, type, message)
    values (p.child_id, 'startup', '🎉 Ο γύρος της ' || left(s.name, 40) || ' πέτυχε! Τα ' || p.coins || ' coins σου έγιναν μερίδια.');
    perform jfb_give_badge(p.child_id, 'angel_investor');
    v_total := v_total + p.coins;
    v_shares_total := v_shares_total + v_shares;
  end loop;

  update startups set
    coins_raised = coins_raised + v_total,
    cash = cash + v_total,
    total_shares = total_shares + v_shares_total,
    reputation = least(reputation + 10, 100),
    valuation = jfb_startup_valuation(cash + v_total, customers, least(reputation + 10, 100), team),
    rounds_won = rounds_won + 1,
    round_ends_at = now()
  where id = p_startup_id;

  if s.child_id is not null then
    insert into jfb_notifications (child_id, type, message)
    values (s.child_id, 'startup', '🎉 Ο γύρος χρηματοδότησης της ' || left(s.name, 40) || ' πέτυχε! Μπήκαν 🪙 ' || v_total || ' στο ταμείο.');
    perform jfb_give_badge(s.child_id, 'round_won');
  end if;
  perform jfb_after_valuation_change(p_startup_id, s.valuation);
end;
$$;
revoke all on function public.jfb_convert_round_pledges(uuid) from public, anon, authenticated;

-- Gives back every pending pledge of rounds whose deadline has passed.
-- p_startup_id limits it to one startup (null = all). Returns refunds made.
create or replace function public.jfb_settle_startup_rounds(p_startup_id uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  s record;
  p record;
  v_back integer;
  v_count integer := 0;
  v_total integer;
begin
  for s in
    select st.* from startups st
    where (p_startup_id is null or st.id = p_startup_id)
      and st.round_ends_at is not null and st.round_ends_at <= now()
      and exists (select 1 from jfb_round_pledges rp where rp.startup_id = st.id and rp.status = 'pending')
    for update
  loop
    v_total := 0;
    for p in select * from jfb_round_pledges where startup_id = s.id and status = 'pending' for update loop
      v_back := p.coins - p.from_capital;
      if v_back > 0 then
        perform jfb_apply_coins(p.child_id, v_back, 'investment',
          'Επιστροφή: ο γύρος της ' || left(s.name, 40) || ' δεν πέτυχε', '↩️');
      end if;
      if p.from_capital > 0 then
        update jfb_children set invest_capital = invest_capital + p.from_capital where id = p.child_id;
      end if;
      update jfb_round_pledges set status = 'refunded' where id = p.id;
      insert into jfb_notifications (child_id, type, message)
      values (p.child_id, 'startup', '↩️ Ο γύρος της ' || left(s.name, 40) || ' δεν έπιασε τον στόχο. Σου επιστράφηκαν τα ' || p.coins || ' coins σου.');
      v_total := v_total + p.coins;
      v_count := v_count + 1;
    end loop;
    if s.child_id is not null then
      insert into jfb_notifications (child_id, type, message)
      values (s.child_id, 'startup', '😕 Ο γύρος της ' || left(s.name, 40) || ' δεν έπιασε τον στόχο και τα 🪙 ' || v_total ||
              ' επιστράφηκαν στους επενδυτές. Δοκίμασε ξανά με μικρότερο στόχο!');
    end if;
    update startups set round_raised = 0 where id = s.id;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.jfb_settle_startup_rounds(uuid) from public, anon, authenticated;
grant execute on function public.jfb_settle_startup_rounds(uuid) to service_role;

-- Invest: during an open round the coins become a pledge; otherwise shares now.
create or replace function public.jfb_invest_in_startup(p_startup_id uuid, p_coins integer)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_child jfb_children%rowtype;
  s startups%rowtype;
  v_invested integer;
  v_pledged integer;
  v_price numeric;
  v_shares numeric;
  v_balance integer;
  v_from_capital integer;
  v_from_coins integer;
begin
  select * into v_child from jfb_children where user_id = auth.uid() limit 1 for update;
  if v_child.id is null then
    raise exception 'Only a child account can invest' using errcode = '42501';
  end if;
  if p_coins is null or p_coins < 1 or p_coins > 100 then
    raise exception 'Invalid amount';
  end if;

  -- A round whose deadline passed is settled first.
  perform jfb_settle_startup_rounds(p_startup_id);

  select * into s from startups where id = p_startup_id for update;
  if s.id is null then raise exception 'Unknown startup'; end if;
  if s.child_id = v_child.id then raise exception 'Own startup'; end if;

  select coalesce(sum(invested), 0) into v_invested
  from jfb_startup_holdings where child_id = v_child.id and startup_id = p_startup_id;
  select coalesce(sum(coins), 0) into v_pledged
  from jfb_round_pledges where child_id = v_child.id and startup_id = p_startup_id and status = 'pending';
  if v_invested + v_pledged + p_coins > jfb_startup_invest_limit() then
    raise exception 'Startup limit reached';
  end if;

  -- Investment capital first, then the child's own coins.
  v_from_capital := least(v_child.invest_capital, p_coins);
  v_from_coins := p_coins - v_from_capital;
  if v_from_capital > 0 then
    update jfb_children set invest_capital = invest_capital - v_from_capital where id = v_child.id;
  end if;
  if v_from_coins > 0 then
    v_balance := jfb_apply_coins(v_child.id, -v_from_coins, 'investment',
      'Επένδυση στο startup ' || left(s.name, 40), '🚀');
  else
    v_balance := v_child.coins;
  end if;

  if s.round_goal is not null and s.round_ends_at > now() then
    -- Open round: hold the coins until the round ends.
    insert into jfb_round_pledges (startup_id, child_id, coins, from_capital, round_ends_at)
    values (p_startup_id, v_child.id, p_coins, v_from_capital, s.round_ends_at);
    update startups set round_raised = round_raised + p_coins where id = p_startup_id;
    if s.round_raised + p_coins >= s.round_goal then
      perform jfb_convert_round_pledges(p_startup_id);
    end if;
    return v_balance;
  end if;

  -- No round: shares now.
  v_price := greatest(s.valuation, 1)::numeric / s.total_shares;
  v_shares := round(p_coins / v_price, 4);

  insert into startup_investments (startup_id, investor_name, coins, child_id, shares)
  values (p_startup_id, v_child.name, p_coins, v_child.id, v_shares);

  insert into jfb_startup_holdings (child_id, startup_id, shares, invested)
  values (v_child.id, p_startup_id, v_shares, p_coins)
  on conflict (child_id, startup_id) do update set
    shares = jfb_startup_holdings.shares + excluded.shares,
    invested = jfb_startup_holdings.invested + excluded.invested,
    updated_at = now();

  update startups set
    coins_raised = coins_raised + p_coins,
    cash = cash + p_coins,
    total_shares = total_shares + v_shares,
    valuation = jfb_startup_valuation(cash + p_coins, customers, reputation, team)
  where id = p_startup_id;

  perform jfb_give_badge(v_child.id, 'angel_investor');
  perform jfb_after_valuation_change(p_startup_id, s.valuation);
  return v_balance;
end;
$$;
revoke all on function public.jfb_invest_in_startup(uuid, integer) from public, anon;
grant execute on function public.jfb_invest_in_startup(uuid, integer) to authenticated;

-- Opening a round first settles an earlier one that ended without its goal.
create or replace function public.jfb_open_funding_round(p_startup_id uuid, p_goal integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_child uuid := jfb_current_child();
  s startups%rowtype;
begin
  if p_goal not in (100, 200, 500, 1000) then raise exception 'Invalid goal'; end if;
  perform jfb_settle_startup_rounds(p_startup_id);
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

notify pgrst, 'reload schema';
