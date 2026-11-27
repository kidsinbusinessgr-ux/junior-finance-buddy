-- Prepaid card details: number, expiry and CVV, so the child pays like adults
-- do online (card details, then a confirmation code from the "bank").
--
-- The details are made up: the number starts with 9, which no real card
-- network uses, and nothing here is linked to a bank. They are kept in their
-- own table with no grants, because parents and teachers can read the
-- children rows: only the child reads their own card (jfb_my_card), and the
-- check (jfb_card_check) happens here, on the server.
--
-- Like a real bank, five wrong tries block the card details for 15 minutes.

create table if not exists public.jfb_cards (
  child_id uuid primary key references public.jfb_children(id) on delete cascade,
  number text not null unique check (number ~ '^9[0-9]{15}$'),
  expiry text not null check (expiry ~ '^(0[1-9]|1[0-2])/[0-9]{2}$'),
  cvv text not null check (cvv ~ '^[0-9]{3}$'),
  wrong_tries integer not null default 0,
  blocked_until timestamptz,
  created_at timestamptz not null default now()
);

alter table public.jfb_cards enable row level security;
revoke all on public.jfb_cards from public, anon, authenticated;

create or replace function public.jfb_random_digits(n integer)
returns text language sql volatile set search_path = public as $$
  select string_agg(floor(random() * 10)::int::text, '') from generate_series(1, n);
$$;
revoke all on function public.jfb_random_digits(integer) from public, anon, authenticated;

-- The signed-in child's card; made the first time they ask for it.
create or replace function public.jfb_my_card()
returns table (number text, expiry text, cvv text)
language plpgsql security definer set search_path = public as $$
declare
  v_child uuid;
begin
  select id into v_child from jfb_children where user_id = auth.uid();
  if v_child is null then raise exception 'Not allowed' using errcode = '42501'; end if;

  if not exists (select 1 from jfb_cards c where c.child_id = v_child) then
    for i in 1..5 loop
      begin
        insert into jfb_cards (child_id, number, expiry, cvv)
        values (
          v_child,
          '9' || jfb_random_digits(15),
          to_char(now() + interval '4 years', 'MM/YY'),
          jfb_random_digits(3)
        );
        exit;
      exception when unique_violation then
        if exists (select 1 from jfb_cards c where c.child_id = v_child) then exit; end if;
      end;
    end loop;
  end if;

  return query select c.number, c.expiry, c.cvv from jfb_cards c where c.child_id = v_child;
end;
$$;

-- Checks what the child typed at the checkout. Answers:
--   ok, locked, blocked, wrong_number, wrong_expiry, wrong_cvv, expired.
create or replace function public.jfb_card_check(p_number text, p_expiry text, p_cvv text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_child jfb_children%rowtype;
  v_card jfb_cards%rowtype;
  v_number text := regexp_replace(coalesce(p_number, ''), '[^0-9]', '', 'g');
  v_expiry text := regexp_replace(coalesce(p_expiry, ''), '\s', '', 'g');
  v_cvv text := regexp_replace(coalesce(p_cvv, ''), '[^0-9]', '', 'g');
  v_wrong text;
begin
  select * into v_child from jfb_children where user_id = auth.uid();
  if not found then raise exception 'Not allowed' using errcode = '42501'; end if;

  select * into v_card from jfb_cards where child_id = v_child.id for update;
  if not found then return 'wrong_number'; end if;

  if v_child.card_locked or v_child.card_parent_locked then return 'locked'; end if;
  if v_card.blocked_until is not null and v_card.blocked_until > now() then return 'blocked'; end if;

  if v_number <> v_card.number then v_wrong := 'wrong_number';
  elsif v_expiry <> v_card.expiry then v_wrong := 'wrong_expiry';
  elsif v_cvv <> v_card.cvv then v_wrong := 'wrong_cvv';
  end if;

  if v_wrong is not null then
    update jfb_cards
    set wrong_tries = case when wrong_tries + 1 >= 5 then 0 else wrong_tries + 1 end,
        blocked_until = case when wrong_tries + 1 >= 5 then now() + interval '15 minutes' else blocked_until end
    where child_id = v_child.id;
    return v_wrong;
  end if;

  update jfb_cards set wrong_tries = 0, blocked_until = null where child_id = v_child.id;

  -- Cards run out at the end of their expiry month.
  if (to_date(v_card.expiry, 'MM/YY') + interval '1 month') <= now() then return 'expired'; end if;
  return 'ok';
end;
$$;

revoke all on function public.jfb_my_card() from public, anon;
revoke all on function public.jfb_card_check(text, text, text) from public, anon;
grant execute on function public.jfb_my_card() to authenticated;
grant execute on function public.jfb_card_check(text, text, text) to authenticated;

notify pgrst, 'reload schema';
