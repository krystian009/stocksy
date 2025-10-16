-- migration: create database triggers for automation
-- description: creates triggers to manage shopping list and inventory logs automatically
-- affected tables: products, shopping_list_items, inventory_logs
-- note: these triggers are critical for maintaining data consistency and audit trails

-- ============================================================================
-- trigger function: manage shopping list based on inventory levels
-- description: automatically adds/removes items from shopping list when product
--              quantity falls below or rises above the minimum threshold
-- ============================================================================

create or replace function manage_shopping_list()
returns trigger as $$
begin
  -- check if quantity is below minimum threshold
  if new.quantity < new.minimum_threshold then
    -- calculate suggested purchase quantity (difference between threshold and current quantity)
    insert into shopping_list_items (user_id, product_id, quantity_to_purchase)
    values (
      new.user_id,
      new.id,
      new.minimum_threshold - new.quantity
    )
    -- if item already exists, update the quantity to purchase
    on conflict (user_id, product_id)
    do update set
      quantity_to_purchase = new.minimum_threshold - new.quantity;
  else
    -- quantity is at or above threshold, remove from shopping list if present
    delete from shopping_list_items
    where user_id = new.user_id and product_id = new.id;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- create trigger on products table to manage shopping list
-- fires after insert or update operations
create trigger trigger_manage_shopping_list
  after insert or update on products
  for each row
  execute function manage_shopping_list();

-- ============================================================================
-- trigger function: log inventory changes
-- description: creates an audit log entry whenever a product's quantity changes
-- note: only logs when quantity actually changes, not on other field updates
-- ============================================================================

create or replace function log_inventory_change()
returns trigger as $$
begin
  -- only log if quantity has changed
  if (tg_op = 'INSERT') or (old.quantity is distinct from new.quantity) then
    insert into inventory_logs (user_id, product_id, previous_quantity, new_quantity)
    values (
      new.user_id,
      new.id,
      coalesce(old.quantity, 0),  -- for inserts, previous quantity is 0
      new.quantity
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- create trigger on products table to log inventory changes
-- fires after insert or update operations
create trigger trigger_log_inventory_change
  after insert or update on products
  for each row
  execute function log_inventory_change();

