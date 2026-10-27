-- Admin-managed site content: categories, brands, services and products
-- (products include special offers and packages).
--
-- Access rules:
--   - Everyone (including signed-out visitors) can read published rows.
--   - Admins can read everything and add, change or delete rows.
--   - An admin is a Supabase Auth user whose app_metadata.role is "admin".
--     Only SQL or the secret key can set app_metadata.

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table public.categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  image_url text not null default '',
  image_alt text not null default '',
  show_images boolean not null default true,
  sort_order integer not null default 0,
  published boolean not null default true
);
alter table public.categories enable row level security;

create table public.brands (
  id text primary key,
  slug text not null unique,
  name text not null,
  logo_url text not null default '',
  aliases text[] not null default '{}',
  website_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.brands enable row level security;

create table public.services (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  image_url text not null default '',
  image_alt text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.services enable row level security;

create table public.products (
  id text primary key,
  kind text not null default 'product' check (kind in ('product', 'package')),
  slug text not null unique,
  -- Packages may have no category.
  category_id text references public.categories (id) on delete set null,
  name text not null,
  summary text not null default '',
  image_url text,
  price_cents integer check (price_cents >= 0),
  discount_price_cents integer check (discount_price_cents >= 0),
  price_display text,
  caliber text,
  condition text check (condition in ('new', 'used')),
  condition_detail text,
  badge text,
  featured boolean not null default false,
  quantity integer check (quantity >= 0),
  stock_note text,
  brand_ids text[] not null default '{}',
  -- Products inside a package (empty for normal products).
  product_ids text[] not null default '{}',
  special_offer boolean not null default false,
  offer_label text,
  highlights text[] not null default '{}',
  offer_starts_at timestamptz,
  offer_ends_at timestamptz,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

create index products_category_id_idx on public.products (category_id);
create index products_special_offer_idx on public.products (special_offer) where special_offer;

-- Access rules: the same policies on every content table (RLS is enabled above).
do $$
declare
  t text;
begin
  foreach t in array array['categories', 'brands', 'services', 'products'] loop
    execute format(
      'create policy "Published rows are public" on public.%I
         for select to anon, authenticated
         using (published or (select public.is_admin()))',
      t
    );
    execute format(
      'create policy "Admins can add rows" on public.%I
         for insert to authenticated
         with check ((select public.is_admin()))',
      t
    );
    execute format(
      'create policy "Admins can change rows" on public.%I
         for update to authenticated
         using ((select public.is_admin()))
         with check ((select public.is_admin()))',
      t
    );
    execute format(
      'create policy "Admins can delete rows" on public.%I
         for delete to authenticated
         using ((select public.is_admin()))',
      t
    );

    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end
$$;
