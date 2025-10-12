# Stocksy

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/your-username/10x-stocksy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Stocksy is a web-based application designed to simplify household inventory management. It provides users with the core tools to track their products, reduce unnecessary purchases, and avoid running out of essential items. This is a sample project for 10xDev training certification.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
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
*   **Astro 5:** A web framework for building fast, content-focused websites.
*   **React 19:** A JavaScript library for building interactive user interfaces.
*   **TypeScript 5:** A typed superset of JavaScript that enhances code quality.
*   **Tailwind CSS 4:** A utility-first CSS framework for rapid UI development.
*   **Shadcn/ui:** A collection of accessible and beautifully designed UI components.

### Backend and Database
*   **Supabase:** An open-source Backend-as-a-Service (BaaS) platform providing database, authentication, APIs, and real-time capabilities out of the box.

### CI/CD and Hosting
*   **GitHub Actions:** For continuous integration and deployment automation.
*   **DigitalOcean:** Cloud hosting provider for application deployment.

## Getting Started Locally

To run the project locally, follow these steps:

### Prerequisites

- **Node.js:** `v22.14.0` (as specified in the `.nvmrc` file). We recommend using a version manager like `nvm`.
- **npm:** Should be installed with Node.js.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/10x-stocksy.git
    cd 10x-stocksy
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
    Your `.env` file should look like this:
    ```
    PUBLIC_SUPABASE_URL="your-supabase-url"
    PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:4321`.

## Available Scripts

The following scripts are available in the project:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Lints the codebase for errors.
- `npm run lint:fix`: Lints the codebase and automatically fixes issues.
- `npm run format`: Formats the code using Prettier.

## Project Scope

### In Scope (MVP Features)
- **User Authentication:** Registration, login, and password recovery via Supabase.
- **Product Management:** Add, edit, and delete products with a name, quantity, and minimum threshold.
- **Inventory List:** A view of all products, sortable alphabetically or by quantity.
- **Shopping List:** Automatically generated based on items that fall below their minimum threshold.
- **Check-In Workflow:** Update inventory quantities from the shopping list after purchase.
- **Home Page Notifications:** Alerts for low-stock items.

### Out of Scope (for now)
- Data import from external sources.
- Inventory categorization.
- Barcode scanning.
- Product expiration date tracking.
- Collaboration features between users.
- Native mobile application (the MVP is web-only).

## Project Status

This project is currently in the **Minimum Viable Product (MVP)** development phase. It is not yet ready for production use but serves as a foundational version for future iterations.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
