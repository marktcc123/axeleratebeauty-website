-- Phase 1: privilege hardening, price isolation, org/location model, payment idempotency.
-- Additive and reversible. Do not run destructive production operations blindly.
-- Apply in the Supabase SQL editor after the original schema.sql.

-- ---------------------------------------------------------------------------
-- Organizations: commercial model and CRM mapping
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists parent_id uuid references public.organizations(id) on delete set null,
  add column if not exists org_kind text not null default 'independent'
    check (org_kind in ('headquarters', 'location_group', 'independent')),
  add column if not exists commercial_model text
    check (commercial_model is null or commercial_model in ('commission', 'wholesale', 'internal')),
  add column if not exists zoho_account_id text unique,
  add column if not exists zoho_sync_status text not null default 'unmapped',
  add column if not exists catalog_source text not null default 'supabase_cache';

comment on column public.organizations.commercial_model is
  'Internal only. Never expose commission or supplier cost in customer UI.';
comment on column public.organizations.zoho_account_id is
  'Exact Zoho Account ID after authorized admin mapping. Never bind by company name.';

-- ---------------------------------------------------------------------------
-- Profiles: users may update display name only
-- ---------------------------------------------------------------------------
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

create policy "users read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "users update own display name"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_admin := false;
    new.role := coalesce(new.role, 'pending');
    if new.organization_id is not null then
      raise exception 'organization assignment requires an administrator';
    end if;
  elsif tg_op = 'UPDATE' then
    new.is_admin := old.is_admin;
    new.role := old.role;
    new.organization_id := old.organization_id;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before insert or update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- ---------------------------------------------------------------------------
-- Locations and memberships
-- ---------------------------------------------------------------------------
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'US',
  zoho_account_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.location_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  role text not null default 'buyer' check (role in ('buyer', 'store_admin', 'hq_admin')),
  created_at timestamptz not null default now(),
  unique (user_id, location_id)
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  email text not null,
  token_hash text not null unique,
  role text not null default 'member',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now()
);

alter table public.locations enable row level security;
alter table public.location_memberships enable row level security;
alter table public.organization_invites enable row level security;

create policy "members read authorized locations"
  on public.locations for select
  using (
    id in (select location_id from public.location_memberships where user_id = auth.uid())
    or organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "members read own location memberships"
  on public.location_memberships for select
  using (user_id = auth.uid());

-- Invites are service-role only.

-- ---------------------------------------------------------------------------
-- Protected prices: public products no longer expose professional_price_cents
-- ---------------------------------------------------------------------------
create table if not exists public.product_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  zoho_pricebook_id text,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  unique (product_id, organization_id, location_id, effective_from)
);

alter table public.product_offers enable row level security;
-- No anon/authenticated select. Service role and authorized server reads only.

drop policy if exists "public can read active products" on public.products;

create or replace view public.catalog_products as
select
  id, sku, slug, name, description, intended_use, category, highlights, contents,
  usage_notes, precautions, images, currency, inventory_status,
  publication_status, reorder_eligible, related_product_ids, created_at, updated_at
from public.products
where publication_status = 'active';

grant select on public.catalog_products to anon, authenticated;

revoke select on table public.products from anon, authenticated;
grant select (
  id, sku, slug, name, description, intended_use, category, highlights, contents,
  usage_notes, precautions, images, currency, inventory_status, available_quantity,
  shipping_attributes, publication_status, reorder_eligible, related_product_ids,
  created_at, updated_at
) on table public.products to authenticated;

alter table public.products
  add column if not exists zoho_product_id text unique,
  add column if not exists zoho_variant_id text,
  add column if not exists catalog_source text not null default 'supabase_cache',
  add column if not exists last_synced_at timestamptz,
  add column if not exists last_sync_error text,
  add column if not exists product_kind text not null default 'replenishment'
    check (product_kind in ('replenishment', 'program', 'full_system', 'internal_lot'));

revoke all on table public.organizations from anon, authenticated;
grant select (
  id, name, business_type, website, phone, address_line1, address_line2,
  city, state, postal_code, country, verification_status, license_info,
  created_at, updated_at
) on table public.organizations to authenticated;

