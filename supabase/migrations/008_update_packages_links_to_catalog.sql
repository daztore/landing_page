begin;

update public.landing_sections
set content = jsonb_set(
  jsonb_set(content, '{secondaryCtaHref}', to_jsonb('/katalog'::text), true),
  '{secondaryCtaLabel}',
  to_jsonb('Lihat Katalog'::text),
  true
)
where slug = 'hero'
  and content ->> 'secondaryCtaHref' = '#packages';

update public.navigation_items
set
  label = 'Katalog',
  href = '/katalog',
  badge = null,
  is_disabled = false
where slug = 'packages'
  and placement = 'header'
  and href = '#packages';

update public.navigation_items
set
  label = 'Katalog',
  href = '/katalog'
where slug in ('packages-mobile', 'packages-footer')
  and href = '#packages';

commit;
