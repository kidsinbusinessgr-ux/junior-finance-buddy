-- Beta: in-app feedback and extra numbers for the founder dashboard (/admin).

create table if not exists public.jfb_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('parent', 'child')),
  page text,
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists jfb_feedback_created_idx on public.jfb_feedback (created_at desc);
create index if not exists jfb_feedback_user_idx on public.jfb_feedback (user_id, created_at desc);

-- Nobody reads or writes the table directly; only the function below and
-- the service role (admin page) touch it.
alter table public.jfb_feedback enable row level security;
revoke all on public.jfb_feedback from anon, authenticated;

-- Sends one feedback message as the signed-in user. At most 5 a day.
create or replace function public.jfb_send_feedback(p_message text, p_page text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_msg text := btrim(coalesce(p_message, ''));
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  if char_length(v_msg) < 1 then raise exception 'Empty message'; end if;
  if char_length(v_msg) > 1000 then v_msg := left(v_msg, 1000); end if;

  if exists (select 1 from jfb_children where user_id = v_uid) then v_role := 'child';
  elsif exists (select 1 from jfb_parents where user_id = v_uid) then v_role := 'parent';
  else raise exception 'No account';
  end if;

  if (select count(*) from jfb_feedback
      where user_id = v_uid and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Too many messages today';
  end if;

  insert into jfb_feedback (user_id, role, page, message)
  values (v_uid, v_role, left(coalesce(p_page, ''), 200), v_msg);
end;
$$;
revoke all on function public.jfb_send_feedback(text, text) from public, anon;
grant execute on function public.jfb_send_feedback(text, text) to authenticated;

-- Beta numbers for /admin. Called only by the server with the service role.
create or replace function public.jfb_admin_beta_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'parentsFromBook', (select count(*) from auth.users u
                        join jfb_parents p on p.user_id = u.id
                        where u.raw_user_meta_data->>'signup_source' = 'book'),
    'parentsWithConsent', (select count(*) from auth.users u
                           join jfb_parents p on p.user_id = u.id
                           where u.raw_user_meta_data ? 'privacy_consent_at'),
    'startups', (select count(*) from startups),
    'startupsByKids', (select count(*) from startups where child_id is not null),
    'decisions', (select count(*) from jfb_startup_decisions),
    'decisions7d', (select count(*) from jfb_startup_decisions where created_at > now() - interval '7 days'),
    'pledges', (select count(*) from jfb_round_pledges),
    'pledgedCoins', (select coalesce(sum(coins), 0) from jfb_round_pledges),
    'stockHolders', (select count(distinct child_id) from jfb_market_holdings where shares > 0),
    'lessonsDone', (select count(*) from jfb_lesson_progress),
    'feedbackCount', (select count(*) from jfb_feedback)
  );
$$;
revoke all on function public.jfb_admin_beta_stats() from public, anon, authenticated;
grant execute on function public.jfb_admin_beta_stats() to service_role;
