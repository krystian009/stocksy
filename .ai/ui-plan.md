# UI Architecture for Stocksy

## 1. UI Structure Overview

The UI architecture for Stocksy is designed as a modern, responsive web application built on Astro, React, and TypeScript. It follows a component-based structure, leveraging Astro for static page layouts and "islands" of dynamic React components for interactive elements. This hybrid approach ensures fast page loads while providing a rich, app-like user experience.

Client-side state management, data fetching, and caching are handled by **React Query (TanStack Query)**, ensuring efficient data synchronization with the backend API. All UI components are sourced from the **Shadcn/ui** library, which guarantees a consistent, accessible (WAI-ARIA compliant), and modern aesthetic. The design is fully responsive, adapting from a desktop-first layout to a mobile-friendly interface that prioritizes usability on smaller screens.

## 2. View List

### Authentication Views

These views are designed for public access and share a consistent, centered-card layout.

---

-   **View Name**: Login Page
-   **View Path**: `/login`
-   **Main Purpose**: To allow returning users to authenticate and access their accounts.
-   **Key Information to Display**: Email and password input fields, "Log In" button, and links to the "Register" and "Forgot Password" pages.
-   **Key View Components**: `Card`, `LoginForm`, `Input`, `Button`, `Toast` (for error notifications, prefer Inline error notifications).
-   **UX, Accessibility, and Security**:
    -   **UX**: Clear error messages for invalid credentials. Redirects to the home page upon successful login.
    -   **Accessibility**: Form fields are properly labeled. Keyboard navigation is fully supported.
    -   **Security**: The Supabase client library handles JWT management securely. No sensitive data is stored in the client-side code.

---

-   **View Name**: Registration Page
-   **View Path**: `/register`
-   **Main Purpose**: To allow new users to create an account.
-   **Key Information to Display**: Email, password, and confirm password fields, "Sign Up" button, and a link to the "Login" page.
-   **Key View Components**: `Card`, `RegisterForm`, `Input`, `Button`, `Toast` (for error notifications, prefer Inline error notifications).
-   **UX, Accessibility, and Security**:
    -   **UX**: Inline validation for password strength and email format. Clear feedback upon successful registration before redirecting.
    -   **Accessibility**: All form inputs have accessible labels. Error states are clearly communicated to screen readers.
    -   **Security**: Follows Supabase best practices for user sign-up.

---

-   **View Name**: Forgot Password Page
-   **View Path**: `/forgot-password`
-   **Main Purpose**: To enable users who have forgotten their password to initiate the recovery process.
-   **Key Information to Display**: Email input field, "Send Reset Instructions" button, and a link back to the "Login" page.
-   **Key View Components**: `Card`, `ForgotPasswordForm`, `Input`, `Button`, `Toast` (for error notifications, prefer Inline error notifications).
-   **UX, Accessibility, and Security**:
    -   **UX**: A confirmation toast is shown after the user submits their email, informing them to check their inbox.
    -   **Accessibility**: The form is simple and fully navigable via keyboard.
    -   **Security**: The entire password reset flow is managed by Supabase Authentication, ensuring a secure process.

### Main Application Views

These views are protected and accessible only to authenticated users. They are wrapped in a main layout containing the top navigation bar.

---

-   **View Name**: Home (Dashboard)
-   **View Path**: `/`
-   **Main Purpose**: To provide an at-a-glance summary of the inventory status, highlighting items that require attention.
-   **Key Information to Display**: A list of low-stock items (products where quantity is at or below the minimum threshold).
-   **Key View Components**: `LowStockList`, `Card`, `EmptyState` (displays a positive message if no items are low in stock).
-   **UX, Accessibility, and Security**:
    -   **UX**: Serves as the primary landing page after login, immediately surfacing the most critical information. Skeleton screens are used during the initial data load.
    -   **Accessibility**: The list of items is structured semantically. The empty state message is accessible to screen readers.
    -   **Security**: All data is fetched for the authenticated user, respecting RLS policies.

---

-   **View Name**: Inventory Page
-   **View Path**: `/inventory`
-   **Main Purpose**: To allow users to view, add, edit, and delete all products in their inventory.
-   **Key Information to Display**: A paginated list of products showing name, current quantity, and minimum threshold.
-   **Key View Components**: `ProductTable` (transforms into `ProductCardList` on mobile), `Pagination`, `Button` ("Add Product"), `Select` (for sorting), `Dialog` (for Add/Edit Product forms and Delete confirmation), `QuantityInput` (with increment/decrement buttons).
-   **UX, Accessibility, and Security**:
    -   **UX**:
        -   Optimistic UI updates for quantity changes provide instant feedback.
        -   A debounced input for manual quantity entry prevents excessive API calls.
        -   Skeleton screens indicate loading states.
        -   A modal dialog provides a focused context for adding/editing products.
        -   A confirmation dialog prevents accidental product deletion.
    -   **Accessibility**: The data table is accessible, with proper headers. All interactive elements (buttons, modals) are WAI-ARIA compliant.
    -   **Security**: All actions (create, update, delete) are authenticated API requests tied to the user's session.

