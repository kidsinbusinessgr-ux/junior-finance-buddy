-- Supabase security advisor: functions without a fixed search_path.
-- Pin them to `public` (the schema they use) so they can't be pointed at
-- other objects. Only Kids in Business functions; other apps in this project
-- (book codes, game, club) are left as they are.
alter function public.award_badge(uuid, text) set search_path = public;
alter function public.check_achievements_on_chore() set search_path = public;
alter function public.check_achievements_on_goal() set search_path = public;
alter function public.check_achievements_on_transaction() set search_path = public;
alter function public.jfb_lesson_max_xp(text) set search_path = public;
alter function public.jfb_startup_invest_limit() set search_path = public;
alter function public.jfb_startup_stage(integer) set search_path = public;
alter function public.jfb_startup_valuation(integer, integer, integer, integer) set search_path = public;
alter function public.jfb_xp_to_level(integer) set search_path = public;
