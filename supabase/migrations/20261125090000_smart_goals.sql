-- SMART savings goals: why the goal matters (Relevant), how much the teen
-- puts in each week (Attainable), the date it should be reached (Timely),
-- and what they learned once it is reached. The child may write only these
-- columns; coins and progress still change only through jfb_deposit_to_goal.

alter table public.jfb_savings_goals
  add column if not exists why text,
  add column if not exists weekly_coins integer,
  add column if not exists deadline date,
  add column if not exists reflection text;

alter table public.jfb_savings_goals
  add constraint jfb_savings_goals_why_len check (why is null or char_length(why) <= 200),
  add constraint jfb_savings_goals_weekly_range check (weekly_coins is null or weekly_coins between 1 and 100000),
  add constraint jfb_savings_goals_reflection_len check (reflection is null or char_length(reflection) <= 300);

grant insert (why, weekly_coins, deadline) on public.jfb_savings_goals to authenticated;
grant update (why, weekly_coins, deadline, reflection) on public.jfb_savings_goals to authenticated;
