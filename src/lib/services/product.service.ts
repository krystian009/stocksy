import type { Tables, TablesInsert } from "@/db/database.types";
import type { SupabaseClient } from "@/db/supabase.client";

import type { CreateProductCommand } from "@/types";

export class DuplicateProductError extends Error {
  constructor(message = "Product with the provided name already exists") {
    super(message);
    this.name = "DuplicateProductError";
  }
}

export class ProductNotFoundError extends Error {
  constructor(message = "Product not found") {
    super(message);
    this.name = "ProductNotFoundError";
  }
}

interface CreateProductParams {
  supabase: SupabaseClient;
  userId: string;
  payload: CreateProductCommand;
}

type ProductRow = Tables<"products">;
type ProductInsert = TablesInsert<"products">;

export async function createProduct({ supabase, userId, payload }: CreateProductParams): Promise<ProductRow> {
  if (!userId) {
    throw new Error("User ID is required to create products");
  }

  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Product name is required");
  }

  const { data: existingProduct, error: existingProductError } = await supabase
    .from("products")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", trimmedName)
    .maybeSingle();

  if (existingProductError) {
    throw existingProductError;
  }

  if (existingProduct) {
    throw new DuplicateProductError();
  }

  const insertPayload: ProductInsert = {
    name: trimmedName,
    quantity: payload.quantity,
    minimum_threshold: payload.minimum_threshold,
    user_id: userId,
  };

  const { data, error } = await supabase.from("products").insert(insertPayload).select().single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Product could not be created");
  }

  return data;
}

interface DeleteProductParams {
  supabase: SupabaseClient;
  userId: string;
  productId: string;
}

export async function deleteProduct({ supabase, userId, productId }: DeleteProductParams): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required to delete products");
  }

  if (!productId) {
    throw new Error("Product ID is required to delete products");
  }

  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .match({ id: productId, user_id: userId });

  if (error) {
    throw error;
  }

  if (!count) {
    throw new ProductNotFoundError();
  }
}
