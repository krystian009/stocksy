# Inventory View – Manual Test Checklist

Use this checklist to validate the `/inventory` experience after local changes or before a release. All actions assume you are running the Astro dev server (`npm run dev`) and have seeded data as needed.

## Setup

- [ ] Start the app and navigate to `http://localhost:4321/inventory`.
- [ ] Ensure network tab is clear to observe API calls to `/api/v1/products`.

## Initial Load

- [ ] Verify loading skeleton renders while data is being fetched.
- [ ] Confirm the initial product list and pagination metadata match the API response.
- [ ] Trigger a forced network error (e.g., disable network) and confirm the inline error banner appears.

## Sorting & Refresh

- [ ] Change the sort field to `Name` and toggle order between `A to Z` / `Z to A`; verify list updates accordingly.
- [ ] Change the sort field to `Quantity` and verify API calls include the correct `sort`/`order` params.
- [ ] Click `Refresh` and confirm products re-fetch without page reset.

## Pagination

- [ ] Use `Next`/`Previous` controls; ensure the page number updates and API requests send the correct `page` param.
- [ ] On the last page, delete items until the next page is empty; confirm the view navigates back to the previous page.

## Creating Products

- [ ] Click `Add Product`; confirm dialog opens with empty defaults and validation messages for required fields.
- [ ] Submit a valid product and confirm it appears in the table, toast success message shows, and dialog closes.
- [ ] Attempt to create a duplicate name; ensure toast shows conflict error and form remains open.

## Editing Products

- [ ] Click `Edit` on an item; confirm dialog pre-fills existing values.
- [ ] Update the name/quantity/minimum threshold, submit, and verify optimistic row state clears once the API succeeds.
- [ ] Simulate a server error (e.g., stop server) and confirm the row shows an error state with toast feedback.

## Deleting Products

- [ ] Click `Delete`; ensure confirmation dialog displays the product name.
- [ ] Confirm deletion, observe optimistic UI (row fades) and toast success.
- [ ] Trigger a deletion error (restore network after request starts) and verify the row reverts with an error indicator.

## Quantity Adjustments

- [ ] Use increment/decrement buttons; ensure quantity updates optimistically and disables at `0`.
- [ ] Manually type a number; confirm invalid input (letters, negatives) is rejected and debounce update fires after 500 ms.
- [ ] Trigger a failing update (network error) and confirm the row highlights with an error message.

## Empty State

- [ ] Remove all products; verify the bordered empty state with “Add your first product” CTA renders and opens the form.

## Accessibility & Keyboard

- [ ] Tab through header controls, table actions, and dialogs; ensure focus styles are visible.
- [ ] Press `Escape` inside dialogs to close them without submitting.
- [ ] Confirm all interactive elements have accessible labels (e.g., quantity buttons, sort controls).

Document any regressions in the issue tracker before shipping.

