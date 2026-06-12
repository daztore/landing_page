begin;

insert into storage.buckets (id, name, public)
values
  ('landing_page', 'landing_page', true),
  ('catalogs', 'catalogs', true)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

drop policy if exists "Public can read landing page images" on storage.objects;
create policy "Public can read landing page images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'landing_page');

drop policy if exists "Public can read catalog images" on storage.objects;
create policy "Public can read catalog images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'catalogs');

commit;
