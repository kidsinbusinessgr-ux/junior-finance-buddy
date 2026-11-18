-- Startups phase 4: the game around the company.
-- * Badges for founders and investors, shown with the other achievements.
-- * A bell message when a company reaches a new stage.
-- * Emoji reactions (fixed set, no free text) from signed-in children.
-- * A public leaderboard: valuation, 7-day growth, CEO streak.

insert into public.jfb_achievements (key, name_gr, description_gr, icon, sort_order) values
  ('startup_founder', 'Ιδρυτής!', 'Έφτιαξες το πρώτο σου startup', '🚀', 9),
  ('angel_investor', 'Angel Επενδυτής!', 'Επένδυσες στο startup ενός φίλου', '😇', 10),
  ('ceo_streak_7', 'CEO της Εβδομάδας!', 'Πήρες αποφάσεις 7 μέρες στη σειρά', '🔥', 11),
  ('stage_prototype', 'Πρωτότυπο!', 'Η εταιρία σου έφτασε στο στάδιο Πρωτότυπο', '🛠️', 12),
  ('stage_launch', 'Λανσάρισμα!', 'Η εταιρία σου έφτασε στο στάδιο Λανσάρισμα', '🎉', 13),
  ('stage_growth', 'Ανάπτυξη!', 'Η εταιρία σου έφτασε στο στάδιο Ανάπτυξη', '📈', 14),
  ('stage_unicorn', 'Μονόκερος!', 'Η εταιρία σου έγινε μονόκερος', '🦄', 15),
  ('round_won', 'Χρηματοδότηση!', 'Ο γύρος χρηματοδότησής σου πέτυχε τον στόχο', '🏆', 16),
  ('generous_ceo', 'Γενναιόδωρος CEO', 'Μοίρασες μέρισμα στους επενδυτές σου', '💝', 17)
on conflict (key) do nothing;

-- Gives a badge once, with a bell message the first time.
create or replace function public.jfb_give_badge(p_child_id uuid, p_key text)
returns void language plpgsql security definer set search_path = public as $$
declare v_name text; v_icon text;
begin
  if p_child_id is null then return; end if;
  insert into jfb_child_achievements (child_id, badge_key) values (p_child_id, p_key)
  on conflict (child_id, badge_key) do nothing;
  if found then
    select name_gr, icon into v_name, v_icon from jfb_achievements where key = p_key;
    insert into jfb_notifications (child_id, type, message)
    values (p_child_id, 'badge', coalesce(v_icon, '🏅') || ' Νέο badge: ' || coalesce(v_name, p_key));
  end if;
end;
$$;
revoke all on function public.jfb_give_badge(uuid, text) from public, anon, authenticated;
grant execute on function public.jfb_give_badge(uuid, text) to service_role;

-- Stage number by valuation (same thresholds as src/lib/startup-stages.ts).
create or replace function public.jfb_startup_stage(p_valuation integer) returns integer
language sql immutable as $$
  select case when p_valuation >= 15000 then 4 when p_valuation >= 6000 then 3
              when p_valuation >= 2500 then 2 when p_valuation >= 1000 then 1 else 0 end;
$$;

