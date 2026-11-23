-- Card payments in the Shop, card lock and a weekly limit.
--
-- The child pays for a reward set by their parent with the virtual card
-- (jfb_card_pay). The payment is checked here, on the server:
--   * the card is not locked, by the child (card_locked) or by the parent
--     (card_parent_locked);
--   * this week's card payments plus this one stay within the parent's
--     weekly limit (card_weekly_limit; null = no limit);
--   * there are enough coins (jfb_apply_coins refuses to go below zero).
-- A payment is a jfb_transactions row of type 'card', which the parent sees.
--
-- The child may lock or unlock only their own lock. The parent's lock and the
-- limit are set by jfb_parent_card_settings, which checks the parent.

alter table public.jfb_children
  add column if not exists card_locked boolean not null default false,
  add column if not exists card_parent_locked boolean not null default false,
  add column if not exists card_weekly_limit integer;

alter table public.jfb_children
  drop constraint if exists jfb_children_card_weekly_limit_check,
  add constraint jfb_children_card_weekly_limit_check check (
    card_weekly_limit is null or card_weekly_limit between 1 and 100000
  );

grant update (card_locked) on public.jfb_children to authenticated;

alter table public.jfb_transactions drop constraint if exists jfb_transactions_type_check;
alter table public.jfb_transactions add constraint jfb_transactions_type_check check (
  type = any (array['chore', 'lesson', 'investment', 'reward', 'deposit', 'withdrawal', 'dividend', 'card'])
);

-- Coins paid with the card since Monday (Greek time).
create or replace function public.jfb_card_week_spent(p_child_id uuid)
returns integer language plpgsql stable security definer set search_path = public as $$
begin
  if not (jfb_is_child(p_child_id) or jfb_is_parent_of(p_child_id)) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  return coalesce((
    select -sum(amount)
    from jfb_transactions
    where child_id = p_child_id
      and type = 'card'
      and created_at >= (date_trunc('week', now() at time zone 'Europe/Athens') at time zone 'Europe/Athens')
  ), 0)::integer;
end;
$$;

create or replace function public.jfb_card_pay(p_reward_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_child jfb_children%rowtype;
  v_reward jfb_rewards%rowtype;
  v_spent integer;
begin
  -- Lock the child's row so two payments at once can't both pass the limit.
  select * into v_child from jfb_children where user_id = auth.uid() for update;
  if not found then raise exception 'Not allowed' using errcode = '42501'; end if;

  select * into v_reward from jfb_rewards
  where id = p_reward_id and parent_id = v_child.parent_id and active;
  if not found then raise exception 'reward_not_found' using errcode = 'P0001'; end if;

  if v_child.card_locked or v_child.card_parent_locked then
    raise exception 'card_locked' using errcode = 'P0001';
  end if;

  if v_child.card_weekly_limit is not null then
    v_spent := jfb_card_week_spent(v_child.id);
    if v_spent + v_reward.cost > v_child.card_weekly_limit then
      raise exception 'over_limit' using errcode = 'P0001';
    end if;
  end if;

  return jfb_apply_coins(v_child.id, -v_reward.cost, 'card', 'Κάρτα: ' || v_reward.name, '💳');
end;
$$;

create or replace function public.jfb_parent_card_settings(p_child_id uuid, p_locked boolean, p_weekly_limit integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not jfb_is_parent_of(p_child_id) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  update jfb_children
  set card_parent_locked = coalesce(p_locked, false),
      card_weekly_limit = case when p_weekly_limit is null or p_weekly_limit <= 0 then null else p_weekly_limit end
  where id = p_child_id;
end;
$$;

revoke all on function public.jfb_card_week_spent(uuid) from public, anon;
revoke all on function public.jfb_card_pay(uuid) from public, anon;
revoke all on function public.jfb_parent_card_settings(uuid, boolean, integer) from public, anon;
grant execute on function public.jfb_card_week_spent(uuid) to authenticated;
grant execute on function public.jfb_card_pay(uuid) to authenticated;
grant execute on function public.jfb_parent_card_settings(uuid, boolean, integer) to authenticated;

notify pgrst, 'reload schema';
