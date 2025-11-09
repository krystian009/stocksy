import type { SupabaseClient } from "@/db/supabase.client";
import type { ShoppingListItemDTO } from "@/types";

interface GetShoppingListParams {
  supabase: SupabaseClient;
  userId: string;
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
  const shoppingListItems: ShoppingListItemDTO[] = data.map((item: any) => {
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
