# Stocksy

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/your-username/stocksy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/your-username/stocksy/workflows/Verify%20Master/badge.svg)](https://github.com/your-username/stocksy/actions)

Stocksy is a web-based application designed to simplify household inventory management. It provides users with the core tools to track their products, reduce unnecessary purchases, and avoid running out of essential items. This is a sample project for 10xDev training certification.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [CI/CD](#cicd)
- [Project Structure](#project-structure)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [Contributing](#contributing)
- [License](#license)

## Project Description

Managing household product inventory can be tedious and time-consuming. A lack of visibility into available products often leads to redundant purchases, waste, and increased expenses. Stocksy solves this by providing a simple and centralized system for inventory tracking.

The Minimum Viable Product (MVP) focuses on core features:
- **Track Products:** Add, edit, and delete products with details like name, quantity, and a minimum stock threshold.
- **Avoid Shortages:** Receive automatic alerts for low-stock items.
- **Simplify Shopping:** An automatically generated shopping list helps streamline the restocking process.

## Tech Stack

The project is built with a modern tech stack:

### Frontend
*   **Astro 5:** A modern web framework using "islands architecture" for optimal performance, reducing JavaScript while allowing React components for interactivity.
*   **React 19:** A powerful JavaScript library for building interactive user interfaces with component-based architecture.
*   **TypeScript 5:** A statically typed superset of JavaScript that enhances code quality and developer productivity.
*   **Tailwind CSS 4:** A utility-first CSS framework for rapidly building custom user interfaces.
*   **Shadcn/ui:** A collection of beautifully designed, accessible UI components built with Radix UI and Tailwind CSS.

### Backend and Database
*   **Supabase:** An open-source Backend-as-a-Service (BaaS) platform built on PostgreSQL, providing database, user authentication, instant APIs, storage, and real-time capabilities.

### Testing
*   **Vitest:** A blazing-fast unit testing framework powered by Vite with native TypeScript support for testing services, schemas, hooks, and utility functions.
*   **@testing-library/react:** A lightweight testing library for React components that encourages best practices by testing from the user's perspective.
*   **Playwright:** A modern end-to-end testing framework that enables reliable cross-browser testing for validating complete user flows.
*   **MSW (Mock Service Worker):** An API mocking library that intercepts requests at the network level for realistic API testing.
*   **axe-core:** An accessibility testing engine for WCAG 2.1 AA compliance checking.
*   **Vitest Coverage (c8):** Code coverage reporting tool providing detailed insights into test coverage.

### Development Tools
*   **ESLint:** Code linting with TypeScript, React, and Astro plugins.
*   **Prettier:** Code formatting with Astro plugin support.
*   **Husky:** Git hooks for automated code quality checks.
*   **lint-staged:** Run linters on git staged files.

### CI/CD and Hosting
*   **GitHub Actions:** Automated testing, building, and deployment pipeline.
*   **DigitalOcean:** Cloud hosting provider for application deployment (via Docker).

## Getting Started Locally

To run the project locally, follow these steps:

### Prerequisites

- **Node.js:** `v22.14.0` (as specified in the `.nvmrc` file). We recommend using a version manager like `nvm`.
- **npm:** Should be installed with Node.js.
- **Supabase Account:** Required for database and authentication services.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/stocksy.git
    cd stocksy
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Supabase credentials. You can copy the example file:
    ```sh
    cp .env.example .env
    ```
    Your `.env` file should contain:
    ```
    SUPABASE_URL=your-supabase-url
    SUPABASE_KEY=your-supabase-anon-key
    ```

4.  **Set up the database:**
    - Navigate to your Supabase project dashboard
    - Run the SQL scripts from the `supabase/` directory to set up the database schema
    - The scripts will create the necessary tables: `products`, `shopping_list_items`, and `inventory_logs`

5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Environment Variables

The application requires the following environment variables:

### Development (`.env`)
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

### Testing (`.env.test`)
For running E2E tests, additional variables are required:
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
E2E_USERNAME_ID=test-user-uuid
E2E_USERNAME=test@example.com
E2E_PASSWORD=test-password
```

See `.env.example` for a template with all required variables.

## Available Scripts

The following scripts are available in the project:

### Development
- `npm run dev`: Starts the development server at `http://localhost:3000`
- `npm run dev:e2e`: Starts the development server in test mode
- `npm run build`: Builds the application for production
- `npm run preview`: Previews the production build locally
- `npm run astro`: Runs Astro CLI commands

### Code Quality
- `npm run lint`: Lints the codebase for errors (ESLint)
- `npm run lint:fix`: Lints and automatically fixes issues
- `npm run format`: Formats the code using Prettier

### Testing
#### Unit Tests
- `npm run test`: Runs unit tests with Vitest in watch mode
- `npm run test:ui`: Runs unit tests with Vitest UI
- `npm run test:coverage`: Runs tests with code coverage reporting

#### E2E Tests
- `npm run test:e2e`: Runs end-to-end tests with Playwright
- `npm run test:e2e:ui`: Runs E2E tests in Playwright UI mode
- `npm run test:e2e:debug`: Runs E2E tests in debug mode
- `npm run test:e2e:codegen`: Generates E2E tests using Playwright codegen

## Testing

The project maintains comprehensive test coverage with both unit and end-to-end tests.

### Unit Tests

Unit tests are written with Vitest and @testing-library/react. They cover:
- Services (product and shopping list logic)
- React hooks (useInventory, useLowStockItems, useShoppingList)
- Schemas and validation (Zod schemas)
- Utility functions

**Running unit tests:**
```bash
npm run test              # Watch mode
npm run test:ui          # Interactive UI
npm run test:coverage    # With coverage report
```

**Coverage thresholds:**
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### E2E Tests

End-to-end tests are written with Playwright and validate complete user workflows:
- Authentication (registration, login, password reset, logout)
- Inventory management (CRUD operations)
- Shopping list generation and check-in workflow

**Running E2E tests:**
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:ui       # Interactive UI mode
npm run test:e2e:debug    # Debug mode with inspector
```

**E2E test setup:**
- Tests use a dedicated test user account in Supabase
- Automatic setup authenticates the user before tests
- Automatic teardown cleans up test data after tests complete
- Requires environment variables in `.env.test` (see [Environment Variables](#environment-variables))

For more details, see the [Testing Documentation](tests/README.md).

## Code Quality

The project uses several tools to maintain code quality:

### Linting
- **ESLint** with TypeScript, React, React Hooks, Astro, and import plugins
- Configuration in `eslint.config.js`
- Runs automatically on git commits via Husky

### Formatting
- **Prettier** with Astro plugin support
- Configuration in `.prettierrc.json`
- Settings: 2-space tabs, 120-character line width, semicolons, double quotes

### Git Hooks
- **Husky** manages git hooks
- **lint-staged** runs linters on staged files before commit
- Automatically formats and lints code before committing

## CI/CD

The project uses GitHub Actions for continuous integration and deployment:

### Workflow: Verify Master

Triggered on:
- Push to `master` branch
- Pull requests to `master` branch
- Manual dispatch

**Jobs:**

1. **Lint**: Checks code quality with ESLint
2. **Build**: Verifies the application builds successfully
3. **Unit Tests**: Runs unit tests with coverage reporting
4. **E2E Tests**: Runs end-to-end tests in Chromium browser

All jobs run on `ubuntu-latest` and use Node.js version from `.nvmrc`.

**Artifacts:**
- Unit test coverage reports (retained for 1 day)
- E2E test results and Playwright reports (retained for 1 day)
- E2E failure screenshots and videos (retained for 1 day, only on failure)

**Required Secrets:**
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase anonymous key
- `E2E_USERNAME_ID`: Test user UUID
- `E2E_USERNAME`: Test user email
- `E2E_PASSWORD`: Test user password

## Project Structure

```
stocksy/
├── .ai/                      # Project documentation and planning
│   ├── prd.md               # Product Requirements Document
│   ├── tech-stack.md        # Technical stack documentation
│   ├── endpoints/           # API endpoint implementation plans
│   └── views/               # View component implementation plans
├── .cursor/                  # Cursor IDE configuration
├── .github/                  # GitHub configuration
│   └── workflows/           # CI/CD workflows
├── src/
│   ├── components/          # React and Astro components
│   │   ├── auth/           # Authentication components
│   │   ├── home/           # Home dashboard components
│   │   ├── inventory/      # Inventory management components
│   │   ├── shopping-list/  # Shopping list components
│   │   └── ui/             # Shadcn/ui components
│   ├── db/                  # Supabase client and types
│   ├── layouts/             # Astro layouts
│   ├── lib/                 # Services and utilities
│   │   ├── api/            # API client functions
│   │   ├── hooks/          # React hooks
│   │   ├── schemas/        # Zod validation schemas
│   │   └── services/       # Business logic services
│   ├── middleware/          # Astro middleware
│   ├── pages/               # Astro pages and API routes
│   │   └── api/            # API endpoints
│   │       ├── auth/       # Authentication endpoints
│   │       └── v1/         # API v1 endpoints
│   ├── styles/              # Global styles
│   └── types.ts             # Shared TypeScript types
├── supabase/                # Supabase configuration and SQL scripts
├── tests/                   # Test files
│   ├── e2e/                # Playwright E2E tests
│   ├── unit/               # Vitest unit tests
│   └── helpers/            # Test utilities and mocks
└── public/                  # Static assets
```

For detailed coding guidelines, see `.cursor/rules/shared.mdc`.

## Project Scope

### In Scope (MVP Features)
- **User Authentication:** Registration, login, password recovery, and logout via Supabase
- **Product Management:** 
  - Add products with name (3-120 characters), quantity (non-negative), and minimum threshold (non-negative)
  - Edit all product details (name, quantity, threshold)
  - Quick quantity adjustments with increment/decrement buttons
  - Delete products with confirmation dialog
- **Inventory List:** 
  - View all products with name and current quantity
  - Sort alphabetically (default) or by quantity remaining
  - Empty state messaging for new users
- **Shopping List:** 
  - Automatically generated when products fall below minimum threshold
  - Suggested purchase quantity to reach minimum threshold
  - Editable purchase quantities
  - Real-time updates based on inventory changes
- **Check-In Workflow:** 
  - Update inventory quantities from shopping list
  - Remove checked-in items from shopping list
- **Home Page Dashboard:** 
  - Low-stock item notifications and alerts
  - Quick overview of inventory status
  - Summary statistics

### Out of Scope (for now)
- Data import from external sources
- Inventory categorization (e.g., food, cleaning)
- Barcode scanning for product entry
- Product expiration date tracking
- Multi-user collaboration or resource sharing
- Native mobile application (MVP is web-only)
- Social features
- Guided tutorials or onboarding flows

### Technical Constraints
- Web/desktop application only
- Minimum supported screen width: 1024px
- Mobile responsiveness not required for MVP

## Project Status

This project is currently in the **Minimum Viable Product (MVP)** development phase. It is not yet ready for production use but serves as a foundational version for future iterations.

**Current Status:**
- ✅ Core features implemented
- ✅ Unit tests with 80%+ coverage
- ✅ E2E tests for critical user flows
- ✅ CI/CD pipeline configured
- 🚧 Deployment to DigitalOcean in progress

## Contributing

This is a training project for 10xDev certification. While it's not open for external contributions, the following guidelines are used:

### Development Workflow
1. Create a feature branch from `master`
2. Make your changes following the coding guidelines in `.cursor/rules/`
3. Ensure all tests pass (`npm run test` and `npm run test:e2e`)
4. Lint and format your code (`npm run lint:fix` and `npm run format`)
5. Commit changes (Husky will run pre-commit hooks)
6. Push to GitHub (CI/CD pipeline will run)
7. Create a pull request to `master`

### Coding Standards
- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write tests for new features
- Maintain 80%+ code coverage
- Handle errors and edge cases early in functions
- Use early returns to avoid nested conditionals
- Document complex logic with comments

See `.cursor/rules/shared.mdc` and related rule files for detailed guidelines.

## Documentation

- **Product Requirements:** [.ai/prd.md](.ai/prd.md)
- **Tech Stack Details:** [.ai/tech-stack.md](.ai/tech-stack.md)
- **Testing Guide:** [tests/README.md](tests/README.md)
- **API Documentation:** [.ai/api-plan.md](.ai/api-plan.md)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Built with ❤️ as part of the 10xDev training certification program.
