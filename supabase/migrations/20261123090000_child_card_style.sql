-- Virtual card: the child's chosen card colour and pattern are saved, so the
-- card shows in the Wallet. The card is only a picture for the app's coins;
-- it is not a real bank card.
--
-- Children may update only these two columns of their own row (plus the
-- columns they could already update); coins and the rest stay protected by
-- the column grants.

alter table public.jfb_children
  add column if not exists card_color text not null default 'purple',
  add column if not exists card_pattern text not null default 'none';

alter table public.jfb_children
  drop constraint if exists jfb_children_card_color_check,
  add constraint jfb_children_card_color_check check (
    card_color in ('purple', 'midnight', 'graphite', 'ocean', 'emerald', 'sunset', 'rose', 'sand')
  ),
  drop constraint if exists jfb_children_card_pattern_check,
  add constraint jfb_children_card_pattern_check check (
    card_pattern in ('none', 'lines', 'dots', 'waves', 'grid', 'glow')
  );

grant update (card_color, card_pattern) on public.jfb_children to authenticated;

notify pgrst, 'reload schema';
