import type { APIContext } from "astro";

import type { ShoppingListResponseDTO } from "@/types";
import { getShoppingListForUser } from "@/lib/services/shopping-list.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

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

  if (!supabase) {
    return createErrorResponse(500, { message: "Supabase client not available" });
  }

  try {
    const shoppingListItems = await getShoppingListForUser({
      supabase,
      userId: DEFAULT_USER_ID,
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
