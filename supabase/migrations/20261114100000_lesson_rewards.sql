-- Lessons award XP once. The child gets XP for their best quiz score per
-- lesson: finishing again only adds the difference if they did better, so
-- repeating a lesson can't farm XP. The maximum XP per lesson is fixed here
-- (same values as the lesson pages), so the browser can't ask for more.

create or replace function public.jfb_lesson_max_xp(p_lesson_id text)
returns integer language sql immutable as $$
  select case p_lesson_id
    when '1' then 100 when '2' then 150 when '3' then 150 when '4' then 200
    when '5' then 200 when '6' then 250 when '7' then 200 when '8' then 250
    when '9' then 250 when '10' then 300 when '11' then 300
    else null end;
$$;

-- Level from XP; same thresholds as XP_LEVELS in src/hooks/useJFB.ts.
create or replace function public.jfb_xp_to_level(p_xp integer)
returns integer language sql immutable as $$
  select case
    when p_xp >= 5000 then 6 when p_xp >= 3000 then 5 when p_xp >= 1800 then 4
    when p_xp >= 1000 then 3 when p_xp >= 400 then 2 else 1 end;
$$;

-- Returns the XP added now (0 if the child already earned this much or more).
create or replace function public.jfb_complete_lesson(
  p_child_id uuid, p_lesson_id text, p_lesson_title text, p_score integer, p_total integer
) returns integer language plpgsql security definer set search_path = public as $$
declare
  v_max integer := jfb_lesson_max_xp(p_lesson_id);
  v_earned integer;
  v_before integer;
  v_gain integer;
begin
  if not jfb_is_child(p_child_id) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if v_max is null then raise exception 'Unknown lesson'; end if;
  if p_total is null or p_total <= 0 or p_total > 50 or p_score is null or p_score < 0 or p_score > p_total then
    raise exception 'Invalid score';
  end if;

  v_earned := round(v_max * p_score::numeric / p_total);

  select xp_earned into v_before from jfb_lesson_progress
  where child_id = p_child_id and lesson_id = p_lesson_id for update;

  if v_before is null then
    insert into jfb_lesson_progress (child_id, lesson_id, lesson_title, xp_earned, coins_earned)
    values (p_child_id, p_lesson_id, left(coalesce(p_lesson_title, ''), 120), v_earned, 0);
    v_gain := v_earned;
  elsif v_earned > v_before then
    update jfb_lesson_progress set xp_earned = v_earned, completed_at = now()
    where child_id = p_child_id and lesson_id = p_lesson_id;
    v_gain := v_earned - v_before;
  else
    v_gain := 0;
  end if;

  if v_gain > 0 then
    update jfb_children
    set xp = coalesce(xp, 0) + v_gain,
        level = jfb_xp_to_level(coalesce(xp, 0) + v_gain)
    where id = p_child_id;
  end if;

  return v_gain;
end;
$$;

revoke all on function public.jfb_complete_lesson(uuid, text, text, integer, integer) from public, anon;
grant execute on function public.jfb_complete_lesson(uuid, text, text, integer, integer) to authenticated;

-- Progress is written only by jfb_complete_lesson; children and parents can read it.
revoke insert, update, delete, truncate, references, trigger on public.jfb_lesson_progress from anon, authenticated;
revoke all on public.jfb_lesson_progress from anon;
drop policy if exists "parent reads lesson progress" on public.jfb_lesson_progress;
create policy "parent reads lesson progress" on public.jfb_lesson_progress
  for select to authenticated using (public.jfb_is_parent_of(child_id));
