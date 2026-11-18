-- The decision result showed the card's planned change even when it couldn't
-- happen (e.g. "customers -3" for a company with 0 customers). Now the stored
-- effects are the real changes the decision made.

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

  -- Days the founder didn't show up (at most 7 count).
  v_missed := least(greatest(p_day - coalesce(s.last_decision_date, p_day - 1) - 1, 0), 7);
  v_base_reputation := greatest(s.reputation - 3 * v_missed, 0);
  v_base_customers := floor(s.customers * (1 - 0.05 * v_missed));

  -- The decision.
  v_customers := greatest(v_base_customers + p_customers, 0);
  v_reputation := least(greatest(v_base_reputation + p_reputation, 0), 100);
  v_team := least(greatest(s.team + p_team, 1), 50);
  v_cash := greatest(s.cash + p_cash, 0);

  -- The day's business: each customer brings 2 coins, each team member costs 8.
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

  return v_effects || jsonb_build_object('streak', v_streak);
end;
$$;
revoke all on function public.jfb_apply_startup_decision(uuid, date, text, integer, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.jfb_apply_startup_decision(uuid, date, text, integer, integer, integer, integer, integer) to service_role;

-- Decisions already stored with a customer loss the company couldn't have.
update public.jfb_startup_decisions d
set effects = d.effects || jsonb_build_object('customers', 0)
where (d.effects->>'customers')::int < 0
  and not exists (select 1 from public.jfb_startup_history h where h.startup_id = d.startup_id and h.day = d.day and h.customers > 0);
