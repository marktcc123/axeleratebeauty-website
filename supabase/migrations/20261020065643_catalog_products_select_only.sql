-- Independent grant repair for an already-created catalog_products view.
-- Hosted Supabase default privileges grant ALL on new tables/views to anon and
-- authenticated. Phase 1 only added GRANT SELECT, so write grants remained.
-- PUBLIC (the role set) currently has no catalog_products ACL entries; revoke it
-- anyway so a later GRANT TO PUBLIC cannot restore writes.
-- Keep security_invoker = false: products has no browser SELECT policy.

revoke all on table public.catalog_products from public;
revoke all on table public.catalog_products from anon;
revoke all on table public.catalog_products from authenticated;

revoke insert, update, delete, truncate, references, trigger
  on table public.catalog_products
  from public, anon, authenticated;

do $$
declare
  cols text;
begin
  select string_agg(format('%I', attname), ', ' order by attnum)
    into cols
  from pg_attribute
  where attrelid = 'public.catalog_products'::regclass
    and attnum > 0
    and not attisdropped;

  if cols is not null then
    execute format(
      'revoke insert, update, references (%s) on public.catalog_products from public, anon, authenticated',
      cols
    );
  end if;
end $$;

grant select on table public.catalog_products to anon, authenticated;
