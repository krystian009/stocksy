import type { APIContext } from "astro";

import type { ShoppingListResponseDTO } from "@/types";
import { getShoppingListForUser } from "@/lib/services/shopping-list.service";

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
 * GET /api/v1/shopping-list
 *
 * Retrieves all shopping list items for the user.
 * Shopping list items represent products that have fallen below their
 * configured minimum stock threshold and require replenishment.
 *
 * @param context - Astro API context containing request and locals
 * @returns Response with shopping list items or error
 */
export async function GET({ locals }: APIContext) {
  const supabase = locals.supabase;
  const userId = locals.user?.id;

  if (!supabase) {
    return createErrorResponse(500, { message: "Supabase client not available" });
  }

  if (!userId) {
    return createErrorResponse(401, { message: "Unauthorized" });
  }

  try {
    const shoppingListItems = await getShoppingListForUser({
      supabase,
      userId,
    });

    const response: ShoppingListResponseDTO = {
      data: shoppingListItems,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return createErrorResponse(500, {
      message: "Failed to fetch shopping list",
    });
  }
}
