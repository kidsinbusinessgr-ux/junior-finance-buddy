-- Startup seasons: every calendar month is a season. A startup's season score
-- is how much its value grew during the month (against its value just before
-- the month started, or the starting 640 for new startups), so every month
-- everyone starts the race again, while the companies themselves carry on.
-- When a month ends, the daily job closes it: the top 3 startups with growth
-- above 0 get investment capital for their founder (100 / 50 / 25), a badge
-- and a bell message. Prizes are investment capital, not spendable coins.

insert into public.jfb_achievements (key, name_gr, description_gr, icon, sort_order) values
  ('season_champion', 'Πρωταθλητής Σεζόν!', 'Το startup σου βγήκε πρώτο σε μια σεζόν', '🥇', 18),
  ('season_podium', 'Βάθρο Σεζόν!', 'Το startup σου βγήκε στις 3 πρώτες θέσεις μιας σεζόν', '🏅', 19)
on conflict (key) do nothing;

create table if not exists public.jfb_startup_season_results (
  season date not null,
  rank integer not null check (rank between 1 and 3),
  startup_id uuid references public.startups(id) on delete set null,
  child_id uuid references public.jfb_children(id) on delete set null,
  name text not null,
  emoji text not null,
  growth integer not null,
  prize integer not null,
  primary key (season, rank)
);
alter table public.jfb_startup_season_results enable row level security;
revoke all on public.jfb_startup_season_results from anon, authenticated;
grant select on public.jfb_startup_season_results to anon, authenticated;
drop policy if exists "read season results" on public.jfb_startup_season_results;
create policy "read season results" on public.jfb_startup_season_results for select using (true);
-- The founder's child id isn't needed by the page.
revoke select on public.jfb_startup_season_results from anon, authenticated;
grant select (season, rank, startup_id, name, emoji, growth, prize) on public.jfb_startup_season_results to anon, authenticated;

-- Season board: growth of every startup during the month that starts on p_season.
-- For the current month the end value is today's value.
create or replace function public.jfb_startup_season_board(p_season date default null)
returns table (id uuid, name text, emoji text, valuation integer, growth integer)
language sql stable security definer set search_path = public as $$
  with season as (
    select date_trunc('month', coalesce(p_season, current_date))::date as starts,
           (date_trunc('month', coalesce(p_season, current_date)) + interval '1 month')::date as ends
  ),
  points as (
    select s.id, s.name, s.emoji, s.valuation as now_value, season.ends > current_date as running,
      coalesce((select h.valuation from jfb_startup_history h
                where h.startup_id = s.id and h.day < season.starts
                order by h.day desc limit 1), 640) as start_value,
      (select h.valuation from jfb_startup_history h
       where h.startup_id = s.id and h.day >= season.starts and h.day < season.ends
       order by h.day desc limit 1) as last_in_season
    from startups s, season
    where s.created_at < season.ends
  )
  -- A running season ends today; a finished one at the last played day in it
  -- (no played day in the season means no growth).
  select id, name, emoji,
    case when running then now_value else coalesce(last_in_season, start_value) end,
    (case when running then now_value else coalesce(last_in_season, start_value) end) - start_value
  from points;
$$;
grant execute on function public.jfb_startup_season_board(date) to anon, authenticated;

-- Closes a finished season once: prizes, badges, bell messages.
-- Returns how many winners were recorded (0 if already closed or nobody grew).
create or replace function public.jfb_finalize_startup_season(p_season date)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_season date := date_trunc('month', p_season)::date;
  v_month text := (array['Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου',
                         'Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου'])[extract(month from v_season)::int];
  v_prizes integer[] := array[100, 50, 25];
  v_medals text[] := array['🥇', '🥈', '🥉'];
  v_rank integer := 0;
  r record;
  v_owner uuid;
begin
  if (v_season + interval '1 month')::date > current_date then
    raise exception 'Season not finished';
  end if;
  if exists (select 1 from jfb_startup_season_results where season = v_season) then
    return 0;
  end if;

  for r in
    select b.id, b.name, b.emoji, b.growth from jfb_startup_season_board(v_season) b
    where b.growth > 0 order by b.growth desc, b.valuation desc limit 3
  loop
    v_rank := v_rank + 1;
    select child_id into v_owner from startups where id = r.id;
    insert into jfb_startup_season_results (season, rank, startup_id, child_id, name, emoji, growth, prize)
    values (v_season, v_rank, r.id, v_owner, r.name, r.emoji, r.growth, v_prizes[v_rank]);
    if v_owner is not null then
      update jfb_children set invest_capital = invest_capital + v_prizes[v_rank] where id = v_owner;
      insert into jfb_notifications (child_id, type, message)
      values (v_owner, 'season', v_medals[v_rank] || ' Η ' || left(r.name, 40) || ' βγήκε ' || v_rank ||
              'η στη σεζόν ' || v_month || '! Πήρες 🚀 ' || v_prizes[v_rank] || ' επενδυτικά coins.');
      perform jfb_give_badge(v_owner, 'season_podium');
      if v_rank = 1 then perform jfb_give_badge(v_owner, 'season_champion'); end if;
    end if;
  end loop;
  return v_rank;
end;
$$;
revoke all on function public.jfb_finalize_startup_season(date) from public, anon, authenticated;
grant execute on function public.jfb_finalize_startup_season(date) to service_role;

notify pgrst, 'reload schema';
