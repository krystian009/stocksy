# View Implementation Plan: Home (Dashboard)

## 1. Overview

The Home (Dashboard) view serves as the primary landing page after user login, providing an at-a-glance summary of inventory status by displaying low-stock items that require immediate attention. This view retrieves all items currently on the user's shopping list (products where quantity has fallen at or below their minimum threshold) and displays them in a clear, accessible list. The interface includes skeleton loading states during data fetch, a positive empty state message when all items are well-stocked, and uses the shopping list API endpoint to fetch low-stock products.

## 2. View Routing

The Home (Dashboard) view will be accessible at the root application path:
-   **Path**: `/`

The corresponding file will be created at `src/pages/index.astro`.

## 3. Component Structure

The view will be composed of a hierarchy of React components rendered within the main Astro page.

```
/src
|-- pages/
|   `-- index.astro
`-- components/
    `-- home/
        |-- HomeView.tsx
        |-- LowStockList.tsx
        |-- LowStockListSkeleton.tsx
        |-- LowStockCard.tsx
        `-- EmptyState.tsx
```

## 4. Component Details

### `HomeView.tsx`

-   **Component description**: The root client-side component that orchestrates the entire home view. It manages the data fetching for low-stock items using a custom `useShoppingList` hook, handles loading states, and renders the appropriate UI based on data availability.

-   **Main elements**: 
    -   Page header with title "Dashboard" or "Low Stock Items"
    -   Conditional rendering of `LowStockListSkeleton` during loading
    -   Conditional rendering of `LowStockList` when data is available
    -   Conditional rendering of `EmptyState` when no low-stock items exist
    -   Error display section for critical API failures

-   **Handled interactions**: None directly; delegates to child components. Manages the overall view state through the `useShoppingList` hook.

-   **Handled validation**: None.

-   **Types**: `ShoppingListItemViewModel`, `ShoppingListItemDTO`.

-   **Props**: None.

### `LowStockList.tsx`

-   **Component description**: Displays the list of low-stock items in a card-based grid layout. This component is responsible for rendering multiple `LowStockCard` components for each item in the shopping list.

-   **Main elements**: 
    -   Container `<div>` with responsive grid layout (using Tailwind CSS grid utilities)
    -   Maps through the array of low-stock items
    -   Renders a `LowStockCard` component for each item

-   **Handled interactions**: None directly; passes data down to child components.

-   **Handled validation**: None.

-   **Types**: `ShoppingListItemViewModel[]`.

-   **Props**:
    -   `items: ShoppingListItemViewModel[]`: The array of low-stock items to display.

### `LowStockCard.tsx`

-   **Component description**: A card component that displays information about a single low-stock product. It shows the product name and the quantity needed to restock.

-   **Main elements**: 
    -   Card wrapper (using Shadcn/ui `Card` component or custom styled `<div>`)
    -   Product name display (`<h3>` or similar)
    -   Quantity to purchase display
    -   Visual indicator/icon showing low stock status
    -   Optional link or navigation to the shopping list page for more actions

-   **Handled interactions**: 
    -   Optional: Click event to navigate to shopping list page
    -   Optional: Inline action buttons (if requirements evolve)

-   **Handled validation**: None.

-   **Types**: `ShoppingListItemViewModel`.

-   **Props**:
    -   `item: ShoppingListItemViewModel`: The shopping list item data to display.

### `LowStockListSkeleton.tsx`

-   **Component description**: A skeleton loading component that provides visual feedback while shopping list data is being fetched from the API.

-   **Main elements**: 
    -   Multiple skeleton card placeholders (matching the `LowStockCard` layout)
    -   Shimmer/pulse animation effect (using Tailwind CSS animations)
    -   Structured to match the grid layout of `LowStockList`

-   **Handled interactions**: None.

-   **Handled validation**: None.

-   **Types**: None.

-   **Props**: None.

### `EmptyState.tsx`

-   **Component description**: A positive message component displayed when there are no low-stock items. It provides user feedback indicating that all inventory items are well-stocked.

-   **Main elements**: 
    -   Container `<div>` with centered content
    -   Positive icon (e.g., checkmark, celebration icon)
    -   Heading with positive message
    -   Descriptive text
    -   Optional navigation button to inventory page

-   **Handled interactions**: 
    -   Optional: Button click to navigate to inventory page

-   **Handled validation**: None.

-   **Types**: None.

-   **Props**: None (or minimal props for customization).

## 5. Types

### `ShoppingListItemViewModel`

This ViewModel extends the `ShoppingListItemDTO` with optional UI-specific state flags. It represents a single item on the shopping list with all necessary display information.

```typescript
import type { ShoppingListItemDTO } from "@/types";

/**
 * View Model for shopping list items displayed on the home dashboard.
 * Extends the DTO with optional UI state for handling loading/error states.
 */
export type ShoppingListItemViewModel = ShoppingListItemDTO & {
  /** Optional UI state for the specific item, e.g., during an action. */
  ui_state?: 'loading' | 'error';
};
```

