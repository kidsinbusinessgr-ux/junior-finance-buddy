-- Chores and rewards were readable by every user (`using (true)`), so families
-- could see each other's lists. A child now sees only their own parent's.
-- Parents keep full access to their own via parent_manages_chores / parent_manages_rewards.

drop policy if exists "child_reads_chores" on public.jfb_chores;
create policy "child_reads_chores" on public.jfb_chores
  for select to authenticated
  using (parent_id in (select parent_id from public.jfb_children where user_id = auth.uid()));

drop policy if exists "child_reads_rewards" on public.jfb_rewards;
create policy "child_reads_rewards" on public.jfb_rewards
  for select to authenticated
  using (parent_id in (select parent_id from public.jfb_children where user_id = auth.uid()));
