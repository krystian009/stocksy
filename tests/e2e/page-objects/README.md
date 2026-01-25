# Page Object Models (POM)

This directory contains Page Object Model classes for E2E testing with Playwright.

## Prerequisites

Before running E2E tests, you need to set up the required environment variables:

1. Copy `.env.example` to `.env.test`:
   ```bash
   cp .env.example .env.test
   ```

2. Set the following environment variables in `.env.test`:
   - `E2E_USERNAME`: Test user email address
   - `E2E_PASSWORD`: Test user password

   Example:
   ```env
   E2E_USERNAME=test@example.com
   E2E_PASSWORD=SecurePassword123
   ```

3. The Playwright configuration loads these variables from `.env.test` automatically.

## Overview

Page Object Model is a design pattern that creates an abstraction layer between tests and the UI. Each page or component in the application has a corresponding class that encapsulates its structure and behaviors.

## Benefits

- **Maintainability**: UI changes only require updates to the page objects, not individual tests
- **Reusability**: Common actions can be reused across multiple tests
- **Readability**: Tests read like user stories rather than implementation details
- **Type Safety**: TypeScript provides autocompletion and compile-time error checking

## Structure

```
tests/e2e/pages/
├── LoginPage.ts              # Login page interactions
├── NavigationComponent.ts    # Navigation bar interactions
├── InventoryPage.ts          # Inventory page interactions
└── index.ts                  # Centralized exports
```

## Page Object Classes

### LoginPage

Handles authentication flow including login form interactions.

```typescript
import { LoginPage } from "./page-objects";

const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login("user@example.com", "password123");
```

### NavigationComponent

Handles main navigation and user menu interactions.

```typescript
import { NavigationComponent } from "./page-objects";

const navigation = new NavigationComponent(page);
await navigation.goToInventory();
await navigation.logout();
```

### InventoryPage

Handles inventory management including CRUD operations on products.

```typescript
import { InventoryPage } from "./page-objects";

const inventoryPage = new InventoryPage(page);
await inventoryPage.addProduct("Product Name", 10, 2);
await inventoryPage.decreaseProductQuantity("Product Name");
await inventoryPage.deleteProduct("Product Name");
```

## Creating a New Page Object

When creating a new page object, follow these guidelines:

1. **Use TypeScript** for type safety
2. **Initialize all locators in the constructor** using `data-test-id` attributes
3. **Create meaningful method names** that describe user actions
4. **Return promises** for async operations
5. **Add JSDoc comments** to document methods
6. **Group related methods** together

### Template

```typescript
import { type Locator, type Page } from "@playwright/test";

/**
 * Page Object Model for [Page Name]
 *
 * Brief description of what this page does
 */
export class PageName {
  readonly page: Page;
  readonly element: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.getByTestId("element-test-id");
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto("/path");
  }

  /**
   * Perform an action
   */
  async performAction() {
    await this.element.click();
  }
}
```

## Best Practices

### 1. Use Data Test IDs

Always use `data-test-id` attributes for locators instead of CSS selectors or text content:

```typescript
// ✅ Good - stable and semantic
this.submitButton = page.getByTestId("login-submit-button");

// ❌ Bad - fragile and dependent on styling
this.submitButton = page.locator("button.btn-primary");

// ❌ Bad - fragile and dependent on text content
this.submitButton = page.getByRole("button", { name: "Sign in" });
```

### 2. Create Atomic Methods

Each method should perform a single, focused action:

```typescript
// ✅ Good - single responsibility
async fillEmail(email: string) {
  await this.emailInput.fill(email);
}

async fillPassword(password: string) {
  await this.passwordInput.fill(password);
}

async submit() {
  await this.submitButton.click();
}

// ✅ Also good - composite method for common flow
async login(email: string, password: string) {
  await this.fillEmail(email);
  await this.fillPassword(password);
  await this.submit();
}
```

### 3. Return Locators for Dynamic Elements

For elements that appear multiple times (like table rows), return locators:

```typescript
// ✅ Good - returns locator for dynamic filtering
getProductRowByName(productName: string) {
  return this.page.getByTestId("product-row").filter({ hasText: productName });
}

// Usage in test
const productRow = inventoryPage.getProductRowByName("Test Product");
await expect(productRow).toBeVisible();
```

### 4. Add Waiting Methods

Create explicit wait methods for common timing scenarios:

```typescript
/**
 * Wait for quantity update (handles debounce delay)
 */
async waitForQuantityUpdate(delayMs: number = 600) {
  await this.page.waitForTimeout(delayMs);
}

/**
 * Wait for product to appear in table
 */
async waitForProduct(productName: string) {
  await this.getProductRowByName(productName).waitFor({ state: "visible" });
}
```

### 5. Use Type-Safe Parameters

Use TypeScript types for better developer experience:

```typescript
// ✅ Good - type-safe parameters
async addProduct(name: string, quantity: number, threshold: number) {
  // ...
}

// ✅ Good - accept multiple types with conversion
async fillProductQuantity(quantity: number | string) {
  await this.productQuantityInput.fill(String(quantity));
}
```

### 6. Keep Page Objects Independent

Page objects should not depend on each other. Navigation between pages should be handled in tests:

```typescript
// ✅ Good - pages are independent
test("workflow", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  
  await loginPage.goto();
  await loginPage.login("user@example.com", "password");
  await inventoryPage.goto(); // Explicit navigation
});

// ❌ Bad - tight coupling
class InventoryPage {
  constructor(page: Page, loginPage: LoginPage) {
    this.loginPage = loginPage; // Don't do this
  }
}
```

## Testing with Page Objects

Example test using multiple page objects:

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage, NavigationComponent, InventoryPage } from "./page-objects";

test.describe("Inventory Management", () => {
  test("add and delete product", async ({ page }) => {
    // Initialize page objects
    const loginPage = new LoginPage(page);
    const navigation = new NavigationComponent(page);
    const inventoryPage = new InventoryPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login("user@example.com", "password123");
    
    // Navigate to inventory
    await navigation.goToInventory();
    
    // Add product
    await inventoryPage.addProduct("Test Product", 5, 2);
    await inventoryPage.waitForProduct("Test Product");
    
    // Verify product exists
    expect(await inventoryPage.hasProduct("Test Product")).toBe(true);
    
    // Delete product
    await inventoryPage.deleteProduct("Test Product");
    await inventoryPage.waitForProductRemoval("Test Product");
    
    // Verify product removed
    expect(await inventoryPage.hasProduct("Test Product")).toBe(false);
  });
});
```

## Resources

- [Playwright Page Object Model](https://playwright.dev/docs/pom)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Project Test IDs Documentation](../../docs/e2e-test-ids.md)
