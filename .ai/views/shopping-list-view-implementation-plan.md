# View Implementation Plan: Shopping List Page

## 1. Overview

The Shopping List Page is designed to provide users with a clear, automatically generated list of products that require restocking. This view serves as the central hub for managing purchases. It displays items whose inventory quantity has fallen below a user-defined minimum threshold. Users can adjust the suggested purchase quantity for each item and perform a "check-in" action once an item is purchased, which updates the main inventory and removes the item from the list. The view also includes a feature to "check-in" all items simultaneously. An empty state message is shown when no items require restocking.

## 2. View Routing

The Shopping List Page will be accessible at the following application path:
- **Path**: `/shopping-list`

This will be implemented by creating a new file: `src/pages/shopping-list.astro`.

## 3. Component Structure

The view will be built using a modular, hierarchical component structure. The main Astro page will render a client-side React component, which in turn orchestrates the display and interaction logic.

```
/src/pages/shopping-list.astro
└── /src/layouts/Layout.astro
    └── /src/components/shopping-list/ShoppingListView.tsx (client:load)
        ├── /src/components/shopping-list/ShoppingListHeader.tsx
        │   └── /src/components/ui/button.tsx (Check-in All)
        ├── if (items exist)
        │   ├── /src/components/shopping-list/ShoppingListTable.tsx (Desktop)
        │   │   └── /src/components/shopping-list/ShoppingListTableRow.tsx[]
        │   │       ├── /src/components/inventory/QuantityInput.tsx
        │   │       └── /src/components/ui/button.tsx (Check-in)
        │   └── /src/components/shopping-list/ShoppingCardList.tsx (Mobile)
        │       └── /src/components/shopping-list/ShoppingCard.tsx[]
        │           ├── /src/components/inventory/QuantityInput.tsx
        │           └── /src/components/ui/button.tsx (Check-in)
        └── if (items do not exist)
            └── /src/components/inventory/EmptyState.tsx
```

## 4. Component Details

### `shopping-list.astro`
- **Component description**: The main server-rendered Astro page. It sets up the overall page layout, performs the initial data fetch on the server, and renders the `ShoppingListView` component as a client-side island, passing the fetched data as a prop.
- **Main elements**: `<Layout>` component, `<ShoppingListView>`.
- **Handled interactions**: None.
- **Handled validation**: None.
- **Types**: Fetches `ShoppingListResponseDTO`, passes `ShoppingListItemDTO[]` to the client.
- **Props**: None.

### `ShoppingListView.tsx`
- **Component description**: This is the root client-side React component that manages the entire state and interactivity of the shopping list. It orchestrates API calls for all user actions (update, check-in, check-in all) and renders the appropriate child components based on the state.
- **Main elements**: `ShoppingListHeader`, `ShoppingListTable` (or `ShoppingCardList` for mobile), `EmptyState`.
- **Handled interactions**: Manages state changes triggered by children, such as quantity updates and check-in actions.
- **Handled validation**: None directly; delegates to children.
- **Types**: `ShoppingListViewModel`, `ShoppingListItemViewModel`.
- **Props**: `initialItems: ShoppingListItemDTO[]`.

### `ShoppingListHeader.tsx`
- **Component description**: Displays the view title ("Shopping List") and provides a global "Check-in All" button.
- **Main elements**: `<h1>`, `<Button>`.
- **Handled interactions**: `onClick` for the "Check-in All" button.
- **Handled validation**: The "Check-in All" button will be disabled if the shopping list is empty or if any check-in/update operation is currently in progress to prevent inconsistent states.
- **Types**: None.
- **Props**: `onCheckInAll: () => void`, `isInteractive: boolean`, `itemCount: number`.

### `ShoppingListTable.tsx` / `ShoppingCardList.tsx`
- **Component description**: These components are responsible for rendering the list of shopping items. `ShoppingListTable` is used for desktop views, displaying data in a structured table. `ShoppingCardList` is used for mobile views, displaying items as individual cards. They map over the list of items and render a row/card for each.
- **Main elements**: `<table>`, `<tbody>` / `<div>` container.
- **Handled interactions**: Bubbles up events from child rows/cards.
- **Handled validation**: None.
- **Types**: `ShoppingListItemViewModel[]`.
- **Props**: `items: ShoppingListItemViewModel[]`, `onUpdateQuantity: (id: string, quantity: number) => void`, `onCheckInItem: (id: string) => void`.

