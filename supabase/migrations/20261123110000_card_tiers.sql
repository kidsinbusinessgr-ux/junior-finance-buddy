-- Card tiers: the virtual card goes up with the child's level
-- (Classic → Silver at level 2 → Gold at level 4 → Black at level 6), and
-- each tier unlocks its own card colour. The check runs here, so a child
-- can't pick a colour before reaching its level (level comes from XP, which
-- only the server changes).

alter table public.jfb_children drop constraint if exists jfb_children_card_color_check;
alter table public.jfb_children add constraint jfb_children_card_color_check check (
  card_color in ('purple', 'midnight', 'graphite', 'ocean', 'emerald', 'sunset', 'rose', 'sand', 'silver', 'gold', 'black')
);

create or replace function public.jfb_card_color_level(p_color text)
returns integer language sql immutable set search_path = public as $$
  select case p_color when 'silver' then 2 when 'gold' then 4 when 'black' then 6 else 1 end;
$$;

create or replace function public.jfb_check_card_color()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.card_color is distinct from old.card_color
     and jfb_xp_to_level(coalesce(new.xp, 0)) < jfb_card_color_level(new.card_color) then
    raise exception 'card_color_locked' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists jfb_children_card_color on public.jfb_children;
create trigger jfb_children_card_color
  before update of card_color on public.jfb_children
  for each row execute function public.jfb_check_card_color();
