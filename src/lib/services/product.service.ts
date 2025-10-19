import type { Tables, TablesInsert } from "@/db/database.types";
import type { SupabaseClient } from "@/db/supabase.client";

import type {
  CreateProductCommand,
  UpdateProductCommand,
  ProductsListQueryParams,
  ProductsListResponseDTO,
} from "@/types";

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

interface UpdateProductParams {
  supabase: SupabaseClient;
  userId: string;
  productId: string;
  payload: UpdateProductCommand;
}

export async function updateProduct({
  supabase,
  userId,
  productId,
  payload,
}: UpdateProductParams): Promise<ProductRow> {
  if (!userId) {
    throw new Error("User ID is required to update products");
  }

  if (!productId) {
    throw new Error("Product ID is required to update products");
  }

  if (payload.name) {
    const trimmedName = payload.name.trim();
    if (!trimmedName) {
      throw new Error("Product name cannot be empty");
    }

    const { data: conflictProduct, error: conflictError } = await supabase
      .from("products")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", trimmedName)
      .neq("id", productId)
      .maybeSingle();

    if (conflictError) {
      throw conflictError;
    }

    if (conflictProduct) {
      throw new DuplicateProductError();
    }

    payload = {
      ...payload,
      name: trimmedName,
    };
  }

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .match({ id: productId, user_id: userId })
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new ProductNotFoundError();
    }

    throw error;
  }

  if (!data) {
    throw new ProductNotFoundError();
  }

  return data;
}

interface GetProductsParams {
  supabase: SupabaseClient;
  userId: string;
  query: ProductsListQueryParams;
}

export async function getProducts({ supabase, userId, query }: GetProductsParams): Promise<ProductsListResponseDTO> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const sort = query.sort ?? "name";
  const order = query.order ?? "asc";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [countResult, dataResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("products")
      .select("id, name, quantity, minimum_threshold")
      .eq("user_id", userId)
      .order(sort, { ascending: order === "asc" })
      .range(from, to),
  ]);

  if (countResult.error) {
    throw countResult.error;
  }

  if (dataResult.error) {
    throw dataResult.error;
  }

  const totalItems = countResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    data: dataResult.data ?? [],
    meta: {
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page,
      per_page: limit,
    },
  };
}
