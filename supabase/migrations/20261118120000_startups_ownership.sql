-- Startups phase 1: every startup belongs to a signed-in child and investing
-- spends real coins.
--
-- Before: anyone (even signed out) could add startups and investments with any
-- name, investing cost nothing, and coins_raised never changed because the
-- page's update was not allowed. Now startups are created by a server function
-- (which also checks the text for bad words) and investments only through
-- jfb_invest_in_startup, which takes the coins from the child.

alter table public.startups
  add column if not exists child_id uuid references public.jfb_children(id) on delete set null;
create index if not exists startups_child_id_idx on public.startups (child_id);

alter table public.startup_investments
  add column if not exists child_id uuid references public.jfb_children(id) on delete set null;
create index if not exists startup_investments_child_idx on public.startup_investments (child_id, startup_id);

-- No direct writes from the browser any more.
drop policy if exists "public insert startups" on public.startups;
drop policy if exists "public insert investments" on public.startup_investments;
revoke insert, update, delete, truncate, references, trigger on public.startups from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.startup_investments from anon, authenticated;

-- Startup pitches stay public (a showcase); who invested is visible to signed-in users only.
revoke select on public.startup_investments from anon;
drop policy if exists "public read investments" on public.startup_investments;
create policy "signed-in read investments" on public.startup_investments
  for select to authenticated using (true);

-- Most a child can put into one startup in total, so they spread their coins.
create or replace function public.jfb_startup_invest_limit() returns integer
language sql immutable as $$ select 200 $$;

-- Invest p_coins of the signed-in child's coins in a startup.
-- Returns the child's new coin balance.
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

  update startups set coins_raised = coins_raised + p_coins where id = p_startup_id;
  return v_balance;
end;
$$;
revoke all on function public.jfb_invest_in_startup(uuid, integer) from public, anon;
grant execute on function public.jfb_invest_in_startup(uuid, integer) to authenticated;

-- coins_raised never updated before; set it from the investments made so far.
update public.startups s
set coins_raised = coalesce((select sum(i.coins) from public.startup_investments i where i.startup_id = s.id), 0);

notify pgrst, 'reload schema';
