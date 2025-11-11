# View Implementation Plan: Home (Dashboard)

## 1. Overview

The Home (Dashboard) view serves as the primary landing page for authenticated users. Its main purpose is to provide an at-a-glance summary of the inventory status by displaying a prominent list of all low-stock items. This enables users to quickly identify which products need restocking. The view includes a loading state for a smooth user experience and an empty state with a positive message when no items are low in stock.

## 2. View Routing

The Home view will be accessible at the root of the application.

-   **Path**: `/`

This will be handled by the `src/pages/index.astro` file.

## 3. Component Structure

The view will be composed of a main Astro page that renders a client-side React component. This component will manage data fetching and rendering logic. The component hierarchy is as follows:

```
src/pages/index.astro
└── src/components/home/HomeDashboard.tsx (client:load)
    ├── src/components/home/HomeDashboardSkeleton.tsx (shown during loading)
    ├── src/components/home/LowStockList.tsx (shown if data is present)
    │   └── src/components/home/LowStockItemCard.tsx (repeated for each item)
    │       └── src/components/ui/Card.tsx (from shadcn/ui)
    └── src/components/home/EmptyState.tsx (shown if data array is empty)
```

## 4. Component Details

### `src/pages/index.astro`

-   **Component description**: The main Astro page for the root route (`/`). It will act as the entry point, rendering the site layout and the main `HomeDashboard` React component as an interactive island.
-   **Main elements**: `<Layout>` and `<HomeDashboard client:load />`.
-   **Handled interactions**: None.
-   **Handled validation**: None.
-   **Types**: None.
-   **Props**: None.

### `HomeDashboard.tsx`

-   **Component description**: This is the main React container for the home page. It is responsible for fetching the low-stock items, managing loading, error, and empty states, and conditionally rendering the appropriate child components (`HomeDashboardSkeleton`, `LowStockList`, or `EmptyState`).
-   **Main elements**: A `div` wrapper that conditionally renders child components based on the `isLoading`, `error`, and `items` state from the `useLowStockItems` hook.
-   **Handled interactions**: None (triggers data fetch on mount).
-   **Handled validation**: Checks if the fetched items array is empty to render the `EmptyState`.
-   **Types**: `ShoppingListItemDTO`.
-   **Props**: None.

### `LowStockList.tsx`

-   **Component description**: A presentational component that receives a list of low-stock items and renders them using the `LowStockItemCard` component for each item.
-   **Main elements**: A `div` or `section` containing a list (`ul` or `div` grid) of `LowStockItemCard` components.
-   **Handled interactions**: None.
-   **Handled validation**: None.
-   **Types**: `LowStockItemViewModel[]`.
-   **Props**:
    -   `items: LowStockItemViewModel[]`: An array of low-stock items to display.

### `LowStockItemCard.tsx`

-   **Component description**: Displays the details of a single low-stock item within a card. It will use the `Card` component from shadcn/ui for styling.
-   **Main elements**: `Card`, `CardHeader`, `CardTitle`, `CardContent` from `src/components/ui/card.tsx`. It will display the `product_name` and `quantity_to_purchase`.
-   **Handled interactions**: None.
-   **Handled validation**: None.
-   **Types**: `LowStockItemViewModel`.
-   **Props**:
    -   `item: LowStockItemViewModel`: The low-stock item to display.

### `HomeDashboardSkeleton.tsx`

-   **Component description**: Provides a loading state UI to be displayed while the dashboard data is being fetched. It should visually resemble the final layout of the `LowStockList` to prevent layout shifts.
-   **Main elements**: Skeleton versions of the `Card` component, using `div` elements with Tailwind CSS animation (`animate-pulse`).
-   **Handled interactions**: None.
-   **Handled validation**: None.
-   **Types**: None.
-   **Props**: None.

### `EmptyState.tsx`

-   **Component description**: A component displayed when the user has no low-stock items. It shows a positive, reassuring message.
-   **Main elements**: A container `div` with a heading (`h2` or `h3`) and a paragraph (`p`) for the message, e.g., "All items are well-stocked!".
-   **Handled interactions**: None.
-   **Handled validation**: None.
-   **Types**: None.
-   **Props**: None.

## 5. Types

The view will use existing DTOs and introduce a ViewModel for clarity within the React components.

-   **`ShoppingListItemDTO` (from `src/types.ts`)**: The Data Transfer Object received from the API.
    ```typescript
    export type ShoppingListItemDTO = Pick<Tables<"shopping_list_items">, "id" | "product_id" | "quantity_to_purchase"> & {
      product_name: string;
    };
    ```
-   **`ShoppingListResponseDTO` (from `src/types.ts`)**: The response wrapper for the API call.
    ```typescript
    export interface ShoppingListResponseDTO {
      data: ShoppingListItemDTO[];
    }
    ```
