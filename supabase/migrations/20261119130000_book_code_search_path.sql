-- Book app (app.kidsinbusiness.gr, /book-login) calls this before sign-in, so it
-- stays callable without a login; only its search_path is pinned (Supabase
-- security advisor).
alter function public.validate_and_use_book_code(text) set search_path = public;
