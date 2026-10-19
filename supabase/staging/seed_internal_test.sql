-- Repeatable internal staging seed.
-- Do not run on production.
-- Do not write these rows to Zoho CRM or Zoho Commerce.
-- Do not invite or email real customers.
-- Re-run is safe: known staging keys are upserted.

begin;

insert into public.organizations (
  name, business_type, verification_status, commercial_model, price_tier,
  org_kind, zoho_account_id, zoho_sync_status, catalog_source, notes
)
values
  (
    'Staging Internal Tier 1',
    'internal_test',
    'approved',
    'wholesale',
    1,
    'independent',
    'staging-internal-tier-1',
    'unmapped',
    'supabase_cache',
    'Internal staging account only. Not a live Zoho Account ID.'
  ),
  (
    'Staging Internal Tier 2',
    'internal_test',
    'approved',
    'wholesale',
    2,
    'independent',
    'staging-internal-tier-2',
    'unmapped',
    'supabase_cache',
    'Internal staging account only. Not a live Zoho Account ID.'
  ),
  (
    'Staging Internal Tier 3',
    'internal_test',
    'approved',
    'commission',
    3,
    'independent',
    'staging-internal-tier-3',
    'unmapped',
    'supabase_cache',
    'Internal staging account only. Not a live Zoho Account ID.'
  )
on conflict (zoho_account_id) do update
  set
    verification_status = excluded.verification_status,
    commercial_model = excluded.commercial_model,
    price_tier = excluded.price_tier,
    catalog_source = 'supabase_cache',
    notes = excluded.notes,
    updated_at = now();

insert into public.locations (organization_id, name, city, state, country)
select o.id, o.name || ' Store', 'Los Angeles', 'CA', 'US'
from public.organizations o
where o.zoho_account_id in (
  'staging-internal-tier-1',
  'staging-internal-tier-2',
  'staging-internal-tier-3'
)
  and not exists (
    select 1 from public.locations l where l.organization_id = o.id
  );

insert into public.products (
  sku, slug, name, description, category, publication_status, product_kind,
  professional_price_cents, public_price_visible, inventory_status,
  zoho_crm_product_id, zoho_commerce_product_id, zoho_variant_id, catalog_source
)
values (
  'STG-MELTING-MASK',
  'staging-melting-mask',
  'Melting Mask',
  'Internal staging SKU. Prices are Tier 1/2/3 fixtures only.',
  'professional_kit',
  'active',
  'replenishment',
  1200,
  false,
  'untracked',
  'staging-crm-melting-mask',
  'staging-commerce-melting-mask',
  'staging-variant-melting-mask',
  'supabase_cache'
)
on conflict (sku) do update
  set
    slug = excluded.slug,
    name = excluded.name,
    publication_status = 'active',
    professional_price_cents = 1200,
    public_price_visible = false,
    zoho_crm_product_id = excluded.zoho_crm_product_id,
    zoho_commerce_product_id = excluded.zoho_commerce_product_id,
    zoho_variant_id = excluded.zoho_variant_id,
    catalog_source = 'supabase_cache',
    updated_at = now();

insert into public.products (
  sku, slug, name, description, category, publication_status, product_kind,
  professional_price_cents, public_price_visible, inventory_status, available_quantity,
  zoho_crm_product_id, zoho_commerce_product_id, zoho_variant_id, catalog_source
)
values (
  'STG-CONCURRENT-STOCK',
  'staging-concurrent-stock',
  'Staging Concurrent Stock',
  'Independent limited-inventory fixture for hosted two-session tests. Reset available_quantity to 1 before each attempt.',
  'professional_kit',
  'active',
  'replenishment',
  1200,
  false,
  'in_stock',
  1,
  'staging-crm-concurrent-stock',
  'staging-commerce-concurrent-stock',
  'staging-variant-concurrent-stock',
  'supabase_cache'
)
on conflict (sku) do update
  set
    slug = excluded.slug,
    publication_status = 'active',
    inventory_status = 'in_stock',
    available_quantity = 1,
    zoho_crm_product_id = excluded.zoho_crm_product_id,
    zoho_commerce_product_id = excluded.zoho_commerce_product_id,
    zoho_variant_id = excluded.zoho_variant_id,
    catalog_source = 'supabase_cache',
    updated_at = now();

delete from public.product_offers
where product_id in (
  select id from public.products where sku in ('STG-MELTING-MASK', 'STG-CONCURRENT-STOCK')
)
  and organization_id is null
  and location_id is null;

insert into public.product_offers (product_id, price_tier, price_cents, currency)
select id, 1, 1200, 'USD' from public.products where sku = 'STG-MELTING-MASK';
insert into public.product_offers (product_id, price_tier, price_cents, currency)
select id, 2, 1440, 'USD' from public.products where sku = 'STG-MELTING-MASK';
insert into public.product_offers (product_id, price_tier, price_cents, currency)
select id, 3, 1728, 'USD' from public.products where sku = 'STG-MELTING-MASK';
insert into public.product_offers (product_id, price_tier, price_cents, currency)
select id, 1, 1200, 'USD' from public.products where sku = 'STG-CONCURRENT-STOCK';

commit;