### `ShoppingListTableRow.tsx` / `ShoppingCard.tsx`
- **Component description**: Represents a single item in the shopping list. It displays the product name, a `QuantityInput` to adjust the purchase quantity, and a "Check-in" button.
- **Main elements**: `<tr>` with `<td>` cells / `<div>` card, `QuantityInput`, `Button`.
- **Handled interactions**: `onChange` on the quantity input (debounced), and `onClick` on the "Check-in" button.
- **Handled validation**: The quantity input must not accept values less than 1. All interactive elements (input, button) will be disabled if the item is currently being updated or checked in.
- **Types**: `ShoppingListItemViewModel`.
- **Props**: `item: ShoppingListItemViewModel`, `onUpdateQuantity: (id: string, quantity: number) => void`, `onCheckInItem: (id: string) => void`.

### `EmptyState.tsx`
- **Component description**: A reusable component that is displayed when the shopping list is empty. It shows a user-friendly message confirming that no items are needed.
- **Main elements**: `<div>` with a title and a message.
- **Handled interactions**: None.
- **Handled validation**: None.
- **Types**: None.
- **Props**: `title: string`, `message: string`.

## 5. Types

### `ShoppingListItemViewModel`
This custom ViewModel extends the API's `ShoppingListItemDTO` to include flags for managing UI state during asynchronous operations. This is essential for providing real-time feedback to the user.

```typescript
import type { ShoppingListItemDTO } from "@/types";

export interface ShoppingListItemViewModel extends ShoppingListItemDTO {
  /** True if the item's quantity is being updated via an API call. */
  isUpdating?: boolean;
  /** True if the item is being checked-in via an API call. */
  isCheckingIn?: boolean;
}
```

### `ShoppingListViewModel`
This ViewModel represents the complete state of the shopping list view, including the list of items and global loading/error states.

```typescript
import type { ShoppingListItemViewModel } from "./ShoppingListItemViewModel";

export interface ShoppingListViewModel {
  /** The list of all shopping list items. */
  items: ShoppingListItemViewModel[];
  /** True during the initial fetch of the shopping list. */
  isLoading: boolean;
  /** True when the "Check-in All" action is in progress. */
  isCheckingInAll: boolean;
  /** Holds a global error message if an operation fails. */
  error?: string | null;
}
```

## 6. State Management

State will be centralized and managed within a custom React hook: `useShoppingList`. This hook will be consumed by the `ShoppingListView` component.

- **Hook**: `useShoppingList(initialItems: ShoppingListItemDTO[])`
- **State**: It will internally manage the `ShoppingListViewModel` object.
- **Purpose**: This hook will encapsulate all business logic:
    - Initializing state with server-fetched data.
    - Providing functions to interact with the API (`updateItemQuantity`, `checkInItem`, `checkInAllItems`).
    - Handling optimistic updates for a fluid UX.
    - Managing loading and error states for each item individually and for the view globally.

## 7. API Integration

Frontend components will interact with the API via functions exposed by the `useShoppingList` hook.

- **Fetch List**:
    - **Endpoint**: `GET /api/v1/shopping-list`
    - **Trigger**: Performed server-side in `shopping-list.astro` on initial page load.
    - **Response Type**: `ShoppingListResponseDTO` (`{ data: ShoppingListItemDTO[] }`).

- **Update Quantity**:
    - **Endpoint**: `PATCH /api/v1/shopping-list/{itemId}`
    - **Trigger**: User changes quantity in `QuantityInput` (debounced `onChange`).
    - **Request Type**: `UpdateShoppingListItemCommand` (`{ quantity_to_purchase: number }`).
    - **Response Type**: `ShoppingListItemDTO`.

