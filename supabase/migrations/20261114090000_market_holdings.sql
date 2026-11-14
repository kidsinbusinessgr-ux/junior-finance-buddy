-- Real-market stock page (/stocks): children invest KidsCoins in real companies
-- at real (FMP, converted to EUR) prices. 1 coin = €0.10, fractional shares.
-- Prices come from the server, never the browser, so trades go through the
-- server function tradeMarketStock (service role) -> jfb_market_trade.

create table if not exists public.jfb_market_holdings (
  child_id uuid not null references public.jfb_children(id) on delete cascade,
  ticker text not null,
  company_name text not null,
  emoji text not null default '📈',
  shares numeric(24, 10) not null check (shares > 0),
  coins_invested integer not null check (coins_invested >= 0),
  avg_buy_price_eur numeric(14, 4) not null check (avg_buy_price_eur > 0),
  updated_at timestamptz not null default now(),
  primary key (child_id, ticker)
);

alter table public.jfb_market_holdings enable row level security;
revoke all on public.jfb_market_holdings from anon, authenticated;
grant select on public.jfb_market_holdings to authenticated;

drop policy if exists "market holdings: child or parent reads" on public.jfb_market_holdings;
create policy "market holdings: child or parent reads" on public.jfb_market_holdings
  for select to authenticated
  using (public.jfb_is_child(child_id) or public.jfb_is_parent_of(child_id));

-- Buy: spend p_coins on p_ticker at p_price_eur. Sell: sell the whole holding.
-- Returns the child's new coin balance. Only the server (service role) may call
-- it; the server checks who the child is and fetches the price itself.
create or replace function public.jfb_market_trade(
  p_child_id uuid, p_ticker text, p_company text, p_emoji text,
  p_side text, p_coins integer, p_price_eur numeric
) returns integer language plpgsql security definer set search_path = public as $$
declare
  v_coin_eur constant numeric := 0.1;
  v_shares numeric;
  v_invested integer;
  v_new_shares numeric;
  v_payout integer;
  v_balance integer;
begin
  if p_price_eur is null or p_price_eur <= 0 or p_price_eur > 1000000 then
    raise exception 'Invalid price';
  end if;

  select shares, coins_invested into v_shares, v_invested
  from jfb_market_holdings where child_id = p_child_id and ticker = p_ticker for update;

  if p_side = 'buy' then
    if p_coins is null or p_coins <= 0 or p_coins > 10000 then raise exception 'Invalid amount'; end if;
    v_new_shares := (p_coins * v_coin_eur) / p_price_eur;
    v_balance := jfb_apply_coins(p_child_id, -p_coins, 'investment',
      'Επένδυση ' || p_coins || ' 🪙 στην ' || p_company, p_emoji);
    insert into jfb_market_holdings (child_id, ticker, company_name, emoji, shares, coins_invested, avg_buy_price_eur)
    values (p_child_id, p_ticker, p_company, p_emoji, v_new_shares, p_coins, p_price_eur)
    on conflict (child_id, ticker) do update
      set shares = jfb_market_holdings.shares + excluded.shares,
          coins_invested = jfb_market_holdings.coins_invested + excluded.coins_invested,
          avg_buy_price_eur = (jfb_market_holdings.shares * jfb_market_holdings.avg_buy_price_eur
                               + excluded.shares * excluded.avg_buy_price_eur)
                              / (jfb_market_holdings.shares + excluded.shares),
          updated_at = now();
  elsif p_side = 'sell' then
    if v_shares is null then raise exception 'Nothing to sell'; end if;
    v_payout := round(v_shares * p_price_eur / v_coin_eur);
    delete from jfb_market_holdings where child_id = p_child_id and ticker = p_ticker;
    if v_payout > 0 then
      v_balance := jfb_apply_coins(p_child_id, v_payout, 'investment',
        'Πώληση μετοχών ' || p_company || ' (+' || v_payout || ' 🪙)', p_emoji);
    else
      select coins into v_balance from jfb_children where id = p_child_id;
    end if;
  else
    raise exception 'Invalid side';
  end if;

  return v_balance;
end;
$$;

revoke all on function public.jfb_market_trade(uuid, text, text, text, text, integer, numeric) from public, anon, authenticated;
grant execute on function public.jfb_market_trade(uuid, text, text, text, text, integer, numeric) to service_role;
