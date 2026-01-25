# E2E Test IDs Reference

This document lists all `data-test-id` attributes added to components for the E2E test scenario.

## Test IDs by Component

### Authentication - LoginForm
**File:** `src/components/auth/LoginForm.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| Form | `login-form` | The main login form container |
| Email Input | `login-email-input` | Email address input field |
| Password Input | `login-password-input` | Password input field |
| Submit Button | `login-submit-button` | Sign in submit button |

### Navigation
**File:** `src/components/Navigation.astro`

| Element | Test ID | Description |
|---------|---------|-------------|
| Home Link | `nav-link-home` | Navigation link to home page |
| Inventory Link | `nav-link-inventory` | Navigation link to inventory page |
| Shopping List Link | `nav-link-shopping-list` | Navigation link to shopping list page |

### User Navigation - UserNav
**File:** `src/components/auth/UserNav.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| User Menu Trigger | `user-nav-trigger` | Button to open user dropdown menu |
| Logout Button | `logout-button` | Logout menu item in dropdown |

### Inventory Header
**File:** `src/components/inventory/InventoryHeader.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| Add Product Button | `add-product-button` | Button to open add product dialog |

### Product Form Dialog
**File:** `src/components/inventory/ProductFormDialog.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| Form | `product-form` | The product form container |
| Name Input | `product-name-input` | Product name input field |
| Quantity Input | `product-quantity-input` | Product quantity input field |
| Threshold Input | `product-threshold-input` | Product minimum threshold input field |
| Cancel Button | `product-form-cancel-button` | Cancel button in form |
| Submit Button | `product-form-submit-button` | Submit button (Add/Save) |

### Product Table
**File:** `src/components/inventory/ProductTable.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| Table | `inventory-table` | The main inventory table |

### Product Table Row
**File:** `src/components/inventory/ProductTableRow.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| Table Row | `product-row` | Individual product row in table |
| Product Name | `product-name` | Product name text in row |

### Quantity Input
**File:** `src/components/inventory/QuantityInput.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| Decrease Button | `quantity-decrease-button` | Button to decrease quantity by 1 |
| Quantity Input | `quantity-input` | Direct quantity input field |
| Increase Button | `quantity-increase-button` | Button to increase quantity by 1 |

### Product Actions
**File:** `src/components/inventory/ProductActions.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| Edit Button | `product-edit-button` | Button to edit product |
| Delete Button | `product-delete-button` | Button to delete product |

### Delete Confirmation Dialog
**File:** `src/components/inventory/DeleteConfirmationDialog.tsx`

| Element | Test ID | Description |
|---------|---------|-------------|
| Cancel Button | `delete-cancel-button` | Cancel deletion button |
| Confirm Button | `delete-confirm-button` | Confirm deletion button |

## Page Object Model Classes

The following Page Object Model classes are available in `tests/e2e/pages/`:

### LoginPage
**File:** `tests/e2e/pages/LoginPage.ts`

Handles all login page interactions including filling credentials, submitting the form, and verifying login success.

**Key Methods:**
- `goto()` - Navigate to login page
- `login(email, password)` - Complete login flow
- `fillEmail(email)` - Fill email field
- `fillPassword(password)` - Fill password field
- `submit()` - Submit the form
- `waitForNavigation()` - Wait for redirect after login
- `isVisible()` - Check if login form is visible

### NavigationComponent
**File:** `tests/e2e/pages/NavigationComponent.ts`

Handles navigation bar interactions including page navigation and user menu actions.

**Key Methods:**
- `goToHome()` - Navigate to home page
- `goToInventory()` - Navigate to inventory page
- `goToShoppingList()` - Navigate to shopping list page
- `openUserMenu()` - Open user dropdown menu
- `logout()` - Complete logout flow
- `waitForLogoutRedirect()` - Wait for redirect to login
- `isAuthenticated()` - Check if user is logged in

### InventoryPage
**File:** `tests/e2e/pages/InventoryPage.ts`

Handles all inventory page interactions including product CRUD operations and quantity management.

**Key Methods:**
- `goto()` - Navigate to inventory page
- `addProduct(name, quantity, threshold)` - Complete add product flow
- `openAddProductDialog()` - Open add product dialog
- `fillProductName(name)` - Fill product name
- `fillProductQuantity(quantity)` - Fill product quantity
- `fillProductThreshold(threshold)` - Fill minimum threshold
- `submitProductForm()` - Submit product form
- `cancelProductForm()` - Cancel product form
- `getProductRowByName(name)` - Get specific product row
- `decreaseProductQuantity(name)` - Decrease product quantity
- `increaseProductQuantity(name)` - Increase product quantity
- `getProductQuantityValue(name)` - Get current quantity value
- `editProduct(name)` - Open edit dialog for product
- `deleteProduct(name)` - Complete delete flow
- `openDeleteDialog(name)` - Open delete confirmation
- `confirmDelete()` - Confirm deletion
- `cancelDelete()` - Cancel deletion
- `hasProduct(name)` - Check if product exists
- `waitForProduct(name)` - Wait for product to appear
- `waitForProductRemoval(name)` - Wait for product to disappear
- `waitForQuantityUpdate(delayMs)` - Wait for debounce delay
- `isTableVisible()` - Check if table is visible
- `getProductCount()` - Get total product count

## Usage Example

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage, NavigationComponent, InventoryPage } from "./page-objects";

test("complete inventory workflow", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const navigation = new NavigationComponent(page);
  const inventoryPage = new InventoryPage(page);

  // Login
  await loginPage.goto();
  await loginPage.login("user@example.com", "password123");
  await loginPage.waitForNavigation();

  // Navigate to inventory
  await navigation.goToInventory();

  // Add product
  await inventoryPage.addProduct("Test Product", 2, 1);
  await inventoryPage.waitForProduct("Test Product");

  // Decrease quantity
  await inventoryPage.decreaseProductQuantity("Test Product");
  await inventoryPage.waitForQuantityUpdate();

  // Delete product
  await inventoryPage.deleteProduct("Test Product");
  await inventoryPage.waitForProductRemoval("Test Product");

  // Logout
  await navigation.logout();
  await navigation.waitForLogoutRedirect();

  await expect(page).toHaveURL("/login");
});
```

## Notes

- All test IDs follow kebab-case naming convention
- Test IDs are semantic and describe the element's purpose
- Quantity input has a 500ms debounce delay - tests should wait accordingly using `waitForQuantityUpdate()`
- Dialog buttons follow `{dialog-name}-{action}-button` pattern
- Navigation links follow `nav-link-{page-name}` pattern
- Page Object Models are located in `tests/e2e/pages/` directory
- Use the centralized export from `tests/e2e/pages/index.ts` for imports
