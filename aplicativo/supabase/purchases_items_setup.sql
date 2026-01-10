create table if not exists purchase_items (
  id uuid default uuid_generate_v4() primary key,
  purchase_id uuid references purchases(id) on delete cascade not null,
  product_id uuid references products(id),
  product_name text not null,
  quantity integer default 1,
  cost decimal(12,2) default 0,
  tax_percent decimal(5,2) default 0,
  discount_percent decimal(5,2) default 0,
  total decimal(12,2) default 0
);

alter table purchase_items enable row level security;
drop policy if exists "Allow All" on purchase_items;
create policy "Allow All" on purchase_items for all using (true) with check (true);
