import { type Locator, type Page } from "@playwright/test";

/**
 * Page Object Model for the Inventory Page
 *
 * Handles all interactions with the inventory page including:
 * - Adding products
 * - Editing products
 * - Deleting products
 * - Managing quantities
 * - Navigating the product table
 */
export class InventoryPage {
  readonly page: Page;
  readonly addProductButton: Locator;
  readonly inventoryTable: Locator;

  // Product Form Dialog locators
  readonly productForm: Locator;
  readonly productNameInput: Locator;
  readonly productQuantityInput: Locator;
  readonly productThresholdInput: Locator;
  readonly productFormSubmitButton: Locator;
  readonly productFormCancelButton: Locator;

  // Product Table Row locators
  readonly productRow: Locator;
  readonly productName: Locator;

  // Quantity Input locators
  readonly quantityDecreaseButton: Locator;
  readonly quantityInput: Locator;
  readonly quantityIncreaseButton: Locator;

  // Product Actions locators
  readonly productEditButton: Locator;
  readonly productDeleteButton: Locator;

  // Delete Confirmation Dialog locators
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.addProductButton = page.getByTestId("add-product-button");
    this.inventoryTable = page.getByTestId("inventory-table");

    // Product Form
    this.productForm = page.getByTestId("product-form");
    this.productNameInput = page.getByTestId("product-name-input");
    this.productQuantityInput = page.getByTestId("product-quantity-input");
    this.productThresholdInput = page.getByTestId("product-threshold-input");
    this.productFormSubmitButton = page.getByTestId("product-form-submit-button");
    this.productFormCancelButton = page.getByTestId("product-form-cancel-button");

    // Product Row
    this.productRow = page.getByTestId("product-row");
    this.productName = page.getByTestId("product-name");

    // Quantity Controls
    this.quantityDecreaseButton = page.getByTestId("quantity-decrease-button");
    this.quantityInput = page.getByTestId("quantity-input");
    this.quantityIncreaseButton = page.getByTestId("quantity-increase-button");

    // Product Actions
    this.productEditButton = page.getByTestId("product-edit-button");
    this.productDeleteButton = page.getByTestId("product-delete-button");

    // Delete Dialog
    this.deleteConfirmButton = page.getByTestId("delete-confirm-button");
    this.deleteCancelButton = page.getByTestId("delete-cancel-button");
  }

  /**
   * Navigate to the inventory page
   */
  async goto() {
    await this.page.goto("/inventory");
  }

  /**
   * Open the add product dialog
   */
  async openAddProductDialog() {
    await this.addProductButton.click();
  }

  /**
   * Fill in the product name
   */
  async fillProductName(name: string) {
    await this.productNameInput.fill(name);
  }

  /**
   * Fill in the product quantity
   */
  async fillProductQuantity(quantity: number | string) {
    await this.productQuantityInput.fill(String(quantity));
  }

  /**
   * Fill in the product minimum threshold
   */
  async fillProductThreshold(threshold: number | string) {
    await this.productThresholdInput.fill(String(threshold));
  }

  /**
   * Submit the product form
   */
  async submitProductForm() {
    await this.productFormSubmitButton.click();
  }

  /**
   * Cancel the product form
   */
  async cancelProductForm() {
    await this.productFormCancelButton.click();
  }

  /**
   * Add a new product with all details
   */
  async addProduct(name: string, quantity: number, threshold: number) {
    await this.openAddProductDialog();
    await this.fillProductName(name);
    await this.fillProductQuantity(quantity);
    await this.fillProductThreshold(threshold);
    await this.submitProductForm();
  }

  /**
   * Get a product row by its name
   */
  getProductRowByName(productName: string) {
    return this.page.getByTestId("product-row").filter({ hasText: productName });
  }

  /**
   * Get the quantity input for a specific product
   */
  getProductQuantityInput(productName: string) {
    return this.getProductRowByName(productName).getByTestId("quantity-input");
  }

  /**
   * Get the decrease button for a specific product
   */
  getProductDecreaseButton(productName: string) {
    return this.getProductRowByName(productName).getByTestId("quantity-decrease-button");
  }

  /**
   * Get the increase button for a specific product
   */
  getProductIncreaseButton(productName: string) {
    return this.getProductRowByName(productName).getByTestId("quantity-increase-button");
  }

  /**
   * Decrease the quantity of a product by 1
   */
  async decreaseProductQuantity(productName: string) {
    await this.getProductDecreaseButton(productName).click();
  }

  /**
   * Increase the quantity of a product by 1
   */
  async increaseProductQuantity(productName: string) {
    await this.getProductIncreaseButton(productName).click();
  }

  /**
   * Get the current quantity value for a product
   */
  async getProductQuantityValue(productName: string): Promise<string> {
    return await this.getProductQuantityInput(productName).inputValue();
  }

  /**
   * Get the edit button for a specific product
   */
  getProductEditButton(productName: string) {
    return this.getProductRowByName(productName).getByTestId("product-edit-button");
  }

  /**
   * Get the delete button for a specific product
   */
  getProductDeleteButton(productName: string) {
    return this.getProductRowByName(productName).getByTestId("product-delete-button");
  }

  /**
   * Open the edit dialog for a product
   */
  async editProduct(productName: string) {
    await this.getProductEditButton(productName).click();
  }

  /**
   * Open the delete confirmation dialog for a product
   */
  async openDeleteDialog(productName: string) {
    await this.getProductDeleteButton(productName).click();
  }

  /**
   * Confirm deletion in the delete dialog
   */
  async confirmDelete() {
    await this.deleteConfirmButton.click();
  }

  /**
   * Cancel deletion in the delete dialog
   */
  async cancelDelete() {
    await this.deleteCancelButton.click();
  }

  /**
   * Delete a product completely (open dialog and confirm)
   */
  async deleteProduct(productName: string) {
    await this.openDeleteDialog(productName);
    await this.confirmDelete();
  }

  /**
   * Check if a product exists in the table
   */
  async hasProduct(productName: string): Promise<boolean> {
    const count = await this.getProductRowByName(productName).count();
    return count > 0;
  }

  /**
   * Wait for a product to appear in the table
   */
  async waitForProduct(productName: string) {
    await this.getProductRowByName(productName).waitFor({ state: "visible" });
  }

  /**
   * Wait for a product to disappear from the table
   */
  async waitForProductRemoval(productName: string) {
    await this.getProductRowByName(productName).waitFor({ state: "detached" });
  }

  /**
   * Check if the inventory table is visible
   */
  async isTableVisible(): Promise<boolean> {
    return await this.inventoryTable.isVisible();
  }

  /**
   * Get the count of products in the table
   */
  async getProductCount(): Promise<number> {
    return await this.productRow.count();
  }

  /**
   * Wait for quantity update (handles debounce delay)
   */
  async waitForQuantityUpdate(delayMs = 600) {
    await this.page.waitForTimeout(delayMs);
  }
}
