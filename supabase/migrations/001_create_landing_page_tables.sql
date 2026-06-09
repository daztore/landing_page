begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_key_format check (key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint site_settings_value_object check (jsonb_typeof(value) = 'object')
);

create table if not exists public.landing_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  eyebrow text,
  title text not null,
  highlighted_title text,
  description text,
  image_url text,
  image_alt text,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint landing_sections_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint landing_sections_content_object check (jsonb_typeof(content) = 'object')
);

create table if not exists public.landing_items (
  id uuid primary key default gen_random_uuid(),
  section_slug text not null references public.landing_sections(slug) on update cascade on delete cascade,
  slug text not null,
  title text,
  description text,
  icon text,
  label text,
  value text,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint landing_items_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint landing_items_content_object check (jsonb_typeof(content) = 'object'),
  constraint landing_items_section_slug_unique unique (section_slug, slug)
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  label text not null,
  href text not null,
  placement text not null,
  badge text,
  icon text,
  is_disabled boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint navigation_items_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint navigation_items_placement_check
    check (placement in ('header', 'header_cta', 'mobile', 'footer')),
  constraint navigation_items_slug_placement_unique unique (slug, placement)
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  image_url text not null,
  image_alt text not null,
  grid_span text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_items_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  display_variant text not null default 'grid',
  name text not null,
  subtitle text not null,
  content text not null,
  rating smallint not null default 5,
  avatar text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint testimonials_variant_check check (display_variant in ('grid', 'carousel')),
  constraint testimonials_rating_check check (rating between 1 and 5),
  constraint testimonials_slug_variant_unique unique (slug, display_variant)
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faqs_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  emoji text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_slug text not null references public.product_categories(slug) on update cascade on delete restrict,
  title text not null,
  description text not null,
  start_price bigint not null,
  end_price bigint,
  image_url text not null,
  badge text,
  processing_time text not null,
  is_customizable boolean not null default true,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_start_price_check check (start_price >= 0),
  constraint products_end_price_check check (end_price is null or end_price >= start_price),
  constraint products_badge_check check (badge is null or badge in ('bestseller', 'limited', 'loved'))
);

create table if not exists public.package_tiers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null,
  price_label text not null,
  icon text not null,
  description text not null,
  features text[] not null default '{}',
  is_highlighted boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_tiers_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists landing_sections_active_order_idx
  on public.landing_sections (is_active, sort_order);
create index if not exists landing_items_section_active_order_idx
  on public.landing_items (section_slug, is_active, sort_order);
create index if not exists navigation_items_placement_active_order_idx
  on public.navigation_items (placement, is_active, sort_order);
create index if not exists gallery_items_active_order_idx
  on public.gallery_items (is_active, sort_order);
create index if not exists testimonials_variant_active_order_idx
  on public.testimonials (display_variant, is_active, sort_order);
create index if not exists faqs_active_order_idx
  on public.faqs (is_active, sort_order);
create index if not exists product_categories_active_order_idx
  on public.product_categories (is_active, sort_order);
create index if not exists products_category_active_order_idx
  on public.products (category_slug, is_active, sort_order);
create index if not exists package_tiers_active_order_idx
  on public.package_tiers (is_active, sort_order);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists landing_sections_set_updated_at on public.landing_sections;
create trigger landing_sections_set_updated_at
before update on public.landing_sections
for each row execute function public.set_updated_at();

drop trigger if exists landing_items_set_updated_at on public.landing_items;
create trigger landing_items_set_updated_at
before update on public.landing_items
for each row execute function public.set_updated_at();

drop trigger if exists navigation_items_set_updated_at on public.navigation_items;
create trigger navigation_items_set_updated_at
before update on public.navigation_items
for each row execute function public.set_updated_at();

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at
before update on public.gallery_items
for each row execute function public.set_updated_at();

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

drop trigger if exists faqs_set_updated_at on public.faqs;
create trigger faqs_set_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

drop trigger if exists product_categories_set_updated_at on public.product_categories;
create trigger product_categories_set_updated_at
before update on public.product_categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists package_tiers_set_updated_at on public.package_tiers;
create trigger package_tiers_set_updated_at
before update on public.package_tiers
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.landing_sections enable row level security;
alter table public.landing_items enable row level security;
alter table public.navigation_items enable row level security;
alter table public.gallery_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.package_tiers enable row level security;

revoke all on table
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
from anon, authenticated;

grant select on table
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
to anon, authenticated;

grant all privileges on table
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
to service_role;

drop policy if exists "Public can read active public site settings" on public.site_settings;
create policy "Public can read active public site settings"
on public.site_settings for select
to anon, authenticated
using (is_active and is_public);

drop policy if exists "Public can read active landing sections" on public.landing_sections;
create policy "Public can read active landing sections"
on public.landing_sections for select
to anon, authenticated
using (is_active);

drop policy if exists "Public can read active landing items" on public.landing_items;
create policy "Public can read active landing items"
on public.landing_items for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.landing_sections
    where landing_sections.slug = landing_items.section_slug
      and landing_sections.is_active
  )
);

drop policy if exists "Public can read active navigation items" on public.navigation_items;
create policy "Public can read active navigation items"
on public.navigation_items for select
to anon, authenticated
using (is_active);

drop policy if exists "Public can read active gallery items" on public.gallery_items;
create policy "Public can read active gallery items"
on public.gallery_items for select
to anon, authenticated
using (is_active);

drop policy if exists "Public can read active testimonials" on public.testimonials;
create policy "Public can read active testimonials"
on public.testimonials for select
to anon, authenticated
using (is_active);

drop policy if exists "Public can read active FAQs" on public.faqs;
create policy "Public can read active FAQs"
on public.faqs for select
to anon, authenticated
using (is_active);

drop policy if exists "Public can read active product categories" on public.product_categories;
create policy "Public can read active product categories"
on public.product_categories for select
to anon, authenticated
using (is_active);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.product_categories
    where product_categories.slug = products.category_slug
      and product_categories.is_active
  )
);

drop policy if exists "Public can read active package tiers" on public.package_tiers;
create policy "Public can read active package tiers"
on public.package_tiers for select
to anon, authenticated
using (is_active);

commit;
