import type { APIContext, APIRoute } from "astro";

import type { UpdateShoppingListItemCommand } from "@/types";
import { updateShoppingListItem } from "@/lib/services/shopping-list.service";
import { updateShoppingListItemSchema } from "@/lib/schemas/shopping-list.schema";

export const prerender = false;

interface ErrorBody {
  message: string;
  errors?: string[];
}

function createErrorResponse(status: number, body: ErrorBody) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * PATCH /api/v1/shopping-list/{id}
 *
 * Updates the quantity to purchase for a specific shopping list item.
 * The endpoint validates the item ID, request body, and ensures the item
 * belongs to the authenticated user before performing the update.
 *
 * @param context - Astro API context containing request, params, and locals
 * @returns Response with updated shopping list item or error
 */
export const PATCH: APIRoute = async ({ params, request, locals }: APIContext) => {
  const supabase = locals.supabase;
  const userId = locals.user?.id;

  // Validate Supabase client availability
  if (!supabase) {
    if (!userId) {
      return createErrorResponse(401, { message: "Unauthorized" });
    }

    return createErrorResponse(500, { message: "Supabase client not available" });
  }

  // Get item ID from path parameter
  const itemId = params.id;
  if (!itemId) {
    return createErrorResponse(400, {
      message: "Item ID is required",
    });
  }

  // Parse and validate request body
  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return createErrorResponse(400, {
      message: "Invalid JSON in request body",
    });
  }

  const validation = updateShoppingListItemSchema.safeParse(requestBody);
  if (!validation.success) {
    const errors = validation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
    return createErrorResponse(400, {
      message: "Validation failed",
      errors,
    });
  }

  const command: UpdateShoppingListItemCommand = validation.data;

  // Update the shopping list item
  try {
    const updatedItem = await updateShoppingListItem({
      supabase,
      userId,
      itemId,
      command,
    });

    return new Response(JSON.stringify(updatedItem), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle "not found" scenario
    if (error instanceof Error && error.message === "Shopping list item not found") {
      return createErrorResponse(404, {
        message: "Shopping list item not found",
      });
    }

    // Handle generic errors
    return createErrorResponse(500, {
      message: "Failed to update shopping list item",
    });
  }
};
