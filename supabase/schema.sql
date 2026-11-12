-- ═══════════════════════════════════════════════════════════════════════
--  BAROMAAZ — database setup
--  Run once: Supabase dashboard → SQL Editor → New query → paste this whole
--  file → Run. Safe to re-run (it skips things that already exist).
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────── Monthly drops (collections) ─────────────
create table if not exists public.drops (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,                 -- e.g. "diya-nov-2026"
  name        text not null,                        -- e.g. "Diya"
  month_label text not null,                        -- e.g. "November 2026"
  blurb       text,
  is_current  boolean not null default false,       -- the drop shown on the homepage
  starts_at   date,
  created_at  timestamptz not null default now()
);
-- only one drop can be "current" at a time
create unique index if not exists drops_one_current on public.drops (is_current) where is_current;

-- ───────────── Categories ─────────────
create table if not exists public.categories (
  slug          text primary key,                   -- tops, kurtis, corsets, dresses, co-ord-sets, festive
  name          text not null,
  image_url     text,
  show_on_home  boolean not null default true,
  sort_order    int not null default 0
);

-- ───────────── Products ─────────────
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,                -- URL: /product/<slug>
  name         text not null,
  category     text not null references public.categories(slug) on update cascade,
  drop_id      uuid references public.drops(id) on delete set null,
  price        int  not null check (price > 0),     -- in rupees, e.g. 1299
  mrp          int  not null check (mrp >= price),
  color        text,
  fabric       text,
  description  text,
  care         text,
  most_wanted  boolean not null default false,
  is_active    boolean not null default true,       -- false = hidden from the shop
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_drop_idx on public.products (drop_id);

-- ───────────── Product photos (ordered) ─────────────
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  position    int not null default 0               -- 0 = main photo
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);

-- ───────────── Stock per size ─────────────
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  size        text not null check (size in ('XS','S','M','L','XL','XXL','Free Size')),
  stock       int  not null default 0 check (stock >= 0),
  sku         text unique,
  unique (product_id, size)
);

-- ───────────── Orders ─────────────
create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  order_number         text unique not null,         -- e.g. BRZ-1730000000000
  status               text not null default 'pending'
                       check (status in ('pending','paid','packed','shipped','delivered','cancelled','refunded')),
  customer_name        text not null,
  customer_email       text not null,
  customer_phone       text not null,
  address              text not null,
  city                 text not null,
  state                text not null,
  pincode              text not null,
  subtotal             int  not null,
  shipping             int  not null default 0,
  total                int  not null,
  razorpay_order_id    text unique,
  razorpay_payment_id  text,
  tracking_url         text,
  created_at           timestamptz not null default now()
);
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,                         -- copied at purchase time
  size        text not null,
  qty         int  not null check (qty > 0),
  price       int  not null
);

-- ───────────── Reviews (shown only after you approve them) ─────────────
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  name         text not null,
  city         text,
  rating       int  not null check (rating between 1 and 5),
  title        text,
  body         text not null,
  size         text,
  photos       text[] not null default '{}',
  is_approved  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ───────────── Returns / exchanges & newsletter ─────────────
create table if not exists public.return_requests (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null,
  item          text not null,
  type          text not null check (type in ('Return','Exchange')),
  new_size      text,
  reason        text not null,
  details       text,
  status        text not null default 'requested',
  created_at    timestamptz not null default now()
);
create table if not exists public.newsletter_subscribers (
  email       text primary key,
  created_at  timestamptz not null default now()
);

-- keep products.updated_at fresh
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ═══════════════ Security (Row Level Security) ═══════════════
-- Visitors can only READ the catalogue and approved reviews.
-- Everything else (orders, stock changes, admin edits) happens on the server
-- with the secret service_role key, which bypasses these rules.
alter table public.drops                  enable row level security;
alter table public.categories             enable row level security;
alter table public.products               enable row level security;
alter table public.product_images         enable row level security;
alter table public.product_variants       enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.reviews                enable row level security;
alter table public.return_requests        enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "public read drops" on public.drops;
create policy "public read drops" on public.drops for select using (true);
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (is_active);
drop policy if exists "public read images" on public.product_images;
create policy "public read images" on public.product_images for select using (true);
drop policy if exists "public read variants" on public.product_variants;
create policy "public read variants" on public.product_variants for select using (true);
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews for select using (is_approved);
-- orders, order_items, return_requests, newsletter_subscribers: no public policies = no public access.

-- ═══════════════ Photo storage ═══════════════
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

-- ═══════════════ Starting categories ═══════════════
insert into public.categories (slug, name, image_url, show_on_home, sort_order) values
  ('tops',        'Tops',        '/images/categories/tops-category-2.webp',    true,  1),
  ('kurtis',      'Kurtis',      '/images/categories/kurtis-category-2.webp',  true,  2),
  ('corsets',     'Corsets',     '/images/categories/corsets-category-2.webp', true,  3),
  ('dresses',     'Dresses',     '/images/categories/dresses-category-2.webp', true,  4),
  ('co-ord-sets', 'Co-ord Sets', '/images/categories/co-ord-sets.webp',      false, 5),
  ('festive',     'Festive',     '/images/categories/festive-category-2.webp', true,  6)
on conflict (slug) do nothing;
