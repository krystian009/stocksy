import type { APIContext, APIRoute } from "astro";

import { checkInAllShoppingListItems } from "@/lib/services/shopping-list.service";

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
 * POST /api/v1/shopping-list/check-in
 *
 * Finalizes all shopping list items after purchase by incrementing the associated products'
 * inventory quantities and clearing the shopping list. The underlying database routine
 * performs all updates and deletions atomically to avoid partial state.
 *
 * @param context - Astro API context containing locals
 * @returns Response with 204 No Content on success or an appropriate error response
 */
export const POST: APIRoute = async ({ locals }: APIContext) => {
  const supabase = locals.supabase;
  const userId = locals.user?.id;

  if (!supabase) {
    return createErrorResponse(500, { message: "Supabase client not available" });
  }

  if (!userId) {
    return createErrorResponse(401, { message: "Unauthorized" });
  }

  try {
    await checkInAllShoppingListItems({
      supabase,
      userId,
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    // Handle "Not Found" error (empty shopping list)
    if (error instanceof Error && error.message === "Shopping list is empty") {
      return createErrorResponse(404, { message: "Shopping list is empty" });
    }

    // Handle all other errors
    return createErrorResponse(500, { message: "Failed to check in all shopping list items" });
  }
};
