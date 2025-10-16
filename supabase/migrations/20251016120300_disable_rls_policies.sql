-- migration: disable rls policies for products, shopping_list_items, and inventory_logs
-- description: drops all rls policies and disables row level security for core tables
-- affected tables: products, shopping_list_items, inventory_logs

-- ============================================================================
-- table: products
-- ============================================================================

-- drop all rls policies for products table
drop policy if exists "Allow user to read their own products" on products;
drop policy if exists "Allow user to create products" on products;
drop policy if exists "Allow user to update their own products" on products;
drop policy if exists "Allow user to delete their own products" on products;

-- disable row level security on products table
alter table products disable row level security;

-- ============================================================================
-- table: shopping_list_items
-- ============================================================================

-- drop all rls policies for shopping_list_items table
drop policy if exists "Allow user to read their own shopping list" on shopping_list_items;
drop policy if exists "Allow user to create shopping list items" on shopping_list_items;
drop policy if exists "Allow user to update their own shopping list items" on shopping_list_items;
drop policy if exists "Allow user to delete their own shopping list items" on shopping_list_items;

-- disable row level security on shopping_list_items table
alter table shopping_list_items disable row level security;

-- ============================================================================
-- table: inventory_logs
-- ============================================================================

-- drop all rls policies for inventory_logs table
drop policy if exists "Allow user to read their own inventory logs" on inventory_logs;
drop policy if exists "Allow system to create inventory logs" on inventory_logs;

-- disable row level security on inventory_logs table
alter table inventory_logs disable row level security;

