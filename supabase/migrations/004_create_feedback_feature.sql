begin;

create extension if not exists pgcrypto;

alter table public.products
  add column if not exists source text not null default 'admin';

alter table public.products
  add column if not exists feedback_request_id uuid;

create table if not exists public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  product_name text not null,
  product_category text not null,
  product_description text,
  product_photo_url text not null,
  catalog_id uuid references public.products(id) on delete set null,
  status text not null default 'pending',
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  constraint feedback_requests_category_check
    check (product_category in ('buket', 'seserahan', 'mahar', 'parsel')),
  constraint feedback_requests_status_check
    check (status in ('pending', 'submitted', 'expired'))
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_feedback_request_id_fkey'
  ) then
    alter table public.products
      add constraint products_feedback_request_id_fkey
      foreign key (feedback_request_id)
      references public.feedback_requests(id)
      on delete set null;
  end if;
end;
$$;

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  feedback_request_id uuid not null
    references public.feedback_requests(id) on delete cascade,
  rating integer not null,
  criticism text,
  testimonial text,
  recommendations text[] not null default '{}',
  customer_photo_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint feedback_submissions_request_unique unique (feedback_request_id),
  constraint feedback_submissions_rating_check check (rating between 1 and 5),
  constraint feedback_submissions_text_required check (
    nullif(btrim(coalesce(criticism, '')), '') is not null
    or nullif(btrim(coalesce(testimonial, '')), '') is not null
  ),
  constraint feedback_submissions_photo_limit check (
    coalesce(array_length(customer_photo_urls, 1), 0) <= 5
  )
);

create index if not exists feedback_requests_status_created_idx
  on public.feedback_requests (status, created_at desc);

create index if not exists feedback_requests_catalog_id_idx
  on public.feedback_requests (catalog_id);

create index if not exists feedback_submissions_request_id_idx
  on public.feedback_submissions (feedback_request_id);

create or replace function public.mark_feedback_request_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.feedback_requests
  set
    status = 'submitted',
    submitted_at = coalesce(submitted_at, now()),
    updated_at = now()
  where id = new.feedback_request_id
    and status = 'pending';

  return new;
end;
$$;

drop trigger if exists feedback_requests_set_updated_at on public.feedback_requests;
create trigger feedback_requests_set_updated_at
before update on public.feedback_requests
for each row execute function public.set_updated_at();

drop trigger if exists feedback_submissions_mark_request_submitted on public.feedback_submissions;
create trigger feedback_submissions_mark_request_submitted
after insert on public.feedback_submissions
for each row execute function public.mark_feedback_request_submitted();

alter table public.feedback_requests enable row level security;
alter table public.feedback_submissions enable row level security;

revoke all on table public.feedback_requests from anon, authenticated;
revoke all on table public.feedback_submissions from anon, authenticated;

grant select (
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
) on public.feedback_requests to anon;

grant select, insert, update, delete on table public.feedback_requests to authenticated;
grant insert (
  feedback_request_id,
  rating,
  criticism,
  testimonial,
  recommendations,
  customer_photo_urls
) on public.feedback_submissions to anon, authenticated;
grant select on table public.feedback_submissions to authenticated;

grant all privileges on table
  public.feedback_requests,
  public.feedback_submissions
to service_role;

drop policy if exists "Public can read feedback requests by link" on public.feedback_requests;
create policy "Public can read feedback requests by link"
on public.feedback_requests for select
to anon, authenticated
using (status in ('pending', 'submitted', 'expired'));

drop policy if exists "Admins can manage feedback requests" on public.feedback_requests;
create policy "Admins can manage feedback requests"
on public.feedback_requests for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Visitors can submit pending feedback once" on public.feedback_submissions;
create policy "Visitors can submit pending feedback once"
on public.feedback_submissions for insert
to anon, authenticated
with check (
  rating between 1 and 5
  and coalesce(array_length(customer_photo_urls, 1), 0) <= 5
  and exists (
    select 1
    from public.feedback_requests
    where feedback_requests.id = feedback_submissions.feedback_request_id
      and feedback_requests.status = 'pending'
  )
);

drop policy if exists "Admins can read feedback submissions" on public.feedback_submissions;
create policy "Admins can read feedback submissions"
on public.feedback_submissions for select
to authenticated
using (public.is_active_admin());

insert into storage.buckets (id, name, public)
values ('feedback_customer_photos', 'feedback_customer_photos', true)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

drop policy if exists "Public can read feedback customer photos" on storage.objects;
create policy "Public can read feedback customer photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'feedback_customer_photos');

drop policy if exists "Visitors can upload feedback customer photos" on storage.objects;
create policy "Visitors can upload feedback customer photos"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'feedback_customer_photos'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.feedback_requests
    where feedback_requests.id = ((storage.foldername(name))[1])::uuid
      and feedback_requests.status = 'pending'
  )
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
