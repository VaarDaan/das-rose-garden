-- ============================================================
-- Das Rose Garden — Supabase Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text unique not null,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admin can read all profiles" on profiles for select using (
  auth.jwt() ->> 'email' = any(string_to_array(current_setting('app.admin_emails', true), ','))
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  images text[] default '{}',
  type text,
  size text[] default '{}',
  flower_color text,
  bloom_season text,
  specs jsonb default '{}',
  stock int default 0,
  created_at timestamptz default now()
);
alter table products enable row level security;
create policy "Anyone can read products" on products for select using (true);
create policy "Admin can manage products" on products for all using (
  auth.jwt() ->> 'email' = any(string_to_array(current_setting('app.admin_emails', true), ','))
);

-- ============================================================
-- CART ITEMS
-- ============================================================
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  quantity int not null default 1,
  size text,
  created_at timestamptz default now()
);
alter table cart_items enable row level security;
create policy "Users can manage own cart" on cart_items for all using (auth.uid() = user_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  items jsonb not null,
  total numeric not null,
  status text not null default 'confirmed',
  payment_method text not null default 'cod',
  address jsonb not null,
  created_at timestamptz default now()
);
alter table orders enable row level security;
create policy "Users can read own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admin can manage all orders" on orders for all using (
  auth.jwt() ->> 'email' = any(string_to_array(current_setting('app.admin_emails', true), ','))
);

-- ============================================================
-- HERO BANNERS
-- ============================================================
create table if not exists hero_banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  link text,
  sort_order int default 0,
  active boolean default true
);
alter table hero_banners enable row level security;
create policy "Anyone can read active banners" on hero_banners for select using (active = true);
create policy "Admin can manage banners" on hero_banners for all using (
  auth.jwt() ->> 'email' = any(string_to_array(current_setting('app.admin_emails', true), ','))
);

-- ============================================================
-- HOME SECTIONS
-- ============================================================
create table if not exists home_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  product_ids uuid[] default '{}',
  sort_order int default 0,
  active boolean default true
);
alter table home_sections enable row level security;
create policy "Anyone can read active sections" on home_sections for select using (active = true);
create policy "Admin can manage sections" on home_sections for all using (
  auth.jwt() ->> 'email' = any(string_to_array(current_setting('app.admin_emails', true), ','))
);

-- ============================================================
-- REALTIME (enable for orders table)
-- ============================================================
alter publication supabase_realtime add table orders;
