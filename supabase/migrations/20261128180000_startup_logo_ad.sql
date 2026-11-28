-- Lesson 9 (Marketing και branding): the founder draws a logo and an ad, and
-- can put them on their startup. They are shown with the startup to everyone,
-- like the product drawing (image_url): the logo in place of the emoji, the
-- ad as "Η διαφήμισή μας".
--
-- Saved by a server function (saveStartupArt), which checks the owner and the
-- file, into the public bucket "startup-images". The browser cannot write
-- these columns or the bucket itself.

alter table public.startups
  add column if not exists logo_url text,
  add column if not exists ad_url text;

notify pgrst, 'reload schema';