-   **`LowStockItemViewModel` (new type alias)**: A ViewModel for a single low-stock item. For this view, it can be a direct alias of `ShoppingListItemDTO` as no transformation is needed.
    ```typescript
    export type LowStockItemViewModel = ShoppingListItemDTO;
    ```

## 6. State Management

State will be managed within the `HomeDashboard.tsx` component using a custom hook, `useLowStockItems`, to encapsulate data fetching logic and related states.

-   **`useLowStockItems.ts`**:
    -   **Purpose**: A React hook responsible for fetching low-stock items from the API and managing the `isLoading`, `error`, and `data` states.
    -   **Exposed State**:
        -   `items: LowStockItemViewModel[] | null`: The fetched list of low-stock items.
        -   `isLoading: boolean`: Indicates if the fetch request is in progress.
        -   `error: Error | null`: Stores any error that occurred during the fetch.
    -   **Implementation**: It will use a `useEffect` hook to fetch data on component mount. It will use the browser's `fetch` API.

## 7. API Integration

The view will integrate with the existing shopping list endpoint to fetch low-stock items.

-   **Endpoint**: `GET /api/v1/shopping-list`
-   **Request**:
    -   Method: `GET`
    -   Body: None.
    -   Headers: Must include authentication credentials (e.g., JWT in `Authorization` header), which should be handled by a shared API client or Supabase client instance.
-   **Response (Success)**:
    -   Status: `200 OK`
    -   Body Type: `ShoppingListResponseDTO`
    -   Payload Example: `{"data":[{"id":"...","product_id":"...","product_name":"Milk","quantity_to_purchase":2}]}`
-   **Response (Error)**:
    -   `401 Unauthorized`: User is not logged in.
    -   `500 Internal Server Error`: Generic server error.

## 8. User Interactions

The Home view is primarily informational, so direct user interactions are minimal.

-   **User navigates to `/`**:
    1.  The `HomeDashboard` component mounts.
    2.  `HomeDashboardSkeleton` is rendered immediately.
    3.  The `useLowStockItems` hook triggers an API call to `GET /api/v1/shopping-list`.
    4.  **On success**: The skeleton is replaced by either `LowStockList` (if items are returned) or `EmptyState` (if the items array is empty).
    5.  **On failure**: The skeleton is replaced by an error message.

## 9. Conditions and Validation

-   **Authentication**: The view is intended for authenticated users. The API endpoint is protected by RLS policies. If a `401 Unauthorized` error is received, the application should redirect the user to the login page.
-   **Loading State**: The `isLoading` flag from `useLowStockItems` determines whether to show the `HomeDashboardSkeleton`. This is active from the moment the component mounts until the API call settles.
-   **Empty State**: After a successful API call, the component will check if `items.length === 0`. If true, the `EmptyState` component is rendered instead of the `LowStockList`.
-   **Error State**: If the `error` object in the hook is not `null`, an error message component is displayed.

## 10. Error Handling

-   **API/Network Errors**: The `catch` block in the `useLowStockItems` hook will capture any network or API errors (e.g., 500 status code). The `error` state will be updated, and the UI will display a generic error message like "Could not load low-stock items. Please try again later."
-   **Unauthorized Access (401)**: The fetch logic should specifically check for a 401 status code. If detected, it should trigger a page redirect to the login route (`/login`).
-   **UI**: An error message can be displayed using Shadcn/ui's `Alert` and `AlertDescription` components for a consistent look and feel.

## 11. Implementation Steps

1.  **Create folder structure**: Create a new directory `src/components/home` for the new React components.
2.  **Create Page Entrypoint**: Modify `src/pages/index.astro` to include the `<HomeDashboard client:load />` component within the main `<Layout>`.
3.  **Implement Custom Hook**: Create and implement the `useLowStockItems` hook in `src/lib/hooks/useLowStockItems.ts`. It will handle the API call to `GET /api/v1/shopping-list` and manage loading, data, and error states.
4.  **Create Skeleton Component**: Implement the `HomeDashboardSkeleton.tsx` component. It should contain placeholder cards that mimic the final layout.
5.  **Create Empty State Component**: Implement the `EmptyState.tsx` component with a friendly message for when the shopping list is empty.
6.  **Create Card Component**: Implement `LowStockItemCard.tsx`. This component will take an `item` as a prop and display its details using shadcn/ui `Card` components.
7.  **Create List Component**: Implement `LowStockList.tsx`. This component will take an `items` array as a prop and map over it, rendering a `LowStockItemCard` for each item.
8.  **Implement Main Dashboard Component**: Implement `HomeDashboard.tsx`. This component will use the `useLowStockItems` hook and conditionally render the `HomeDashboardSkeleton`, `EmptyState`, or `LowStockList` based on the hook's state.
9.  **Add Styles**: Ensure all new components are styled correctly using Tailwind CSS, consistent with the rest of the application.
10. **Testing**: Manually test all scenarios: loading state, empty state, data-filled state, and error state. Verify that a 401 error correctly redirects to the login page.
