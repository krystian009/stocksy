import { test, expect } from "@playwright/test";
import { NavigationComponent, InventoryPage } from "./page-objects";

/**
 * E2E Test: Complete Inventory Workflow
 *
 * This test covers the following scenario:
 * 1. User navigates to inventory page
 * 2. User adds a product with quantity 2 and minimum 1
 * 3. Product shows on the inventory page in the table
 * 4. User decreases the value of that product by 1
 * 5. Inventory page updates
 * 6. User deletes the product
 * 7. Inventory page no longer shows any products
 *
 * Environment Variables Required:
 * - E2E_USERNAME: Test user email
 * - E2E_PASSWORD: Test user password
 */

test.describe("Inventory Management Workflow", () => {
  let navigation: NavigationComponent;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    // Initialize Page Object Models
    navigation = new NavigationComponent(page);
    inventoryPage = new InventoryPage(page);

    // Navigate to home page to ensure authenticated session is loaded
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("complete inventory workflow - add, update, delete product", async ({ page }) => {
    // Test data
    const testProduct = {
      name: `Test Product ${Date.now()}`,
      quantity: 2,
      threshold: 1,
    };

    // Step 1: Navigate to inventory page
    await navigation.goToInventory();
    await expect(page).toHaveURL("/inventory");

    // Step 2: Add a new product
    await inventoryPage.addProduct(testProduct.name, testProduct.quantity, testProduct.threshold);

    // Step 3: Verify product appears in table
    await inventoryPage.waitForProduct(testProduct.name);
    expect(await inventoryPage.isTableVisible()).toBe(true);
    expect(await inventoryPage.hasProduct(testProduct.name)).toBe(true);

    // Verify product details
    const initialQuantity = await inventoryPage.getProductQuantityValue(testProduct.name);
    expect(initialQuantity).toBe(String(testProduct.quantity));

    // Step 4: Decrease product quantity by 1
    await inventoryPage.decreaseProductQuantity(testProduct.name);

    // Step 5: Verify quantity updated (wait for debounce)
    await inventoryPage.waitForQuantityUpdate();
    const updatedQuantity = await inventoryPage.getProductQuantityValue(testProduct.name);
    expect(updatedQuantity).toBe(String(testProduct.quantity - 1));

    // Step 6: Delete the product
    await inventoryPage.deleteProduct(testProduct.name);

    // Step 7: Verify product no longer exists in table
    await inventoryPage.waitForProductRemoval(testProduct.name);
    expect(await inventoryPage.hasProduct(testProduct.name)).toBe(false);
  });

  test("cancel product deletion", async ({ page }) => {
    const testProduct = {
      name: `Persistent Product ${Date.now()}`,
      quantity: 5,
      threshold: 2,
    };

    // Navigate to inventory page
    await navigation.goToInventory();
    await expect(page).toHaveURL("/inventory");

    // Add a product
    await inventoryPage.addProduct(testProduct.name, testProduct.quantity, testProduct.threshold);
    await inventoryPage.waitForProduct(testProduct.name);

    // Open delete dialog but cancel
    await inventoryPage.openDeleteDialog(testProduct.name);
    await inventoryPage.cancelDelete();

    // Verify product still exists
    expect(await inventoryPage.hasProduct(testProduct.name)).toBe(true);
  });

  test("increase product quantity", async ({ page }) => {
    const testProduct = {
      name: `Quantity Test Product ${Date.now()}`,
      quantity: 3,
      threshold: 1,
    };

    // Navigate to inventory page
    await navigation.goToInventory();
    await expect(page).toHaveURL("/inventory");

    // Add a product
    await inventoryPage.addProduct(testProduct.name, testProduct.quantity, testProduct.threshold);
    await inventoryPage.waitForProduct(testProduct.name);

    // Increase quantity
    await inventoryPage.increaseProductQuantity(testProduct.name);
    await inventoryPage.waitForQuantityUpdate();

    // Verify quantity increased
    const updatedQuantity = await inventoryPage.getProductQuantityValue(testProduct.name);
    expect(updatedQuantity).toBe(String(testProduct.quantity + 1));
  });

  test("edit product details", async ({ page }) => {
    const timestamp = Date.now();
    const initialProduct = {
      name: `Original Product ${timestamp}`,
      quantity: 10,
      threshold: 3,
    };
    const updatedProduct = {
      name: `Updated Product ${timestamp}`,
      quantity: 15,
      threshold: 5,
    };

    // Navigate to inventory page
    await navigation.goToInventory();
    await expect(page).toHaveURL("/inventory");

    // Add a product
    await inventoryPage.addProduct(initialProduct.name, initialProduct.quantity, initialProduct.threshold);
    await inventoryPage.waitForProduct(initialProduct.name);

    // Edit product
    await inventoryPage.editProduct(initialProduct.name);
    await inventoryPage.fillProductName(updatedProduct.name);
    await inventoryPage.fillProductQuantity(updatedProduct.quantity);
    await inventoryPage.fillProductThreshold(updatedProduct.threshold);
    await inventoryPage.submitProductForm();

    // Verify product updated
    await inventoryPage.waitForProduct(updatedProduct.name);
    expect(await inventoryPage.hasProduct(updatedProduct.name)).toBe(true);
    expect(await inventoryPage.hasProduct(initialProduct.name)).toBe(false);
  });
});
