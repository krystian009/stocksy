import type { APIContext, APIRoute } from "astro";
import { z } from "zod";

import { checkInShoppingListItem } from "@/lib/services/shopping-list.service";

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

const pathParamsSchema = z.object({
  id: z.string().uuid(),
});

/**
 * POST /api/v1/shopping-list/{id}/check-in
 *
 * Finalizes a shopping list item after purchase by incrementing the associated product's
 * inventory quantity and removing the item from the shopping list. The underlying database
 * routine performs the update and deletion atomically to avoid partial state.
 *
 * @param context - Astro API context containing params and locals
 * @returns Response with 204 No Content on success or an appropriate error response
 */
export const POST: APIRoute = async ({ params, locals }: APIContext) => {
  const supabase = locals.supabase;
  const userId = locals.user?.id;

  if (!supabase) {
    return createErrorResponse(500, { message: "Supabase client not available" });
  }

  if (!userId) {
    return createErrorResponse(401, { message: "Unauthorized" });
  }

  const parseResult = pathParamsSchema.safeParse(params);
  if (!parseResult.success) {
    return createErrorResponse(400, {
      message: "Validation failed",
      errors: parseResult.error.issues.map((issue) => issue.message),
    });
  }

  const itemId = parseResult.data.id;

  try {
    await checkInShoppingListItem({
      supabase,
      userId,
      itemId,
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Shopping list item not found") {
      return createErrorResponse(404, { message: "Shopping list item not found" });
    }

    return createErrorResponse(500, { message: "Failed to check in shopping list item" });
  }
};
