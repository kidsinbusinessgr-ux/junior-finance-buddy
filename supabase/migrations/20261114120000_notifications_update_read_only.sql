-- Children and parents may only mark notifications as read; the message,
-- type and owner can't be changed from the browser.
revoke update on public.jfb_notifications from anon, authenticated;
grant update (read) on public.jfb_notifications to authenticated;