**Field Breakdown:**
- `id: string` (from `ShoppingListItemDTO`): UUID of the shopping list item
- `product_id: string` (from `ShoppingListItemDTO`): UUID of the associated product
- `product_name: string` (from `ShoppingListItemDTO`): Display name of the product
- `quantity_to_purchase: number` (from `ShoppingListItemDTO`): Number of items needed to restock
- `ui_state?: 'loading' | 'error'` (added): Optional UI state flag for component-level feedback

## 6. State Management

State will be primarily managed by a custom hook, **`useShoppingList`**, located at `src/lib/hooks/useShoppingList.ts`.

-   **Purpose**: This hook encapsulates all business logic for fetching and managing shopping list data on the home view. It provides a clean interface for the `HomeView` component, following the same pattern as `useInventory`.

-   **Internal State**:
    -   `items: ShoppingListItemViewModel[]`: The list of low-stock items (shopping list items).
    -   `isLoading: boolean`: Loading state for the initial data fetch.
    -   `error: Error | null`: Stores any critical API error that occurs during fetching.

-   **Exposed API**:
    -   `state`: An object containing `{ items, isLoading, error }`
    -   `actions`: An object containing `{ refetch }` for manual data refresh

-   **Data Fetching**: The hook will automatically fetch shopping list data on mount using `useEffect`. It will use the `getShoppingList` function from the API client.

-   **Error Handling**: Failed API calls will set the `error` state and optionally display a toast notification using Sonner.

## 7. API Integration

All API interactions will be handled within the `useShoppingList` hook. A set of API client functions will be created in `src/lib/api/shopping-list.ts`.

-   **`getShoppingList()`**:
    -   **Request**: `GET /api/v1/shopping-list` with no query parameters.
    -   **Request Type**: None (no payload required).
    -   **Response Type**: `ShoppingListResponseDTO` which contains:
        ```typescript
        {
          data: ShoppingListItemDTO[]
        }
        ```
    -   **Response Fields**:
        -   `data`: Array of `ShoppingListItemDTO` objects
        -   Each `ShoppingListItemDTO` contains:
            -   `id`: UUID of the shopping list item
            -   `product_id`: UUID of the associated product
            -   `product_name`: String name of the product
            -   `quantity_to_purchase`: Integer quantity needed to restock
    -   **Success Code**: `200 OK`
    -   **Error Codes**: 
        -   `401 Unauthorized`: User is not authenticated
        -   `500 Internal Server Error`: Server-side error

**API Client Implementation Pattern:**

The API client will follow the same pattern as `src/lib/api/products.ts`:

```typescript
export async function getShoppingList(): Promise<ShoppingListResponseDTO> {
  const response = await fetch('/api/v1/shopping-list', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  return handleResponse<ShoppingListResponseDTO>(response);
}
```

## 8. User Interactions

-   **Viewing Low-Stock Items**: User navigates to the home page (default landing after login) → `useShoppingList` hook automatically fetches data → `LowStockList` displays all items requiring attention.

-   **Refreshing Data**: User can manually refresh the shopping list (if refresh button is provided) → `refetch` action is called → Data is re-fetched from the API → UI updates with latest low-stock items.

-   **No Low-Stock Items**: User navigates to home page → API returns empty array → `EmptyState` is displayed with positive message "Your shopping list is empty. All your items are well-stocked!"

-   **Navigating to Shopping List or Inventory**: User clicks on a card or navigation link (optional) → Application navigates to `/shopping-list` or `/inventory` page.

## 9. Conditions and Validation

### Display Conditions

-   **Loading State**: 
    -   Condition: `isLoading === true`
    -   Components Affected: `HomeView`
    -   Interface Effect: Display `LowStockListSkeleton` component

-   **Empty State**:
    -   Condition: `!isLoading && items.length === 0 && !error`
    -   Components Affected: `HomeView`
    -   Interface Effect: Display `EmptyState` component with positive message

-   **Data Display**:
    -   Condition: `!isLoading && items.length > 0 && !error`
    -   Components Affected: `HomeView`
    -   Interface Effect: Display `LowStockList` component with all items

-   **Error State**:
    -   Condition: `error !== null`
    -   Components Affected: `HomeView`
    -   Interface Effect: Display error message banner above or instead of content

### API Response Conditions

-   **Successful Fetch (200 OK)**: 
    -   Condition verified: Response status is 200
    -   Action: Parse response, map to ViewModels, update `items` state

-   **Unauthorized (401)**:
    -   Condition verified: Response status is 401
    -   Action: Display authentication error, potentially redirect to login

-   **Server Error (500)**:
    -   Condition verified: Response status is 500
    -   Action: Set error state, display user-friendly error message

## 10. Error Handling

