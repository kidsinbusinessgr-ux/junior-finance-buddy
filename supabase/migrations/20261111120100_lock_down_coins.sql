-- Step 2 of 2. Apply ONLY AFTER the frontend that uses the new jfb_* functions
-- is live, otherwise the old site's direct writes will start failing.

-- 1. Nobody outside the database may call the old open functions.
revoke all on function public.jfb_add_coins(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.process_weekly_allowances() from public, anon, authenticated;
revoke all on function public.award_badge(uuid, text) from public, anon, authenticated;
revoke all on function public.check_achievements_on_transaction() from public, anon, authenticated;
revoke all on function public.check_achievements_on_goal() from public, anon, authenticated;
revoke all on function public.check_achievements_on_chore() from public, anon, authenticated;
alter function public.jfb_add_coins(uuid, integer, integer) set search_path = public;

-- 2. Balances, XP and levels can only change through the functions.
revoke insert, update on public.jfb_children from anon, authenticated;
grant insert (parent_id, name, avatar, invite_code, user_id) on public.jfb_children to authenticated;
grant update (name, avatar, current_streak, last_login_date, user_id) on public.jfb_children to authenticated;

-- 3. Money history and holdings are written only by the functions.
revoke insert, update, delete on public.jfb_transactions from anon, authenticated;
revoke insert, update, delete on public.jfb_stock_holdings from anon, authenticated;
revoke insert, update, delete on public.jfb_startup_investments from anon, authenticated;

-- 4. Savings goals: children create/rename goals; saved amounts move via jfb_deposit_to_goal.
revoke insert, update on public.jfb_savings_goals from anon, authenticated;
grant insert (child_id, name, emoji, target_coins) on public.jfb_savings_goals to authenticated;
grant update (name, emoji, target_coins) on public.jfb_savings_goals to authenticated;

-- 5. Push subscriptions: server only (service role bypasses RLS).
drop policy if exists "Service role full access" on public.push_subscriptions;
revoke all on public.push_subscriptions from anon, authenticated;
