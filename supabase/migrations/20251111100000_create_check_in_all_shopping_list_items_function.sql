-- migration: create check_in_all_shopping_list_items rpc
-- description: provides atomic bulk check-in workflow for all shopping list items
-- affected objects: function check_in_all_shopping_list_items(uuid)

create or replace function check_in_all_shopping_list_items(
  requesting_user_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items_count int;
begin
  -- count shopping list items before processing
  select count(*) into v_items_count
  from shopping_list_items
  where user_id = requesting_user_id;

  -- use a CTE to select all shopping_list_items for the requesting user
  with user_shopping_list_items as (
    select product_id, quantity_to_purchase
    from shopping_list_items
    where user_id = requesting_user_id
  )
  -- update products table by joining against the CTE
  update products
  set quantity = quantity + user_shopping_list_items.quantity_to_purchase
  from user_shopping_list_items
  where products.id = user_shopping_list_items.product_id
    and products.user_id = requesting_user_id;

  -- delete all shopping_list_items belonging to the user
  delete from shopping_list_items
  where user_id = requesting_user_id;

  -- return the count of items that were processed
  return v_items_count;
end;
$$;

