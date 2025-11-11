-- migration: create check_in_shopping_list_item rpc
-- description: provides atomic check-in workflow for shopping list items
-- affected objects: function check_in_shopping_list_item(uuid, uuid)

create or replace function check_in_shopping_list_item(
  item_id uuid,
  requesting_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id uuid;
  v_quantity integer;
begin
  -- lock the target shopping list item to prevent concurrent modifications
  select product_id, quantity_to_purchase
    into v_product_id, v_quantity
  from shopping_list_items
  where id = item_id
    and user_id = requesting_user_id
  for update;

  if not found then
    raise exception
      using
        errcode = 'P0002',
        message = format('Shopping list item %s not found for user %s', item_id, requesting_user_id);
  end if;

  update products
  set quantity = quantity + v_quantity
  where id = v_product_id
    and user_id = requesting_user_id;

  if not found then
    raise exception
      using
        errcode = 'P0002',
        message = format('Product %s not found for user %s', v_product_id, requesting_user_id);
  end if;

  delete from shopping_list_items
  where id = item_id
    and user_id = requesting_user_id;
end;
$$;


