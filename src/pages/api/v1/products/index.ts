import type { APIContext } from "astro";

import type { ProductDTO } from "@/types";
import { createProduct } from "@/lib/services/product.service";
import { DuplicateProductError } from "@/lib/services/product.service";
import { createProductSchema } from "@/lib/schemas/product.schema";
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

export async function POST({ request, locals }: APIContext) {
  const supabase = locals.supabase;

  if (!supabase) {
    return createErrorResponse(500, { message: "Supabase client not available" });
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

  const parseResult = createProductSchema.safeParse(payload);
  if (!parseResult.success) {
    const validationErrors = parseResult.error.issues.map((issue) => issue.message);
    return createErrorResponse(400, {
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  try {
    const product = await createProduct({
      supabase,
      userId: DEFAULT_USER_ID,
      payload: parseResult.data,
    });

    const responseBody: ProductDTO = {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      minimum_threshold: product.minimum_threshold,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof DuplicateProductError) {
      return createErrorResponse(409, {
        message: error.message,
      });
    }

    return createErrorResponse(500, {
      message: "Failed to create product",
    });
  }
}
