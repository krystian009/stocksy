import { type Locator, type Page } from "@playwright/test";

/**
 * Page Object Model for the Navigation Component
 *
 * Handles all interactions with the main navigation bar including:
 * - Navigating to different pages
 * - User menu interactions
 * - Logout functionality
 */
export class NavigationComponent {
  readonly page: Page;
  readonly homeLink: Locator;
  readonly inventoryLink: Locator;
  readonly shoppingListLink: Locator;
  readonly userNavTrigger: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeLink = page.getByTestId("nav-link-home");
    this.inventoryLink = page.getByTestId("nav-link-inventory");
    this.shoppingListLink = page.getByTestId("nav-link-shopping-list");
    this.userNavTrigger = page.getByTestId("user-nav-trigger");
    this.logoutButton = page.getByTestId("logout-button");
  }

  /**
   * Navigate to the home page
   */
  async goToHome() {
    await this.homeLink.click();
  }

  /**
   * Navigate to the inventory page
   */
  async goToInventory() {
    await this.inventoryLink.click();
  }

  /**
   * Navigate to the shopping list page
   */
  async goToShoppingList() {
    await this.shoppingListLink.click();
  }

  /**
   * Open the user navigation menu
   */
  async openUserMenu() {
    await this.userNavTrigger.click();
  }

  /**
   * Logout the current user
   */
  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
  }

  /**
   * Wait for redirect to login page after logout
   */
  async waitForLogoutRedirect() {
    await this.page.waitForURL("/login");
  }

  /**
   * Check if navigation is visible (user is authenticated)
   */
  async isAuthenticated() {
    return await this.homeLink.isVisible();
  }
}
