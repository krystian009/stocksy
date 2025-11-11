# View Implementation Plan: Home (Dashboard)

## 1. Overview

The Home (Dashboard) view is the authenticated landing page at “/”. It surfaces low‑stock items at a glance by listing items from the user’s shopping list (i.e., products at or below their minimum threshold) with suggested purchase quantities. It features an accessible skeleton for initial load, a friendly empty state when nothing needs attention, and error feedback for failure cases.

## 2. View Routing

- Path: `/`
- File: `src/pages/index.astro`
- Change: Replace the current redirect to `/inventory` with a dashboard page that renders a React island for dynamic data (client-side fetch of low‑stock items).

## 3. Component Structure

```
src/pages/index.astro                          # Home page entry
└── <HomeDashboard client:load />              # React island

src/components/home/HomeDashboard.tsx          # Container: fetch + states + layout
├── src/components/home/HomeDashboardSkeleton.tsx
├── src/components/home/LowStockList.tsx
│   └── src/components/home/LowStockItemCard.tsx
└── src/components/home/HomeEmptyState.tsx

src/lib/hooks/useLowStockItems.ts              # Custom hook for data + state
src/lib/api/shopping-list.ts                   # API client for GET /api/v1/shopping-list
src/components/ui/card.tsx (if missing)        # Minimal Card primitives (or Tailwind div wrappers)
```

## 4. Component Details

### `src/pages/index.astro`
- Component description: Astro page for `/`. Wraps content in `src/layouts/Layout.astro` and renders `<HomeDashboard client:load />`.
- Main elements: Page heading (e.g., “Dashboard”), landmark `<main>`, region for list.
- Handled interactions: None (presentation + island mount).
- Validation conditions: None.
- Types: None.
- Props: None.

### `HomeDashboard.tsx`
- Component description: Container responsible for fetching and presenting low‑stock items. Manages loading, empty, error, and success states.
- Main elements and children: Heading, description text, conditional render of `HomeDashboardSkeleton`, `HomeEmptyState`, `LowStockList`, or an error alert.
- Handled interactions: Initial fetch on mount; optional “Retry” button on error.
- Validation conditions:
  - Render `HomeEmptyState` when `items.length === 0` after successful fetch.
  - Guard against non-positive `quantity_to_purchase` (should not occur; defensive check).
- Types:
  - Uses `LowStockItemViewModel[]` from the hook.
- Props: None.

### `LowStockList.tsx`
- Component description: Semantic list of low‑stock items.
- Main elements: `<section aria-labelledby="low-stock-heading">`, `<ul role="list">` with list items rendered via `LowStockItemCard`.
- Handled interactions: None (read-only).
- Validation conditions: Requires non-empty `items` array.
- Types: `LowStockItemViewModel[]`.
- Props:
  - `items: LowStockItemViewModel[]`

### `LowStockItemCard.tsx`
- Component description: Displays a single low‑stock entry as a card with product name and suggested `quantity_to_purchase`.
- Main elements: `Card` wrapper; product name as heading; quantity detail in content; optional “View inventory” link to `/inventory`.
- Handled interactions: None (read-only).
- Validation conditions:
  - Defensive: If `quantity_to_purchase <= 0`, show “Review required” badge instead of a number.
- Types: `LowStockItemViewModel`.
- Props:
  - `item: LowStockItemViewModel`

### `HomeDashboardSkeleton.tsx`
- Component description: Loading skeleton that approximates final list layout to avoid layout shift.
- Main elements: 3–6 card placeholders with `animate-pulse`; semantic container with `aria-hidden="true"`; `aria-busy="true"` on the list region.
- Handled interactions: None.
- Validation conditions: None.
- Types: None.
- Props: None.

### `HomeEmptyState.tsx`
- Component description: Positive empty state when there are no low‑stock items.
- Main elements: Centered container with heading like “All set!” and supportive text “No items are low in stock.”
- Handled interactions: Optional “Go to inventory” link.
- Validation conditions: Only render when data fetch succeeded and `items.length === 0`.
- Types: None.
- Props: None.

## 5. Types

- Existing DTOs (from `src/types.ts`):
  - `ShoppingListItemDTO`:
    - `id: string`
    - `product_id: string`
    - `quantity_to_purchase: number`
    - `product_name: string`
  - `ShoppingListResponseDTO`:
    - `data: ShoppingListItemDTO[]`

- New ViewModel types:
  - `LowStockItemViewModel`: mirrors `ShoppingListItemDTO` for UI clarity.
    - `id: string`
    - `product_id: string`
    - `product_name: string`
    - `quantity_to_purchase: number`

- Optional internal error shape (for API client only; not exported globally):
  - `ApiError = { message: string; errors?: string[] }`

