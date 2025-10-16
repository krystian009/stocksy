-- migration: create initial schema for stocksy application
-- description: creates products, shopping_list_items, and inventory_logs tables
-- affected tables: products, shopping_list_items, inventory_logs
-- dependencies: requires auth.users table from supabase auth

-- ============================================================================
-- table: products
-- description: stores core inventory information for each user
-- ============================================================================

create table products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity integer not null default 0,
  minimum_threshold integer not null default 0,
  
  -- constraints
  constraint products_name_length_check check (char_length(name) >= 3),
  constraint products_quantity_non_negative_check check (quantity >= 0),
  constraint products_threshold_non_negative_check check (minimum_threshold >= 0),
  constraint products_unique_name_per_user unique (user_id, name)
);

-- enable row level security on products table
alter table products enable row level security;

-- create rls policy: allow authenticated users to read their own products
create policy "Allow user to read their own products"
  on products
  for select
  using (auth.uid() = user_id);

-- create rls policy: allow authenticated users to insert their own products
create policy "Allow user to create products"
  on products
  for insert
  with check (auth.uid() = user_id);

-- create rls policy: allow authenticated users to update their own products
create policy "Allow user to update their own products"
  on products
  for update
  using (auth.uid() = user_id);

-- create rls policy: allow authenticated users to delete their own products
create policy "Allow user to delete their own products"
  on products
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- table: shopping_list_items
-- description: holds products that have fallen below minimum threshold
-- note: managed automatically by database triggers
-- ============================================================================

create table shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity_to_purchase integer not null,
  
  -- constraints
  constraint shopping_list_items_quantity_positive_check check (quantity_to_purchase > 0),
  constraint shopping_list_items_unique_product_per_user unique (user_id, product_id)
);

-- enable row level security on shopping_list_items table
alter table shopping_list_items enable row level security;

-- create rls policy: allow authenticated users to read their own shopping list
create policy "Allow user to read their own shopping list"
  on shopping_list_items
  for select
  using (auth.uid() = user_id);

-- create rls policy: allow authenticated users to insert shopping list items
create policy "Allow user to create shopping list items"
  on shopping_list_items
  for insert
  with check (auth.uid() = user_id);

-- create rls policy: allow authenticated users to update their own shopping list items
create policy "Allow user to update their own shopping list items"
  on shopping_list_items
  for update
  using (auth.uid() = user_id);

-- create rls policy: allow authenticated users to delete their own shopping list items
create policy "Allow user to delete their own shopping list items"
  on shopping_list_items
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- table: inventory_logs
-- description: audit trail for all product quantity changes
-- note: populated automatically by database triggers, records are immutable
-- ============================================================================

create table inventory_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  previous_quantity integer not null,
  new_quantity integer not null
);

-- enable row level security on inventory_logs table
alter table inventory_logs enable row level security;

-- create rls policy: allow authenticated users to read their own inventory logs
create policy "Allow user to read their own inventory logs"
  on inventory_logs
  for select
  using (auth.uid() = user_id);

-- create rls policy: allow system to create inventory logs for authenticated users
-- note: this policy allows the trigger to insert logs for the authenticated user
create policy "Allow system to create inventory logs"
  on inventory_logs
  for insert
  with check (auth.uid() = user_id);

-- note: no update or delete policies are defined as inventory logs are immutable

