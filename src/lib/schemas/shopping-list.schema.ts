import { z } from "zod";

/**
 * Validation schema for updating a shopping list item.
 *
 * Validates that the quantity_to_purchase is a positive integer.
 * This ensures that only valid, meaningful quantities can be set
 * for items on the shopping list.
 */
export const updateShoppingListItemSchema = z.object({
  quantity_to_purchase: z
    .number({
      required_error: "quantity_to_purchase is required",
      invalid_type_error: "quantity_to_purchase must be a number",
    })
    .int("quantity_to_purchase must be an integer")
    .positive("quantity_to_purchase must be a positive number"),
});
