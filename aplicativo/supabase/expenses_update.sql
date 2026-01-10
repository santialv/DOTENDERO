alter table expenses 
add column if not exists customer_id uuid references customers(id);
