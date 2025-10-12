# Product Requirements Document (PRD) - Stocksy
## 1. Product Overview
Stocksy is a web-based application designed to simplify household inventory management. The Minimum Viable Product (MVP) focuses on providing users with core tools to track their products, reduce unnecessary purchases, and avoid running out of essential items. Users can add, edit, and delete products, view their current inventory, and receive automatic alerts for low-stock items. The application automatically generates a shopping list based on user-defined minimum thresholds, helping to streamline the restocking process.

## 2. User Problem
Managing household product inventory can often be tedious and time-consuming. A lack of clear visibility into available products frequently results in unnecessary extra trips to the store and redundant purchases. This often leads to buying items that are not needed or forgetting to restock essential goods, causing both waste and increased expenses. Stocksy aims to solve this by providing a simple and centralized system for inventory tracking.

## 3. Functional Requirements
### 3.1. User Account System
- User authentication (registration, login, password recovery) will be handled by the Supabase Authentication module.
- Each user's inventory is private and associated with their account.

### 3.2. Product Management
- Users can add products with a name (minimum 3 characters), a current quantity (non-negative integer), and a minimum threshold (non-negative integer).
- Users can edit all product details (name, quantity, and minimum threshold).
- When editing quantity, users can either input the number directly or use increment/decrement buttons for quick adjustments.
- Users can permanently delete products from their inventory. A confirmation prompt will be displayed before deletion to prevent accidental removal.

### 3.3. Inventory List
- A dedicated view displays all products in the user's inventory, showing the product name and its current quantity.
- The inventory list defaults to alphabetical sorting by product name.
- Users have an option to sort the list by "quantity remaining" in ascending order to quickly identify low-stock items.
- If a user's inventory is empty, an "empty state" message will be displayed, prompting them to add their first product.

### 3.4. Shopping List
- The shopping list is automatically generated when a product's quantity falls below its user-defined minimum threshold.
- The list suggests a purchase quantity required to bring the item's stock back up to its minimum threshold.
- Users can modify the suggested purchase quantity for any item on the list before shopping.
- The shopping list updates in real-time if product quantities or minimum thresholds are changed in the inventory.
- Users cannot manually add custom, non-inventory items to the shopping list.

### 3.5. Check-In Workflow
- From the shopping list, a user can perform a "check-in" action for an item they have purchased.
- This action updates the product's quantity in the main inventory based on the purchase quantity and removes the item from the shopping list.

### 3.6. Home Page Notifications
- The home page will display clear notifications for any products that have fallen below their minimum threshold, alerting the user to low-stock items immediately upon login.

## 4. Product Boundaries
### 4.1. Out of Scope for MVP
- Data import from external sources.
- Inventory categorization (e.g., food, cleaning, etc.).
- Barcode scanning for product entry.
- Tracking of product expiration dates.
- Resource sharing or collaboration between users (e.g., household members).
- Native mobile application (the MVP is web-only).
- Social features.
- Guided tutorials or onboarding flows.

### 4.2. Technical Constraints
- The application is designed for web/desktop use only.
- The minimum supported screen width is 1024px. Mobile responsiveness is not a requirement for the MVP.

## 5. User Stories
### 5.1. Authentication
---
- ID: US-001
- Title: New User Registration
- Description: As a new user, I want to create a personal account so that I can manage my own inventory.
- Acceptance Criteria:
  - Given I am on the registration page,
  - When I enter a valid email and a secure password,
  - And I click the "Sign Up" button,
  - Then my account is created,
  - And I am automatically logged in and redirected to the home page.
  - Given I enter an already registered email, I should see a clear error message.

---
- ID: US-002
- Title: User Login
- Description: As a returning user, I want to log in to my account so that I can access my inventory.
- Acceptance Criteria:
  - Given I am on the login page,
  - When I enter my correct email and password,
  - And I click the "Log In" button,
  - Then I am authenticated and redirected to my home page.
  - Given I enter incorrect credentials, I should see a clear error message.

---
- ID: US-003
- Title: User Password Recovery
- Description: As a user who forgot my password, I want to be able to reset it so that I can regain access to my account.
- Acceptance Criteria:
  - Given I am on the login page,
  - When I click the "Forgot Password?" link,
  - And I enter my registered email address,
  - Then I receive an email with instructions and a link to reset my password.
  - When I follow the link and set a new password, I can then log in with the new password.

---
- ID: US-004
- Title: User Logout
- Description: As a logged-in user, I want to log out of my account to ensure my session is secure.
- Acceptance Criteria:
  - Given I am logged into the application,
  - When I click the "Logout" button,
  - Then my session is terminated,
  - And I am redirected to the login page.

### 5.2. Inventory Management
---
- ID: US-005
- Title: Add a New Product to Inventory
- Description: As a user, I want to add a new product to my inventory by specifying its name, quantity, and a minimum stock level, so I can start tracking it.
- Acceptance Criteria:
  - Given I am on the inventory page,
  - When I open the "Add Product" form,
  - And I enter a name (at least 3 characters), a starting quantity (e.g., 5), and a minimum threshold (e.g., 2),
  - And I click "Save,"
  - Then the new product appears in my inventory list with the correct details.

