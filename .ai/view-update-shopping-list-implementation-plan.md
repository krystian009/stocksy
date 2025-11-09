# API Endpoint Implementation Plan: Update Shopping List Item

## 1. Endpoint Overview
This document specifies the implementation plan for the `PATCH /api/v1/shopping-list/{itemId}` endpoint. Its purpose is to allow an authenticated user to update the `quantity_to_purchase` of a specific item on their shopping list. The endpoint validates the input, updates the database record, and returns the modified item.

## 2. Request Details
-   **HTTP Method**: `PATCH`
-   **URL Structure**: `/api/v1/shopping-list/{itemId}`
-   **Parameters**:
    -   **Required**:
        -   `itemId` (Path Parameter, UUID): The unique identifier of the shopping list item to update.
-   **Request Body**:
    -   **Required**: `UpdateShoppingListItemCommand`
    ```json
    {
      "quantity_to_purchase": 20
    }
    ```

## 3. Used Types
-   `UpdateShoppingListItemCommand` (`src/types.ts`): Models the request body.
-   `ShoppingListItemDTO` (`src/types.ts`): Defines the structure of the successful response payload.
-   `SupabaseClient` (`src/db/supabase.client.ts`): The Supabase client type.

## 4. Response Details
-   **Success Response**:
    -   **Code**: `200 OK`
    -   **Payload**: The updated `ShoppingListItemDTO`.
    ```json
    {
      "id": "e8a9b1c2-d3e4-f5a6-b7c8-d9e0f1a2b3c4",
      "product_id": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
      "product_name": "Organic Almonds",
      "quantity_to_purchase": 20
    }
    ```
-   **Error Responses**:
    -   **Code**: `400 Bad Request`
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found`
    -   **Code**: `500 Internal Server Error`

## 5. Data Flow
1.  A `PATCH` request is sent to `/api/v1/shopping-list/{itemId}` with the quantity in the request body.
2.  The Astro middleware validates the user's JWT. If invalid, it returns `401 Unauthorized`.
3.  The API route handler validates that the `itemId` path parameter is a valid UUID. If not, it returns `400 Bad Request`.
4.  The handler parses and validates the request body using the `updateShoppingListItemSchema`. If validation fails, it returns `400 Bad Request`.
5.  The handler retrieves the `supabase` client and `user` object from `context.locals`.
6.  It calls the `updateShoppingListItem` function from the `ShoppingListService`, passing the `supabase` client, `user.id`, `itemId`, and the validated request body.
7.  The service executes a Supabase query to update the `shopping_list_items` record. The query's `where` clause matches both `id` (the `itemId`) and `user_id` to ensure authorization.
8.  The service checks if the update was successful. If no rows were affected, it throws a "Not Found" error, which the handler catches and translates to a `404 Not Found` response.
9.  If the update succeeds, the service performs a follow-up query to fetch the complete updated item (including the joined `product_name`) and returns it as a `ShoppingListItemDTO`.
10. The handler receives the DTO and returns it to the client with a `200 OK` status.

## 6. Security Considerations
-   **Authentication**: Endpoint access is restricted to authenticated users via middleware that checks for a valid Supabase JWT.
-   **Authorization**: To prevent IDOR attacks, the service layer *must* ensure that the database update operation targets a record matching both the provided `itemId` and the `user_id` from the authenticated session. Supabase RLS policies on the `shopping_list_items` table for `update` operations will serve as the primary security enforcement.
-   **Input Validation**: The `itemId` is validated as a UUID, and the request body is strictly validated by a Zod schema to prevent invalid or malicious data from being processed.

## 7. Performance Considerations
-   The operation involves two database queries: an `update` and a `select`.
-   To ensure efficiency, the `where` clause of the update query relies on the primary key (`id`) and the `user_id` column. An index on `(user_id, id)` on the `shopping_list_items` table is beneficial.

## 8. Implementation Steps
1.  **Create Schema File**: Create a new file at `src/lib/schemas/shopping-list.schema.ts`.
2.  **Define Validation Schema**: In the new file, define and export `updateShoppingListItemSchema` using Zod. It should validate an object with a single key, `quantity_to_purchase`, which must be a positive integer (`z.number().int().positive()`).
3.  **Update Service**: Open `src/lib/services/shopping-list.service.ts`.
4.  **Implement Service Logic**:
    -   Create a new async function `updateShoppingListItem(supabase: SupabaseClient, userId: string, itemId: string, command: UpdateShoppingListItemCommand): Promise<ShoppingListItemDTO>`.
    -   Inside, perform a Supabase `update` on `shopping_list_items` setting the `quantity_to_purchase`. The query must use `.match({ id: itemId, user_id: userId })`.
    -   Check if the update query returns an error or if the `data` is null/empty. If so, throw a "Not Found" error.
    -   After the update, perform a `select` query to get the updated item, joining with `products` to get the `name` (aliased as `product_name`). This query should also be filtered by `id: itemId`.
    -   Return the result as a `ShoppingListItemDTO`.
5.  **Create API Route**: Create the API endpoint file at `src/pages/api/v1/shopping-list/[id].ts`.
6.  **Implement Route Handler**:
    -   In `[id].ts`, export `export const prerender = false;`.
    -   Define the `PATCH` handler: `export const PATCH: APIRoute = async ({ params, request, context }) => { ... };`.
    -   Validate `params.id` as a UUID.
    -   Retrieve and validate the request body using `updateShoppingListItemSchema`.
    -   Retrieve the `user` from `context.locals`. Handle the case where the user is not authenticated.
    -   Call the `updateShoppingListItem` service function.
    -   Wrap the call in a `try...catch` block. Catch specific "Not Found" errors to return `404`, and catch generic errors to return `500`.
    -   On success, return a `200 OK` response with the DTO from the service.
