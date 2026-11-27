-- Junior and Teen accounts.
--
-- Junior (about 7-11): the parent keeps the card's controls (lock, weekly
-- limit) and the Shop of rewards, as before.
-- Teen (about 12+): the child manages their own card. The parent (or the
-- teacher) gives consent and sees the progress, but does not lock the card,
-- set a limit or sell rewards.
--
-- The parent or teacher sets the stage (jfb_set_child_stage). Moving to Teen
-- clears the parent's lock and limit, and the parent's card settings are then
-- refused, so the rule holds on the server too.

alter table public.jfb_children
  add column if not exists stage text not null default 'junior';

alter table public.jfb_children drop constraint if exists jfb_children_stage_check;
alter table public.jfb_children add constraint jfb_children_stage_check check (stage in ('junior', 'teen'));

grant select (stage) on public.jfb_children to authenticated;

create or replace function public.jfb_set_child_stage(p_child_id uuid, p_stage text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not jfb_is_parent_of(p_child_id) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if p_stage not in ('junior', 'teen') then
    raise exception 'bad_stage' using errcode = 'P0001';
  end if;
  update jfb_children
  set stage = p_stage,
      card_parent_locked = case when p_stage = 'teen' then false else card_parent_locked end,
      card_weekly_limit = case when p_stage = 'teen' then null else card_weekly_limit end
  where id = p_child_id;
end;
$$;

-- Same as before, but a Teen's card is theirs to manage.
create or replace function public.jfb_parent_card_settings(p_child_id uuid, p_locked boolean, p_weekly_limit integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not jfb_is_parent_of(p_child_id) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if exists (select 1 from jfb_children where id = p_child_id and stage = 'teen') then
    raise exception 'teen_self_managed' using errcode = 'P0001';
  end if;
  update jfb_children
  set card_parent_locked = coalesce(p_locked, false),
      card_weekly_limit = case when p_weekly_limit is null or p_weekly_limit <= 0 then null else p_weekly_limit end
  where id = p_child_id;
end;
$$;

revoke all on function public.jfb_set_child_stage(uuid, text) from public, anon;
grant execute on function public.jfb_set_child_stage(uuid, text) to authenticated;

notify pgrst, 'reload schema';
