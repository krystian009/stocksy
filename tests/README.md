# Testing Documentation

This directory contains all test files and testing infrastructure for the Stocksy application.

## Directory Structure

```
tests/
├── e2e/                    # End-to-end tests (Playwright)
│   ├── fixtures/          # E2E test fixtures (auth, etc.)
│   └── page-objects/      # Page Object Models for E2E tests
├── unit/                   # Unit tests (Vitest)
├── fixtures/              # Shared test data fixtures
│   ├── test-users.ts      # User fixtures
│   ├── test-products.ts   # Product fixtures
│   └── test-shopping-list.ts  # Shopping list fixtures
├── mocks/                 # Mock implementations
│   ├── handlers.ts        # MSW request handlers
│   ├── server.ts          # MSW server setup
│   └── supabase.mock.ts   # Supabase client mocks
├── helpers/               # Test utilities
│   └── render.tsx         # Custom render function with providers
├── setup.ts               # Vitest global setup
└── README.md              # This file
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- path/to/test.spec.ts

# Run tests matching pattern
npm run test -- -t "product service"
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Generate E2E tests with codegen
npm run test:e2e:codegen

# Run specific test file
npm run test:e2e -- tests/e2e/auth.spec.ts

# Run tests in headed mode
npm run test:e2e -- --headed
```

## Writing Tests

### Unit Tests

Unit tests should be placed next to the file they're testing or in the `tests/unit/` directory.

**Example: Testing a service**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct } from '@/lib/services/product.service';
import { createMockSupabaseClient, mockSupabaseSuccess } from '../mocks/supabase.mock';

describe('Product Service', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
  });

  it('should create a product successfully', async () => {
    const productData = { name: 'Test Product', quantity: 10, minimum_threshold: 5 };
    mockSupabase.single.mockResolvedValue(mockSupabaseSuccess({ id: '1', ...productData }));

    const result = await createProduct({
      supabase: mockSupabase as any,
      userId: 'user-1',
      payload: productData,
    });

    expect(result).toMatchObject(productData);
  });
});
```

**Example: Testing a React component**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../helpers/render';
import { ProductTable } from '@/components/inventory/ProductTable';

describe('ProductTable', () => {
  it('should render products', () => {
    const products = [
      { id: '1', name: 'Product A', quantity: 10, minimum_threshold: 5 }
    ];

    render(<ProductTable products={products} />);

    expect(screen.getByText('Product A')).toBeInTheDocument();
  });
});
```

### E2E Tests

E2E tests should be placed in the `tests/e2e/` directory and use Page Object Models.

**Example: Testing authentication flow**

```typescript
import { test, expect } from './fixtures/auth.fixture';
import { LoginPage } from './page-objects/LoginPage';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login('test@stocksy.app', 'TestPassword123!');
    await loginPage.waitForRedirect();

    await expect(page).toHaveURL('/');
  });
});
```

**Example: Testing inventory management**

```typescript
import { test, expect } from './fixtures/auth.fixture';
import { InventoryPage } from './page-objects/InventoryPage';

test.describe('Inventory Management', () => {
  test('should create a new product', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);
    
    await inventoryPage.goto();
    await inventoryPage.openAddProductDialog();
    await inventoryPage.fillProductForm('New Product', 10, 5);
    await inventoryPage.submitProductForm();

    const productRow = await inventoryPage.getProductRow('New Product');
    await expect(productRow).toBeVisible();
  });
});
```

## Test Fixtures

### Using Test Data

```typescript
import { testProducts } from '../fixtures/test-products';
import { testUsers } from '../fixtures/test-users';
import { testShoppingListItems } from '../fixtures/test-shopping-list';

// Use in your tests
const product = testProducts[0];
const user = testUsers.validUser;
```

### MSW for API Mocking

MSW is configured to mock API requests in unit tests:

```typescript
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Override specific handler for a test
test('should handle API error', async () => {
  server.use(
    http.get('/api/v1/products', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );

  // Your test code...
});
```

## Best Practices

### Unit Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use descriptive test names**: `it('should create product when valid data is provided')`
3. **Test one thing per test**: Keep tests focused and simple
4. **Mock external dependencies**: Use `vi.mock()` for modules, MSW for HTTP
5. **Use type-safe mocks**: Preserve TypeScript types in mocks
6. **Test edge cases**: Empty states, errors, boundary conditions

### E2E Tests

1. **Use Page Object Models**: Encapsulate page interactions
2. **Wait for elements properly**: Use Playwright's auto-waiting
3. **Use semantic locators**: Prefer `getByRole`, `getByLabel` over CSS selectors
4. **Test user flows, not implementation**: Focus on what users do
5. **Keep tests independent**: Each test should be able to run in isolation
6. **Use fixtures for setup**: Leverage Playwright fixtures for common setup

## Coverage Thresholds

The project maintains the following coverage thresholds:

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

Run `npm run test:coverage` to check current coverage.

## Debugging Tests

### Vitest

```bash
# Run tests with debugger
node --inspect-brk ./node_modules/vitest/vitest.mjs run

# Use VS Code debugger
# Add breakpoints and run "Debug Vitest" configuration
```

### Playwright

```bash
# Run in debug mode
npm run test:e2e:debug

# Use Playwright Inspector
npm run test:e2e -- --debug

# View trace
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests are automatically run in CI/CD pipeline:

- Unit tests run on every commit
- E2E tests run on pull requests
- Coverage reports are generated and uploaded

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module '@/...'"
**Solution**: Ensure `vitest.config.ts` has correct path aliases

**Issue**: E2E tests timeout
**Solution**: Increase timeout in `playwright.config.ts` or check if dev server is running

**Issue**: MSW handlers not working
**Solution**: Ensure `server.listen()` is called in setup and `server.close()` in teardown

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)

