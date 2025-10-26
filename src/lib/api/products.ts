import type {
  CreateProductCommand,
  ProductDTO,
  ProductsListQueryParams,
  ProductsListResponseDTO,
  UpdateProductCommand,
} from "@/types";

const PRODUCTS_BASE_PATH = "/api/v1/products";

function buildQueryString(params: ProductsListQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.order) {
    searchParams.set("order", params.order);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function parseError(response: Response): Promise<Error> {
  let message = `Request failed with status ${response.status}`;
  let details: string | undefined;

  try {
    const data = (await response.json()) as { message?: string; errors?: string[] };
    if (data.message) {
      message = data.message;
    }

    if (data.errors?.length) {
      details = data.errors.join(", ");
    }
  } catch (error) {
    if (error instanceof Error) {
      details = error.message;
    }
  }

  if (details) {
    message = `${message}: ${details}`;
  }

  return new Error(message);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    const data = (await response.json()) as T;
    return data;
  }

  throw await parseError(response);
}

export async function getProducts(params: ProductsListQueryParams = {}): Promise<ProductsListResponseDTO> {
  const query = buildQueryString(params);
  const response = await fetch(`${PRODUCTS_BASE_PATH}${query}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return handleResponse<ProductsListResponseDTO>(response);
}

export async function createProduct(payload: CreateProductCommand): Promise<ProductDTO> {
  const response = await fetch(PRODUCTS_BASE_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ProductDTO>(response);
}

export async function updateProduct(id: string, payload: UpdateProductCommand): Promise<ProductDTO> {
  if (!id) {
    throw new Error("Product ID is required to update a product");
  }

  const response = await fetch(`${PRODUCTS_BASE_PATH}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ProductDTO>(response);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!id) {
    throw new Error("Product ID is required to delete a product");
  }

  const response = await fetch(`${PRODUCTS_BASE_PATH}/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  await handleResponse<undefined>(response);
}
