begin;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;
grant all privileges on table public.admin_users to service_role;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and is_active = true
  );
$$;

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated, service_role;

drop policy if exists "Users can read own admin access" on public.admin_users;
create policy "Users can read own admin access"
on public.admin_users for select
to authenticated
using (id = auth.uid() and is_active = true);

grant insert, update, delete on table
  public.site_settings,
  public.landing_sections,
  public.landing_items,
  public.navigation_items,
  public.gallery_items,
  public.testimonials,
  public.faqs,
  public.product_categories,
  public.products,
  public.package_tiers
to authenticated;

drop policy if exists "Admins can read all site settings" on public.site_settings;
create policy "Admins can read all site settings"
on public.site_settings for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all landing sections" on public.landing_sections;
create policy "Admins can read all landing sections"
on public.landing_sections for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage landing sections" on public.landing_sections;
create policy "Admins can manage landing sections"
on public.landing_sections for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all landing items" on public.landing_items;
create policy "Admins can read all landing items"
on public.landing_items for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage landing items" on public.landing_items;
create policy "Admins can manage landing items"
on public.landing_items for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all navigation items" on public.navigation_items;
create policy "Admins can read all navigation items"
on public.navigation_items for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage navigation items" on public.navigation_items;
create policy "Admins can manage navigation items"
on public.navigation_items for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all gallery items" on public.gallery_items;
create policy "Admins can read all gallery items"
on public.gallery_items for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage gallery items" on public.gallery_items;
create policy "Admins can manage gallery items"
on public.gallery_items for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all testimonials" on public.testimonials;
create policy "Admins can read all testimonials"
on public.testimonials for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage testimonials" on public.testimonials;
create policy "Admins can manage testimonials"
on public.testimonials for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all FAQs" on public.faqs;
create policy "Admins can read all FAQs"
on public.faqs for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage FAQs" on public.faqs;
create policy "Admins can manage FAQs"
on public.faqs for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all product categories" on public.product_categories;
create policy "Admins can read all product categories"
on public.product_categories for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage product categories" on public.product_categories;
create policy "Admins can manage product categories"
on public.product_categories for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
on public.products for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can read all package tiers" on public.package_tiers;
create policy "Admins can read all package tiers"
on public.package_tiers for select
to authenticated
using (public.is_active_admin());

drop policy if exists "Admins can manage package tiers" on public.package_tiers;
create policy "Admins can manage package tiers"
on public.package_tiers for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can upload landing page images" on storage.objects;
create policy "Admins can upload landing page images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'landing_page'
  and public.is_active_admin()
);

drop policy if exists "Admins can update landing page images" on storage.objects;
create policy "Admins can update landing page images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'landing_page'
  and public.is_active_admin()
)
with check (
  bucket_id = 'landing_page'
  and public.is_active_admin()
);

drop policy if exists "Admins can delete landing page images" on storage.objects;
create policy "Admins can delete landing page images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'landing_page'
  and public.is_active_admin()
);

drop policy if exists "Admins can upload catalog images" on storage.objects;
create policy "Admins can upload catalog images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'catalogs'
  and public.is_active_admin()
);

drop policy if exists "Admins can update catalog images" on storage.objects;
create policy "Admins can update catalog images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'catalogs'
  and public.is_active_admin()
)
with check (
  bucket_id = 'catalogs'
  and public.is_active_admin()
);

drop policy if exists "Admins can delete catalog images" on storage.objects;
create policy "Admins can delete catalog images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'catalogs'
  and public.is_active_admin()
);

commit;
