-- Daily per-user caps for the AI buddy (Gemini), so nobody can run up the bill.
-- Only the server (service role) touches this; app users have no access.
create table if not exists public.jfb_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  kind text not null,
  count integer not null default 0,
  primary key (user_id, day, kind)
);
alter table public.jfb_ai_usage enable row level security;
revoke all on public.jfb_ai_usage from anon, authenticated;

-- Atomically uses one call from today's allowance. Returns false when the cap is reached.
create or replace function public.jfb_ai_take(p_user uuid, p_kind text, p_limit integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  insert into jfb_ai_usage (user_id, day, kind, count)
  values (p_user, current_date, p_kind, 1)
  on conflict (user_id, day, kind) do update
    set count = jfb_ai_usage.count + 1
    where jfb_ai_usage.count < p_limit
  returning count into v_count;
  return v_count is not null;
end;
$$;

revoke all on function public.jfb_ai_take(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.jfb_ai_take(uuid, text, integer) to service_role;
