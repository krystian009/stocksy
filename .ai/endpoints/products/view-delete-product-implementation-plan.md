# API Endpoint Implementation Plan: Delete Product

## 1. Endpoint Overview
This document outlines the implementation plan for the `DELETE /api/v1/products/{productId}` endpoint. This endpoint allows an authenticated user to permanently delete one of their products from the inventory. The operation is idempotent; deleting a non-existent resource will result in a `404 Not Found` error.

## 2. Request Details
-   **HTTP Method**: `DELETE`
-   **URL Structure**: `/api/v1/products/{productId}`
-   **Parameters**:
    -   **Required (Path)**: `productId` (`uuid`) - The ID of the product to be deleted.
-   **Request Body**: None.

## 3. Used Types
-   None. This endpoint does not use any DTOs or Command Models for its request or response.

## 4. Response Details
-   **Success (`204 No Content`)**:
    An empty response body, indicating that the product was successfully deleted.
-   **Error**:
    Returns a standardized JSON error object.
    ```json
    { "message": "Error description" }
    ```

## 5. Data Flow
1.  A `DELETE` request is sent to `/api/v1/products/{productId}`.
2.  Astro middleware validates the user's session and populates `context.locals`.
3.  The `DELETE` handler in `src/pages/api/v1/products/[id].ts` is invoked.
4.  The handler validates the user's session, returning `401 Unauthorized` if it's missing.
5.  It validates that the `productId` from the path parameter is a valid UUID, returning `400 Bad Request` if not.
6.  The handler calls the `ProductService.deleteProduct` method, passing the `supabase` client, `user.id`, and `productId`.
7.  The `ProductService` executes a `delete` operation on the `products` table, matching on both `id` and `user_id`.
8.  The service checks the result of the delete operation. If no rows were affected, it means the product was not found for that user, and it throws a `NotFoundError`.
9.  The handler catches the `NotFoundError` and returns a `404 Not Found` response.
10. If the service call completes without error, the handler returns a `204 No Content` response.

## 6. Security Considerations
-   **Authentication**: All requests must be authenticated. The Astro middleware enforces this.
-   **Authorization / IDOR Prevention**: The critical security measure is to prevent an Insecure Direct Object Reference (IDOR) attack. The `ProductService` **must** ensure data tenancy by including the `user_id` from the secure session in the `match` clause of the delete query (`.delete().match({ id: productId, user_id: userId })`). This guarantees that a user can only delete products they own.
-   **Input Validation**: The route handler must validate that the `productId` is a proper UUID to prevent malformed queries or potential injection attempts, even with the ORM's protection.

## 7. Error Handling
-   **`400 Bad Request`**: Returned if the `productId` path parameter is not a valid UUID.
-   **`401 Unauthorized`**: Returned if the request lacks a valid authentication token.
-   **`404 Not Found`**: Returned if the `productId` does not exist or does not belong to the authenticated user.
-   **`500 Internal Server Error`**: Returned for any unexpected database failures during the deletion process.

## 8. Performance Considerations
-   **Database Indexing**: The `DELETE` operation will use the primary key index on the `id` column, making it highly performant. The additional `user_id` filter will also be efficient if indexed. No performance issues are anticipated.
-   **Cascading Deletes**: The database schema specifies `ON DELETE CASCADE` for related `shopping_list_items` and `inventory_logs`. This is efficient at the database level but means a single `DELETE` request can trigger multiple related row deletions. This is expected behavior and not a performance concern under normal load.

## 9. Implementation Steps
1.  **Update Product Service**:
    -   Open `src/lib/services/product.service.ts`.
    -   Implement an async `deleteProduct` function that accepts `supabase`, `userId`, and `productId`.
    -   Inside the function:
        a. Execute the delete query: `supabase.from('products').delete().match({ id: productId, user_id: userId })`.
        b. Check the `count` of the returned data from the query. If the count is 0, throw a `NotFoundError`.

2.  **Implement API Route Handler**:
    -   Open the file: `src/pages/api/v1/products/[id].ts`.
    -   Implement the `DELETE({ params, context })` handler function.
    -   In the `DELETE` handler:
        a. Retrieve the user session; return `401` if not found.
        b. Validate that `params.id` is a valid UUID; return `400` if not.
        c. Call `ProductService.deleteProduct` within a `try...catch` block.
        d. In the `catch` block, check for `NotFoundError` and return a `404` status. For any other error, return `500`.
        e. If the `try` block completes successfully, return a `204` status.
