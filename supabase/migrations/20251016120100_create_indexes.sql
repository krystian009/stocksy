-- migration: create performance indexes
-- description: creates indexes to optimize query performance for common access patterns
-- affected tables: products, shopping_list_items, inventory_logs
-- rationale: indexes improve performance for sorting, filtering, and joining operations

-- ============================================================================
-- indexes on products table
-- ============================================================================

-- composite index on (user_id, name)
-- purpose: speeds up default alphabetical sorting of inventory list for a specific user
-- usage: queries that filter by user_id and sort by name
create index idx_products_user_id_name on products(user_id, name);

-- composite index on (user_id, quantity)
-- purpose: speeds up sorting by quantity to find low-stock items for a user
-- usage: queries that filter by user_id and sort by quantity
create index idx_products_user_id_quantity on products(user_id, quantity);

-- ============================================================================
-- indexes on shopping_list_items table
-- ============================================================================

-- composite index on (user_id, product_id)
-- purpose: optimizes lookups for items on a user's shopping list
-- usage: queries that filter shopping list items by user and product
create index idx_shopping_list_items_user_id_product_id on shopping_list_items(user_id, product_id);

-- ============================================================================
-- indexes on inventory_logs table
-- ============================================================================

-- composite index on (user_id, product_id)
-- purpose: improves performance when querying change history for a specific product
-- usage: queries that retrieve audit trail for a specific product belonging to a user
create index idx_inventory_logs_user_id_product_id on inventory_logs(user_id, product_id);

-- additional index on (user_id, created_at)
-- purpose: optimizes queries that retrieve recent inventory changes for a user
-- usage: queries that display chronological history of all inventory changes
create index idx_inventory_logs_user_id_created_at on inventory_logs(user_id, created_at desc);

