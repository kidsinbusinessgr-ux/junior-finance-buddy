-- Teachers and classes.
--
-- A teacher is a jfb_parents row with role 'teacher', so every parent tool
-- (chores, allowance, investment capital, guide) works for a class too.
-- The teacher makes classes; each class has a 6-character code. Students join
-- with the code, a display name, a username and a password, without an email:
-- the server (joinClass) creates their login as <username>@students.kidsinbusiness.gr,
-- already confirmed, and links the child to the teacher and the class.

-- ── Teachers ────────────────────────────────────────────────────────────────
alter table public.jfb_parents
  add column if not exists role text not null default 'parent',
  add column if not exists school text;

alter table public.jfb_parents drop constraint if exists jfb_parents_role_check;
alter table public.jfb_parents add constraint jfb_parents_role_check check (role in ('parent', 'teacher'));
alter table public.jfb_parents drop constraint if exists jfb_parents_school_check;
alter table public.jfb_parents add constraint jfb_parents_school_check check (school is null or char_length(school) <= 80);

grant select (role, school) on public.jfb_parents to authenticated;
grant insert (role, school) on public.jfb_parents to authenticated;
grant update (school) on public.jfb_parents to authenticated;

-- ── Classes ─────────────────────────────────────────────────────────────────
create or replace function public.jfb_new_class_code()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..6 loop
      c := c || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.jfb_classes where code = c);
  end loop;
  return c;
end;
$$;

create table if not exists public.jfb_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.jfb_parents(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
  created_at timestamptz not null default now()
);
-- The default needs the table to exist (the function checks for duplicates).
alter table public.jfb_classes alter column code set default public.jfb_new_class_code();

create index if not exists jfb_classes_teacher_idx on public.jfb_classes(teacher_id);

alter table public.jfb_classes enable row level security;

drop policy if exists teacher_own_classes on public.jfb_classes;
create policy teacher_own_classes on public.jfb_classes
  for all
  using (teacher_id in (select id from public.jfb_parents where user_id = auth.uid() and role = 'teacher'))
  with check (teacher_id in (select id from public.jfb_parents where user_id = auth.uid() and role = 'teacher'));

revoke all on public.jfb_classes from anon, authenticated;
grant select, delete on public.jfb_classes to authenticated;
grant insert (teacher_id, name) on public.jfb_classes to authenticated;
grant update (name) on public.jfb_classes to authenticated;

-- ── Students ────────────────────────────────────────────────────────────────
alter table public.jfb_children
  add column if not exists class_id uuid references public.jfb_classes(id) on delete set null,
  add column if not exists username text;

alter table public.jfb_children drop constraint if exists jfb_children_username_check;
alter table public.jfb_children add constraint jfb_children_username_check
  check (username is null or username ~ '^[a-z0-9._]{3,20}$');
create unique index if not exists jfb_children_username_key on public.jfb_children(username) where username is not null;
create index if not exists jfb_children_class_idx on public.jfb_children(class_id);

grant select (class_id, username) on public.jfb_children to authenticated;

-- A student sees the name of their own class.
drop policy if exists student_sees_class on public.jfb_classes;
create policy student_sees_class on public.jfb_classes
  for select
  using (id in (select class_id from public.jfb_children where user_id = auth.uid()));

-- Before signing up, a student checks the class code (they are not signed in yet).
create or replace function public.jfb_check_class_code(p_code text)
returns table (class_name text, teacher_name text, school text)
language sql
stable
security definer
set search_path = public
as $$
  select c.name, p.name, p.school
  from public.jfb_classes c
  join public.jfb_parents p on p.id = c.teacher_id
  where c.code = upper(btrim(p_code))
  limit 1;
$$;

revoke all on function public.jfb_check_class_code(text) from public;
grant execute on function public.jfb_check_class_code(text) to anon, authenticated;
-- Runs as the default of jfb_classes.code, so the inserting teacher needs it.
revoke all on function public.jfb_new_class_code() from public, anon;
grant execute on function public.jfb_new_class_code() to authenticated;

notify pgrst, 'reload schema';
