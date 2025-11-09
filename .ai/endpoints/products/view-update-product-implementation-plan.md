# API Endpoint Implementation Plan: Update Product

## 1. Endpoint Overview
This document outlines the implementation plan for the `PATCH /api/v1/products/{productId}` endpoint. It enables an authenticated user to update the details of one of their existing products. The update is partial, meaning clients only need to send the fields they wish to change.

## 2. Request Details
-   **HTTP Method**: `PATCH`
-   **URL Structure**: `/api/v1/products/{productId}`
-   **Parameters**:
    -   **Required (Path)**: `productId` (`uuid`) - The ID of the product to update.
-   **Request Body**:
    A JSON object containing one or more fields to update. The body must not be empty.
    ```json
    {
      "name": "string",       // optional
      "quantity": "integer",   // optional
      "minimum_threshold": "integer" // optional
    }
    ```

## 3. Used Types
-   **`UpdateProductCommand`**: For typing the partial request body.
-   **`ProductDTO`**: For typing the successful response payload.

All types are sourced from `src/types.ts`.

## 4. Response Details
-   **Success (`200 OK`)**:
    Returns the complete JSON object of the product after the update has been applied.
    ```json
    {
      "id": "uuid",
      "name": "string",
      "quantity": "integer",
      "minimum_threshold": "integer"
    }
    ```
-   **Error**:
    Returns a standardized JSON error object.
    ```json
    { "message": "Error description" }
    ```

## 5. Data Flow
1.  A `PATCH` request is sent to `/api/v1/products/{productId}`.
2.  Astro middleware validates the user's session and populates `context.locals`.
3.  The `PATCH` handler in `src/pages/api/v1/products/[id].ts` is invoked.
4.  The handler validates the user's session, returning `401 Unauthorized` if missing.
5.  It validates that the `productId` from the path is a valid UUID and that the request body is not empty, returning `400 Bad Request` on failure.
6.  The request body is parsed and validated against the `updateProductSchema`. A `400` response is returned if validation fails.
7.  The handler calls the `ProductService.updateProduct` method, passing the `supabase` client, `user.id`, `productId`, and the validated update data.
8.  The `ProductService` first checks for name conflicts if `name` is being updated. If a conflict exists, it throws an error that the handler converts to a `409 Conflict` response.
9.  The service then attempts to update the product, matching on both `id` and `user_id`.
10. If the update affects no rows (i.e., product not found for that user), the service throws a `NotFoundError`, which the handler converts to a `404 Not Found` response.
11. If the update is successful, the service returns the updated product data.
12. The handler sends a `200 OK` response with the updated `ProductDTO`.

## 6. Security Considerations
-   **Authentication**: All requests must be authenticated. This is enforced by middleware.
-   **Authorization / IDOR Prevention**: The primary security measure is ensuring data tenancy. The `ProductService` **must** include `user_id` in the `match` clause of the update query (`.match({ id: productId, user_id: userId })`). This guarantees that users can only modify products they own, preventing Insecure Direct Object Reference vulnerabilities.
-   **Input Validation**: Strict validation with Zod (`updateProductSchema`) at the route handler level prevents malformed or malicious data from reaching the database, protecting data integrity.
-   **Conflict Prevention**: Business logic in the service will prevent users from creating duplicate product names within their own inventory.

## 7. Error Handling
-   **`400 Bad Request`**: Returned for invalid `productId` format, empty request body, or if the payload fails Zod validation.
-   **`401 Unauthorized`**: Returned if the session is invalid or missing.
-   **`404 Not Found`**: Returned if the `productId` does not correspond to any product owned by the authenticated user.
-   **`409 Conflict`**: Returned if the update would result in a duplicate product `name` for the user.
-   **`500 Internal Server Error`**: Returned for any unexpected database failures or server-side exceptions.

## 8. Performance Considerations
-   **Database Indexing**: The query to update the product will be fast as it will use the primary key (`id`). The pre-update check for a name conflict will benefit from the existing unique index on `(user_id, name)`. No performance bottlenecks are anticipated.

## 9. Implementation Steps
1.  **Update Zod Schema**:
    -   Open `src/lib/schemas/product.schema.ts`.
    -   Add and export an `updateProductSchema` that validates the optional `name`, `quantity`, and `minimum_threshold` fields.

2.  **Create API Route File**:
    -   Create a new file: `src/pages/api/v1/products/[id].ts`.
    -   Add `export const prerender = false;`.
    -   Implement the `PATCH({ params, request, context })` handler.

3.  **Update Product Service**:
    -   Open `src/lib/services/product.service.ts`.
    -   Implement an async `updateProduct` function that accepts `supabase`, `userId`, `productId`, and `UpdateProductCommand` data.
    -   Inside the function:
        a. If `data.name` is provided, query to see if another product with that name already exists for the `userId`. If so, throw a `ConflictError`.
        b. Execute the update: `supabase.from('products').update(data).match({ id: productId, user_id: userId }).select().single()`.
        c. If the result is null or has an error, throw a `NotFoundError`.
        d. Return the successfully updated product.

4.  **Implement Handler Logic**:
    -   In the `PATCH` handler in `[id].ts`:
        a. Validate the user session.
        b. Validate `params.id` is a UUID.
        c. Validate the request body is not empty and conforms to `updateProductSchema`.
        d. Call `ProductService.updateProduct` inside a `try...catch` block.
        e. Handle specific errors (`NotFoundError`, `ConflictError`) by returning `404` and `409` status codes.
        f. For generic errors, return `500`.
        g. On success, return `200` with the updated product DTO.
