import { type Locator, type Page } from "@playwright/test";

/**
 * Page Object Model for the Login Page
 *
 * Handles all interactions with the login page including:
 * - Filling in credentials
 * - Submitting the form
 * - Verifying login success
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-button");
    this.loginForm = page.getByTestId("login-form");
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * Fill in the email field
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill in the password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the login form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Perform complete login action
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /**
   * Wait for navigation after successful login
   */
  async waitForNavigation() {
    await this.page.waitForURL("/");
  }

  /**
   * Check if the login form is visible
   */
  async isVisible() {
    return await this.loginForm.isVisible();
  }
}
