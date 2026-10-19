-- Rollback for 20261019_phase1_security.sql
-- Review before running. Does not delete paid orders.

drop trigger if exists protect_profile_privileges on public.profiles;
drop function if exists public.protect_profile_privileges();
drop function if exists public.claim_processed_event(text, text, text);
drop function if exists public.mark_order_paid(text, text, integer, integer, integer, jsonb);
drop function if exists public.decrement_tracked_inventory(uuid, integer);

drop view if exists public.catalog_products;

drop table if exists public.zoho_tokens;
drop table if exists public.zoho_sync_jobs;
drop table if exists public.webhook_failures;
drop table if exists public.processed_events;
drop table if exists public.inbound_shipments;
drop table if exists public.contract_installments;
drop table if exists public.contracts;
drop table if exists public.settlement_records;
drop table if exists public.product_offers;
drop table if exists public.organization_invites;
drop table if exists public.location_memberships;
drop table if exists public.locations;

-- Recreate the original public product read if rolling back before a data cutover.
drop policy if exists "public can read active products" on public.products;
create policy "public can read active products"
  on public.products for select
  using (publication_status = 'active');
