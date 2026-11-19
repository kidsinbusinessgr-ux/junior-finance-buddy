-- A founder can't react to their own startup; only other children can.
create or replace function public.jfb_toggle_startup_reaction(p_startup_id uuid, p_emoji text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_child uuid := jfb_current_child();
begin
  if exists (select 1 from startups where id = p_startup_id and child_id = v_child) then
    raise exception 'Own startup';
  end if;
  delete from jfb_startup_reactions where startup_id = p_startup_id and child_id = v_child and emoji = p_emoji;
  if found then return false; end if;
  insert into jfb_startup_reactions (startup_id, child_id, emoji) values (p_startup_id, v_child, p_emoji);
  return true;
end;
$$;
revoke all on function public.jfb_toggle_startup_reaction(uuid, text) from public, anon;
grant execute on function public.jfb_toggle_startup_reaction(uuid, text) to authenticated;

-- Reactions a founder already gave to their own startup are removed.
delete from public.jfb_startup_reactions r
using public.startups s
where s.id = r.startup_id and s.child_id = r.child_id;
