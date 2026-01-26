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
    await this.submitButton.waitFor({ state: "visible" });
    await this.submitButton.click();
  }

  /**
   * Perform complete login action
   */
  async login(email: string, password: string) {
    // Wait for the form to be fully loaded and interactive
    await this.loginForm.waitFor({ state: "visible" });

    // Small delay to ensure React has hydrated
    await this.page.waitForLoadState("networkidle");

    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();

    // Wait for successful login and redirect to home page
    await this.page.waitForURL("/", { timeout: 10000 });
  }
}
