# API Endpoint Implementation Plan: Get Shopping List

## 1. Endpoint Overview
This document outlines the implementation plan for the `GET /api/v1/shopping-list` endpoint. The endpoint retrieves all items from an authenticated user's shopping list. These items represent products that have fallen below their configured minimum stock threshold and require replenishment. The response includes details from both the `shopping_list_items` and `products` tables.

## 2. Request Details
-   **HTTP Method**: `GET`
-   **URL Structure**: `/api/v1/shopping-list`
-   **Parameters**:
    -   Required: None
    -   Optional: None
-   **Request Body**: None

## 3. Used Types
The implementation will use the following existing types defined in `src/types.ts`:
-   `ShoppingListItemDTO`: Represents a single item in the shopping list, combining data from `shopping_list_items` and `products`.
-   `ShoppingListResponseDTO`: Defines the structure of the successful response payload.
-   `SupabaseClient`: The Supabase client type from `src/db/supabase.client.ts`.

## 4. Response Details
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**: `ShoppingListResponseDTO`
    ```json
    {
      "data": [
        {
          "id": "e8a9b1c2-d3e4-f5a6-b7c8-d9e0f1a2b3c4",
          "product_id": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
          "product_name": "Organic Almonds",
          "quantity_to_purchase": 10
        }
      ]
    }
    ```
-   **Error Responses**:
    -   **Code**: `401 Unauthorized`
    -   **Code**: `500 Internal Server Error`

## 5. Data Flow
1.  A `GET` request is sent to `/api/v1/shopping-list`.
2.  The Astro middleware intercepts the request and validates the user's JWT from Supabase. If invalid, it rejects the request with a `401 Unauthorized` error.
3.  The API route handler retrieves the `supabase` client and authenticated `user` object from `context.locals`.
4.  The handler calls the `getShoppingListForUser` function from the `ShoppingListService`, passing the `supabase` client and the `user.id`.
5.  The `ShoppingListService` executes a database query to select all records from `shopping_list_items` that match the `user.id`.
6.  The query performs an `INNER JOIN` on the `products` table using `product_id` to fetch the corresponding `product_name`.
7.  The service maps the query result to an array of `ShoppingListItemDTO`.
8.  The handler receives the DTO array, wraps it in a `ShoppingListResponseDTO` object, and returns it to the client with a `200 OK` status.

## 6. Security Considerations
-   **Authentication**: The endpoint is protected. All requests must include a valid JWT issued by Supabase. The middleware is responsible for this check.
-   **Authorization**: Data access is restricted to the owner of the shopping list. The service-layer query will explicitly filter by the authenticated user's ID. As a primary enforcement mechanism, a Supabase Row-Level Security (RLS) policy must be in place on the `shopping_list_items` table to ensure a user can only read their own rows.

## 7. Performance Considerations
-   **Database Query**: The primary performance factor is the database join between `shopping_list_items` and `products`.
-   **Indexing**: To ensure the query is performant, indexes should be confirmed on the following foreign key columns:
    -   `shopping_list_items(user_id)`
    -   `shopping_list_items(product_id)`
    -   `products(id)` (already a primary key, so indexed by default)

## 8. Implementation Steps
1.  **Create Service File**: Create a new file at `src/lib/services/shopping-list.service.ts`.
2.  **Implement Service Logic**:
    -   In `shopping-list.service.ts`, create an async function `getShoppingListForUser(supabase: SupabaseClient, userId: string): Promise<ShoppingListItemDTO[]>`.
    -   Inside this function, build a Supabase query to select `id`, `product_id`, `quantity_to_purchase` from `shopping_list_items` and `name` from `products`.
    -   Alias the `products.name` column to `product_name` to match the `ShoppingListItemDTO`.
    -   Use `.eq('user_id', userId)` to filter the results for the current user.
    -   Join with the `products` table where `shopping_list_items.product_id` equals `products.id`.
    -   Add error handling to catch and log any database errors.
3.  **Create API Route**: Create the API endpoint file at `src/pages/api/v1/shopping-list/index.ts`.
4.  **Implement Route Handler**:
    -   In `index.ts`, export `export const prerender = false;`.
    -   Define the `GET` handler: `export const GET: APIRoute = async ({ context }) => { ... };`.
    -   Retrieve `supabase` and `session` from `context.locals`. If `session` or `session.user` is null, return a `401 Unauthorized` response.
    -   Call the `getShoppingListForUser` service function with the `supabase` client and `session.user.id`.
    -   Wrap the returned data in the `ShoppingListResponseDTO` structure.
    -   Return a `new Response` with the JSON-serialized data and a `200` status.
    -   Wrap the logic in a `try...catch` block to handle potential errors from the service and return a `500 Internal Server Error` response.
