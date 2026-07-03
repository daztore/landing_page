begin;

update public.products
set
  source = 'feedback_request',
  is_active = false,
  is_available = false
where feedback_request_id is not null;

update public.products
set
  source = 'feedback_request',
  is_active = false,
  is_available = false
from public.feedback_requests
where public.products.id = public.feedback_requests.catalog_id;

update public.products
set description = 'Produk custom berdasarkan request pelanggan.'
where source = 'feedback_request'
  and description like 'Produk dari request feedback pelanggan%';

update public.products
set
  is_active = false,
  is_available = false
where source = 'feedback_request'
  and (is_active = true or is_available = true);

revoke select on table public.feedback_requests from anon;
revoke select (
  id,
  customer_name,
  product_name,
  product_category,
  product_description,
  product_photo_url,
  catalog_id,
  status,
  created_at,
  submitted_at
) on public.feedback_requests from anon;

revoke insert on table public.feedback_submissions from anon, authenticated;
revoke insert (
  feedback_request_id,
  rating,
  criticism,
  testimonial,
  recommendations,
  customer_photo_urls
) on public.feedback_submissions from anon, authenticated;

drop policy if exists "Public can read feedback requests by link" on public.feedback_requests;
drop policy if exists "Visitors can submit pending feedback once" on public.feedback_submissions;

drop policy if exists "Admins can manage feedback requests" on public.feedback_requests;
create policy "Admins can manage feedback requests"
on public.feedback_requests for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read feedback submissions" on public.feedback_submissions;
create policy "Admins can read feedback submissions"
on public.feedback_submissions for select
to authenticated
using (public.is_active_admin());

insert into storage.buckets (id, name, public)
values ('feedback_customer_photos', 'feedback_customer_photos', false)
on conflict (id) do update set
  name = excluded.name,
  public = false;

drop policy if exists "Public can read feedback customer photos" on storage.objects;
drop policy if exists "Visitors can upload feedback customer photos" on storage.objects;

drop policy if exists "Admins can read feedback customer photos" on storage.objects;
create policy "Admins can read feedback customer photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'feedback_customer_photos'
  and public.is_active_admin()
);

drop policy if exists "Admins can delete feedback customer photos" on storage.objects;
create policy "Admins can delete feedback customer photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'feedback_customer_photos'
  and public.is_active_admin()
);

commit;
