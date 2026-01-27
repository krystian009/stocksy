-- migration: enable rls policies for products, shopping_list_items, and inventory_logs
-- description: re-enables row level security and recreates all rls policies for core tables
-- affected tables: products, shopping_list_items, inventory_logs
-- note: this migration reverses the changes made in 20251016120300_disable_rls_policies.sql

-- ============================================================================
-- table: products
-- ============================================================================

-- enable row level security on products table
-- this ensures that all data access is controlled by rls policies
alter table products enable row level security;

-- create rls policy: allow authenticated users to read their own products
-- users can only view products that belong to them (user_id matches authenticated user)
create policy "Allow user to read their own products"
  on products
  for select
  using (auth.uid() = user_id);

-- create rls policy: allow authenticated users to insert their own products
-- users can only create products with their own user_id
create policy "Allow user to create products"
  on products
  for insert
  with check (auth.uid() = user_id);

-- create rls policy: allow authenticated users to update their own products
-- users can only modify products that belong to them
create policy "Allow user to update their own products"
  on products
  for update
  using (auth.uid() = user_id);

-- create rls policy: allow authenticated users to delete their own products
-- users can only remove products that belong to them
create policy "Allow user to delete their own products"
  on products
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- table: shopping_list_items
-- ============================================================================

-- enable row level security on shopping_list_items table
-- this ensures that all data access is controlled by rls policies
alter table shopping_list_items enable row level security;

-- create rls policy: allow authenticated users to read their own shopping list
-- users can only view shopping list items that belong to them
create policy "Allow user to read their own shopping list"
  on shopping_list_items
  for select
  using (auth.uid() = user_id);

-- create rls policy: allow authenticated users to insert shopping list items
-- users can only create shopping list items with their own user_id
create policy "Allow user to create shopping list items"
  on shopping_list_items
  for insert
  with check (auth.uid() = user_id);

-- create rls policy: allow authenticated users to update their own shopping list items
-- users can only modify shopping list items that belong to them
create policy "Allow user to update their own shopping list items"
  on shopping_list_items
  for update
  using (auth.uid() = user_id);

-- create rls policy: allow authenticated users to delete their own shopping list items
-- users can only remove shopping list items that belong to them
create policy "Allow user to delete their own shopping list items"
  on shopping_list_items
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- table: inventory_logs
-- ============================================================================

-- enable row level security on inventory_logs table
-- this ensures that all data access is controlled by rls policies
alter table inventory_logs enable row level security;

-- create rls policy: allow authenticated users to read their own inventory logs
-- users can only view inventory logs that belong to them
-- this provides audit trail visibility for the user's own product changes
create policy "Allow user to read their own inventory logs"
  on inventory_logs
  for select
  using (auth.uid() = user_id);

-- create rls policy: allow system to create inventory logs for authenticated users
-- this policy allows database triggers to insert logs when product quantities change
-- the trigger ensures the user_id matches the authenticated user
create policy "Allow system to create inventory logs"
  on inventory_logs
  for insert
  with check (auth.uid() = user_id);

-- note: no update or delete policies are defined as inventory logs are immutable
-- this maintains data integrity and prevents tampering with audit trail records
