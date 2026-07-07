begin;

create extension if not exists pgcrypto;

create sequence if not exists public.order_number_seq
  as bigint
  start with 1
  increment by 1
  no minvalue
  no maxvalue
  cache 1;

create or replace function public.generate_order_number()
returns text
language plpgsql
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := 'DZT-'
      || to_char(now() at time zone 'Asia/Jakarta', 'YYYYMMDD')
      || '-'
      || lpad(nextval('public.order_number_seq')::text, 5, '0');

    exit when not exists (
      select 1
      from public.orders
      where order_number = candidate
    );
  end loop;

  return candidate;
end;
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  lead_id uuid references public.leads(id) on delete set null,
  status text not null default 'draft',
  customer_name text not null,
  whatsapp_number text not null,
  email text,
  event_date date,
  due_date date,
  subtotal_amount bigint not null default 0,
  discount_amount bigint not null default 0,
  total_amount bigint not null default 0,
  currency text not null default 'IDR',
  public_access_token_hash text not null unique,
  public_access_token_hint text not null default '',
  admin_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_order_number_format
    check (order_number ~ '^DZT-[0-9]{8}-[0-9]{5,}$'),
  constraint orders_status_check
    check (status in (
      'draft',
      'confirmed',
      'waiting_payment',
      'paid',
      'in_production',
      'ready_to_ship',
      'shipped',
      'completed',
      'cancelled'
    )),
  constraint orders_customer_name_length
    check (char_length(btrim(customer_name)) between 2 and 120),
  constraint orders_whatsapp_number_format
    check (whatsapp_number ~ '^[0-9]{10,16}$'),
  constraint orders_email_length
    check (email is null or char_length(email) <= 160),
  constraint orders_amounts_check
    check (
      subtotal_amount >= 0
      and discount_amount >= 0
      and total_amount >= 0
      and total_amount = subtotal_amount - discount_amount
    ),
  constraint orders_currency_check
    check (currency = 'IDR'),
  constraint orders_public_access_token_hash_format
    check (public_access_token_hash ~ '^[a-f0-9]{64}$'),
  constraint orders_public_access_token_hint_length
    check (char_length(public_access_token_hint) <= 12),
  constraint orders_admin_note_length
    check (admin_note is null or char_length(admin_note) <= 4000),
  constraint orders_metadata_object
    check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_slug text,
  product_snapshot jsonb not null default '{}'::jsonb,
  item_type text not null default 'manual',
  item_name text not null,
  item_description text,
  quantity integer not null default 1,
  unit_price bigint not null default 0,
  line_total bigint not null default 0,
  custom_options jsonb not null default '{}'::jsonb,
  admin_note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint order_items_type_check
    check (item_type in ('manual', 'catalog')),
  constraint order_items_product_slug_format
    check (product_slug is null or product_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint order_items_product_snapshot_object
    check (jsonb_typeof(product_snapshot) = 'object'),
  constraint order_items_name_length
    check (char_length(btrim(item_name)) between 2 and 160),
  constraint order_items_description_length
    check (item_description is null or char_length(item_description) <= 1000),
  constraint order_items_quantity_check
    check (quantity between 1 and 99),
  constraint order_items_amounts_check
    check (
      unit_price >= 0
      and line_total = quantity::bigint * unit_price
    ),
  constraint order_items_custom_options_object
    check (jsonb_typeof(custom_options) = 'object'),
  constraint order_items_admin_note_length
    check (admin_note is null or char_length(admin_note) <= 4000),
  constraint order_items_catalog_reference_check
    check (
      item_type = 'manual'
      or product_slug is not null
    )
);

create table if not exists public.order_status_histories (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status_from text,
  status_to text not null,
  note text,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint order_status_histories_status_from_check
    check (status_from is null or status_from in (
      'draft',
      'confirmed',
      'waiting_payment',
      'paid',
      'in_production',
      'ready_to_ship',
      'shipped',
      'completed',
      'cancelled'
    )),
  constraint order_status_histories_status_to_check
    check (status_to in (
      'draft',
      'confirmed',
      'waiting_payment',
      'paid',
      'in_production',
      'ready_to_ship',
      'shipped',
      'completed',
      'cancelled'
    )),
  constraint order_status_histories_note_length
    check (note is null or char_length(note) <= 4000)
);

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);

create index if not exists orders_created_idx
  on public.orders (created_at desc);

create index if not exists orders_lead_id_idx
  on public.orders (lead_id);

create index if not exists orders_order_number_idx
  on public.orders (order_number);

create index if not exists order_items_order_sort_idx
  on public.order_items (order_id, sort_order);

create index if not exists order_status_histories_order_created_idx
  on public.order_status_histories (order_id, created_at);

create or replace function public.change_order_status(
  p_order_id uuid,
  p_status text,
  p_note text default null
)
returns void
language plpgsql
set search_path = public
as $$
declare
  current_status text;
  event_body text;
begin
  if not public.is_active_admin() then
    raise exception 'Admin access required';
  end if;

  if p_status not in (
    'draft',
    'confirmed',
    'waiting_payment',
    'paid',
    'in_production',
    'ready_to_ship',
    'shipped',
    'completed',
    'cancelled'
  ) then
    raise exception 'Invalid order status';
  end if;

  select status
  into current_status
  from public.orders
  where id = p_order_id
  for update;

  if current_status is null then
    raise exception 'Order not found';
  end if;

  event_body := nullif(btrim(coalesce(p_note, '')), '');

  if current_status = p_status and event_body is null then
    return;
  end if;

  update public.orders
  set
    status = p_status,
    updated_by = auth.uid()
  where id = p_order_id;

  insert into public.order_status_histories (
    order_id,
    status_from,
    status_to,
    note,
    created_by
  )
  values (
    p_order_id,
    current_status,
    p_status,
    coalesce(event_body, 'Status order diperbarui.'),
    auth.uid()
  );
end;
$$;

revoke all on function public.generate_order_number() from public;
grant execute on function public.generate_order_number() to authenticated, service_role;

revoke all on function public.change_order_status(uuid, text, text) from public;
grant execute on function public.change_order_status(uuid, text, text) to authenticated;

revoke all on sequence public.order_number_seq from public;
grant usage, select on sequence public.order_number_seq to authenticated, service_role;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_histories enable row level security;

revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
revoke all on table public.order_status_histories from anon, authenticated;

grant select, insert, update, delete on table public.orders to authenticated;
grant select, insert, update, delete on table public.order_items to authenticated;
grant select, insert, update, delete on table public.order_status_histories to authenticated;

grant all privileges on table
  public.orders,
  public.order_items,
  public.order_status_histories
to service_role;

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
on public.orders for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can manage order items" on public.order_items;
create policy "Admins can manage order items"
on public.order_items for all
to authenticated
using (
  public.is_active_admin()
  and exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
  )
)
with check (
  public.is_active_admin()
  and exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
  )
);

drop policy if exists "Admins can manage order status histories" on public.order_status_histories;
create policy "Admins can manage order status histories"
on public.order_status_histories for all
to authenticated
using (
  public.is_active_admin()
  and exists (
    select 1
    from public.orders
    where orders.id = order_status_histories.order_id
  )
)
with check (
  public.is_active_admin()
  and exists (
    select 1
    from public.orders
    where orders.id = order_status_histories.order_id
  )
);

commit;
