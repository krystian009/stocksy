import type { SupabaseClient } from "@/db/supabase.client";
import type { ShoppingListItemDTO, UpdateShoppingListItemCommand } from "@/types";

interface GetShoppingListParams {
  supabase: SupabaseClient;
  userId: string;
}

interface UpdateShoppingListItemParams {
  supabase: SupabaseClient;
  userId: string;
  itemId: string;
  command: UpdateShoppingListItemCommand;
}

interface ShoppingListItemWithProduct {
  id: string;
  product_id: string;
  quantity_to_purchase: number;
  products: {
    name: string;
  };
}

/**
 * Retrieves all shopping list items for a specific user.
 *
 * This function queries the shopping_list_items table joined with the products table
 * to fetch complete shopping list item information including the product name.
 *
 * @param params - Object containing the Supabase client and user ID
 * @param params.supabase - The Supabase client instance
 * @param params.userId - The authenticated user's ID
 * @returns Promise resolving to an array of ShoppingListItemDTO objects
 * @throws Error if userId is missing or if database query fails
 */
export async function getShoppingListForUser({
  supabase,
  userId,
}: GetShoppingListParams): Promise<ShoppingListItemDTO[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch shopping list");
  }

  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("id, product_id, quantity_to_purchase, products!inner(name)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Map the query result to ShoppingListItemDTO format
  // The products relation is nested as a single object (not array) due to foreign key relationship

  const shoppingListItems: ShoppingListItemDTO[] = data.map((item: ShoppingListItemWithProduct) => {
    // Supabase returns the joined products table as a nested object
    const product = item.products;
    if (!product || typeof product !== "object" || !("name" in product)) {
      throw new Error(`Product not found for shopping list item ${item.id}`);
    }

    return {
      id: item.id,
      product_id: item.product_id,
      quantity_to_purchase: item.quantity_to_purchase,
      product_name: product.name as string,
    };
  });

  return shoppingListItems;
}

/**
 * Updates the quantity to purchase for a specific shopping list item.
 *
 * This function updates a shopping list item's quantity_to_purchase field
 * and returns the updated item with product information. It enforces
 * authorization by ensuring the item belongs to the specified user.
 *
 * @param params - Object containing the Supabase client, user ID, item ID, and update command
 * @param params.supabase - The Supabase client instance
 * @param params.userId - The authenticated user's ID
 * @param params.itemId - The UUID of the shopping list item to update
 * @param params.command - The update command containing the new quantity_to_purchase
 * @returns Promise resolving to the updated ShoppingListItemDTO
 * @throws Error if the item is not found or doesn't belong to the user
 * @throws Error if the database operation fails
 */
export async function updateShoppingListItem({
  supabase,
  userId,
  itemId,
  command,
}: UpdateShoppingListItemParams): Promise<ShoppingListItemDTO> {
  // Validate required parameters
  if (!userId) {
    throw new Error("User ID is required to update shopping list item");
  }

  if (!itemId) {
    throw new Error("Item ID is required to update shopping list item");
  }

  // Perform the update operation with authorization check
  // The match ensures we only update items that belong to this user (IDOR prevention)
  // Using .select() after .update() returns the updated row(s) to verify the operation affected rows
  const { data: updateData, error: updateError } = await supabase
    .from("shopping_list_items")
    .update({ quantity_to_purchase: command.quantity_to_purchase })
    .match({ id: itemId, user_id: userId })
    .select();

  if (updateError) {
    throw updateError;
  }

  // Check if any rows were affected by the update
  if (!updateData || updateData.length === 0) {
    throw new Error("Shopping list item not found");
  }

  // Fetch the updated item with product information
  const { data, error: selectError } = await supabase
    .from("shopping_list_items")
    .select("id, product_id, quantity_to_purchase, products!inner(name)")
    .eq("id", itemId)
    .single();

  if (selectError) {
    throw selectError;
  }

  if (!data) {
    throw new Error("Shopping list item not found");
  }

  // Type assertion for the query result
  const item = data as ShoppingListItemWithProduct;
  const product = item.products;

  if (!product || typeof product !== "object" || !("name" in product)) {
    throw new Error(`Product not found for shopping list item ${item.id}`);
  }

  // Return the updated item as DTO
  return {
    id: item.id,
    product_id: item.product_id,
    quantity_to_purchase: item.quantity_to_purchase,
    product_name: product.name as string,
  };
}
