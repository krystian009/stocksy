# Stocksy Authentication Module - Technical Specification

## 1. Overview

This document outlines the technical architecture for implementing user authentication in the Stocksy application. The design is based on the functional requirements specified in `prd.md` (US-001, US-002, US-003, US-004, US-018) and aligns with the existing technology stack (Astro, React, Supabase, Tailwind CSS).

The primary goal is to create a secure and seamless authentication experience, including user registration, login, logout, and password recovery, while ensuring that all application routes are protected and accessible only to authenticated users.

## 2. User Interface (UI) Architecture

The frontend will be extended with new pages, components, and layouts to manage the authentication flow.

### 2.1. New Pages (Astro)

Four new pages will be created under `src/pages/` to handle different authentication states. These pages will be responsible for rendering the layout and embedding the interactive React form components.

-   **`src/pages/login.astro`**:
    -   **Purpose**: Allows existing users to sign in.
    -   **Content**: Will display the `LoginForm` component.
    -   **Access**: Publicly accessible. If an authenticated user navigates here, they should be redirected to the home page (`/`).

-   **`src/pages/register.astro`**:
    -   **Purpose**: Allows new users to create an account.
    -   **Content**: Will display the `RegisterForm` component.
    -   **Access**: Publicly accessible. If an authenticated user navigates here, they should be redirected to the home page (`/`).

-   **`src/pages/forgot-password.astro`**:
    -   **Purpose**: Allows users to request a password reset link.
    -   **Content**: Will display the `ForgotPasswordForm` component.
    -   **Access**: Publicly accessible.

-   **`src/pages/password-reset.astro`**:
    -   **Purpose**: Allows users to set a new password after following the reset link from their email.
    -   **Content**: Will display a `PasswordResetForm` component.
    -   **Access**: Publicly accessible, typically via a token-based link from Supabase.

### 2.2. New Components (React)

New React components will be created under `src/components/auth/` to handle form logic, state management, and user interaction. These will use `zod` for schema validation (via `react-hook-form`) and `sonner` for displaying toast notifications.

-   **`src/components/auth/LoginForm.tsx`**:
    -   **Responsibility**: Manages the login form state, client-side validation, and submission.
    -   **Fields**: Email, Password.
    -   **Actions**: On submit, POSTs credentials to the `/api/auth/login` endpoint.
    -   **Feedback**: Displays validation errors and server responses (e.g., "Invalid credentials").
    -   **Additional UI**: Includes a "Forgot Password?" link that navigates to `/forgot-password` (required by US-003).

-   **`src/components/auth/RegisterForm.tsx`**:
    -   **Responsibility**: Manages the registration form state and validation.
    -   **Fields**: Email, Password, Confirm Password.
    -   **Actions**: On submit, POSTs credentials to `/api/auth/register`.
    -   **Feedback**: Displays validation errors (e.g., "Passwords do not match," "Email already in use").

-   **`src/components/auth/ForgotPasswordForm.tsx`**:
    -   **Responsibility**: Manages the password recovery request form.
    -   **Fields**: Email.
    -   **Actions**: On submit, POSTs the email to `/api/auth/password-reset`.
    -   **Feedback**: Confirms that a reset email has been sent.

-   **`src/components/auth/PasswordResetForm.tsx`**:
    -   **Responsibility**: Manages the new password submission form after user clicks the reset link.
    -   **Fields**: New Password, Confirm New Password.
    -   **Actions**: On submit, POSTs the new password to `/api/auth/update-password`.
    -   **Feedback**: Displays validation errors (e.g., "Passwords do not match") and confirms successful password update.
    -   **Note**: The reset token/code from the URL will be automatically handled by Supabase client.

-   **`src/components/auth/AuthButton.tsx`**:
    -   **Responsibility**: A client-side component that conditionally renders a "Login" or "Logout" button.
    -   **State**: It will check the user's authentication status.
    -   **Actions**:
        -   If logged out, it renders a link/button to `/login`.
        -   If logged in, it renders a "Logout" button that, when clicked, POSTs to `/api/auth/logout`.

### 2.3. Layout and Navigation Updates

-   **`src/layouts/Layout.astro`**:
    -   Will be updated to include the `AuthButton` component in the main navigation header.
    -   It will receive the user session information from Astro's middleware (`Astro.locals.user`) to decide whether to render the main content or a restricted view (though redirection is preferred).

-   **`src/components/Navigation.astro`**:
    -   This component will be modified to include a new `AuthButton` component in the top-right corner, as required by US-018.

### 2.4. Validation and Error Handling

-   **Client-Side (React Forms)**:
    -   Use `zod` and `react-hook-form` for real-time input validation (e.g., email format, password length, password confirmation).
    -   Display inline error messages next to the corresponding form fields.
-   **Server-Side (API Responses)**:
    -   API endpoints will return structured JSON errors (e.g., `{ success: false, error: 'Invalid credentials' }`).
    -   The React forms will handle these responses and display user-friendly notifications using `sonner`.

## 3. Backend Logic

Backend logic will be implemented using Astro API routes and middleware, leveraging the server-side capabilities of the framework.

### 3.1. API Endpoints (`src/pages/api/auth/`)

-   **`POST /api/auth/login`**:
    -   **Responsibility**: Handles user login.
    -   **Input**: `email`, `password`.
    -   **Logic**:
        1.  Validate input data (e.g., non-empty, valid email format).
        2.  Call Supabase `signInWithPassword`.
        3.  On success, Supabase Auth Helpers will set a session cookie.
        4.  Return a success response, which the client will use to redirect to `/`.
        5.  On failure, return a 401 Unauthorized status with an error message.

