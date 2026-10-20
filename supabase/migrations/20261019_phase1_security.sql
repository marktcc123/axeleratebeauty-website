-- Phase 1 security / commerce foundation.
-- Apply after supabase/schema.sql. All new columns are created before views, policies, and functions.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Columns first
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists parent_id uuid references public.organizations(id) on delete set null,
  add column if not exists org_kind text not null default 'independent',
  add column if not exists commercial_model text,
  add column if not exists price_tier integer,
  add column if not exists zoho_account_id text,
  add column if not exists zoho_sync_status text not null default 'unmapped',
  add column if not exists catalog_source text not null default 'supabase_cache';

alter table public.organizations drop constraint if exists organizations_org_kind_check;
alter table public.organizations add constraint organizations_org_kind_check
  check (org_kind in ('headquarters', 'location_group', 'independent'));
alter table public.organizations drop constraint if exists organizations_commercial_model_check;
alter table public.organizations add constraint organizations_commercial_model_check
  check (commercial_model is null or commercial_model in ('commission', 'wholesale', 'internal'));
alter table public.organizations drop constraint if exists organizations_price_tier_check;
alter table public.organizations add constraint organizations_price_tier_check
  check (price_tier is null or price_tier in (1, 2, 3));

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_zoho_account_id_key'
  ) then
    alter table public.organizations add constraint organizations_zoho_account_id_key unique (zoho_account_id);
  end if;
end $$;

alter table public.products
  add column if not exists zoho_crm_product_id text,
  add column if not exists zoho_commerce_product_id text,
  add column if not exists zoho_variant_id text,
  add column if not exists catalog_source text not null default 'supabase_cache',
  add column if not exists last_synced_at timestamptz,
  add column if not exists last_sync_error text,
  add column if not exists product_kind text not null default 'replenishment';

alter table public.products drop constraint if exists products_product_kind_check;
alter table public.products add constraint products_product_kind_check
  check (product_kind in ('replenishment', 'program', 'full_system', 'internal_lot'));

alter table public.inquiries
  add column if not exists location_count integer,
  add column if not exists purchase_timeline text,
  add column if not exists program_slug text,
  add column if not exists sync_status text not null default 'pending',
  add column if not exists zoho_lead_id text,
  add column if not exists last_sync_error text;

alter table public.orders
  add column if not exists location_id uuid,
  add column if not exists payer_organization_id uuid,
  add column if not exists shipping_pending boolean not null default true,
  add column if not exists tax_pending boolean not null default true,
  add column if not exists catalog_source text not null default 'supabase_cache',
  add column if not exists zoho_order_id text,
  add column if not exists zoho_deal_id text,
  add column if not exists order_kind text not null default 'replenishment',
  add column if not exists refunded_cents integer not null default 0,
  add column if not exists stripe_idempotency_key text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_stripe_idempotency_key_key'
  ) then
    alter table public.orders add constraint orders_stripe_idempotency_key_key unique (stripe_idempotency_key);
  end if;
end $$;

alter table public.orders drop constraint if exists orders_order_kind_check;
alter table public.orders add constraint orders_order_kind_check
  check (order_kind in ('replenishment', 'program', 'contract_installment'));

-- ---------------------------------------------------------------------------
-- 2. New tables
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

create table if not exists public.product_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  price_tier integer check (price_tier is null or price_tier in (1, 2, 3)),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  zoho_pricebook_id text,
  effective_from timestamptz not null default now(),
  effective_to timestamptz
);

