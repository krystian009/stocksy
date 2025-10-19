# API Endpoint Implementation Plan: List Products

## 1. Endpoint Overview
This document outlines the implementation plan for the `GET /api/v1/products` endpoint. The endpoint provides a paginated and sortable list of all products belonging to the authenticated user. It supports query parameters for controlling pagination and sorting order.

## 2. Request Details
-   **HTTP Method**: `GET`
-   **URL Structure**: `/api/v1/products`
-   **Parameters**:
    -   **Required**: None.
    -   **Optional (Query)**:
        -   `page` (`number`, default: `1`): The page number for pagination.
        -   `limit` (`number`, default: `20`): The number of items per page.
        -   `sort` (`string`, enum: `name` | `quantity`, default: `name`): The field to sort by.
        -   `order` (`string`, enum: `asc` | `desc`, default: `asc`): The sort direction.
-   **Request Body**: None.

## 3. Used Types
-   **`ProductsListResponseDTO`**: The main response payload structure.
-   **`ProductDTO`**: For each item in the `data` array.
-   **`PaginationMetaDTO`**: For the `meta` object.
-   **`ProductsListQueryParams`**: For the validated query parameters.

All types are sourced from `src/types.ts`.

## 4. Response Details
-   **Success (`200 OK`)**:
    Returns a `ProductsListResponseDTO` object containing the paginated list of products and metadata.
    ```json
    {
      "data": [
        {
          "id": "uuid",
          "name": "string",
          "quantity": "integer",
          "minimum_threshold": "integer"
        }
      ],
      "meta": {
        "total_items": "integer",
        "total_pages": "integer",
        "current_page": "integer",
        "per_page": "integer"
      }
    }
    ```
-   **Error**:
    Returns a standardized JSON error object.
    ```json
    { "message": "Error description" }
    ```

## 5. Data Flow
1.  A `GET` request is sent to `/api/v1/products` with optional query parameters.
2.  Astro middleware validates the user's session and populates `context.locals.user` and `context.locals.supabase`.
3.  The `GET` handler in `src/pages/api/v1/products/index.ts` is invoked.
4.  It checks for `context.locals.user`. If missing, it returns `401 Unauthorized`.
5.  The handler parses the `URL.searchParams` against the `getProductsQuerySchema` Zod schema. If validation fails, it returns `400 Bad Request`.
6.  The handler calls `ProductService.getProducts`, passing the `supabase` client, `user.id`, and the validated query parameters.
7.  The `ProductService` calculates the pagination range and executes two database queries: one to get the total count of products for the user, and another to fetch the paginated and sorted product data.
8.  The service computes the pagination metadata (`total_pages`, etc.) and assembles the `ProductsListResponseDTO`.
9.  The handler receives the `ProductsListResponseDTO` and sends a `200 OK` response with the payload.

## 6. Security Considerations
-   **Authentication**: The endpoint is protected. All requests must be authenticated via Astro middleware, which verifies the session.
-   **Authorization**: Any authenticated user is authorized to view their own list of products.
-   **Data Isolation**: This is critical. All database queries within the `ProductService` **must** be filtered with a `where('user_id', '=', userId)` clause to ensure that a user can only ever see their own data.

## 7. Error Handling
-   **`400 Bad Request`**: Returned if any query parameter fails validation (e.g., an invalid `sort` field or non-integer `page`).
-   **`401 Unauthorized`**: Returned if no valid authentication session is found.
-   **`500 Internal Server Error`**: Returned for unexpected database errors or other server-side failures. The error will be logged internally.

## 8. Performance Considerations
-   **Database Indexing**: A database index on the `user_id` column of the `products` table is essential for efficiently filtering products for the current user. An index on the `(user_id, name)` pair will also speed up the default sort.
-   **Query Count**: The service runs two queries per request (one for count, one for data). This is a standard and efficient pattern for pagination that avoids performance issues related to large offsets.
-   **Pagination Limits**: While not enforced in this plan, a global maximum `limit` could be enforced in the Zod schema (e.g., `limit.max(100)`) to prevent clients from requesting excessively large page sizes.

## 9. Implementation Steps
1.  **Update Zod Schema**:
    -   Open the file: `src/lib/schemas/product.schema.ts`.
    -   Add and export a `getProductsQuerySchema` that validates the optional `page`, `limit`, `sort`, and `order` parameters. Use `z.coerce.number()` for numeric fields and `.default()` for all fields to handle missing inputs.

2.  **Update Product Service**:
    -   Open the file: `src/lib/services/product.service.ts`.
    -   Implement an async `getProducts` function that accepts the Supabase client, `userId`, and validated `ProductsListQueryParams`.
    -   Inside the function:
        a. Calculate the `from` and `to` range for pagination from `page` and `limit`.
        b. Execute two queries in parallel using `Promise.all`:
            i. A query to `select('*', { count: 'exact', head: true })` filtered by `userId`.
            ii. A query to `select('id, name, quantity, minimum_threshold')` filtered by `userId`, with `.order()` and `.range()` applied.
        c. Calculate `total_pages` from the count and limit.
        d. Construct and return the `ProductsListResponseDTO`.

3.  **Update API Route**:
    -   Open the API route file: `src/pages/api/v1/products/index.ts`.
    -   Implement the `GET({ url, context })` handler function.

4.  **Implement Handler Logic**:
    -   In the `GET` handler:
        a. Retrieve `user` and `supabase` from `context.locals`. Return `401` if `user` is null.
        b. Convert `url.searchParams` to an object.
        c. Use `getProductsQuerySchema.safeParse()` to validate the query parameters. If it fails, return a `400` response.
        d. Wrap the call to `ProductService.getProducts` in a `try...catch` block.
        e. In the `try` block, `await` the service call and return a `200 OK` response with the result.
        f. In the `catch` block, log the error and return `500`.