-- After a company's value changed: bell message and badge for a new stage.
create or replace function public.jfb_after_valuation_change(p_startup_id uuid, p_old integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  s startups%rowtype;
  v_old integer := jfb_startup_stage(p_old);
  v_new integer;
  v_names text[] := array['Ιδέα', 'Πρωτότυπο', 'Λανσάρισμα', 'Ανάπτυξη', 'Μονόκερος'];
  v_badges text[] := array[null, 'stage_prototype', 'stage_launch', 'stage_growth', 'stage_unicorn'];
begin
  select * into s from startups where id = p_startup_id;
  v_new := jfb_startup_stage(s.valuation);
  if v_new <= v_old or s.child_id is null then return; end if;
  insert into jfb_notifications (child_id, type, message)
  values (s.child_id, 'startup', '🚀 Η ' || left(s.name, 40) || ' έφτασε στο στάδιο ' || v_names[v_new + 1] || '!');
  for i in v_old + 1 .. v_new loop
    perform jfb_give_badge(s.child_id, v_badges[i + 1]);
  end loop;
end;
$$;
revoke all on function public.jfb_after_valuation_change(uuid, integer) from public, anon, authenticated;

-- Daily decision: as before, plus stage messages and the 7-day streak badge.
create or replace function public.jfb_apply_startup_decision(
  p_startup_id uuid, p_day date, p_card_id text, p_choice integer,
  p_customers integer, p_cash integer, p_reputation integer, p_team integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s startups%rowtype;
  v_missed integer;
  v_base_customers integer;
  v_base_reputation integer;
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

  v_missed := least(greatest(p_day - coalesce(s.last_decision_date, p_day - 1) - 1, 0), 7);
  v_base_reputation := greatest(s.reputation - 3 * v_missed, 0);
  v_base_customers := floor(s.customers * (1 - 0.05 * v_missed));

  v_customers := greatest(v_base_customers + p_customers, 0);
  v_reputation := least(greatest(v_base_reputation + p_reputation, 0), 100);
  v_team := least(greatest(s.team + p_team, 1), 50);
  v_cash := greatest(s.cash + p_cash, 0);

  v_revenue := v_customers * 2;
  v_costs := v_team * 8;

  v_effects := jsonb_build_object(
    'customers', v_customers - v_base_customers,
    'cash', v_cash - s.cash,
    'reputation', v_reputation - v_base_reputation,
    'team', v_team - s.team,
    'revenue', v_revenue, 'costs', v_costs, 'missed', v_missed,
    'valuationBefore', s.valuation
  );

  v_cash := greatest(v_cash + v_revenue - v_costs, 0);
  v_streak := case when s.last_decision_date = p_day - 1 then s.ceo_streak + 1 else 1 end;
  v_valuation := jfb_startup_valuation(v_cash, v_customers, v_reputation, v_team);
  v_effects := v_effects || jsonb_build_object('valuationAfter', v_valuation);

  update startups set
    customers = v_customers, reputation = v_reputation, team = v_team, cash = v_cash,
    valuation = v_valuation, ceo_streak = v_streak, last_decision_date = p_day
  where id = p_startup_id;

  insert into jfb_startup_decisions (startup_id, day, card_id, choice, effects)
  values (p_startup_id, p_day, p_card_id, p_choice, v_effects);

  insert into jfb_startup_history (startup_id, day, valuation, customers, cash, reputation)
  values (p_startup_id, p_day, v_valuation, v_customers, v_cash, v_reputation)
  on conflict (startup_id, day) do update set
    valuation = excluded.valuation, customers = excluded.customers,
    cash = excluded.cash, reputation = excluded.reputation;

  perform jfb_after_valuation_change(p_startup_id, s.valuation);
  if v_streak >= 7 then perform jfb_give_badge(s.child_id, 'ceo_streak_7'); end if;

  return v_effects || jsonb_build_object('streak', v_streak);
end;
$$;
revoke all on function public.jfb_apply_startup_decision(uuid, date, text, integer, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.jfb_apply_startup_decision(uuid, date, text, integer, integer, integer, integer, integer) to service_role;

-- Invest: as before, plus the investor badge, stage messages and the round badge.
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

-- Dividend: as before, plus the generous-CEO badge.
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
  perform jfb_give_badge(v_child, 'generous_ceo');

  return jsonb_build_object('paid', v_paid, 'investors', v_count);
end;
$$;
revoke all on function public.jfb_pay_startup_dividend(uuid, integer) from public, anon;
grant execute on function public.jfb_pay_startup_dividend(uuid, integer) to authenticated;

-- Emoji reactions: one of each emoji per child per startup, no free text.
create table if not exists public.jfb_startup_reactions (
  startup_id uuid not null references public.startups(id) on delete cascade,
  child_id uuid not null references public.jfb_children(id) on delete cascade,
  emoji text not null check (emoji in ('🔥', '💡', '🚀', '❤️', '👏')),
  created_at timestamptz not null default now(),
  primary key (startup_id, child_id, emoji)
);
alter table public.jfb_startup_reactions enable row level security;
revoke all on public.jfb_startup_reactions from anon, authenticated;

-- Adds or removes the signed-in child's reaction; returns true if it is now on.
create or replace function public.jfb_toggle_startup_reaction(p_startup_id uuid, p_emoji text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_child uuid := jfb_current_child();
begin
  delete from jfb_startup_reactions where startup_id = p_startup_id and child_id = v_child and emoji = p_emoji;
  if found then return false; end if;
  insert into jfb_startup_reactions (startup_id, child_id, emoji) values (p_startup_id, v_child, p_emoji);
  return true;
end;
$$;
revoke all on function public.jfb_toggle_startup_reaction(uuid, text) from public, anon;
grant execute on function public.jfb_toggle_startup_reaction(uuid, text) to authenticated;

-- Reaction counts for a startup, and which ones the signed-in child gave.
create or replace function public.jfb_startup_reaction_counts(p_startup_id uuid)
returns table (emoji text, total integer, mine boolean)
language sql stable security definer set search_path = public as $$
  select r.emoji, count(*)::int,
         bool_or(r.child_id = (select id from jfb_children where user_id = auth.uid() limit 1))
  from jfb_startup_reactions r where r.startup_id = p_startup_id group by r.emoji;
$$;
grant execute on function public.jfb_startup_reaction_counts(uuid) to anon, authenticated;

-- Leaderboard: every startup with its value, growth over the last 7 days
-- (against its value a week ago, or the starting 640) and CEO streak.
create or replace function public.jfb_startup_leaderboard()
returns table (id uuid, name text, emoji text, valuation integer, growth integer, ceo_streak integer)
language sql stable security definer set search_path = public as $$
  select s.id, s.name, s.emoji, s.valuation,
         s.valuation - coalesce((
           select h.valuation from jfb_startup_history h
           where h.startup_id = s.id and h.day <= current_date - 7
           order by h.day desc limit 1), 640) as growth,
         case when s.last_decision_date >= current_date - 1 then s.ceo_streak else 0 end
  from startups s;
$$;
grant execute on function public.jfb_startup_leaderboard() to anon, authenticated;

-- Founders of existing startups get their founder badge.
select public.jfb_give_badge(child_id, 'startup_founder') from public.startups where child_id is not null;

notify pgrst, 'reload schema';
