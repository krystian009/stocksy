# View Implementation Plan: Inventory Page

## 1. Overview

The Inventory Page is a comprehensive view designed for managing a user's household inventory. It allows users to view a paginated list of their products, add new items, edit existing ones, and delete products they no longer need. The interface supports sorting and provides immediate feedback for quantity adjustments through optimistic UI updates. It is built to be robust, with clear loading states, error handling, and user-friendly dialogs for all major actions.

## 2. View Routing

The Inventory Page will be accessible at the following application path:
-   **Path**: `/inventory`

The corresponding file will be created at `src/pages/inventory.astro`.

## 3. Component Structure

The view will be composed of a hierarchy of React components rendered within a main Astro page.

```
/src
|-- pages/
|   `-- inventory.astro
`-- components/
    `-- inventory/
        |-- InventoryView.tsx
        |-- InventoryHeader.tsx
        |-- ProductTable.tsx
        |-- ProductTableRow.tsx
        |-- ProductTableSkeleton.tsx
        |-- EmptyState.tsx
        |-- QuantityInput.tsx
        |-- ProductActions.tsx
        |-- ProductFormDialog.tsx
        `-- DeleteConfirmationDialog.tsx
```

## 4. Component Details

### `InventoryView.tsx`

-   **Component description**: The root client-side component that orchestrates the entire view. It uses the `useInventory` hook to manage state, data fetching, and user actions.
-   **Main elements**: Renders `InventoryHeader`, `ProductTable`, and `Pagination`. It also controls the visibility and logic for `ProductFormDialog` and `DeleteConfirmationDialog`.
-   **Handled interactions**: Manages which dialog is open (add, edit, delete), and passes handler functions from the `useInventory` hook down to child components.
-   **Types**: `ProductViewModel`, `PaginationMetaDTO`, `ProductDTO`.
-   **Props**: None.

### `InventoryHeader.tsx`

-   **Component description**: A header section containing the page title ("Inventory"), sorting controls, and the "Add Product" button.
-   **Main elements**: `<h1>`, `Select` (from Shadcn/ui) for sorting, `Button` (from Shadcn/ui) to trigger the add product dialog.
-   **Handled interactions**:
    -   `onSortChange`: When the user selects a new sorting option.
    -   `onAddProduct`: When the user clicks the "Add Product" button.
-   **Types**: `ProductsListQueryParams`.
-   **Props**:
    -   `sort: ProductsListQueryParams['sort']`: The current sort field.
    -   `order: ProductsListQueryParams['order']`: The current sort order.
    -   `onSortChange: (sort: string, order: string) => void`: Callback to update sorting.
    -   `onAddProduct: () => void`: Callback to open the add product dialog.

### `ProductTable.tsx`

-   **Component description**: Displays the list of products in a table. It is responsible for showing the loading state (skeleton), empty state, or the list of product rows.
-   **Main elements**: A `<table>` structure from Shadcn/ui (`Table`, `TableHeader`, `TableBody`, etc.). Conditionally renders `ProductTableSkeleton`, `EmptyState`, or a list of `ProductTableRow` components.
-   **Handled interactions**: None directly; delegates to child components.
-   **Types**: `ProductViewModel[]`.
-   **Props**:
    -   `products: ProductViewModel[]`: The array of products to display.
    -   `isLoading: boolean`: Indicates if the data is loading.
    -   `onUpdateProduct: (id: string, payload: UpdateProductCommand) => void`: Handler to update a product.
    -   `onDeleteProduct: (product: ProductViewModel) => void`: Handler to initiate product deletion.
    -   `onEditProduct: (product: ProductViewModel) => void`: Handler to open the edit dialog.

### `ProductTableRow.tsx`

-   **Component description**: Renders a single product's data in a `<tr>` element.
-   **Main elements**: `<tr>` with `<td>` cells for Name, Quantity, Minimum Threshold, and Actions.
-   **Handled interactions**: Delegates quantity updates and actions to its children.
-   **Types**: `ProductViewModel`, `UpdateProductCommand`.
-   **Props**:
    -   `product: ProductViewModel`: The product data for the row.
    -   `(All props from ProductTable are passed down)`

### `QuantityInput.tsx`

