# API Endpoint Implementation Plan: Create Product

## 1. Endpoint Overview
This document outlines the implementation plan for the `POST /api/v1/products` endpoint. The endpoint allows an authenticated user to add a new product to their inventory. It validates the incoming data, checks for duplicates, and creates a new record in the `products` table.

## 2. Request Details
-   **HTTP Method**: `POST`
-   **URL Structure**: `/api/v1/products`
-   **Parameters**: None
-   **Request Body**:
    A JSON object containing the details of the product to be created.
    ```json
    {
      "name": "string",
      "quantity": "integer",
      "minimum_threshold": "integer"
    }
    ```

## 3. Used Types
-   **`CreateProductCommand`**: For typing the request body payload.
-   **`ProductDTO`**: For typing the response payload.

All types are sourced from `src/types.ts`.

## 4. Response Details
-   **Success (`201 Created`)**:
    Returns a JSON object representing the newly created product.
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
    {
      "message": "Error description",
      "errors": ["Optional list of validation errors"]
    }
    ```

## 5. Data Flow
1.  A `POST` request is sent to `/api/v1/products`.
2.  Astro middleware validates the user's Supabase session from the `Authorization` header and populates `context.locals.user` and `context.locals.supabase`.
3.  The `POST` handler in `src/pages/api/v1/products/index.ts` is invoked.
4.  It first checks for an authenticated user on `context.locals`. If missing, it returns `401 Unauthorized`.
5.  The request body is parsed and validated against the `createProductSchema` Zod schema. If validation fails, it returns `400 Bad Request`.
6.  The handler calls the `ProductService.createProduct` method, passing the `supabase` client, `user.id`, and the validated request data.
7.  The `ProductService` checks if a product with the same name already exists for that user. If a duplicate is found, it throws an error, which the handler catches and converts to a `409 Conflict` response.
8.  If no duplicate is found, the service inserts a new record into the `products` table with the provided data and the `user_id`.
9.  The service returns the newly created product data.
10. The handler receives the new product, formats it as a `ProductDTO`, and sends a `201 Created` response with the DTO in the body.

## 6. Security Considerations
-   **Authentication**: The endpoint is protected. All requests must include a valid JWT Bearer token. The Astro middleware is responsible for session verification.
-   **Authorization**: Any authenticated user is authorized to create a product for their own account.
-   **Data Isolation**: All database operations (checking for duplicates and inserting) **must** be scoped by the `user_id` obtained from the trusted session (`context.locals.user.id`). This ensures a user can only affect their own data.
-   **Input Validation**: A strict Zod schema (`createProductSchema`) will be used to validate the request body, preventing malformed data from reaching the service layer or database. This mitigates risks like NoSQL injection and ensures data integrity.

## 7. Error Handling
-   **`400 Bad Request`**: Returned if the request body fails validation against the Zod schema. The response body will include details about the validation errors.
-   **`401 Unauthorized`**: Returned if the request is made without a valid authentication token or if the session is invalid/expired.
-   **`409 Conflict`**: Returned if a product with the same `name` already exists for the user, leveraging the `UNIQUE (user_id, name)` constraint.
-   **`500 Internal Server Error`**: Returned for any unexpected server-side issues, such as a database connection failure. The specific error details will be logged on the server for debugging but not exposed to the client.

## 8. Performance Considerations
-   **Database Index**: The unique constraint on `(user_id, name)` is backed by an index, ensuring that the check for duplicate product names is highly efficient and will not degrade as the table grows.
-   **Query-to-Write Ratio**: The endpoint performs one `SELECT` (to check for duplicates) and one `INSERT`. This is an efficient pattern for a create operation. No significant performance bottlenecks are anticipated.

## 9. Implementation Steps
1.  **Create Zod Schema**:
    -   Create a new file: `src/lib/schemas/product.schema.ts`.
    -   Define and export a `createProductSchema` that validates `name`, `quantity`, and `minimum_threshold` according to the specification.

2.  **Create Product Service**:
    -   Create a new file: `src/lib/services/product.service.ts`.
    -   Implement an async `createProduct` function that accepts the Supabase client, `userId`, and `CreateProductCommand` data.
    -   Inside the function:
        a. Query the `products` table to check if a product with the same `name` and `userId` exists.
        b. If a duplicate exists, throw a custom error (e.g., `DuplicateRecordError`) to be handled by the API route.
        c. If no duplicate exists, insert the new product record into the `products` table.
        d. Return the complete new product record from the database.

3.  **Create API Route**:
    -   Create the directory `src/pages/api/v1/products/`.
    -   Create the API route file: `src/pages/api/v1/products/index.ts`.
    -   Add `export const prerender = false;` to ensure it's a dynamic route.
    -   Implement the `POST({ request, context })` handler function.

4.  **Implement Handler Logic**:
    -   In the `POST` handler:
        a. Retrieve `user` and `supabase` from `context.locals`. Return `401` if `user` is null.
        b. Await and parse `request.json()`.
        c. Use `createProductSchema.safeParse()` to validate the data. If it fails, return a `400` response with the errors.
        d. Wrap the call to `ProductService.createProduct` in a `try...catch` block.
        e. In the `try` block, await the service call and return a `201` response with the resulting `ProductDTO`.
        f. In the `catch` block, check if the error is the custom `DuplicateRecordError` and return `409`. For all other errors, return `500`.
