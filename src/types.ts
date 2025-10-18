/**
 * Data Transfer Objects (DTOs) and Command Models for Stocksy API
 *
 * This file contains type definitions for all API request/response payloads.
 * All types are derived from database entity definitions to ensure type safety
 * and consistency between the database schema and API contracts.
 */

import type { Tables } from "./db/database.types";

// ============================================================================
// Product DTOs and Command Models
// ============================================================================

/**
 * Product Data Transfer Object
 *
 * Represents a product entity as returned by the API.
 * Uses Pick (whitelist) to explicitly define exposed fields - safer than Omit (blacklist).
 *
 * ⚠️ Note: Changes to the products table may require updating this type.
 */
export type ProductDTO = Pick<Tables<"products">, "id" | "name" | "quantity" | "minimum_threshold">;

/**
 * Create Product Command
 *
 * Command model for creating a new product.
 * All fields are required as per API validation rules.
 */
export interface CreateProductCommand {
  name: string;
  quantity: number;
  minimum_threshold: number;
}

/**
 * Update Product Command
 *
 * Command model for updating an existing product.
 * All fields are optional - only provided fields will be updated.
 */
export type UpdateProductCommand = Partial<Pick<Tables<"products">, "name" | "quantity" | "minimum_threshold">>;

/**
 * Pagination Metadata
 *
 * Metadata object included in paginated list responses.
 */
export interface PaginationMetaDTO {
  total_items: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

/**
 * Products List Response
 *
 * Response structure for GET /api/v1/products endpoint.
 * Includes paginated product data and pagination metadata.
 */
export interface ProductsListResponseDTO {
  data: ProductDTO[];
  meta: PaginationMetaDTO;
}

// ============================================================================
// Shopping List DTOs and Command Models
// ============================================================================

/**
 * Shopping List Item Data Transfer Object
 *
 * Represents a shopping list item as returned by the API.
 * Uses Pick (whitelist) to explicitly define exposed fields - safer than Omit (blacklist).
 * Augmented with product_name from joined products table.
 *
 * ⚠️ Note: Changes to the shopping_list_items table may require updating this type.
 */
export type ShoppingListItemDTO = Pick<Tables<"shopping_list_items">, "id" | "product_id" | "quantity_to_purchase"> & {
  product_name: string;
};

/**
 * Shopping List Response
 *
 * Response structure for GET /api/v1/shopping-list endpoint.
 * Contains all shopping list items for the authenticated user.
 */
export interface ShoppingListResponseDTO {
  data: ShoppingListItemDTO[];
}

/**
 * Update Shopping List Item Command
 *
 * Command model for updating a shopping list item's quantity to purchase.
 * The quantity_to_purchase field is required for this operation.
 */
export interface UpdateShoppingListItemCommand {
  quantity_to_purchase: number;
}

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Products List Query Parameters
 *
 * Query parameters for the GET /api/v1/products endpoint.
 * Used for pagination, sorting, and filtering.
 */
export interface ProductsListQueryParams {
  page?: number;
  limit?: number;
  sort?: "name" | "quantity";
  order?: "asc" | "desc";
}
