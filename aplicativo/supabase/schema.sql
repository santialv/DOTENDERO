-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Organizations (Tenants)
-- Centralizes all business logic and isolation.
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- Commercial Name
  legal_name text, -- Razón Social (S.A.S, etc)
  nit text, -- Tax ID
  regime text, -- IVA Regime
  activity_code text, -- CIIU
  city text,
  address text,
  phone text,
  email text,
  logo_url text,
  rut_url text, -- Path to stored RUT document
  plan text default 'free', -- 'free', 'pro', 'enterprise'
  subscription_status text default 'active',
  settings jsonb default '{}'::jsonb, -- Flexible config (printer, taxes, etc)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles (Users linked to Auth)
-- Links Supabase Auth users to our internal logic.
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'owner', -- 'owner', 'admin', 'cashier'
  organization_id uuid references organizations(id),
  city text, -- Personal residence city
  address text, -- Personal residence address
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Customers (CRM)
create table customers (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) not null,
  full_name text not null,
  document_type text, -- CC, CE, NIT
  document_number text,
  email text,
  phone text,
  address text,
  city text,
  credit_limit decimal(12,2) default 0,
  current_debt decimal(12,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Products (Inventory)
create table products (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) not null,
  name text not null,
  description text,
  barcode text,
  internal_code text,
  price decimal(12,2) default 0,
  cost decimal(12,2) default 0,
  tax_rate decimal(5,2) default 0, -- IVA %
  stock integer default 0,
  min_stock integer default 5,
  category text,
  unit text default 'UND',
  status text default 'active', -- 'active', 'inactive'
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Invoices (Sales Heads)
create table invoices (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) not null,
  customer_id uuid references customers(id), -- Nullable for anonymous sales
  seller_id uuid references profiles(id),
  number text, -- Consecutive invoice number (e.g., POS-1001)
  prefix text, -- e.g., POS
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  payment_method text, -- 'cash', 'card', 'transfer', 'credit'
  subtotal decimal(12,2) default 0,
  tax_total decimal(12,2) default 0,
  discount_total decimal(12,2) default 0,
  total decimal(12,2) default 0,
  status text default 'paid', -- 'paid', 'pending', 'cancelled'
  notes text,
  dian_resolution text
);

-- 6. Invoice Items (Sales Details)
create table invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references invoices(id) on delete cascade not null,
  product_id uuid references products(id),
  product_name text not null, -- Snapshot of name at time of sale
  quantity integer not null,
  unit_price decimal(12,2) not null, -- Snapshot of price
  unit_cost decimal(12,2), -- For margin calculation
  tax_rate decimal(5,2),
  subtotal decimal(12,2) not null,
  organization_id uuid references organizations(id) not null -- Denormalized for RLS performance
);

-- 7. Movements (Kardex / Inventory History)
create table movements (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) not null,
  product_id uuid references products(id) not null,
  invoice_id uuid references invoices(id), -- Link if sale
  type text not null, -- 'IN', 'OUT', 'SALE', 'RETURN', 'ADJUSTMENT'
  quantity integer not null,
  previous_stock integer,
  new_stock integer,
  unit_cost decimal(12,2), -- Cost at moment of movement
  reference text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id)
);

-- Indexes for Performance
-- Critical for dashboards and searches
create index idx_products_org_barcode on products(organization_id, barcode);
create index idx_products_org_name on products(organization_id, name);
create index idx_invoices_org_date on invoices(organization_id, date);
create index idx_movements_product_date on movements(product_id, created_at desc);
create index idx_customers_org_doc on customers(organization_id, document_number);

-- Row Level Security (RLS) Policies
-- Essential for multi-tenancy security.

-- Helper function to get current user's organization
create or replace function get_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid();
$$ language sql security definer;

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table products enable row level security;
alter table movements enable row level security;
alter table customers enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Policies (Examples for Products)
create policy "View Org Products" on products for select using (organization_id = get_org_id());
create policy "Manage Org Products" on products for all using (organization_id = get_org_id());

-- Policies for Invoices
create policy "View Org Invoices" on invoices for select using (organization_id = get_org_id());
create policy "Manage Org Invoices" on invoices for all using (organization_id = get_org_id());

-- Policies for Customers
create policy "View Org Customers" on customers for select using (organization_id = get_org_id());
create policy "Manage Org Customers" on customers for all using (organization_id = get_org_id());