### Initial Load Failure

-   **Scenario**: The initial `GET /api/v1/shopping-list` API call fails.
-   **Handling**: 
    -   Display an error message banner in the `HomeView` component
    -   Message should be user-friendly: "Failed to load shopping list. Please try again."
    -   Provide a "Retry" button that calls the `refetch` action
    -   Log error details to console for debugging

### Network Errors

-   **Scenario**: Network request fails due to connectivity issues.
-   **Handling**:
    -   Catch network errors in the API client
    -   Display toast notification: "Network error. Please check your connection."
    -   Set `error` state in the hook
    -   Allow user to retry via refresh button

### Authentication Errors (401)

-   **Scenario**: API returns 401 Unauthorized.
-   **Handling**:
    -   Display error message: "Session expired. Please log in again."
    -   Optionally redirect to login page (if auth flow is implemented)
    -   Clear any cached authentication state

### Empty Response Handling

-   **Scenario**: API returns empty array (no low-stock items).
-   **Handling**:
    -   This is a valid state, not an error
    -   Display `EmptyState` component with positive message
    -   Ensure message is accessible to screen readers

### Malformed Response

-   **Scenario**: API returns unexpected data structure.
-   **Handling**:
    -   Validate response structure in API client
    -   If validation fails, throw descriptive error
    -   Display generic error message to user
    -   Log detailed error for debugging

## 11. Implementation Steps

1.  **Create Directory Structure**: 
    -   Create `src/components/home/` directory for all home view components.

2.  **Create Type Definitions**:
    -   Create `src/components/home/types.ts` file
    -   Define `ShoppingListItemViewModel` type extending `ShoppingListItemDTO`

3.  **Implement API Client**:
    -   Create `src/lib/api/shopping-list.ts` (if not already exists)
    -   Implement `getShoppingList()` function following the pattern from `products.ts`
    -   Include proper error handling and response parsing

4.  **Develop `useShoppingList` Hook**:
    -   Create `src/lib/hooks/useShoppingList.ts`
    -   Implement state management using `useReducer` (following `useInventory` pattern)
    -   Include actions for `fetch` and `refetch`
    -   Implement error handling and toast notifications
    -   Add `useEffect` to automatically fetch data on mount

5.  **Build Skeleton Component**:
    -   Create `src/components/home/LowStockListSkeleton.tsx`
    -   Implement skeleton UI with shimmer/pulse animation
    -   Match the layout structure of `LowStockList` for smooth transition

6.  **Build EmptyState Component**:
    -   Create `src/components/home/EmptyState.tsx`
    -   Implement positive message UI
    -   Include optional navigation to inventory page
    -   Ensure accessibility with ARIA labels

7.  **Build LowStockCard Component**:
    -   Create `src/components/home/LowStockCard.tsx`
    -   Implement card layout using Shadcn/ui `Card` or custom styles
    -   Display product name and quantity to purchase
    -   Add visual indicators (icons, colors) for low stock
    -   Ensure semantic HTML structure

8.  **Build LowStockList Component**:
    -   Create `src/components/home/LowStockList.tsx`
    -   Implement responsive grid layout with Tailwind CSS
    -   Map through items array and render `LowStockCard` for each item
    -   Handle empty array gracefully

9.  **Build HomeView Component**:
    -   Create `src/components/home/HomeView.tsx`
    -   Integrate `useShoppingList` hook
    -   Implement conditional rendering logic:
        -   Show skeleton during loading
        -   Show empty state when no items
        -   Show list when items exist
        -   Show error message on failure
    -   Add page header with title
    -   Include optional refresh button

10. **Setup Astro Page**:
    -   Update `src/pages/index.astro`
    -   Remove redirect to `/inventory`
    -   Import and render `HomeView` component with `client:load` directive
    -   Wrap in appropriate layout

11. **Style and Polish**:
    -   Apply consistent spacing and typography using Tailwind classes
    -   Ensure responsive design (minimum 1024px width as per PRD)
    -   Add transitions and animations for smooth UX
    -   Implement dark mode support if applicable

12. **Accessibility Enhancements**:
    -   Add ARIA labels to interactive elements
    -   Ensure semantic HTML structure (proper heading hierarchy)
    -   Make empty state message accessible to screen readers
    -   Test keyboard navigation
    -   Verify screen reader compatibility

13. **Error Handling Polish**:
    -   Implement toast notifications for all API errors
    -   Add retry mechanisms where appropriate
    -   Ensure error messages are user-friendly and actionable

14. **Testing**:
    -   Manually test loading state (throttle network to observe skeleton)
    -   Test empty state (ensure database has no low-stock items)
    -   Test with various numbers of low-stock items
    -   Test error scenarios (disconnect network, simulate 500 error)
    -   Verify user story US-011 acceptance criteria
    -   Test accessibility with screen reader
    -   Verify responsive layout at 1024px minimum width

