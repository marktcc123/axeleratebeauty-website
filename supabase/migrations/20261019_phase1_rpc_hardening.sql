-- Harden inventory, paid-state, and refund RPCs.
-- Apply after 20261019_phase1_security.sql. Safe to re-run.

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
  where stripe_checkout_session_id = p_checkout_session_id
  for update;

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

  -- Replayed paid events must not overwrite a later refund state.
  if v_order.payment_status in ('partially_refunded', 'refunded') then
    if v_order.total_cents is distinct from p_total_cents then
      raise exception 'paid_amount_mismatch';
    end if;
    return v_order.id;
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
    and payment_status not in ('paid', 'partially_refunded', 'refunded')
  returning * into v_order;

  if not found then
    select * into v_order
    from public.orders
    where stripe_checkout_session_id = p_checkout_session_id;
    if v_order.payment_status in ('paid', 'partially_refunded', 'refunded') then
      return v_order.id;
    end if;
    raise exception 'paid_state_conflict';
  end if;

  return v_order.id;
end;
$$;

create or replace function public.apply_inventory_decrement(p_order_id uuid, p_product_id uuid, p_qty integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_updated integer := 0;
begin
  if p_qty is null or p_qty <= 0 then
    raise exception 'invalid_quantity';
  end if;

  select * into v_product
  from public.products
  where id = p_product_id
  for update;
  if not found then
    raise exception 'product_not_found';
  end if;

  if exists (
    select 1
    from public.inventory_movements
    where order_id = p_order_id and product_id = p_product_id
  ) then
    return true;
  end if;

  if v_product.inventory_status <> 'untracked'
     and v_product.available_quantity is not null
     and v_product.available_quantity < p_qty then
    return false;
  end if;

  insert into public.inventory_movements (order_id, product_id, quantity)
  values (p_order_id, p_product_id, p_qty);

  if v_product.inventory_status = 'untracked' or v_product.available_quantity is null then
    return true;
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
  get diagnostics v_updated = row_count;

  if v_updated <> 1 then
    delete from public.inventory_movements
    where order_id = p_order_id and product_id = p_product_id;
    return false;
  end if;

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
  where stripe_payment_intent_id = p_payment_intent
  for update;
  if not found then
    raise exception 'order_not_found';
  end if;
  if lower(v_order.currency) <> lower(coalesce(p_currency, v_order.currency)) then
    raise exception 'currency_mismatch';
  end if;

  -- Serialize every refund on this order so the succeeded total cannot tear.
  perform 1
  from public.refunds
  where order_id = v_order.id
  for update;

  insert into public.refunds (order_id, stripe_refund_id, amount_cents, currency, status)
  values (v_order.id, p_stripe_refund_id, p_amount_cents, v_order.currency, p_status)
  on conflict (stripe_refund_id) do update
    set
      status = case
        when public.refunds.status = 'succeeded' then public.refunds.status
        when public.refunds.status = 'failed' and excluded.status = 'pending' then public.refunds.status
        else excluded.status
      end,
      amount_cents = case
        when public.refunds.status = 'succeeded' then public.refunds.amount_cents
        when public.refunds.status = 'failed' and excluded.status = 'pending' then public.refunds.amount_cents
        else excluded.amount_cents
      end,
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

revoke all on function public.mark_order_paid(text, text, text, integer, integer, integer, jsonb) from public, anon, authenticated;
revoke all on function public.apply_inventory_decrement(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.apply_refund(text, text, integer, text, text) from public, anon, authenticated;

do $$
begin
  grant execute on function public.mark_order_paid(text, text, text, integer, integer, integer, jsonb) to service_role;
  grant execute on function public.apply_inventory_decrement(uuid, uuid, integer) to service_role;
  grant execute on function public.apply_refund(text, text, integer, text, text) to service_role;
exception
  when undefined_object then
    null;
end $$;
