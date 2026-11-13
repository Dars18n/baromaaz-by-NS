-- ═══════════════════════════════════════════════════════════════════════
--  BAROMAAZ — admin dashboard update (order cancellations + "new" markers)
--  Run once: Supabase → SQL Editor → New query → paste this file → Run.
--  Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

-- Cancellation details
alter table public.orders add column if not exists cancel_reason text;
alter table public.orders add column if not exists cancelled_at  timestamptz;
alter table public.orders add column if not exists cancelled_by  text;            -- 'customer' or 'admin'
alter table public.orders add column if not exists cancel_seen   boolean not null default true;  -- false = admin hasn't read this cancellation yet
alter table public.orders drop constraint if exists orders_cancelled_by_check;
alter table public.orders add constraint orders_cancelled_by_check check (cancelled_by is null or cancelled_by in ('customer','admin'));

-- "New order" marker. Existing orders count as already seen (default true on the
-- column add), then new orders default to unseen.
alter table public.orders add column if not exists admin_seen boolean not null default true;
alter table public.orders alter column admin_seen set default false;

create index if not exists orders_cancelled_idx on public.orders (cancelled_at desc) where cancelled_at is not null;

-- Cancels an order, puts the stock back (only if it had been taken off), and records the reason.
-- p_by = 'customer' (cannot cancel once packed) or 'admin' (cannot cancel once shipped).
create or replace function public.cancel_order(p_order_id uuid, p_reason text, p_by text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o  public.orders%rowtype;
  it record;
begin
  if p_by not in ('customer','admin') then return 'bad_request'; end if;
  select * into o from public.orders where id = p_order_id for update;
  if not found then return 'not_found'; end if;

  if o.status in ('cancelled','refunded') then return 'already_cancelled'; end if;
  if o.status in ('shipped','delivered')  then return 'too_late'; end if;
  if p_by = 'customer' and o.status = 'packed' then return 'too_late'; end if;

  -- stock is only reduced once an order is confirmed/paid, so only then is it put back
  if o.status in ('confirmed','paid','packed') then
    for it in select product_id, size, qty from public.order_items where order_id = o.id loop
      update public.product_variants
         set stock = stock + it.qty
       where product_id = it.product_id and size = it.size;
    end loop;
  end if;

  update public.orders
     set status       = 'cancelled',
         cancel_reason = left(btrim(coalesce(p_reason, '')), 500),
         cancelled_at  = now(),
         cancelled_by  = p_by,
         cancel_seen   = false
   where id = o.id;

  return 'cancelled';
end;
$$;

revoke all on function public.cancel_order(uuid, text, text) from public, anon, authenticated;
grant execute on function public.cancel_order(uuid, text, text) to service_role;