## 6. State Management

- Custom hook: `useLowStockItems`
  - Purpose: Encapsulate fetch, loading, error, and data mapping to `LowStockItemViewModel[]`.
  - State:
    - `items: LowStockItemViewModel[]`
    - `isLoading: boolean`
    - `error: Error | null`
    - Optional: `lastUpdatedAt: number` (useful for future “Refreshed at …” UI)
  - Actions:
    - `refetch(): Promise<void>` (used by Retry button on error)
  - Behavior:
    - On mount, request `GET /api/v1/shopping-list`; map DTOs 1:1 to view models.
    - Set loading true before request, false after settle.
    - Set error on failures; clear error on success.

## 7. API Integration

- Endpoint: `GET /api/v1/shopping-list`
- Request:
  - Method: GET
  - Headers: `Accept: application/json`
  - Body: none
- Response:
  - 200 OK: `ShoppingListResponseDTO`
  - 401 Unauthorized
  - 500 Internal Server Error (generic)
- Client module: `src/lib/api/shopping-list.ts`
  - `export async function getShoppingList(): Promise<ShoppingListResponseDTO>`
  - Reuse `handleResponse`/`parseError` pattern from `src/lib/api/products.ts`
  - Propagate thrown `Error` upward for the hook to handle

## 8. User Interactions

- Navigate to `/`:
  - Skeleton shown immediately.
  - On success with items: list of `LowStockItemCard` is rendered.
  - On success with no items: `HomeEmptyState` rendered.
  - On failure: error alert with “Retry” re-triggers fetch.
- Keyboard/Screen reader:
  - List uses semantic `<ul role="list">` and labeled `<section>` with `aria-labelledby`.
  - Error message placed in `aria-live="polite"` region.

## 9. Conditions and Validation

- Authentication condition (API-level):
  - If `401`, treat as unauthenticated: display message “Your session has expired.” and route to login (future), or show non-blocking alert in MVP.
- Data validity:
  - `quantity_to_purchase` must be a positive integer (server-side Zod enforces). UI defensively hides nonsensical values if received.
- State-driven rendering:
  - `isLoading === true` → skeleton
  - `error !== null` → error alert
  - `!error && !isLoading && items.length === 0` → empty state
  - `!error && !isLoading && items.length > 0` → list

## 10. Error Handling

- Network/API errors:
  - Catch in hook; set `error` and stop loading; render alert with human-readable message.
  - Include a “Retry” control that calls `refetch()`.
- Unauthorized (401):
  - Display an auth message; in future wire to auth flow (supabase) to redirect. Do not expose raw error details.
- Resilience:
  - If parsing fails, fall back to a generic “Could not load low‑stock items. Please try again.”

## 11. Implementation Steps

1. Routing
   - Update `src/pages/index.astro` to render `<HomeDashboard client:load />` within `Layout` instead of redirecting.

2. API client
   - Create `src/lib/api/shopping-list.ts` with `getShoppingList()` modeled after `products.ts` helpers.

3. Hook
   - Implement `src/lib/hooks/useLowStockItems.ts`:
     - State: `items`, `isLoading`, `error`.
     - `useEffect` to fetch on mount.
     - `refetch` method for retries.

4. Components
   - `src/components/home/HomeDashboard.tsx`:
     - Use hook; branch on loading/error/empty/success.
     - Wrap content in `<main>` with proper headings and labels.
   - `src/components/home/HomeDashboardSkeleton.tsx`:
     - Render 3–6 pulsing card placeholders; apply `aria-busy` on container.
   - `src/components/home/HomeEmptyState.tsx`:
     - Positive message and optional link to `/inventory`.
   - `src/components/home/LowStockList.tsx` and `LowStockItemCard.tsx`:
     - Semantic list; each card shows `product_name` and `quantity_to_purchase`.

5. UI primitives
   - If `src/components/ui/card.tsx` is absent, add a minimal Card (wrapper, header, title, content) or use styled divs with Tailwind classes for the list items.

6. Accessibility
   - Use `<section aria-labelledby="low-stock-heading">`, `<h2 id="low-stock-heading">`.
   - Apply `role="status"` and `aria-live="polite"` for error/empty notices.

7. Testing
   - Verify states: loading, success-with-items, success-empty, error, and unauthorized (mock 401).
   - Check keyboard nav and landmarks.

8. Performance
   - Keep list static; no heavy recomputation; small lists render as simple flex/grid.

## Appendix: Mapping to PRD and User Story

- PRD 3.6 Home Page Notifications: This view directly implements the low‑stock notification list.
- User Story US‑011: Satisfied by `HomeDashboard` + `LowStockList` fetching `GET /api/v1/shopping-list` and rendering the items prominently on the home page.


