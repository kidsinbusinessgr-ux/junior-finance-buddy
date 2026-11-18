-- Parents can reward a child with "investment capital": coins that can only be
-- invested in startups. Investing uses this capital first, then the child's
-- own coins. Whatever comes back (selling a stake, dividends) is normal coins,
-- so the child earns spendable coins only if they invest well.

alter table public.jfb_children
  add column if not exists invest_capital integer not null default 0;
alter table public.jfb_children drop constraint if exists jfb_children_invest_capital_check;
alter table public.jfb_children add constraint jfb_children_invest_capital_check check (invest_capital >= 0);

-- Parent gives investment capital (1–1000) to their child.
create or replace function public.jfb_parent_give_invest_capital(p_child_id uuid, p_amount integer)
returns integer language plpgsql security definer set search_path = public as $$
declare v_capital integer;
begin
  if not jfb_is_parent_of(p_child_id) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if p_amount is null or p_amount < 1 or p_amount > 1000 then raise exception 'Invalid amount'; end if;
  update jfb_children set invest_capital = invest_capital + p_amount
  where id = p_child_id returning invest_capital into v_capital;
  insert into jfb_notifications (child_id, type, message)
  values (p_child_id, 'invest_capital',
    '🚀 Πήρες ' || p_amount || ' επενδυτικά coins! Μπορείς να τα επενδύσεις σε startups.');
  return v_capital;
end;
$$;
revoke all on function public.jfb_parent_give_invest_capital(uuid, integer) from public, anon;
grant execute on function public.jfb_parent_give_invest_capital(uuid, integer) to authenticated;

-- Invest: as before, but investment capital is used first.
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
      perform jfb_give_badge(s.child_id, 'round_won');
    end if;
  end if;

  perform jfb_give_badge(v_child.id, 'angel_investor');
  perform jfb_after_valuation_change(p_startup_id, s.valuation);
  return v_balance;
end;
$$;
revoke all on function public.jfb_invest_in_startup(uuid, integer) from public, anon;
grant execute on function public.jfb_invest_in_startup(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
