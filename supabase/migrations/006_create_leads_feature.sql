begin;

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'product_detail',
  status text not null default 'new',
  customer_name text not null,
  whatsapp_number text not null,
  email text,
  product_id uuid references public.products(id) on delete set null,
  product_slug text,
  product_snapshot jsonb not null default '{}'::jsonb,
  interest_category text,
  event_date date,
  budget_range text,
  message text,
  consent_accepted boolean not null default false,
  consent_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_contacted_at timestamptz,
  assigned_admin_id uuid references public.admin_users(id) on delete set null,
  constraint leads_source_check
    check (source in ('product_detail', 'catalog', 'landing', 'admin_manual')),
  constraint leads_status_check
    check (status in ('new', 'contacted', 'quoted', 'converted', 'cancelled')),
  constraint leads_customer_name_length
    check (char_length(btrim(customer_name)) between 2 and 120),
  constraint leads_whatsapp_number_format
    check (whatsapp_number ~ '^[0-9]{10,16}$'),
  constraint leads_email_length
    check (email is null or char_length(email) <= 160),
  constraint leads_product_slug_format
    check (product_slug is null or product_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint leads_product_snapshot_object
    check (jsonb_typeof(product_snapshot) = 'object'),
  constraint leads_interest_category_length
    check (interest_category is null or char_length(interest_category) <= 120),
  constraint leads_budget_range_length
    check (budget_range is null or char_length(budget_range) <= 80),
  constraint leads_message_length
    check (message is null or char_length(message) <= 1000),
  constraint leads_consent_required
    check (consent_accepted = true),
  constraint leads_metadata_object
    check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.lead_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  message_type text not null,
  channel text not null,
  body text not null,
  status_from text,
  status_to text,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint lead_messages_type_check
    check (message_type in ('customer_message', 'admin_note', 'status_change', 'system')),
  constraint lead_messages_channel_check
    check (channel in ('form', 'whatsapp', 'phone', 'email', 'admin', 'system')),
  constraint lead_messages_body_length
    check (char_length(btrim(body)) between 1 and 4000),
  constraint lead_messages_status_from_check
    check (status_from is null or status_from in ('new', 'contacted', 'quoted', 'converted', 'cancelled')),
  constraint lead_messages_status_to_check
    check (status_to is null or status_to in ('new', 'contacted', 'quoted', 'converted', 'cancelled'))
);

create index if not exists leads_status_created_idx
  on public.leads (status, created_at desc);

create index if not exists leads_created_idx
  on public.leads (created_at desc);

create index if not exists leads_product_id_idx
  on public.leads (product_id);

create index if not exists leads_product_slug_idx
  on public.leads (product_slug);

create index if not exists lead_messages_lead_created_idx
  on public.lead_messages (lead_id, created_at);

create or replace function public.change_lead_status(
  p_lead_id uuid,
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

  if p_status not in ('new', 'contacted', 'quoted', 'converted', 'cancelled') then
    raise exception 'Invalid lead status';
  end if;

  select status
  into current_status
  from public.leads
  where id = p_lead_id
  for update;

  if current_status is null then
    raise exception 'Lead not found';
  end if;

  event_body := nullif(btrim(coalesce(p_note, '')), '');

  if current_status = p_status and event_body is null then
    return;
  end if;

  update public.leads
  set
    status = p_status,
    last_contacted_at = case
      when p_status = 'contacted' then coalesce(last_contacted_at, now())
      else last_contacted_at
    end
  where id = p_lead_id;

  insert into public.lead_messages (
    lead_id,
    message_type,
    channel,
    body,
    status_from,
    status_to,
    created_by
  )
  values (
    p_lead_id,
    'status_change',
    'admin',
    coalesce(event_body, 'Status lead diperbarui.'),
    current_status,
    p_status,
    auth.uid()
  );
end;
$$;

revoke all on function public.change_lead_status(uuid, text, text) from public;
grant execute on function public.change_lead_status(uuid, text, text) to authenticated;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.lead_messages enable row level security;

revoke all on table public.leads from anon, authenticated;
revoke all on table public.lead_messages from anon, authenticated;

grant select, insert, update, delete on table public.leads to authenticated;
grant select, insert, update, delete on table public.lead_messages to authenticated;

grant all privileges on table
  public.leads,
  public.lead_messages
to service_role;

drop policy if exists "Admins can manage leads" on public.leads;
create policy "Admins can manage leads"
on public.leads for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "Admins can manage lead messages" on public.lead_messages;
create policy "Admins can manage lead messages"
on public.lead_messages for all
to authenticated
using (
  public.is_active_admin()
  and exists (
    select 1
    from public.leads
    where leads.id = lead_messages.lead_id
  )
)
with check (
  public.is_active_admin()
  and exists (
    select 1
    from public.leads
    where leads.id = lead_messages.lead_id
  )
);

commit;
