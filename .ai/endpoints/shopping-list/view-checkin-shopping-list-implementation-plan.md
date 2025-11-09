# API Endpoint Implementation Plan: Check-In Shopping List Item

## 1. Endpoint Overview
This document outlines the implementation plan for the `POST /api/v1/shopping-list/{itemId}/check-in` endpoint. This endpoint facilitates the "check-in" of a purchased shopping list item. Executing this action increases the associated product's inventory quantity by the `quantity_to_purchase` and subsequently removes the item from the shopping list. The entire operation is handled atomically in the database to ensure data integrity.

## 2. Request Details
-   **HTTP Method**: `POST`
-   **URL Structure**: `/api/v1/shopping-list/{itemId}/check-in`
-   **Parameters**:
    -   **Required**:
        -   `itemId` (Path Parameter, UUID): The unique identifier of the shopping list item to check in.
-   **Request Body**: None

## 3. Used Types
-   `SupabaseClient` (`src/db/supabase.client.ts`): The Supabase client type.
-   No Data Transfer Objects (DTOs) or Command Models are required for the request or response.

## 4. Response Details
-   **Success Response**:
    -   **Code**: `204 No Content`
    -   **Payload**: None
-   **Error Responses**:
    -   **Code**: `400 Bad Request`
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found`
    -   **Code**: `500 Internal Server Error`

## 5. Data Flow
1.  A `POST` request is sent to `/api/v1/shopping-list/{itemId}/check-in`.
2.  The Astro middleware validates the user's JWT. If invalid, it returns `401 Unauthorized`.
3.  The API route handler validates that the `itemId` path parameter is a valid UUID. If not, it returns `400 Bad Request`.
4.  The handler retrieves the `supabase` client and authenticated `user` object from `context.locals`.
5.  It calls the `checkInShoppingListItem` function from the `ShoppingListService`, passing the `supabase` client, `user.id`, and `itemId`.
6.  The service function executes a Supabase Remote Procedure Call (RPC) to a custom database function named `check_in_shopping_list_item`.
7.  The `check_in_shopping_list_item` database function performs the following steps atomically:
    a. Finds the `shopping_list_items` record matching both the `itemId` and the `user.id`. If not found, it raises an error.
    b. Retrieves the `product_id` and `quantity_to_purchase` from the item.
    c. Updates the corresponding `products` record, incrementing its `quantity`.
    d. Deletes the `shopping_list_items` record.
8.  If the RPC indicates the item was not found, the service throws a "Not Found" error, which the handler translates to a `404 Not Found` response.
9.  On successful completion of the RPC, the handler returns a `204 No Content` response.

## 6. Security Considerations
-   **Authentication**: The endpoint is protected by middleware, ensuring only authenticated users can access it.
-   **Authorization**: To prevent IDOR vulnerabilities, the business logic is handled by a database RPC that requires both the `itemId` and the authenticated `user_id`. This guarantees that a user can only check in items they own.
-   **Atomicity**: Using a database RPC ensures the multi-step process (update product, delete item) is atomic, preventing partial updates and data inconsistency.

## 7. Performance Considerations
-   The use of a single database RPC is highly performant. It minimizes network latency by bundling multiple database operations into a single round trip and leverages the database's native transaction capabilities.

## 8. Implementation Steps
1.  **Create Database Migration**:
    -   Create a new SQL migration file in `supabase/migrations/`.
    -   In this file, define a new PostgreSQL function `check_in_shopping_list_item(item_id UUID, requesting_user_id UUID)`.
    -   This function should first select the `product_id` and `quantity_to_purchase` from `shopping_list_items` where `id = item_id` AND `user_id = requesting_user_id`. If no record is found, it should raise an exception.
    -   It should then `UPDATE` the `products` table, setting `quantity = quantity + quantity_to_purchase`.
    -   Finally, it should `DELETE` from `shopping_list_items` where `id = item_id`.
2.  **Update Service**: Open `src/lib/services/shopping-list.service.ts`.
3.  **Implement Service Logic**:
    -   Create a new async function `checkInShoppingListItem(supabase: SupabaseClient, userId: string, itemId: string): Promise<void>`.
    -   Inside, call the Supabase RPC: `await supabase.rpc('check_in_shopping_list_item', { item_id: itemId, requesting_user_id: userId })`.
    -   Check the result of the RPC call for errors. If the RPC indicates the item was not found (e.g., by returning null or a specific error code), throw a "Not Found" error.
4.  **Create API Route**: Create the API endpoint file at `src/pages/api/v1/shopping-list/[id]/check-in.ts`.
5.  **Implement Route Handler**:
    -   In the new file, export `export const prerender = false;`.
    -   Define the `POST` handler: `export const POST: APIRoute = async ({ params, context }) => { ... };`.
    -   Validate `params.id` as a UUID. If invalid, return a `400` response.
    -   Retrieve the `user` from `context.locals`. If not present, return `401`.
    -   Call the `checkInShoppingListItem` service function inside a `try...catch` block.
    -   In the `catch` block, check for the "Not Found" error to return `404`, and handle any other errors with `500`.
    -   On success, return a `new Response(null, { status: 204 })`.
