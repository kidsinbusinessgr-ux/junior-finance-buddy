-- Step 1 of 2 (safe to apply before the new frontend is deployed: only ADDS things).
-- Every coin change now goes through one of these SECURITY DEFINER functions,
-- which check who is calling (auth.uid()) and read prices/amounts from the
-- database instead of trusting the browser.

-- ── helpers ──────────────────────────────────────────────────────────────────
create or replace function public.jfb_is_parent_of(p_child_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from jfb_children c join jfb_parents p on p.id = c.parent_id
    where c.id = p_child_id and p.user_id = auth.uid()
  );
$$;

create or replace function public.jfb_is_child(p_child_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from jfb_children where id = p_child_id and user_id = auth.uid());
$$;

-- Internal: change balance + write the transaction row. Not callable by users.
create or replace function public.jfb_apply_coins(
  p_child_id uuid, p_amount integer, p_type text, p_description text, p_icon text
) returns integer language plpgsql security definer set search_path = public as $$
declare v_coins integer;
begin
  update jfb_children set coins = coins + p_amount
  where id = p_child_id and coins + p_amount >= 0
  returning coins into v_coins;
  if v_coins is null then
    raise exception 'Not enough coins' using errcode = 'P0001';
  end if;
  insert into jfb_transactions (child_id, type, amount, description, icon)
  values (p_child_id, p_type, p_amount, p_description, p_icon);
  return v_coins;
end;
$$;