-   **Component description**: An input field with increment/decrement buttons for adjusting product quantity. It implements debouncing for manual text entry to prevent excessive API calls.
-   **Main elements**: `Input` field, and two `Button` components for `+` and `-`.
-   **Handled interactions**:
    -   Clicking `+`/`-` buttons immediately triggers `onChange`.
    -   Typing in the input field triggers `onChange` after a 500ms debounce.
-   **Validation**:
    -   Input is restricted to non-negative integers.
-   **Types**: None.
-   **Props**:
    -   `productId: string`: The ID of the product being updated.
    -   `initialValue: number`: The starting quantity.
    -   `onUpdate: (id: string, payload: UpdateProductCommand) => void`: The callback to invoke with the new quantity.

### `ProductFormDialog.tsx`

-   **Component description**: A modal dialog for creating or editing a product. It contains a form built with `react-hook-form` for state management and validation.
-   **Main elements**: `Dialog` (Shadcn/ui), `form` with `Input` and `Label` components for name, quantity, and minimum threshold.
-   **Handled interactions**: Form submission.
-   **Handled validation**:
    -   `name`: Required, must be a string of at least 3 characters.
    -   `quantity`: Required, must be a non-negative integer.
    -   `minimum_threshold`: Required, must be a non-negative integer.
-   **Types**: `ProductFormValues`, `ProductViewModel`.
-   **Props**:
    -   `isOpen: boolean`: Controls dialog visibility.
    -   `onClose: () => void`: Function to close the dialog.
    -   `onSubmit: (data: ProductFormValues) => void`: Callback on successful form submission.
    -   `product?: ProductViewModel`: Optional initial data for editing.

### `DeleteConfirmationDialog.tsx`

-   **Component description**: A simple modal dialog asking the user to confirm the deletion of a product.
-   **Main elements**: `Dialog` (Shadcn/ui) with a title, description, and "Confirm" / "Cancel" buttons.
-   **Handled interactions**: Clicking the "Confirm" button.
-   **Types**: `ProductViewModel`.
-   **Props**:
    -   `isOpen: boolean`: Controls dialog visibility.
    -   `onClose: () => void`: Function to close the dialog.
    -   `onConfirm: () => void`: Callback to execute the deletion.
    -   `product?: ProductViewModel`: The product to be deleted, used to display its name.

## 5. Types

### `ProductViewModel`

This ViewModel extends the `ProductDTO` with UI-specific state flags for handling optimistic updates.

```typescript
import type { ProductDTO } from "@/types";

export type ProductViewModel = ProductDTO & {
  /** UI state for the specific product row, e.g., during an optimistic update. */
  ui_state?: 'updating' | 'deleting' | 'error';
};
```

### `ProductFormValues`

This type defines the shape of the data managed by `react-hook-form` within the `ProductFormDialog`. It is compatible with both `CreateProductCommand` and `UpdateProductCommand`.

```typescript
export interface ProductFormValues {
  name: string;
  quantity: number;
  minimum_threshold: number;
}
```

## 6. State Management

State will be primarily managed by a custom hook, **`useInventory`**, located at `src/lib/hooks/useInventory.ts`.

-   **Purpose**: This hook will encapsulate all business logic for the Inventory view, including data fetching, pagination, sorting, and mutation operations (add, update, delete). It will provide a clean interface for the `InventoryView` component.
-   **Internal State**:
    -   `products: ProductViewModel[]`: The list of products.
    -   `meta: PaginationMetaDTO | null`: Pagination metadata from the API.
    -   `isLoading: boolean`: Loading state for the initial fetch.
    -   `error: Error | null`: Stores any critical API error.
    -   `queryParams: ProductsListQueryParams`: The current parameters for API requests (page, sort, etc.).
-   **Exposed API**:
    -   `state`: `{ products, meta, isLoading, error, queryParams }`
    -   `actions`: `{ setPage, setSort, addProduct, updateProduct, deleteProduct }`
-   **Optimistic Updates**: The `updateProduct` function will first update the local state immediately and then make the API call. If the call fails, it will revert the change and set the product's `ui_state` to `'error'`.

## 7. API Integration

All API interactions will be handled within the `useInventory` hook. A set of API client functions will be created in `src/lib/api/products.ts`.

-   **`getProducts(params)`**:
    -   **Request**: `GET /api/v1/products` with query params of type `ProductsListQueryParams`.
    -   **Response**: `ProductsListResponseDTO`.
