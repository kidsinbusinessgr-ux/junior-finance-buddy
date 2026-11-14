-- Every family starts with the default chores. They used to be added by the
-- browser right after creating the parent profile, and when that call failed
-- the family was left with an empty chore list. The database now adds them
-- itself whenever a parent profile is created, and only if the family has no
-- chores yet (so it never duplicates them).

create or replace function public.jfb_insert_default_chores(p_parent_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from jfb_chores where parent_id = p_parent_id) then return; end if;
  insert into jfb_chores (parent_id, name, emoji, coins, is_obligatory) values
    (p_parent_id, 'Στρώσιμο κρεβατιού', '🛏️', 0, true),
    (p_parent_id, 'Βούρτσισμα δοντιών', '🦷', 0, true),
    (p_parent_id, 'Τακτοποίηση δωματίου', '🧹', 0, true),
    (p_parent_id, 'Σκούπισμα σαλονιού', '🧹', 15, false),
    (p_parent_id, 'Πλύσιμο πιάτων', '🍽️', 20, false),
    (p_parent_id, 'Πότισμα φυτών', '🪴', 10, false),
    (p_parent_id, 'Βοήθεια με ψώνια', '🛒', 25, false),
    (p_parent_id, 'Καθάρισμα μπάνιου', '🚿', 30, false);
end;
$$;
revoke all on function public.jfb_insert_default_chores(uuid) from public, anon, authenticated;

create or replace function public.jfb_parents_seed_chores()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform jfb_insert_default_chores(new.id);
  return new;
end;
$$;
revoke all on function public.jfb_parents_seed_chores() from public, anon, authenticated;

drop trigger if exists jfb_parents_seed_chores on public.jfb_parents;
create trigger jfb_parents_seed_chores
  after insert on public.jfb_parents
  for each row execute function public.jfb_parents_seed_chores();

-- Kept for older app versions still calling it: same checks, never duplicates.
create or replace function public.jfb_seed_default_chores(p_parent_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from jfb_parents where id = p_parent_id and user_id = auth.uid()) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  perform jfb_insert_default_chores(p_parent_id);
end;
$$;

-- Families that ended up with no chores get the defaults now.
select public.jfb_insert_default_chores(p.id)
from public.jfb_parents p
where not exists (select 1 from public.jfb_chores c where c.parent_id = p.id);
