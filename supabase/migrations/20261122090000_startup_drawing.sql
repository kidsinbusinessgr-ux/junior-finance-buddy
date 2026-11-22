-- Startup drawing: the founder draws their product on a drawing board in the
-- app, and the picture is shown with the startup to everyone.
--
-- The picture is saved by a server function (saveStartupDrawing), which checks
-- that the signed-in child owns the startup and that the file is a small PNG.
-- The browser cannot write to the bucket or to image_url itself.

alter table public.startups
  add column if not exists image_url text;

-- Public bucket: anyone can view the pictures by URL; only the service role
-- (the server) uploads, because there are no insert/update policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('startup-images', 'startup-images', true, 1048576, array['image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
