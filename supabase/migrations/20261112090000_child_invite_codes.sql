-- Child sign-up with an invite code.
-- Before this, a child who wasn't logged in couldn't read their invite row (RLS),
-- so every code came back "not found" and the account was never linked.

-- Returns the child's first name for a valid, still-claimable code (else null).
-- "Claimable" = not linked yet, or still linked to the parent's own login.
create or replace function public.jfb_check_invite(p_code text)
returns text language sql stable security definer set search_path = public as $$
  select c.name
  from jfb_children c
  join jfb_parents p on p.id = c.parent_id
  where c.invite_code = upper(trim(p_code))
    and (c.user_id is null or c.user_id = p.user_id)
  limit 1;
$$;

-- Links the signed-in user to the child row for this code. Returns the child id.
create or replace function public.jfb_claim_invite(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_child uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in' using errcode = '42501'; end if;

  -- A login can be one child, and parents keep their own login.
  if exists (select 1 from jfb_children where user_id = auth.uid())
     or exists (select 1 from jfb_parents where user_id = auth.uid()) then
    raise exception 'This account already has a profile' using errcode = 'P0001';
  end if;

  update jfb_children c
  set user_id = auth.uid()
  from jfb_parents p
  where p.id = c.parent_id
    and c.invite_code = upper(trim(p_code))
    and (c.user_id is null or c.user_id = p.user_id)
  returning c.id into v_child;

  if v_child is null then raise exception 'Invalid or used invite code' using errcode = 'P0001'; end if;
  return v_child;
end;
$$;

revoke all on function public.jfb_check_invite(text) from public;
revoke all on function public.jfb_claim_invite(text) from public, anon;
grant execute on function public.jfb_check_invite(text) to anon, authenticated;
grant execute on function public.jfb_claim_invite(text) to authenticated;
