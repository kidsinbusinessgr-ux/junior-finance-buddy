-- A class is Junior or Teen too: the teacher sets it once, all its students
-- follow, and students who join later get the class's stage (joinClass).

alter table public.jfb_classes
  add column if not exists stage text not null default 'junior';

alter table public.jfb_classes drop constraint if exists jfb_classes_stage_check;
alter table public.jfb_classes add constraint jfb_classes_stage_check check (stage in ('junior', 'teen'));

create or replace function public.jfb_set_class_stage(p_class_id uuid, p_stage text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from jfb_classes c join jfb_parents p on p.id = c.teacher_id
    where c.id = p_class_id and p.user_id = auth.uid()
  ) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if p_stage not in ('junior', 'teen') then
    raise exception 'bad_stage' using errcode = 'P0001';
  end if;
  update jfb_classes set stage = p_stage where id = p_class_id;
  update jfb_children
  set stage = p_stage,
      card_parent_locked = case when p_stage = 'teen' then false else card_parent_locked end,
      card_weekly_limit = case when p_stage = 'teen' then null else card_weekly_limit end
  where class_id = p_class_id;
end;
$$;

revoke all on function public.jfb_set_class_stage(uuid, text) from public, anon;
grant execute on function public.jfb_set_class_stage(uuid, text) to authenticated;

notify pgrst, 'reload schema';
