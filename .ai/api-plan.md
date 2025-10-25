# REST API Plan for Stocksy

This document outlines the REST API for the Stocksy application, designed based on the database schema, Product Requirements Document (PRD), and specified tech stack.

## 1. Resources

The API is designed around three main resources:

-   **Products**: Represents items in a user's inventory. Corresponds to the `products` table.
-   **Shopping List**: Represents items that are low in stock and need to be purchased. Corresponds to the `shopping_list_items` table.

## 2. Endpoints

All endpoints are prefixed with `/api/v1`.

### 2.1. Products Resource

Base path: `/api/v1/products`

---

#### List Products

-   **Method**: `GET`
-   **Path**: `/`
-   **Description**: Retrieves a paginated list of all products for the authenticated user.
-   **Query Parameters**:
    -   `page` (optional, `number`, default: `1`): The page number for pagination.
    -   `limit` (optional, `number`, default: `20`): The number of items per page.
    -   `sort` (optional, `string`, enum: `name`, `quantity`, default: `name`): The field to sort by.
    -   `order` (optional, `string`, enum: `asc`, `desc`, default: `asc`): The sort order.
-   **Response Payload**:
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
-   **Success Code**: `200 OK`
-   **Error Codes**: `401 Unauthorized`

---

#### Create Product

-   **Method**: `POST`
-   **Path**: `/`
-   **Description**: Adds a new product to the user's inventory.
-   **Request Payload**:
    ```json
    {
      "name": "string",
      "quantity": "integer",
      "minimum_threshold": "integer"
    }
    ```
-   **Response Payload**:
    ```json
    {
      "id": "uuid",
      "name": "string",
      "quantity": "integer",
      "minimum_threshold": "integer"
    }
    ```
-   **Success Code**: `201 Created`
-   **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `409 Conflict` (if product name already exists for the user)

---

#### Get Product

-   **Method**: `GET`
-   **Path**: `/{productId}`
-   **Description**: Retrieves a single product by its ID.
-   **Response Payload**:
    ```json
    {
      "id": "uuid",
      "name": "string",
      "quantity": "integer",
      "minimum_threshold": "integer"
    }
    ```
-   **Success Code**: `200 OK`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found`

---

#### Update Product

-   **Method**: `PATCH`
-   **Path**: `/{productId}`
-   **Description**: Updates a product's details (name, quantity, or threshold).
-   **Request Payload**:
    ```json
    {
      "name": "string",       // optional
      "quantity": "integer",   // optional
      "minimum_threshold": "integer" // optional
    }
    ```
-   **Response Payload**:
    ```json
    {
      "id": "uuid",
      "name": "string",
      "quantity": "integer",
      "minimum_threshold": "integer"
    }
    ```
-   **Success Code**: `200 OK`
-   **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

---

#### Delete Product

-   **Method**: `DELETE`
-   **Path**: `/{productId}`
-   **Description**: Permanently deletes a product from the inventory.
-   **Success Code**: `204 No Content`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found`

---

### 2.2. Shopping List Resource

Base path: `/api/v1/shopping-list`

---

#### Get Shopping List

-   **Method**: `GET`
-   **Path**: `/`
-   **Description**: Retrieves all items on the user's shopping list. These are products that have fallen below their minimum threshold. The response includes product details.
-   **Response Payload**:
    ```json
    {
      "data": [
        {
          "id": "uuid", // shopping_list_item id
          "product_id": "uuid",
          "product_name": "string",
          "quantity_to_purchase": "integer"
        }
      ]
    }
    ```
-   **Success Code**: `200 OK`
-   **Error Codes**: `401 Unauthorized`

---

#### Update Shopping List Item

-   **Method**: `PATCH`
-   **Path**: `/{itemId}`
-   **Description**: Updates the `quantity_to_purchase` for an item on the shopping list.
-   **Request Payload**:
    ```json
    {
      "quantity_to_purchase": "integer"
    }
    ```
-   **Response Payload**: The updated shopping list item.
    ```json
    {
      "id": "uuid",
      "product_id": "uuid",
      "product_name": "string",
      "quantity_to_purchase": "integer"
    }
    ```
-   **Success Code**: `200 OK`
-   **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

---

#### Check-In Shopping List Item

-   **Method**: `POST`
-   **Path**: `/{itemId}/check-in`
-   **Description**: Marks a shopping list item as purchased. This action increases the corresponding product's quantity by the `quantity_to_purchase` and subsequently removes the item from the shopping list (via a database trigger).
-   **Success Code**: `204 No Content`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found`

---

## 3. Authentication and Authorization

-   **Mechanism**: Authentication will be handled using JSON Web Tokens (JWT) provided by Supabase Authentication.
-   **Implementation**:
    1.  The client application will send the Supabase JWT in the `Authorization` header of every request (e.g., `Authorization: Bearer <token>`).
    2.  Astro middleware (`src/middleware/index.ts`) will intercept all incoming API requests.
    3.  The middleware will validate the JWT. If the token is invalid or missing, it will return a `401 Unauthorized` error.
    4.  If the token is valid, the middleware will create a user-specific Supabase client instance and attach it to `context.locals`.
    5.  API route handlers will use the Supabase client from `context.locals` to make database queries. This ensures that all database operations are performed on behalf of the authenticated user and are subject to Supabase's Row-Level Security (RLS) policies.

## 4. Validation and Business Logic

### Validation

Input validation will be performed at the API level using Zod schemas to provide immediate, clear error messages to the client before hitting the database.

-   **Product Creation/Update (`POST /products`, `PATCH /products/{id}`):**
    -   `name`: Must be a string with a minimum length of 3 characters, maximum length of 120 characters.
    -   `quantity`: Must be a non-negative integer (`>= 0`).
    -   `minimum_threshold`: Must be a positive integer (`>0`).
-   **Shopping List Update (`PATCH /shopping-list/{id}`):**
    -   `quantity_to_purchase`: Must be a positive integer (`> 0`).

### Business Logic

-   **Automatic Shopping List Management**: The creation and deletion of `shopping_list_items` are handled automatically by PostgreSQL triggers in the database. The API does not contain this logic. An item is added to the list when `products.quantity` falls at or below `products.minimum_threshold` and removed when it rises above it.
-   **Inventory Logging**: All changes to `products.quantity` are automatically logged in the `inventory_logs` table by a database trigger. This process is transparent to the API.
-   **"Check-In" Workflow**: The `POST /api/shopping-list/{itemId}/check-in` endpoint encapsulates this logic. It triggers an update on the `products` table, which in turn causes database triggers to update the `shopping_list_items` and `inventory_logs` tables, ensuring data consistency.