create table if not exists public.processed_events (
  provider text not null,
  event_id text not null,
  event_type text,
  status text not null default 'processing'
    check (status in ('processing', 'succeeded', 'failed')),
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  last_error text,
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

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  stripe_refund_id text not null unique,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD',
  status text not null check (status in ('pending', 'failed', 'succeeded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settlement_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete restrict,
  organization_id uuid references public.organizations(id),
  commercial_model text not null,
  record_kind text not null default 'sale'
    check (record_kind in ('sale', 'refund_adjustment')),
  related_refund_id uuid references public.refunds(id),
  rule_version text not null,
  customer_total_cents integer not null,
  tax_cents integer not null default 0,
  shipping_cents integer not null default 0,
  processor_fee_cents integer,
  purchase_cost_cents integer,
  commission_base_cents integer,
  commission_cents integer,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'cost_missing', 'calculated', 'adjusted')),
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists settlement_records_sale_order_uidx
  on public.settlement_records (order_id)
  where record_kind = 'sale';

create unique index if not exists settlement_records_refund_uidx
  on public.settlement_records (related_refund_id)
  where record_kind = 'refund_adjustment' and related_refund_id is not null;

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

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_location_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_location_id_fkey foreign key (location_id) references public.locations(id);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'orders_payer_organization_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_payer_organization_id_fkey foreign key (payer_organization_id) references public.organizations(id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Views after columns exist
-- ---------------------------------------------------------------------------
create or replace view public.catalog_products
with (security_invoker = false) as
select
  id, sku, slug, name, description, intended_use, category, highlights, contents,
  usage_notes, precautions, images, currency, inventory_status, shipping_attributes,
  publication_status, reorder_eligible, related_product_ids,
  zoho_crm_product_id, zoho_commerce_product_id, zoho_variant_id, product_kind,
  created_at, updated_at
from public.products
where publication_status = 'active';

-- ---------------------------------------------------------------------------
-- 4. RLS, grants, and existing-policy cleanup
-- ---------------------------------------------------------------------------
alter table public.locations enable row level security;
alter table public.location_memberships enable row level security;
alter table public.organization_invites enable row level security;
alter table public.product_offers enable row level security;
alter table public.processed_events enable row level security;
alter table public.webhook_failures enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.refunds enable row level security;
alter table public.settlement_records enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_installments enable row level security;
alter table public.inbound_shipments enable row level security;
alter table public.zoho_sync_jobs enable row level security;
alter table public.zoho_tokens enable row level security;

drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users update own display name" on public.profiles;
drop policy if exists "public can read active products" on public.products;
drop policy if exists "authenticated can create inquiries" on public.inquiries;
drop policy if exists "members read own orders" on public.orders;
drop policy if exists "members read authorized location orders" on public.orders;
drop policy if exists "members read authorized locations" on public.locations;
drop policy if exists "members read own location memberships" on public.location_memberships;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

create policy "users read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "users update own display name"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

revoke all on table public.products from public, anon, authenticated;
revoke all on table public.catalog_products from public, anon, authenticated;
grant select on table public.catalog_products to anon, authenticated;

create policy "members read authorized locations"
  on public.locations for select
  using (
    id in (select location_id from public.location_memberships where user_id = auth.uid())
    or organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "members read own location memberships"
  on public.location_memberships for select
  using (user_id = auth.uid());

revoke all on table public.organizations from public, anon, authenticated;
grant select (
  id, name, business_type, website, phone, address_line1, address_line2,
  city, state, postal_code, country, verification_status, license_info,
  created_at, updated_at
) on table public.organizations to authenticated;

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
-- 5. Functions, then revoke PUBLIC execute
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
  allow_write text := coalesce(current_setting('app.allow_privilege_write', true), '');
begin
  -- Never trust current_user: SECURITY DEFINER makes that the function owner.
  if jwt_role = 'service_role' or allow_write = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_admin := false;
    new.role := 'pending';
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

create or replace function public.claim_webhook_event(p_provider text, p_event_id text, p_event_type text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.processed_events%rowtype;
begin
  insert into public.processed_events (provider, event_id, event_type, status)
  values (p_provider, p_event_id, p_event_type, 'processing')
  returning * into existing;
  return 'claimed';
exception
  when unique_violation then
    select * into existing
    from public.processed_events
    where provider = p_provider and event_id = p_event_id;

    if existing.status = 'succeeded' then
      return 'succeeded';
    end if;
    if existing.status = 'processing' and existing.claimed_at > now() - interval '2 minutes' then
      return 'in_progress';
    end if;

    update public.processed_events
    set status = 'processing',
        event_type = p_event_type,
        claimed_at = now(),
        last_error = null
    where provider = p_provider and event_id = p_event_id;
    return 'reclaimed';
end;
$$;

create or replace function public.complete_webhook_event(p_provider text, p_event_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.processed_events
  set status = 'succeeded', completed_at = now(), last_error = null
  where provider = p_provider and event_id = p_event_id;
end;
$$;

create or replace function public.fail_webhook_event(p_provider text, p_event_id text, p_error text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.processed_events
  set status = 'failed', last_error = p_error, completed_at = now()
  where provider = p_provider and event_id = p_event_id;
end;
$$;

create or replace function public.mark_order_paid(
  p_checkout_session_id text,
  p_payment_intent text,
  p_currency text,
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
  v_order public.orders%rowtype;
begin
  select * into v_order
  from public.orders
  where stripe_checkout_session_id = p_checkout_session_id;

  if not found then
    raise exception 'order_not_found';
  end if;
  if p_currency is null or lower(p_currency) <> lower(v_order.currency) then
    raise exception 'currency_mismatch';
  end if;
  if p_total_cents is null or p_tax_cents is null or p_shipping_cents is null then
    raise exception 'amount_incomplete';
  end if;
  if p_total_cents < v_order.subtotal_cents then
    raise exception 'amount_below_subtotal';
  end if;

  if v_order.payment_status = 'paid' then
    if v_order.total_cents is distinct from p_total_cents then
      raise exception 'paid_amount_mismatch';
    end if;
    return v_order.id;
  end if;

  update public.orders
  set
    payment_status = 'paid',
    status = 'paid',
    stripe_payment_intent_id = p_payment_intent,
    tax_cents = p_tax_cents,
    shipping_cents = p_shipping_cents,
    tax_pending = false,
    shipping_pending = false,
    total_cents = p_total_cents,
    shipping_address = coalesce(p_shipping_address, shipping_address)
  where id = v_order.id
    and payment_status is distinct from 'paid'
  returning id into v_order.id;

  return v_order.id;
end;
$$;

create or replace function public.apply_inventory_decrement(p_order_id uuid, p_product_id uuid, p_qty integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_qty is null or p_qty <= 0 then
    raise exception 'invalid_quantity';
  end if;

  insert into public.inventory_movements (order_id, product_id, quantity)
  values (p_order_id, p_product_id, p_qty)
  on conflict (order_id, product_id) do nothing;

  if not found then
    return true;
  end if;

  if exists (
    select 1 from public.products
    where id = p_product_id
      and inventory_status <> 'untracked'
      and available_quantity is not null
      and available_quantity < p_qty
  ) then
    delete from public.inventory_movements
    where order_id = p_order_id and product_id = p_product_id;
    return false;
  end if;

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

  return true;
end;
$$;

create or replace function public.apply_refund(
  p_stripe_refund_id text,
  p_payment_intent text,
  p_amount_cents integer,
  p_currency text,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_refund public.refunds%rowtype;
  v_total integer;
begin
  if p_status not in ('pending', 'failed', 'succeeded') then
    raise exception 'invalid_refund_status';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'invalid_refund_amount';
  end if;

  select * into v_order
  from public.orders
  where stripe_payment_intent_id = p_payment_intent;
  if not found then
    raise exception 'order_not_found';
  end if;
  if lower(v_order.currency) <> lower(coalesce(p_currency, v_order.currency)) then
    raise exception 'currency_mismatch';
  end if;

  insert into public.refunds (order_id, stripe_refund_id, amount_cents, currency, status)
  values (v_order.id, p_stripe_refund_id, p_amount_cents, v_order.currency, p_status)
  on conflict (stripe_refund_id) do update
    set status = excluded.status,
        amount_cents = excluded.amount_cents,
        updated_at = now()
  returning * into v_refund;

  select coalesce(sum(amount_cents), 0) into v_total
  from public.refunds
  where order_id = v_order.id and status = 'succeeded';

  update public.orders
  set
    refunded_cents = v_total,
    payment_status = case
      when v_total >= total_cents and v_total > 0 then 'refunded'
      when v_total > 0 then 'partially_refunded'
      else payment_status
    end,
    status = case
      when v_total >= total_cents and v_total > 0 then 'refunded'
      else status
    end
  where id = v_order.id;

  return v_refund.id;
end;
$$;

revoke all on function public.claim_webhook_event(text, text, text) from public, anon, authenticated;
revoke all on function public.complete_webhook_event(text, text) from public, anon, authenticated;
revoke all on function public.fail_webhook_event(text, text, text) from public, anon, authenticated;
revoke all on function public.mark_order_paid(text, text, text, integer, integer, integer, jsonb) from public, anon, authenticated;
revoke all on function public.apply_inventory_decrement(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.apply_refund(text, text, integer, text, text) from public, anon, authenticated;
revoke all on function public.protect_profile_privileges() from public, anon, authenticated;

do $$
begin
  grant execute on function public.claim_webhook_event(text, text, text) to service_role;
  grant execute on function public.complete_webhook_event(text, text) to service_role;
  grant execute on function public.fail_webhook_event(text, text, text) to service_role;
  grant execute on function public.mark_order_paid(text, text, text, integer, integer, integer, jsonb) to service_role;
  grant execute on function public.apply_inventory_decrement(uuid, uuid, integer) to service_role;
  grant execute on function public.apply_refund(text, text, integer, text, text) to service_role;
exception
  when undefined_object then
    null;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Backfill only after structures exist
-- ---------------------------------------------------------------------------
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
  5, 1, 4,
  'Supply-side in-transit lots. Not Axelerate sellable SKUs and not customer orders.'
)
on conflict (lot_code) do nothing;