---
- ID: US-006
- Title: View Inventory List
- Description: As a user, I want to see a clear list of all my products and their current quantities so I know what I have at a glance.
- Acceptance Criteria:
  - Given I have products in my inventory,
  - When I navigate to the inventory page,
  - Then I see a list of all my products.
  - Each item in the list displays the product name and current quantity.
  - The list is sorted alphabetically by default.

---
- ID: US-007
- Title: Edit Product Details
- Description: As a user, I want to edit a product's name and minimum threshold to keep my inventory information accurate.
- Acceptance Criteria:
  - Given I have a product in my inventory,
  - When I click the "Edit" button for that product,
  - And I change the product name or minimum threshold,
  - And I save the changes,
  - Then the updated details are reflected in the inventory list.
  - If the threshold change causes the item to be low-stock, it appears on the shopping list.

---
- ID: US-008
- Title: Update Product Quantity
- Description: As a user, I want to quickly update the quantity of a product to reflect its current stock level.
- Acceptance Criteria:
  - Given I am viewing a product in my inventory,
  - When I use the increment (+) or decrement (-) buttons,
  - Then the quantity is immediately updated by 1.
  - When I directly type a new number into the quantity input field,
  - Then the quantity is updated to that number.
  - The quantity cannot be a negative number.

---
- ID: US-009
- Title: Delete a Product from Inventory
- Description: As a user, I want to permanently delete a product I no longer need to keep my inventory list clean.
- Acceptance Criteria:
  - Given I have a product in my inventory,
  - When I click the "Delete" button for that product,
  - Then a confirmation dialog appears asking, "Are you sure you want to delete this product?"
  - When I confirm the deletion,
  - Then the product is permanently removed from my inventory and any associated lists (e.g., shopping list).

---
- ID: US-010
- Title: Input Validation for Product Form
- Description: As a user, I want to be prevented from entering invalid data when adding or editing a product so that the inventory data remains consistent and reliable.
- Acceptance Criteria:
  - Given I am in the "Add Product" or "Edit Product" form,
  - When I try to save with a product name less than 3 characters long, I see an error message.
  - When I try to save with a negative number for Quantity or Minimum Threshold, I see an error message.
  - The form cannot be submitted until all validation errors are resolved.

### 5.3. Home Page & Shopping List
---
- ID: US-011
- Title: View Low-Stock Notifications
- Description: As a user, I want to see immediate notifications for low-stock items on my home page so I am aware of what needs restocking.
- Acceptance Criteria:
  - Given I have products where the quantity is at or below the minimum threshold,
  - When I log in or navigate to the home page,
  - Then I see a prominent section or list displaying all low-stock items.

---
- ID: US-012
- Title: View Automatically Generated Shopping List
- Description: As a user, I want the app to automatically create a shopping list for me when an item runs low so I don't have to remember to add it myself.
- Acceptance Criteria:
  - Given a product's quantity falls below its minimum threshold,
  - When I navigate to the shopping list page,
  - Then that product appears on the list.
  - The list suggests a purchase quantity to replenish the stock to its minimum level (e.g., if min is 5 and current is 2, it suggests buying 3).

---
- ID: US-013
- Title: Adjust Purchase Quantity on Shopping List
- Description: As a user, I want to be able to adjust the suggested purchase quantity on the shopping list in case I want to buy more or less than recommended.
- Acceptance Criteria:
  - Given an item is on my shopping list with a suggested quantity,
  - When I edit the quantity field for that item,
  - Then the new quantity is saved.
  - This new quantity will be used when I "check-in" the item.

---
- ID: US-014
- Title: "Check-in" Purchased Items
- Description: As a user, I want to quickly "check-in" my purchases from the shopping list to update my inventory in one step.
- Acceptance Criteria:
  - Given I have an item on my shopping list,
  - When I click the "Check-in" button for that item,
  - Then the item's quantity in my inventory is increased by the purchase quantity specified on the shopping list.
  - The item is removed from the shopping list.

### 5.4. UI/UX & Edge Cases
---
- ID: US-015
- Title: Sort Inventory List
- Description: As a user, I want to sort my inventory list to find items easily, either alphabetically or by the lowest quantity.
- Acceptance Criteria:
  - Given I am viewing my inventory list,
  - When I select the "Sort by Name" option, the list is ordered alphabetically (A-Z).
  - When I select the "Sort by Quantity" option, the list is ordered by the lowest quantity remaining (ascending).
  - The default sort is alphabetical.

---
- ID: US-016
- Title: View Inventory Empty State
- Description: As a new user with no products, I want to see a helpful message instead of a blank page, guiding me on what to do next.
- Acceptance Criteria:
  - Given I have not added any products to my inventory,
  - When I navigate to the inventory page,
  - Then I see a message like, "Your inventory is empty. Add your first product to get started!"
  - A clear button or link to "Add Product" is visible.

---
- ID: US-017
- Title: View Shopping List Empty State
- Description: As a user with no low-stock items, I want to see a confirmation that my shopping list is empty.
- Acceptance Criteria:
  - Given none of my products are below their minimum threshold,
  - When I navigate to the shopping list page,
  - Then I see a message like, "Your shopping list is empty. All your items are well-stocked!"

## 6. Success Metrics
- 90% of users maintain a populated inventory in their profiles (at least one item).
- 65% of users update inventory status at least weekly and generate shopping lists.
