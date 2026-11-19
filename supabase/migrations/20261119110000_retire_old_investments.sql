-- The old /investments page sold 6 stocks at fixed made-up prices and 3
-- made-up startups (jfb_stock_holdings, jfb_startup_investments). It is replaced
-- by the real stock page (/stocks) and children's startups (/startups). Every
-- child gets back exactly the coins they paid there, with a bell message, and
-- the old functions are closed.

do $$
declare
  r record;
begin
  for r in
    select child_id, sum(coins)::int as coins from (
      select child_id, shares * avg_buy_price as coins from public.jfb_stock_holdings
      union all
      select child_id, shares * price_per_share from public.jfb_startup_investments
    ) x group by child_id having sum(coins) > 0
  loop
    perform public.jfb_apply_coins(r.child_id, r.coins, 'investment',
      'Επιστροφή παλιών επενδύσεων (παλιά σελίδα Επενδύσεις)', '↩️');
    insert into public.jfb_notifications (child_id, type, message)
    values (r.child_id, 'investment',
      '↩️ Οι παλιές σου επενδύσεις έκλεισαν και πήρες πίσω ' || r.coins ||
      ' coins. Δοκίμασε τις αληθινές μετοχές και τα startups των φίλων σου!');
  end loop;
  delete from public.jfb_stock_holdings;
  delete from public.jfb_startup_investments;
end $$;

revoke execute on function public.jfb_trade_stock(uuid, text, text, text, integer, text) from public, anon, authenticated;
revoke execute on function public.jfb_invest_startup(uuid, text, text, integer) from public, anon, authenticated;