-   **`POST /api/auth/register`**:
    -   **Responsibility**: Handles new user registration.
    -   **Input**: `email`, `password`.
    -   **Logic**:
        1.  Validate input data.
        2.  Call Supabase `signUp` with `emailRedirectTo` option disabled (to prevent confirmation requirement).
        3.  On success, the user is automatically logged in (session created) and the API returns a success response with session data. The client will redirect to `/` (satisfying US-001 requirement for auto-login).
        4.  On failure (e.g., user already exists), return a 409 Conflict status with an error message.
    -   **Note**: Email confirmation is **disabled** for MVP to satisfy US-001's auto-login requirement. In Supabase dashboard, ensure "Enable email confirmations" is turned OFF under Authentication > Settings.

-   **`POST /api/auth/logout`**:
    -   **Responsibility**: Handles user logout.
    -   **Logic**:
        1.  Call Supabase `signOut`.
        2.  Supabase Auth Helpers will clear the session cookie.
        3.  Return a success response, which the client will use to redirect to `/login`.

-   **`POST /api/auth/password-reset`**:
    -   **Responsibility**: Initiates the password reset flow.
    -   **Input**: `email`.
    -   **Logic**:
        1.  Validate input.
        2.  Call Supabase `resetPasswordForEmail` with `redirectTo` pointing to `/password-reset`.
        3.  Return a success response, regardless of whether the email exists, to prevent user enumeration.

-   **`POST /api/auth/update-password`**:
    -   **Responsibility**: Updates the user's password after they've followed the reset link.
    -   **Input**: `password` (new password).
    -   **Logic**:
        1.  Validate input (password strength requirements).
        2.  Call Supabase `updateUser({ password: newPassword })`. The session will be automatically available from the reset token.
        3.  On success, return a success response. The client will redirect to `/login` with a success message.
        4.  On failure, return a 400 Bad Request with an error message.

### 3.2. Middleware (`src/middleware/index.ts`)

A central middleware file will be responsible for route protection and session management.

-   **Responsibility**:
    1.  Create a server-side Supabase client for each request.
    2.  Check for a valid session on every page request (except for public auth pages and auth API endpoints).
    3.  If the user is not authenticated and is trying to access a protected page, redirect them to `/login`.
    4.  If the user is authenticated and tries to access auth pages (`/login`, `/register`), redirect them to `/` (home page).
    5.  If the user is authenticated, store the user session in `Astro.locals.session` and `Astro.locals.user` so it's accessible in all server-rendered Astro pages and components.
    6.  Handle the code exchange flow for OAuth callbacks (if ever needed) and password reset links.

-   **Public Routes**: `/login`, `/register`, `/forgot-password`, `/password-reset`, and `/api/auth/*` endpoints.
-   **Protected Routes**: All other pages (`/`, `/inventory`, `/shopping-list`) and API endpoints (`/api/v1/*`) require authentication.

### 3.3. Data Models and Validation

-   **DTOs (Data Transfer Objects)**: `zod` schemas will be defined in `src/lib/schemas/auth.schema.ts` for registration, login, and password reset payloads to ensure type safety and consistent validation rules between client and server.
-   **Server-Side Validation**: API routes will use these `zod` schemas to parse and validate incoming request bodies before processing them.

## 4. Authentication System (Supabase Integration)

Supabase will be the core of the authentication system. We will use the `@supabase/supabase-js` library and its Astro-specific server-side auth helpers.

### 4.1. Supabase Client Configuration

-   **Server-Side**: A Supabase client will be instantiated in the middleware for every request, using environment variables for the URL and `anon` key. This ensures secure interaction with the Supabase API from the server.
-   **Client-Side**: A separate client-side Supabase instance can be created for use in React components if needed, though most interactions will be routed through our Astro API endpoints.

### 4.2. Session Management

-   **Cookie-Based Sessions**: The Astro server-side auth helpers for Supabase will be used to manage sessions via secure, HTTP-only cookies. This is the recommended approach for server-rendered applications.
-   **Session Availability**: The session object, populated by the middleware, will be available in `Astro.locals` for use in `.astro` files and API routes, enabling conditional rendering and secure data fetching.

### 4.3. Authentication Flows

-   **Registration**: `supabase.auth.signUp()` will be used. **Email confirmations will be DISABLED** in the Supabase project settings to satisfy US-001's requirement that users are "automatically logged in" after registration. Upon successful signup, a session is immediately created and the user is redirected to the home page.
-   **Login**: `supabase.auth.signInWithPassword()` will authenticate the user and create a session. On success, redirects to `/` (home page) per US-002.
-   **Logout**: `supabase.auth.signOut()` will invalidate the session and clear the auth cookies. On success, redirects to `/login` per US-004.
-   **Password Recovery**:
    1.  User clicks "Forgot Password?" link on the login page (US-003).
    2.  `supabase.auth.resetPasswordForEmail()` sends the reset link to the user's email with `redirectTo: '/password-reset'`.
    3.  When the user clicks the link in their email, they are taken to `/password-reset`. Supabase appends authentication tokens to the URL.
    4.  The password reset page displays `PasswordResetForm` where the user enters a new password.
    5.  On submit, the form POSTs to `/api/auth/update-password` which calls `supabase.auth.updateUser({ password: newPassword })`.
    6.  On success, user is redirected to `/login` and can log in with their new password (US-003).

## 5. Implementation Checklist

### 5.1. Supabase Configuration Requirements
-   **Disable Email Confirmation**: In Supabase Dashboard → Authentication → Settings → "Enable email confirmations" must be **OFF**
-   **Email Templates**: Configure password reset email template with correct redirect URL
-   **Auth Settings**: Ensure session timeout and refresh token settings are appropriate for the application
