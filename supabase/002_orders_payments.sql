-- ═══════════════════════════════════════════════════════════════════════
--  BAROMAAZ — orders & payments update
--  Run once: Supabase → SQL Editor → New query → paste this file → Run.
--  Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

-- email is optional at checkout now
alter table public.orders alter column customer_email drop not null;

-- extra order fields
alter table public.orders add column if not exists paid_at        timestamptz;
alter table public.orders add column if not exists alert_sent     boolean not null default false;
alter table public.orders add column if not exists landmark       text;
alter table public.orders add column if not exists payment_source text;   -- 'checkout' or 'webhook'

-- Cash on Delivery
alter table public.orders add column if not exists payment_method text not null default 'online';  -- 'online' or 'cod'
alter table public.orders add column if not exists cod_fee        int  not null default 0;
-- new status 'confirmed' = COD order placed, money to be collected on delivery
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending','confirmed','paid','packed','shipped','delivered','cancelled','refunded'));

create index if not exists orders_status_idx on public.orders (status, created_at desc);

-- Marks an order paid and reduces stock — all in one transaction, and only once.
-- Called by the website after Razorpay confirms payment (checkout and webhook both call it;
-- whichever comes second does nothing).
create or replace function public.mark_order_paid(p_razorpay_order_id text, p_payment_id text, p_source text default 'checkout')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o  public.orders%rowtype;
  it record;
begin
  select * into o from public.orders where razorpay_order_id = p_razorpay_order_id for update;
  if not found then
    return 'not_found';            -- not one of this website's orders (e.g. another site on the same Razorpay account)
  end if;
  if o.status <> 'pending' then
    return 'already_' || o.status; -- already processed
  end if;

  for it in select product_id, size, qty from public.order_items where order_id = o.id loop
    update public.product_variants
       set stock = greatest(stock - it.qty, 0)
     where product_id = it.product_id and size = it.size;
  end loop;

  update public.orders
     set status = 'paid', razorpay_payment_id = p_payment_id, paid_at = now(), payment_source = p_source
   where id = o.id;

  return 'paid';
end;
$$;

-- only the server (service role) may call it — never visitors
revoke all on function public.mark_order_paid(text, text, text) from public, anon, authenticated;
grant execute on function public.mark_order_paid(text, text, text) to service_role;

-- Confirms a Cash-on-Delivery order and reduces stock — once only.
create or replace function public.confirm_cod_order(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o  public.orders%rowtype;
  it record;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then return 'not_found'; end if;
  if o.payment_method <> 'cod' or o.status <> 'pending' then return 'already_' || o.status; end if;

  for it in select product_id, size, qty from public.order_items where order_id = o.id loop
    update public.product_variants
       set stock = greatest(stock - it.qty, 0)
     where product_id = it.product_id and size = it.size;
  end loop;

  update public.orders set status = 'confirmed' where id = o.id;
  return 'confirmed';
end;
$$;

revoke all on function public.confirm_cod_order(uuid) from public, anon, authenticated;
grant execute on function public.confirm_cod_order(uuid) to service_role;