-   **`createProduct(payload)`**:
    -   **Request**: `POST /api/v1/products` with a payload of type `CreateProductCommand`.
    -   **Response**: `ProductDTO`.
-   **`updateProduct(id, payload)`**:
    -   **Request**: `PATCH /api/v1/products/{id}` with a payload of type `UpdateProductCommand`.
    -   **Response**: `ProductDTO`.
-   **`deleteProduct(id)`**:
    -   **Request**: `DELETE /api/v1/products/{id}`.
    -   **Response**: `204 No Content`.

## 8. User Interactions

-   **Adding a Product**: User clicks "Add Product" -> `ProductFormDialog` opens -> User fills form and clicks "Save" -> `addProduct` is called -> Table updates.
-   **Editing a Product**: User clicks "Edit" on a row -> `ProductFormDialog` opens with pre-filled data -> User edits and clicks "Save" -> `updateProduct` is called -> Table updates.
-   **Deleting a Product**: User clicks "Delete" -> `DeleteConfirmationDialog` opens -> User clicks "Confirm" -> `deleteProduct` is called -> Row is removed from the table.
-   **Changing Quantity**: User clicks `+`/`-` or types in `QuantityInput` -> `updateProduct` is called optimistically -> UI updates instantly.
-   **Sorting**: User selects an option from the sort `Select` -> `setSort` is called -> Data is re-fetched with new sort params.
-   **Pagination**: User clicks a page number -> `setPage` is called -> Data is re-fetched for the new page.

## 9. Conditions and Validation

-   **Form Validation** (`ProductFormDialog`):
    -   `name`: Enforced to be a string with a minimum of 3 characters and maximum length of 120 characters. An error message will display below the input if invalid.
    -   `quantity` / `minimum_threshold`: Enforced to be non-negative integers. An error message will display if the value is negative or not a number.
    -   The "Save" button will be disabled until the form is valid.
-   **API Conditions**:
    -   **Duplicate Name**: If the API returns a `409 Conflict` error on product creation/update, a toast notification will inform the user that the product name already exists.
    -   **Not Found**: If the API returns a `404 Not Found` on update/delete, the local state will be refreshed to remove the stale item, and a toast will inform the user.

## 10. Error Handling

-   **Initial Load Failure**: If the initial `GET /api/v1/products` call fails, a full-page error message will be displayed instead of the table.
-   **Mutation Failures** (Add/Update/Delete):
    -   Any failed API call will display a toast notification (e.g., using `react-hot-toast`) with a user-friendly error message.
    -   For failed optimistic updates (e.g., quantity change), the UI will revert to the previous state, and the row will be highlighted to indicate an error.
-   **Validation Errors**: Displayed inline within the `ProductFormDialog`, next to the corresponding form field.

## 11. Implementation Steps

1.  **Create Files**: Create all the files specified in the *Component Structure* section.
2.  **Setup Astro Page**: Create `src/pages/inventory.astro` and have it render the `InventoryView` component with `client:load`.
3.  **Implement API Client**: Create `src/lib/api/products.ts` with functions for `getProducts`, `createProduct`, `updateProduct`, and `deleteProduct`.
4.  **Develop `useInventory` Hook**: Implement the `useInventory` hook in `src/lib/hooks/useInventory.ts`, including all state and logic for fetching and mutations.
5.  **Build Static Components**: Implement the stateless components: `InventoryHeader`, `ProductTableSkeleton`, and `EmptyState`.
6.  **Build Dialogs**: Implement `ProductFormDialog` (with `react-hook-form` and Zod for validation) and `DeleteConfirmationDialog`.
7.  **Build Table Components**: Implement `ProductTable`, `ProductTableRow`, `QuantityInput`, and `ProductActions`. Wire up the props for event handling.
8.  **Assemble `InventoryView`**: In `InventoryView.tsx`, use the `useInventory` hook and wire together all the child components, passing down state and action handlers.
9.  **Implement Pagination**: Integrate a pagination component (from Shadcn/ui or custom) and connect it to the `setPage` action from the `useInventory` hook.
10. **Refine UI and Error Handling**: Add toast notifications for all API errors and success messages. Style the optimistic update error state (e.g., red border on the errored row).
11. **Testing**: Manually test all user stories and edge cases, including form validation, API errors, and empty/loading states.
