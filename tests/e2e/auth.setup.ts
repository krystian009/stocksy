import { expect, test as setup } from "@playwright/test";
import path from "path";
import { LoginPage, NavigationComponent } from "./page-objects";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

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

setup("authenticate", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const navigation = new NavigationComponent(page);

  const testUser = getTestCredentials();

  await loginPage.goto();
  await loginPage.login(testUser.email, testUser.password);

  // Optionally verify we're actually authenticated
  await expect(page).toHaveURL("/");
  expect(await navigation.isAuthenticated()).toBe(true);

  await page.context().storageState({ path: authFile });
});
