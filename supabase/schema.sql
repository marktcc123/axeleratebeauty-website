-- Dermabell Professional commerce schema
-- Run in the Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text,
  website text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'US',
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected', 'suspended')),
  license_info text,
  resale_certificate_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  full_name text,
  role text not null default 'pending'
    check (role in ('pending', 'member', 'company_admin')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  slug text unique not null,
  name text not null,
  description text,
  intended_use text,
  category text not null default 'professional_kit',
  highlights jsonb not null default '[]'::jsonb,
  contents jsonb not null default '[]'::jsonb,
  usage_notes text,
  precautions text,
  images jsonb not null default '[]'::jsonb,
  currency text not null default 'USD',
  professional_price_cents integer,
  public_price_visible boolean not null default false,
  inventory_status text not null default 'untracked'
    check (inventory_status in ('untracked', 'in_stock', 'out_of_stock')),
  available_quantity integer,
  shipping_attributes jsonb not null default '{}'::jsonb,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'active', 'archived')),
  reorder_eligible boolean not null default true,
  related_product_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  organization_id uuid not null references public.organizations(id),
  user_id uuid references auth.users(id),
  status text not null default 'pending_payment',
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'unfulfilled',
  subtotal_cents integer not null,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'USD',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  shipping_address jsonb,
  billing_address jsonb,
  tracking_number text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  sku text not null,
  name text not null,
  quantity integer not null,
  unit_price_cents integer not null
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  name text,
  email text,
  phone text,
  business_name text,
  message text,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inquiries enable row level security;
alter table public.audit_events enable row level security;

create policy "public can read active products"
  on public.products for select
  using (publication_status = 'active');

create policy "users read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "users update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "users insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "members read own organization"
  on public.organizations for select
  using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "members read own orders"
  on public.orders for select
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "members read own order items"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders
      where organization_id in (select organization_id from public.profiles where id = auth.uid())
    )
  );

create policy "authenticated can create inquiries"
  on public.inquiries for insert
  to authenticated
  with check (true);

-- Service role bypasses RLS for admin, webhook, and checkout writes.