- **Check-In Item**:
    - **Endpoint**: `POST /api/v1/shopping-list/{itemId}/check-in`
    - **Trigger**: User clicks the "Check-in" button for an item.
    - **Request Type**: None.
    - **Response Code**: `204 No Content`.

- **Check-In All Items**:
    - **Endpoint**: `POST /api/v1/shopping-list/check-in`
    - **Trigger**: User clicks the "Check-in All" button.
    - **Request Type**: None.
    - **Response Code**: `204 No Content`.

## 8. User Interactions

- **View Loads**: The list of items is displayed. A loader is shown if data fetching is deferred to the client.
- **User Edits Quantity**: The user types a new number in the `QuantityInput`. After a short debounce period (e.g., 500ms), an API call is made. The input is disabled while the update is in progress.
- **User Clicks "Check-in"**: The corresponding item is optimistically removed from the list, and its row/card is disabled. A success toast is shown. On failure, the item reappears, and an error toast is displayed.
- **User Clicks "Check-in All"**: All items are optimistically removed from the list, and the "Check-in All" button is disabled. A success toast is shown. On failure, the list is restored, and an error toast is displayed.
- **Empty List**: If the list is or becomes empty, the `EmptyState` component is rendered with the message: "Your shopping list is empty. All your items are well-stocked!".

## 9. Conditions and Validation

- **Quantity Input**: The `QuantityInput` component will enforce a minimum value of `1`. It will only accept integer values.
- **Button States**:
    - The "Check-in" button for an item is disabled if that item is being updated (`isUpdating`) or checked in (`isCheckingIn`).
    - The "Check-in All" button is disabled if the list is empty, or if `isCheckingInAll` is true, or if any single item has `isUpdating` or `isCheckingIn` set to true.
    - All interactive elements are disabled during their respective async operations to prevent duplicate requests.

## 10. Error Handling

- **API Failures**: Any failed API call (e.g., due to network issues or server errors) will be caught.
- **User Feedback**: An error message will be displayed to the user via a toast notification (e.g., using `sonner`).
- **State Reversal**: For optimistic updates (check-in, check-in all), if the API call fails, the application state will be reverted to its previous condition. For example, if a check-in fails, the removed item will be added back to the list.
- **Boundary Cases**: If a `PATCH` request fails, the UI will reflect the last known valid state from the server.

## 11. Implementation Steps

1.  **Create Page File**: Create `src/pages/shopping-list.astro`. Set up the page layout and perform the initial `GET /api/v1/shopping-list` data fetch.
2.  **Define Types**: Create `ShoppingListItemViewModel` and `ShoppingListViewModel` type definitions in a new file, e.g., `src/components/shopping-list/types.ts`.
3.  **Create View Component**: Create the main `ShoppingListView.tsx` component. It should accept `initialItems` as a prop.
4.  **Implement `useShoppingList` Hook**: Create `src/lib/hooks/useShoppingList.ts`. Implement the state logic, optimistic updates, and API-calling functions (`updateItemQuantity`, `checkInItem`, `checkInAllItems`).
5.  **Build UI Components**:
    - Create `ShoppingListHeader.tsx` with the title and "Check-in All" button.
    - Create `ShoppingListTable.tsx` and `ShoppingListTableRow.tsx` for the desktop layout. Use `shadcn/ui` `Table` components.
    - Create responsive logic to render `ShoppingCardList.tsx` and `ShoppingCard.tsx` on mobile screens.
    - Ensure a reusable `QuantityInput` is used.
    - Use the existing `EmptyState` component for when the list is empty.
6.  **Integrate Components and Hook**: Connect the `useShoppingList` hook to `ShoppingListView.tsx`. Pass down state and handler functions as props to the child components (`ShoppingListHeader`, `ShoppingListTable`, etc.).
7.  **Add Responsiveness**: Use Tailwind CSS media queries to switch between the table view (`hidden md:table`) and the card list view (`md:hidden`).
8.  **Implement Feedback**: Add loading indicators (e.g., disabled state, spinners) for all async operations. Integrate `sonner` toasts for success and error notifications.
9.  **Testing**: Manually test all user stories: viewing the list, updating quantities, checking in single items, checking in all items, and verifying the empty state.
