-- Which account a browser subscription belongs to, and whether it gets the
-- founder's morning "new feedback" alert (set only for ADMIN_EMAILS by the server).
alter table public.push_subscriptions
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists admin_alerts boolean not null default false;
notify pgrst, 'reload schema';
