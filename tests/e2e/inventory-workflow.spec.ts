import { test, expect } from "@playwright/test";
import { LoginPage, NavigationComponent, InventoryPage } from "./page-objects";

/**
 * E2E Test: Complete Inventory Workflow
 *
 * This test covers the following scenario:
 * 1. User logs in successfully
 * 2. User navigates to inventory page
 * 3. User adds a product with quantity 2 and minimum 1
 * 4. Product shows on the inventory page in the table
 * 5. User decreases the value of that product by 1
 * 6. Inventory page updates
 * 7. User deletes the product
 * 8. Inventory page no longer shows any products
 * 9. User logs out
 *
 * Environment Variables Required:
 * - E2E_USERNAME: Test user email
 * - E2E_PASSWORD: Test user password
 */

// Get test credentials from environment variables
const getTestCredentials = () => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "E2E_USERNAME and E2E_PASSWORD environment variables are required. " +
        "Please set them in your .env.test file or environment."
    );
  }

  return { email: username, password };
};

test.describe("Inventory Management Workflow", () => {
  let loginPage: LoginPage;
  let navigation: NavigationComponent;
  let inventoryPage: InventoryPage;
  let testUser: { email: string; password: string };

  test.beforeAll(() => {
    // Get credentials once for all tests
    testUser = getTestCredentials();
  });

  test.beforeEach(async ({ page }) => {
    // Initialize Page Object Models
    loginPage = new LoginPage(page);
    navigation = new NavigationComponent(page);
    inventoryPage = new InventoryPage(page);
  });

  test("complete inventory workflow - add, update, delete product", async ({ page }) => {
    // Test data
    const testProduct = {
      name: "Test Product",
      quantity: 2,
      threshold: 1,
    };

    // Step 1: Login
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await loginPage.waitForNavigation();

    // Verify login successful
    await expect(page).toHaveURL("/");
    expect(await navigation.isAuthenticated()).toBe(true);

    // Step 2: Navigate to inventory page
    await navigation.goToInventory();
    await expect(page).toHaveURL("/inventory");

    // Step 3: Add a new product
    await inventoryPage.addProduct(testProduct.name, testProduct.quantity, testProduct.threshold);

    // Step 4: Verify product appears in table
    await inventoryPage.waitForProduct(testProduct.name);
    expect(await inventoryPage.isTableVisible()).toBe(true);
    expect(await inventoryPage.hasProduct(testProduct.name)).toBe(true);

    // Verify product details
    const initialQuantity = await inventoryPage.getProductQuantityValue(testProduct.name);
    expect(initialQuantity).toBe(String(testProduct.quantity));

    // Step 5: Decrease product quantity by 1
    await inventoryPage.decreaseProductQuantity(testProduct.name);

    // Step 6: Verify quantity updated (wait for debounce)
    await inventoryPage.waitForQuantityUpdate();
    const updatedQuantity = await inventoryPage.getProductQuantityValue(testProduct.name);
    expect(updatedQuantity).toBe(String(testProduct.quantity - 1));

    // Step 7: Delete the product
    await inventoryPage.deleteProduct(testProduct.name);

    // Step 8: Verify product no longer exists in table
    await inventoryPage.waitForProductRemoval(testProduct.name);
    expect(await inventoryPage.hasProduct(testProduct.name)).toBe(false);

    // Step 9: Logout
    await navigation.logout();
    await navigation.waitForLogoutRedirect();

    // Verify redirected to login page
    await expect(page).toHaveURL("/login");
    expect(await loginPage.isVisible()).toBe(true);
  });

  test("cancel product deletion", async () => {
    const testProduct = {
      name: "Persistent Product",
      quantity: 5,
      threshold: 2,
    };

    // Login and navigate to inventory
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await navigation.goToInventory();

    // Add a product
    await inventoryPage.addProduct(testProduct.name, testProduct.quantity, testProduct.threshold);
    await inventoryPage.waitForProduct(testProduct.name);

    // Open delete dialog but cancel
    await inventoryPage.openDeleteDialog(testProduct.name);
    await inventoryPage.cancelDelete();

    // Verify product still exists
    expect(await inventoryPage.hasProduct(testProduct.name)).toBe(true);
  });

  test("increase product quantity", async () => {
    const testProduct = {
      name: "Quantity Test Product",
      quantity: 3,
      threshold: 1,
    };

    // Login and navigate to inventory
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await navigation.goToInventory();

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

  test("edit product details", async () => {
    const initialProduct = {
      name: "Original Product",
      quantity: 10,
      threshold: 3,
    };
    const updatedProduct = {
      name: "Updated Product",
      quantity: 15,
      threshold: 5,
    };

    // Login and navigate to inventory
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await navigation.goToInventory();

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
