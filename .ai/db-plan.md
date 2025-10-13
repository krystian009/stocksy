# Stocksy Database Schema

This document outlines the PostgreSQL database schema for the Stocksy application, designed to meet the requirements specified in the Product Requirements Document (PRD) and planning sessions. The schema is optimized for use with Supabase.

## 1. Tables and Data Types

### ENUM Types

First, we define a custom `ENUM` type to categorize inventory changes.

```sql
CREATE TYPE inventory_log_change_type AS ENUM (
  'MANUAL_UPDATE',
  'CHECK_IN',
  'INITIAL_STOCK'
);
```

### `products`

This table stores the core inventory information for each user.

- **`id`**: `UUID` - Primary Key, automatically generated.
- **`created_at`**: `TIMESTAMPTZ` - Timestamp of when the product was created, defaults to `now()`.
- **`user_id`**: `UUID` - Foreign Key referencing `auth.users(id)`. Links the product to a user.
- **`name`**: `TEXT` - The name of the product. Cannot be null.
- **`quantity`**: `INTEGER` - The current stock level. Defaults to `0` and cannot be negative.
- **`minimum_threshold`**: `INTEGER` - The minimum stock level before the product is considered "low." Defaults to `0` and cannot be negative.

**Constraints:**
- **Name Length:** `CHECK (char_length(name) >= 3)` - Enforces a minimum name length of 3 characters.
- **Quantity Non-Negative:** `CHECK (quantity >= 0)` - Ensures the quantity is never negative.
- **Threshold Non-Negative:** `CHECK (minimum_threshold >= 0)` - Ensures the threshold is never negative.
- **Unique Product Name:** `UNIQUE (user_id, name)` - Prevents a user from having duplicate product names.

### `shopping_list_items`

This table holds products that have fallen below their minimum threshold and need to be purchased. It is managed automatically by a database trigger on the `products` table.

- **`id`**: `UUID` - Primary Key, automatically generated.
- **`created_at`**: `TIMESTAMPTZ` - Timestamp of when the item was added to the list, defaults to `now()`.
- **`user_id`**: `UUID` - Foreign Key referencing `auth.users(id)`.
- **`product_id`**: `UUID` - Foreign Key referencing `products(id)`. Deletes automatically if the parent product is deleted (`ON DELETE CASCADE`).
- **`quantity_to_purchase`**: `INTEGER` - The suggested quantity to buy. Cannot be negative.

**Constraints:**
- **Quantity to Purchase Positive**: `CHECK (quantity_to_purchase > 0)` - Ensures the suggested purchase quantity is a positive number.
- **Unique Product on List**: `UNIQUE (user_id, product_id)` - Ensures a product only appears once on a user's shopping list.

### `inventory_logs`

This table serves as an audit trail, recording every change to a product's quantity. It is populated automatically by a database trigger.

- **`id`**: `UUID` - Primary Key, automatically generated.
- **`created_at`**: `TIMESTAMPTZ` - Timestamp of when the log entry was created, defaults to `now()`.
- **`user_id`**: `UUID` - Foreign Key referencing `auth.users(id)`.
- **`product_id`**: `UUID` - Foreign Key referencing `products(id)`. Deletes automatically if the parent product is deleted (`ON DELETE CASCADE`).
- **`change_type`**: `inventory_log_change_type` - The type of change (e.g., `'MANUAL_UPDATE'`).
- **`previous_quantity`**: `INTEGER` - The quantity before the change occurred.
- **`new_quantity`**: `INTEGER` - The quantity after the change occurred.

## 2. Relationships

The database schema is centered around the `auth.users` table provided by Supabase.

- **`auth.users` ↔ `products`**: A one-to-many relationship. One user can have many products.
- **`products` ↔ `shopping_list_items`**: A one-to-one relationship. A product can appear at most once on the shopping list. The `ON DELETE CASCADE` rule ensures that deleting a product also removes its corresponding shopping list entry.
- **`products` ↔ `inventory_logs`**: A one-to-many relationship. A product can have many log entries tracking its history. The `ON DELETE CASCADE` rule ensures that a product's entire history is removed when the product itself is deleted.