drop policy if exists "members read own orders" on public.orders;
create policy "members read authorized location orders"
  on public.orders for select
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
    and (
      location_id is null
      or location_id in (select location_id from public.location_memberships where user_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Inquiries: extra sales fields, public insert via service role only
-- ---------------------------------------------------------------------------
alter table public.inquiries
  add column if not exists location_count integer,
  add column if not exists purchase_timeline text,
  add column if not exists program_slug text,
  add column if not exists sync_status text not null default 'pending',
  add column if not exists zoho_lead_id text,
  add column if not exists last_sync_error text;

drop policy if exists "authenticated can create inquiries" on public.inquiries;

-- ---------------------------------------------------------------------------
-- Orders: store snapshot, pending tax/shipping, catalog source
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists location_id uuid references public.locations(id),
  add column if not exists payer_organization_id uuid references public.organizations(id),
  add column if not exists shipping_pending boolean not null default true,
  add column if not exists tax_pending boolean not null default true,
  add column if not exists catalog_source text not null default 'supabase_cache',
  add column if not exists zoho_order_id text,
  add column if not exists zoho_deal_id text,
  add column if not exists order_kind text not null default 'replenishment'
    check (order_kind in ('replenishment', 'program', 'contract_installment'));

-- ---------------------------------------------------------------------------
-- Payment and inventory idempotency
-- ---------------------------------------------------------------------------
create table if not exists public.processed_events (
  provider text not null,
  event_id text not null,
  event_type text,
  created_at timestamptz not null default now(),
  primary key (provider, event_id)
);

create table if not exists public.webhook_failures (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text,
  error text not null,
  payload_digest text,
  retry_after timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.claim_processed_event(p_provider text, p_event_id text, p_event_type text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.processed_events (provider, event_id, event_type)
  values (p_provider, p_event_id, p_event_type);
  return true;
exception
  when unique_violation then
    return false;
end;
$$;

create or replace function public.mark_order_paid(
  p_checkout_session_id text,
  p_payment_intent text,
  p_tax_cents integer,
  p_shipping_cents integer,
  p_total_cents integer,
  p_shipping_address jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.orders
  set
    payment_status = 'paid',
    status = 'paid',
    stripe_payment_intent_id = p_payment_intent,
    tax_cents = coalesce(p_tax_cents, tax_cents),
    shipping_cents = coalesce(p_shipping_cents, shipping_cents),
    tax_pending = p_tax_cents is null,
    shipping_pending = p_shipping_cents is null,
    total_cents = coalesce(p_total_cents, total_cents),
    shipping_address = coalesce(p_shipping_address, shipping_address)
  where stripe_checkout_session_id = p_checkout_session_id
    and payment_status is distinct from 'paid'
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.decrement_tracked_inventory(p_product_id uuid, p_qty integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set
    available_quantity = available_quantity - p_qty,
    inventory_status = case
      when available_quantity - p_qty <= 0 then 'out_of_stock'
      else inventory_status
    end,
    updated_at = now()
  where id = p_product_id
    and inventory_status <> 'untracked'
    and available_quantity is not null
    and available_quantity >= p_qty;
  return found;
end;
$$;

-- ---------------------------------------------------------------------------
-- Internal settlement and contract records (no public policies)
-- ---------------------------------------------------------------------------
create table if not exists public.settlement_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete restrict,
  organization_id uuid references public.organizations(id),
  commercial_model text not null,
  rule_version text not null,
  customer_total_cents integer not null,
  tax_cents integer not null default 0,
  shipping_cents integer not null default 0,
  processor_fee_cents integer,
  supplier_cost_cents integer,
  commission_base_cents integer,
  commission_cents integer,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'cost_missing', 'calculated', 'adjusted')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  location_id uuid references public.locations(id),
  title text not null,
  total_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.contract_installments (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  sequence integer not null,
  amount_cents integer not null,
  trigger_kind text not null,
  estimated_at date,
  completed_at date,
  due_at date,
  paid_at date,
  unique (contract_id, sequence)
);

create table if not exists public.inbound_shipments (
  id uuid primary key default gen_random_uuid(),
  lot_code text unique not null,
  supplier text not null default 'AOETO',
  description text not null,
  quantity integer not null,
  reserved_quantity integer not null default 0,
  unassigned_quantity integer not null,
  status text not null default 'in_transit',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.settlement_records enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_installments enable row level security;
alter table public.inbound_shipments enable row level security;
alter table public.processed_events enable row level security;
alter table public.webhook_failures enable row level security;

-- ---------------------------------------------------------------------------
-- Zoho sync jobs
-- ---------------------------------------------------------------------------
create table if not exists public.zoho_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  direction text not null check (direction in ('to_zoho', 'from_zoho')),
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'skipped')),
  attempt_count integer not null default 0,
  last_error text,
  next_retry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zoho_tokens (
  id text primary key default 'default',
  access_token_ciphertext text,
  refresh_token_ciphertext text,
  expires_at timestamptz,
  api_domain text,
  updated_at timestamptz not null default now()
);

alter table public.zoho_sync_jobs enable row level security;
alter table public.zoho_tokens enable row level security;

insert into public.locations (organization_id, name, address_line1, city, state, postal_code, country)
select id, name, address_line1, city, state, postal_code, country
from public.organizations o
where not exists (select 1 from public.locations l where l.organization_id = o.id);

insert into public.location_memberships (user_id, location_id, role)
select p.id, l.id, 'hq_admin'
from public.profiles p
join public.locations l on l.organization_id = p.organization_id
where p.organization_id is not null
on conflict (user_id, location_id) do nothing;

insert into public.inbound_shipments (lot_code, description, quantity, reserved_quantity, unassigned_quantity, notes)
values (
  'AOETO-OCEAN-5',
  'AOETO-purchased professional systems currently ocean-freight in transit',
  5,
  1,
  4,
  'Supply-side in-transit lots. Not Axelerate sellable SKUs and not customer orders. One reserved conceptually for Laredo; four unassigned.'
)
on conflict (lot_code) do nothing;