-- ── parent actions ───────────────────────────────────────────────────────────
create or replace function public.jfb_parent_give_coins(p_child_id uuid, p_amount integer, p_note text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare v_coins integer;
begin
  if not jfb_is_parent_of(p_child_id) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > 10000 then raise exception 'Invalid amount'; end if;
  v_coins := jfb_apply_coins(p_child_id, p_amount, 'deposit', coalesce(nullif(p_note, ''), 'Χαρτζιλίκι'), '💰');
  insert into jfb_notifications (child_id, type, message)
  values (p_child_id, 'allowance_received', '💰 έλαβες ' || p_amount || ' 🪙 χαρτζιλίκι!');
  return v_coins;
end;
$$;

create or replace function public.jfb_approve_chore(p_submission_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_child uuid; v_name text; v_emoji text; v_coins integer;
begin
  select s.child_id, ch.name, ch.emoji, ch.coins into v_child, v_name, v_emoji, v_coins
  from jfb_chore_submissions s join jfb_chores ch on ch.id = s.chore_id
  where s.id = p_submission_id;
  if v_child is null or not jfb_is_parent_of(v_child) then raise exception 'Not allowed' using errcode = '42501'; end if;

  -- Only a pending submission can be approved, so a double click pays once.
  update jfb_chore_submissions set status = 'approved', reviewed_at = now()
  where id = p_submission_id and status = 'pending';
  if not found then return; end if;

  if v_coins > 0 then
    perform jfb_apply_coins(v_child, v_coins, 'chore', v_emoji || ' ' || v_name, v_emoji);
  end if;
  insert into jfb_notifications (child_id, type, message)
  values (v_child, 'chore_approved', v_emoji || ' ' || v_name || ' εγκρίθηκε! Κέρδισες ' || v_coins || ' 🪙');
end;
$$;

create or replace function public.jfb_approve_reward(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_child uuid; v_name text; v_cost integer;
begin
  select r.child_id, rw.name, rw.cost into v_child, v_name, v_cost
  from jfb_reward_requests r join jfb_rewards rw on rw.id = r.reward_id
  where r.id = p_request_id;
  if v_child is null or not jfb_is_parent_of(v_child) then raise exception 'Not allowed' using errcode = '42501'; end if;

  update jfb_reward_requests set status = 'approved', reviewed_at = now()
  where id = p_request_id and status = 'pending';
  if not found then return; end if;
  perform jfb_apply_coins(v_child, -v_cost, 'reward', 'Βραβείο: ' || v_name, '🎁');
end;
$$;

-- ── child actions ────────────────────────────────────────────────────────────
create or replace function public.jfb_deposit_to_goal(p_goal_id uuid, p_amount integer)
returns void language plpgsql security definer set search_path = public as $$
declare v_child uuid; v_name text; v_saved integer; v_target integer; v_put integer;
begin
  select child_id, name, saved_coins, target_coins into v_child, v_name, v_saved, v_target
  from jfb_savings_goals where id = p_goal_id for update;
  if v_child is null or not jfb_is_child(v_child) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Invalid amount'; end if;

  v_put := least(p_amount, greatest(v_target - v_saved, 0));
  if v_put = 0 then return; end if;
  perform jfb_apply_coins(v_child, -v_put, 'withdrawal', 'Αποταμίευση: ' || v_name, '🎯');
  update jfb_savings_goals
  set saved_coins = v_saved + v_put, completed = (v_saved + v_put) >= v_target
  where id = p_goal_id;
end;
$$;

-- Simulated prices live here, server-side, so the browser can't pick its own price.
-- Keep in sync with STOCK_CATALOG / STARTUP_CATALOG in src/routes/investments.tsx.
create or replace function public.jfb_stock_price(p_ticker text)
returns integer language sql immutable set search_path = public as $$
  select case p_ticker
    when 'AAPL' then 85 when 'NKE' then 42 when 'SPOT' then 38
    when 'LEGO' then 55 when 'NFLX' then 72 when 'RBLX' then 29
  end;
$$;

create or replace function public.jfb_startup_price(p_name text)
returns integer language sql immutable set search_path = public as $$
  select case p_name when 'GreenBot' then 10 when 'SnackBox' then 15 when 'PetHelper' then 20 end;
$$;

create or replace function public.jfb_trade_stock(
  p_child_id uuid, p_ticker text, p_company text, p_emoji text, p_quantity integer, p_side text
) returns void language plpgsql security definer set search_path = public as $$
declare v_price integer := jfb_stock_price(p_ticker); v_shares integer; v_avg integer; v_total integer;
begin
  if not jfb_is_child(p_child_id) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if v_price is null then raise exception 'Unknown stock'; end if;
  if p_quantity is null or p_quantity <= 0 or p_quantity > 1000 then raise exception 'Invalid quantity'; end if;
  v_total := v_price * p_quantity;

  select shares, avg_buy_price into v_shares, v_avg
  from jfb_stock_holdings where child_id = p_child_id and ticker = p_ticker for update;
  v_shares := coalesce(v_shares, 0);

  if p_side = 'buy' then
    perform jfb_apply_coins(p_child_id, -v_total, 'investment',
      'Αγορά ' || p_quantity || ' μετοχών ' || p_company, p_emoji);
    insert into jfb_stock_holdings (child_id, ticker, company_name, emoji, shares, avg_buy_price, updated_at)
    values (p_child_id, p_ticker, p_company, p_emoji, p_quantity, v_price, now())
    on conflict (child_id, ticker) do update
      set shares = jfb_stock_holdings.shares + excluded.shares,
          avg_buy_price = round(((jfb_stock_holdings.shares * jfb_stock_holdings.avg_buy_price)
                          + (excluded.shares * excluded.avg_buy_price))::numeric
                          / (jfb_stock_holdings.shares + excluded.shares)),
          updated_at = now();
  elsif p_side = 'sell' then
    if v_shares < p_quantity then raise exception 'Not enough shares'; end if;
    if v_shares = p_quantity then
      delete from jfb_stock_holdings where child_id = p_child_id and ticker = p_ticker;
    else
      update jfb_stock_holdings set shares = v_shares - p_quantity, updated_at = now()
      where child_id = p_child_id and ticker = p_ticker;
    end if;
    perform jfb_apply_coins(p_child_id, v_total, 'investment',
      'Πώληση ' || p_quantity || ' μετοχών ' || p_company, p_emoji);
  else
    raise exception 'Invalid side';
  end if;
end;
$$;

create or replace function public.jfb_invest_startup(
  p_child_id uuid, p_startup_name text, p_emoji text, p_quantity integer
) returns void language plpgsql security definer set search_path = public as $$
declare v_price integer := jfb_startup_price(p_startup_name);
begin
  if not jfb_is_child(p_child_id) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if v_price is null then raise exception 'Unknown startup'; end if;
  if p_quantity is null or p_quantity <= 0 or p_quantity > 1000 then raise exception 'Invalid quantity'; end if;

  perform jfb_apply_coins(p_child_id, -(v_price * p_quantity), 'investment',
    'Επένδυση σε ' || p_startup_name || ' (' || p_quantity || ' μερίδια)', p_emoji);
  insert into jfb_startup_investments (child_id, startup_name, emoji, shares, price_per_share, invested_at)
  values (p_child_id, p_startup_name, p_emoji, p_quantity, v_price, now())
  on conflict (child_id, startup_name) do update
    set shares = jfb_startup_investments.shares + excluded.shares, invested_at = now();
end;
$$;

-- Seeding chores only for your own parent profile.
create or replace function public.jfb_seed_default_chores(p_parent_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from jfb_parents where id = p_parent_id and user_id = auth.uid()) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  insert into jfb_chores (parent_id, name, emoji, coins, is_obligatory) values
    (p_parent_id, 'Στρώσιμο κρεβατιού', '🛏️', 0, true),
    (p_parent_id, 'Βούρτσισμα δοντιών', '🦷', 0, true),
    (p_parent_id, 'Τακτοποίηση δωματίου', '🧹', 0, true),
    (p_parent_id, 'Σκούπισμα σαλονιού', '🧹', 15, false),
    (p_parent_id, 'Πλύσιμο πιάτων', '🍽️', 20, false),
    (p_parent_id, 'Πότισμα φυτών', '🪴', 10, false),
    (p_parent_id, 'Βοήθεια με ψώνια', '🛒', 25, false),
    (p_parent_id, 'Καθάρισμα μπάνιου', '🚿', 30, false);
end;
$$;

-- Who may call what. Internal helpers stay private.
revoke all on function public.jfb_apply_coins(uuid, integer, text, text, text) from public, anon, authenticated;
revoke all on function public.jfb_parent_give_coins(uuid, integer, text) from public, anon;
revoke all on function public.jfb_approve_chore(uuid) from public, anon;
revoke all on function public.jfb_approve_reward(uuid) from public, anon;
revoke all on function public.jfb_deposit_to_goal(uuid, integer) from public, anon;
revoke all on function public.jfb_trade_stock(uuid, text, text, text, integer, text) from public, anon;
revoke all on function public.jfb_invest_startup(uuid, text, text, integer) from public, anon;
revoke all on function public.jfb_seed_default_chores(uuid) from public, anon;
grant execute on function public.jfb_parent_give_coins(uuid, integer, text) to authenticated;
grant execute on function public.jfb_approve_chore(uuid) to authenticated;
grant execute on function public.jfb_approve_reward(uuid) to authenticated;
grant execute on function public.jfb_deposit_to_goal(uuid, integer) to authenticated;
grant execute on function public.jfb_trade_stock(uuid, text, text, text, integer, text) to authenticated;
grant execute on function public.jfb_invest_startup(uuid, text, text, integer) to authenticated;
grant execute on function public.jfb_seed_default_chores(uuid) to authenticated;

-- Achievements catalog had RLS switched off.
alter table public.jfb_achievements enable row level security;
drop policy if exists "achievements readable" on public.jfb_achievements;
create policy "achievements readable" on public.jfb_achievements for select to authenticated using (true);

-- Each Stripe checkout session can unlock premium for one account only.
-- Written by the server (service role); no access for app users.
create table if not exists public.jfb_premium_claims (
  session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  claimed_at timestamptz not null default now()
);
alter table public.jfb_premium_claims enable row level security;
revoke all on public.jfb_premium_claims from anon, authenticated;

-- Premium flag moves to app_metadata (users cannot edit it themselves).
-- Carries over anyone already marked paid in the old, user-editable field.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('subscription_tier', 'paid',
                        'subscription_plan', coalesce(raw_user_meta_data->>'subscription_plan', 'monthly'))
where raw_user_meta_data->>'subscription_tier' = 'paid'
  and coalesce(raw_app_meta_data->>'subscription_tier', '') <> 'paid';