## 3. Indexes

Indexes are created to optimize query performance for common access patterns, such as sorting, filtering, and joining tables.

- **On `products` table:**
  - **Composite Index on `(user_id, name)`**: Speeds up the default alphabetical sorting of the inventory list for a specific user.
  - **Composite Index on `(user_id, quantity)`**: Speeds up sorting by quantity to find low-stock items for a user.

- **On `shopping_list_items` table:**
  - **Index on `(user_id, product_id)`**: Optimizes lookups for items on a user's shopping list.

- **On `inventory_logs` table:**
  - **Index on `(user_id, product_id)`**: Improves performance when querying the change history for a specific product belonging to a user.

## 4. Row-Level Security (RLS) Policies

To ensure data privacy, Row-Level Security (RLS) is enabled on all tables. Policies are defined to grant access only to the data owner. The `auth.uid()` function is used to identify the currently authenticated user.

### Policies for `products` table:

- **`Enable RLS`**: `ALTER TABLE products ENABLE ROW LEVEL SECURITY;`
- **`SELECT`**: `CREATE POLICY "Allow user to read their own products" ON products FOR SELECT USING (auth.uid() = user_id);`
- **`INSERT`**: `CREATE POLICY "Allow user to create products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);`
- **`UPDATE`**: `CREATE POLICY "Allow user to update their own products" ON products FOR UPDATE USING (auth.uid() = user_id);`
- **`DELETE`**: `CREATE POLICY "Allow user to delete their own products" ON products FOR DELETE USING (auth.uid() = user_id);`

### Policies for `shopping_list_items` table:

- **`Enable RLS`**: `ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;`
- **`SELECT`**: `CREATE POLICY "Allow user to read their own shopping list" ON shopping_list_items FOR SELECT USING (auth.uid() = user_id);`
- **`INSERT`**: `CREATE POLICY "Allow user to create shopping list items" ON shopping_list_items FOR INSERT WITH CHECK (auth.uid() = user_id);`
- **`UPDATE`**: `CREATE POLICY "Allow user to update their own shopping list items" ON shopping_list_items FOR UPDATE USING (auth.uid() = user_id);`
- **`DELETE`**: `CREATE POLICY "Allow user to delete their own shopping list items" ON shopping_list_items FOR DELETE USING (auth.uid() = user_id);`

### Policies for `inventory_logs` table:

- **`Enable RLS`**: `ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;`
- **`SELECT`**: `CREATE POLICY "Allow user to read their own inventory logs" ON inventory_logs FOR SELECT USING (auth.uid() = user_id);`
- **`INSERT`**: `CREATE POLICY "Allow system to create inventory logs" ON inventory_logs FOR INSERT WITH CHECK (auth.uid() = user_id);`
- **`UPDATE/DELETE`**: No policies are defined for `UPDATE` or `DELETE` on `inventory_logs` as these records should be immutable.

## 5. Additional Notes & Automation

- **Database Triggers**: The schema relies heavily on PostgreSQL triggers for automation, which are not defined in this document but are a critical part of the implementation.
  - An `AFTER INSERT OR UPDATE` trigger on the `products` table is responsible for automatically adding or removing items from the `shopping_list_items` table based on the `quantity` and `minimum_threshold`.
  - An `AFTER UPDATE` trigger on the `products` table is responsible for creating a new entry in the `inventory_logs` table whenever a product's quantity changes.
- **Data Integrity**: Using `ON DELETE CASCADE` ensures that related data in `shopping_list_items` and `inventory_logs` is cleaned up automatically when a product is deleted, preventing orphaned records.
- **UUIDs as Primary Keys**: Using `UUID`s for primary keys helps prevent enumeration attacks and is a best practice for data exposed via an API.
