-- Errors that break a page in the browser (the "Η σελίδα δε φορτώθηκε" page and
-- the lesson workshops), so they can be found and fixed without asking the
-- family for screenshots. Anyone can add a row (the page may break before
-- sign-in); nobody can read them from the browser, only the admin.
-- Short text only: the page, the message, the first lines of the stack and
-- the browser. No names, no form contents.

create table if not exists public.jfb_client_errors (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  path text check (char_length(path) <= 200),
  message text check (char_length(message) <= 500),
  stack text check (char_length(stack) <= 2000),
  browser text check (char_length(browser) <= 300)
);

create index if not exists jfb_client_errors_created_idx on public.jfb_client_errors(created_at desc);

alter table public.jfb_client_errors enable row level security;

drop policy if exists anyone_reports on public.jfb_client_errors;
create policy anyone_reports on public.jfb_client_errors
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

revoke all on public.jfb_client_errors from anon, authenticated;
grant insert (path, message, stack, browser) on public.jfb_client_errors to anon, authenticated;

notify pgrst, 'reload schema';
