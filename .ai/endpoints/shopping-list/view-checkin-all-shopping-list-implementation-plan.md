# API Endpoint Implementation Plan: Check-In All Shopping List Items

## 1. Endpoint Overview
This document details the implementation plan for the `POST /api/v1/shopping-list/check-in` endpoint. This endpoint provides a bulk operation to mark all items on an authenticated user's shopping list as purchased. The action atomically updates the inventory for each corresponding product and clears the user's shopping list.

## 2. Request Details
-   **HTTP Method**: `POST`
-   **URL Structure**: `/api/v1/shopping-list/check-in`
-   **Parameters**: None
-   **Request Body**: None

## 3. Used Types
-   `SupabaseClient` (`src/db/supabase.client.ts`): The Supabase client type.
-   No Data Transfer Objects (DTOs) or Command Models are required.

## 4. Response Details
-   **Success Response**:
    -   **Code**: `204 No Content`
    -   **Payload**: None
-   **Error Responses**:
    -   **Code**: `401 Unauthorized`
    -   **Code**: `404 Not Found` (If the shopping list is empty)
    -   **Code**: `500 Internal Server Error`

## 5. Data Flow
1.  A `POST` request is sent to `/api/v1/shopping-list/check-in`.
2.  Astro middleware validates the user's JWT and returns `401` if invalid.
3.  The API route handler retrieves the authenticated `user` from `context.locals`.
4.  The handler calls the `checkInAllShoppingListItems` function from the `ShoppingListService`, passing the `supabase` client and the `user.id`.
5.  The service function executes a Supabase RPC to a database function named `check_in_all_shopping_list_items`, passing the `user.id`.
6.  The `check_in_all_shopping_list_items` database function performs the following steps within a single transaction:
    a. Finds all `shopping_list_items` for the given `user_id`. If none exist, it returns a status indicating zero items were processed.
    b. For each item, it updates the quantity of the corresponding product in the `products` table.
    c. It deletes all `shopping_list_items` belonging to the user.
7.  The service layer inspects the RPC result. If zero items were processed, it throws a "Not Found" error.
8.  The handler catches the "Not Found" error and returns a `404 Not Found` response.
9.  On successful RPC execution for one or more items, the handler returns a `204 No Content` response.

## 6. Security Considerations
-   **Authentication**: The endpoint is protected by middleware, ensuring it is only accessible by authenticated users.
-   **Authorization**: The entire operation is scoped to the authenticated user by passing the `user_id` to the database RPC, which enforces this scoping in all its queries. This prevents any cross-user data modification.
-   **Atomicity**: Using a single RPC ensures that the entire bulk operation is atomic. Either all product quantities are updated and the list is cleared, or the entire transaction is rolled back on failure, preventing data inconsistency.

## 7. Performance Considerations
-   This approach is highly performant. A single round trip to the database executes all required logic, minimizing network overhead and leveraging the efficiency of the PostgreSQL engine for bulk operations.

## 8. Implementation Steps
1.  **Create Database Migration**:
    -   Create a new SQL migration file.
    -   Define a new PostgreSQL function `check_in_all_shopping_list_items(requesting_user_id UUID) returns int`. This function will return the count of items processed.
    -   The function logic should:
        1.  Use a CTE to select all `shopping_list_items` for the `requesting_user_id`.
        2.  `UPDATE` the `products` table by joining against the CTE.
        3.  `DELETE` from `shopping_list_items` where `user_id = requesting_user_id`.
        4.  Return the count of items that were processed.
2.  **Update Service**: Open `src/lib/services/shopping-list.service.ts`.
3.  **Implement Service Logic**:
    -   Create a new async function `checkInAllShoppingListItems(supabase: SupabaseClient, userId: string): Promise<void>`.
    -   Inside, call the RPC: `const { data, error } = await supabase.rpc('check_in_all_shopping_list_items', { requesting_user_id: userId })`.
    -   Handle any `error`.
    -   If `data` is `0`, throw a "Not Found" error to signify an empty list.
4.  **Create API Route**: Create the file `src/pages/api/v1/shopping-list/check-in.ts`.
5.  **Implement Route Handler**:
    -   Export `export const prerender = false;`.
    -   Define the `POST` handler `POST: APIRoute = async ({ context }) => { ... };`.
    -   Retrieve the `user` from `context.locals`, returning `401` if not authenticated.
    -   Call the `checkInAllShoppingListItems` service function within a `try...catch` block.
    -   In the `catch` block, specifically handle the "Not Found" error by returning `404`, and all other errors with `500`.
    -   On success, return a `204 No Content` response.
