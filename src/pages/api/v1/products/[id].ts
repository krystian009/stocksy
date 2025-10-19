import type { APIContext } from "astro";

import {
  deleteProduct,
  ProductNotFoundError,
  updateProduct,
  DuplicateProductError,
} from "@/lib/services/product.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import type { ProductDTO } from "@/types";
import { updateProductSchema } from "@/lib/schemas/product.schema";

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

export async function PATCH({ params, request, locals }: APIContext) {
  const supabase = locals.supabase;

  if (!supabase) {
    return createErrorResponse(500, { message: "Supabase client not available" });
  }

  const productId = params?.id;

  if (!productId) {
    return createErrorResponse(400, { message: "Product ID is required" });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return createErrorResponse(400, {
      message: "Invalid JSON payload",
      errors: [error instanceof Error ? error.message : "Unexpected error"],
    });
  }

  const parseResult = updateProductSchema.safeParse(payload);

  if (!parseResult.success) {
    return createErrorResponse(400, {
      message: "Validation failed",
      errors: parseResult.error.issues.map((issue) => issue.message),
    });
  }

  try {
    const product = await updateProduct({
      supabase,
      userId: DEFAULT_USER_ID,
      productId,
      payload: parseResult.data,
    });

    const responseBody: ProductDTO = {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      minimum_threshold: product.minimum_threshold,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof DuplicateProductError) {
      return createErrorResponse(409, { message: error.message });
    }

    if (error instanceof ProductNotFoundError) {
      return createErrorResponse(404, { message: error.message });
    }

    return createErrorResponse(500, { message: "Failed to update product" });
  }
}
