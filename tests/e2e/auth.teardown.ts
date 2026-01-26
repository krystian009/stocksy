/* eslint-disable no-console */
import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";

// Get Supabase credentials from environment variables
const getSupabaseCredentials = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_KEY environment variables are required. " +
        "Please set them in your .env.test file or environment."
    );
  }

  return { url, key };
};

// Get test user ID from environment variables
const getTestUserId = () => {
  const userId = process.env.E2E_USERNAME_ID;

  if (!userId) {
    throw new Error(
      "E2E_USERNAME_ID environment variable is required. " + "Please set it in your .env.test file or environment."
    );
  }

  return userId;
};

teardown("cleanup database", async () => {
  const { url, key } = getSupabaseCredentials();
  const userId = getTestUserId();

  // Create Supabase client for cleanup
  const supabase = createClient<Database>(url, key);

  console.log(`Starting database cleanup for user: ${userId}`);

  try {
    // Delete in order of foreign key dependencies:
    // 1. First delete inventory_logs (references products)
    const { error: logsError } = await supabase.from("inventory_logs").delete().eq("user_id", userId);

    if (logsError) {
      console.error("Error deleting inventory_logs:", logsError);
      throw logsError;
    }
    console.log("✓ Deleted inventory_logs");

    // 2. Then delete shopping_list_items (references products)
    const { error: shoppingError } = await supabase.from("shopping_list_items").delete().eq("user_id", userId);

    if (shoppingError) {
      console.error("Error deleting shopping_list_items:", shoppingError);
      throw shoppingError;
    }
    console.log("✓ Deleted shopping_list_items");

    // 3. Finally delete products (referenced by other tables)
    const { error: productsError } = await supabase.from("products").delete().eq("user_id", userId);

    if (productsError) {
      console.error("Error deleting products:", productsError);
      throw productsError;
    }
    console.log("✓ Deleted products");

    console.log("Database cleanup completed successfully");
  } catch (error) {
    console.error("Database cleanup failed:", error);
    throw error;
  }
});
