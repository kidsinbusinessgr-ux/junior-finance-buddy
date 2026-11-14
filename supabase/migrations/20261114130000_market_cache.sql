-- Shared cache for market data from FMP (prices, exchange rate, history, news).
-- The free FMP plan allows about 250 calls a day; asking per visitor used them
-- up within a few page loads and prices showed as 0. The server now refreshes
-- each entry at most every few hours and everyone reads the stored copy.
-- Only the server (service role) reads or writes it.

create table if not exists public.jfb_market_cache (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz,
  claimed_at timestamptz
);

alter table public.jfb_market_cache enable row level security;
revoke all on public.jfb_market_cache from anon, authenticated;

-- Lets exactly one server request refresh an entry: returns true for the
-- caller that may refresh now, false if someone else did so within p_seconds.
create or replace function public.jfb_claim_market_refresh(p_key text, p_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_ok boolean;
begin
  insert into jfb_market_cache (key, claimed_at) values (p_key, now())
  on conflict (key) do update set claimed_at = now()
    where jfb_market_cache.claimed_at is null
       or jfb_market_cache.claimed_at < now() - make_interval(secs => p_seconds)
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
revoke all on function public.jfb_claim_market_refresh(text, integer) from public, anon, authenticated;
grant execute on function public.jfb_claim_market_refresh(text, integer) to service_role;
