import type { APIContext } from "astro";

import { deleteProduct, ProductNotFoundError } from "@/lib/services/product.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

export const prerender = false;

interface ErrorBody {
  message: string;
}

function createErrorResponse(status: number, body: ErrorBody) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE({ params, locals }: APIContext) {
  const supabase = locals.supabase;

  if (!supabase) {
    return createErrorResponse(500, { message: "Supabase client not available" });
  }

  const productId = params?.id;

  if (!productId) {
    return createErrorResponse(400, { message: "Product ID is required" });
  }

  try {
    await deleteProduct({
      supabase,
      userId: DEFAULT_USER_ID,
      productId,
    });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return createErrorResponse(404, { message: error.message });
    }

    return createErrorResponse(500, { message: "Failed to delete product" });
  }

  return new Response(null, { status: 204 });
}