---

-   **View Name**: Shopping List Page
-   **View Path**: `/shopping-list`
-   **Main Purpose**: To display a list of items that need to be purchased and allow the user to "check them in" after purchase.
-   **Key Information to Display**: A list of products with their suggested `quantity_to_purchase`.
-   **Key View Components**: `ShoppingListTable` (transforms into `ShoppingCardList` on mobile), `Input` (for adjusting quantity), `Button` ("Check-in"), `EmptyState` (if the list is empty).
-   **UX, Accessibility, and Security**:
    -   **UX**: The UI clearly communicates that this list is automatically generated. The "Check-in" action provides a quick way to update inventory.
    -   **Accessibility**: List items and interactive elements are fully accessible.
    -   **Security**: All actions are authenticated and operate within the user's scope.

## 3. User Journey Map

This map outlines the primary flow for an authenticated user managing their inventory.

1.  **Login and Arrival**: The user logs in and is redirected to the **Home** page. They immediately see a list of low-stock items, prompting them to take action.
2.  **Navigate to Inventory**: The user clicks "Inventory" in the top navigation bar to go to the **Inventory Page**.
3.  **Add a New Product**:
    -   The user clicks the "Add Product" button, which opens a **Dialog** modal.
    -   They fill in the product name, quantity, and minimum threshold.
    -   Upon saving, the modal closes, a success toast appears, and the product optimistically appears in the `ProductTable`.
4.  **Update Product Quantity**:
    -   The user finds a product in the `ProductTable` and uses the `QuantityInput`'s `+`/`-` buttons to adjust the stock.
    -   The UI updates instantly (optimistic update). The API call is made in the background.
    -   If the new quantity drops below the minimum threshold, the user knows it will now appear on the shopping list.
5.  **Review Shopping List**:
    -   The user navigates to the **Shopping List Page**.
    -   They see the product they just updated, now listed with a suggested `quantity_to_purchase`.
    -   They can adjust this quantity if needed.
6.  **Check-In Purchase**:
    -   After purchasing the item, the user returns to the **Shopping List Page**.
    -   They click the "Check-in" button for the item.
    -   The item is optimistically removed from the list, and a background API call updates the product's quantity in the main inventory.
7.  **Logout**: The user clicks the "Logout" button in the navigation header, terminating their session and redirecting them to the **Login** page.

## 4. Layout and Navigation Structure

-   **Main Layout**: A primary Astro layout component (`src/layouts/Layout.astro`) wraps all authenticated views. It includes the `TopNavBar` and the main content area where page components are rendered.
-   **Top Navigation Bar**:
    -   A persistent horizontal bar at the top of the screen.
    -   Contains links to **Home (`/`)**, **Inventory (`/inventory`)**, and **Shopping List (`/shopping-list`)**.
    -   On the right side, it includes a dropdown menu with user information and a "Logout" button.
-   **Responsive Navigation**:
    -   On screen widths less than `1024px`, the navigation links collapse into a "hamburger" menu icon.
    -   Clicking the icon reveals a slide-out or dropdown menu with the navigation links, ensuring full usability on mobile devices.
-   **Data Display**:
    -   On desktop, data-heavy lists (Inventory, Shopping List) are displayed in a `Table` for easy scanning of rows.
    -   On mobile, these tables transform into a vertical `Card`-based layout, where each card represents one item. This avoids horizontal scrolling and makes information readable on narrow screens.

## 5. Key Components

This is a list of key reusable components, built using Shadcn/ui, that form the foundation of the user interface.

-   **Dialog**: Used for modal forms ("Add Product," "Edit Product") and confirmation prompts ("Delete Product"). Ensures a focused user interaction and is fully accessible.
-   **Toast**: Provides non-intrusive, temporary notifications for actions (e.g., "Product saved successfully") and errors (e.g., "Product name already exists").
-   **Skeleton**: Placeholder components that mimic the final UI layout. They are displayed while data is being fetched, preventing layout shifts and improving the perceived performance.
-   **Table**: Used for displaying lists of data on desktop screens. Includes features like sorting and is styled for clarity.
-   **Card**: The primary container for content on mobile and for dashboard widgets. Adapts content into a readable, vertical format.
-   **Button**: Used for all primary actions (Save, Add, Delete, Check-in). Variants (e.g., primary, destructive) are used to signify the nature of an action.
-   **Input**: Standard text field for forms. Used with form management libraries for validation and state handling.
-   **Select**: A dropdown component used for sorting options on the Inventory page (e.g., "Sort by Name," "Sort by Quantity").
-   **EmptyState**: A reusable component displayed when a list is empty (e.g., no low-stock items, empty inventory). It combines a helpful message with a call-to-action button.
-   **QuantityInput**: A custom composite component featuring a numerical input flanked by `+` and `-` buttons for quick quantity adjustments.
