# Stocksy - Comprehensive Test Plan

## 1. Introduction and Testing Objectives

### 1.1 Purpose

This document defines the comprehensive test plan for **Stocksy**, a household inventory management application. The plan ensures the application meets quality standards, functional requirements, and provides a reliable user experience.

### 1.2 Objectives

- Verify all functional requirements are correctly implemented
- Ensure data integrity and security across multi-tenant architecture
- Validate API contracts and response formats
- Confirm UI/UX consistency and accessibility compliance
- Identify performance bottlenecks and regressions
- Guarantee authentication and authorization mechanisms work correctly

### 1.3 References

- Tech Stack: Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui, Supabase
- Database: PostgreSQL (via Supabase)
- Existing Manual Test Checklist: `docs/inventory-manual-test.md`

---

## 2. Scope of Testing

### 2.1 In Scope

| Module | Description |
|--------|-------------|
| **Authentication** | User registration, login, logout, password reset, session management |
| **Inventory Management** | Product CRUD, quantity adjustments, pagination, sorting |
| **Shopping List** | Auto-populated items, quantity updates, check-in (single/all) |
| **Home Dashboard** | Low-stock monitoring, first-run wizard, summary cards |
| **API Layer** | All `/api/v1/*` and `/api/auth/*` endpoints |
| **Database** | Triggers, RLS policies, constraints, stored procedures |
| **Middleware** | Route protection, Supabase client injection |
| **UI Components** | Shadcn/ui components, forms, dialogs, tables |

### 2.2 Out of Scope

- Third-party Supabase infrastructure testing
- Load testing at scale (> 10,000 concurrent users)
- Browser compatibility for legacy browsers (IE11, pre-Chromium Edge)
- Mobile native apps (web responsive design is in scope)

---

## 3. Types of Testing

### 3.1 Unit Testing

**Objective:** Validate individual functions and components in isolation.

| Layer | Target | Tools |
|-------|--------|-------|
| Services | `product.service.ts`, `shopping-list.service.ts` | Vitest, @testing-library/react |
| Schemas | Zod validation schemas | Vitest |
| Hooks | `useInventory`, `useShoppingList`, `useLowStockItems` | Vitest, @testing-library/react-hooks |
| Utils | `src/lib/utils.ts` | Vitest |
| React Components | UI components, form components | Vitest, @testing-library/react |

### 3.2 Integration Testing

**Objective:** Verify interactions between modules work correctly.

| Integration Point | Description |
|-------------------|-------------|
| API → Service → Database | End-to-end request handling |
| Middleware → Route Protection | Authentication enforcement |
| React Hooks → API Client | State management with API calls |
| Database Triggers → Shopping List | Automatic item population |

### 3.3 End-to-End (E2E) Testing

**Objective:** Validate complete user flows from UI to database.

| Flow | Description |
|------|-------------|
| User Registration → Login | Complete onboarding flow |
| Product Management | Create, edit, delete products |
| Shopping List Workflow | View items, update quantities, check-in |
| Dashboard Interactions | Low-stock alerts, navigation |

### 3.4 API Testing

**Objective:** Validate REST API contracts, status codes, and error handling.

| Endpoint Category | Endpoints |
|-------------------|-----------|
| Authentication | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `POST /api/auth/password-reset`, `POST /api/auth/update-password` |
| Products | `GET /api/v1/products`, `POST /api/v1/products`, `PUT /api/v1/products/[id]`, `DELETE /api/v1/products/[id]` |
| Shopping List | `GET /api/v1/shopping-list`, `PUT /api/v1/shopping-list/[id]`, `POST /api/v1/shopping-list/[id]/check-in`, `POST /api/v1/shopping-list/check-in` |

### 3.5 Security Testing

**Objective:** Ensure proper authentication, authorization, and data protection.

| Test Area | Focus |
|-----------|-------|
| Authentication | Session handling, token validation, secure cookies |
| Authorization | RLS policy enforcement, IDOR prevention |
| Input Validation | SQL injection, XSS, malformed payloads |
| CORS/CSRF | Cross-origin request handling |

### 3.6 Accessibility Testing

**Objective:** Ensure WCAG 2.1 AA compliance.

| Area | Focus |
|------|-------|
| Keyboard Navigation | Tab order, focus management, escape to close |
| Screen Readers | ARIA labels, live regions, semantic HTML |
| Color Contrast | Text readability, focus indicators |
| Form Accessibility | Labels, error messages, validation feedback |

### 3.7 Performance Testing

**Objective:** Validate response times and resource utilization.

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms (p95) |
| Page Load Time | < 2s (First Contentful Paint) |
| Time to Interactive | < 3s |
| Database Query Time | < 50ms |

---

## 4. Test Scenarios for Key Functionalities

### 4.1 Authentication Module

#### 4.1.1 User Registration
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| AUTH-001 | Register with valid email and password | Account created, redirect to login |
| AUTH-002 | Register with existing email | 409 Conflict, error message displayed |
| AUTH-003 | Register with invalid email format | Validation error, no API call |
| AUTH-004 | Register with weak password | Validation error with requirements |
| AUTH-005 | Register with empty fields | Field-level validation errors |

#### 4.1.2 User Login
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| AUTH-006 | Login with valid credentials | Session created, redirect to dashboard |
| AUTH-007 | Login with invalid password | 401 Unauthorized, error message |
| AUTH-008 | Login with non-existent email | 401 Unauthorized, generic error |
| AUTH-009 | Login without credentials | Validation error |
| AUTH-010 | Access protected route without auth | Redirect to login |

#### 4.1.3 Password Reset
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| AUTH-011 | Request reset for existing email | Email sent, success message |
| AUTH-012 | Request reset for non-existent email | No error (security consideration) |
| AUTH-013 | Reset with valid token | Password updated, redirect to login |
| AUTH-014 | Reset with expired/invalid token | Error message, retry option |

#### 4.1.4 Logout
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| AUTH-015 | Logout from authenticated session | Session cleared, redirect to login |
| AUTH-016 | Access protected route after logout | Redirect to login |

### 4.2 Inventory Management Module

#### 4.2.1 Product Listing
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| INV-001 | Load products (default pagination) | 20 products per page, sorted by name A-Z |
| INV-002 | Navigate to next/previous page | Correct products displayed, page updated |
| INV-003 | Sort by quantity ascending | Products sorted correctly |
| INV-004 | Sort by name descending | Products sorted Z-A |
| INV-005 | Refresh product list | Data refetched, current page maintained |
| INV-006 | Load with no products | Empty state with "Add Product" CTA |

#### 4.2.2 Product Creation
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| INV-007 | Create product with valid data | Product created, toast success, list updated |
| INV-008 | Create product with duplicate name | 409 Conflict, error message |
| INV-009 | Create with name < 3 characters | Validation error |
| INV-010 | Create with negative quantity | Validation error |
| INV-011 | Create with threshold = 0 | Validation error (minimum 1) |
| INV-012 | Cancel product creation | Dialog closes, no changes |

#### 4.2.3 Product Update
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| INV-013 | Update product name | Name updated, optimistic UI, toast success |
| INV-014 | Update quantity via +/- buttons | Quantity changes, debounced API call |
| INV-015 | Update quantity to 0 | Quantity set to 0, item added to shopping list |
| INV-016 | Update to duplicate name | 409 Conflict, reverted to original |
| INV-017 | Update with server error | Error state, row highlighted, toast error |

#### 4.2.4 Product Deletion
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| INV-018 | Delete product (confirm) | Product removed, toast success |
| INV-019 | Delete product (cancel) | Dialog closes, product retained |
| INV-020 | Delete last product on page | Navigate to previous page |
| INV-021 | Delete with server error | Row reverted, error indicator |

### 4.3 Shopping List Module

#### 4.3.1 Shopping List Display
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| SHOP-001 | Load shopping list | Items displayed with product names |
| SHOP-002 | Load empty shopping list | Empty state displayed |
| SHOP-003 | Quantity below threshold triggers list | Item auto-added to shopping list |

#### 4.3.2 Quantity Update
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| SHOP-004 | Update quantity via input | Quantity updated, optimistic UI |
| SHOP-005 | Set quantity to 0 | Validation error (minimum 1) |
| SHOP-006 | Update with server error | Reverted to previous value |

#### 4.3.3 Check-In Operations
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| SHOP-007 | Check-in single item | Item removed, product quantity incremented |
| SHOP-008 | Check-in all items | All items removed, quantities updated |
| SHOP-009 | Check-in with empty list | Error message |
| SHOP-010 | Check-in with server error | Items reverted, error toast |

### 4.4 Home Dashboard Module

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| HOME-001 | Load with low-stock items | Up to 8 items displayed, sorted by urgency |
| HOME-002 | Load with no products | First-run wizard displayed |
| HOME-003 | Load with no low-stock items | Empty state displayed |
| HOME-004 | API error during load | Error state with message |

---

## 5. Test Environment

### 5.1 Development Environment

| Component | Configuration |
|-----------|---------------|
| Runtime | Node.js 20.x |
| Package Manager | npm 10.x |
| Framework | Astro 5 (dev server) |
| Database | Supabase local (via Docker) |
| Browser | Chrome Latest (primary) |

### 5.2 Test Database

```sql
-- Test user seeding
INSERT INTO auth.users (id, email) VALUES 
  ('test-user-1', 'test@stocksy.app'),
  ('test-user-2', 'other@stocksy.app');

-- Test products
INSERT INTO products (user_id, name, quantity, minimum_threshold) VALUES
  ('test-user-1', 'Test Product A', 5, 10),
  ('test-user-1', 'Test Product B', 0, 5);
```

### 5.3 Environment Variables

| Variable | Test Value |
|----------|------------|
| `PUBLIC_SUPABASE_URL` | `http://localhost:54321` |
| `PUBLIC_SUPABASE_ANON_KEY` | Local dev key |

---

## 6. Testing Tools

| Category | Tool | Purpose |
|----------|------|---------|
| Unit/Integration | **Vitest** | Fast unit tests with TypeScript support |
| Component Testing | **@testing-library/react** | React component testing |
| E2E Testing | **Playwright** | Cross-browser E2E tests |
| API Testing | **Supertest** / **Hoppscotch** | HTTP request testing |
| Accessibility | **axe-core** / **Lighthouse** | WCAG compliance checking |
| Code Coverage | **Vitest Coverage (c8)** | Code coverage reporting |
| Mocking | **MSW (Mock Service Worker)** | API mocking for frontend tests |
| Database | **Supabase CLI** | Local Supabase instance |

---

## 7. Test Schedule

| Phase | Duration | Activities |
|-------|----------|------------|
| **Phase 1: Setup** | Week 1 | Configure test environment, install tools, create fixtures |
| **Phase 2: Unit Tests** | Weeks 2-3 | Service layer, schemas, hooks, components |
| **Phase 3: Integration Tests** | Weeks 4-5 | API endpoints, database interactions |
| **Phase 4: E2E Tests** | Weeks 6-7 | User flows, cross-browser testing |
| **Phase 5: Security & Performance** | Week 8 | Security audit, performance benchmarks |
| **Phase 6: Regression & UAT** | Week 9 | Full regression, user acceptance |

---

## 8. Acceptance Criteria

### 8.1 Quality Gates

| Metric | Threshold |
|--------|-----------|
| Unit Test Coverage | ≥ 80% |
| Integration Test Pass Rate | 100% |
| E2E Test Pass Rate | ≥ 95% |
| Critical Bug Count | 0 |
| High Bug Count | ≤ 3 |

### 8.2 Exit Criteria

- All critical and high-priority test cases pass
- No unresolved security vulnerabilities
- Performance targets met
- Accessibility audit passes with no critical issues
- Stakeholder sign-off obtained

---

## 9. Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| **QA Lead** | Test planning, coordination, reporting |
| **QA Engineers** | Test case design, execution, bug reporting |
| **Developers** | Unit tests, bug fixes, code reviews |
| **DevOps** | CI/CD pipeline, test environment |
| **Product Owner** | UAT validation, acceptance sign-off |

---

## 10. Bug Reporting Procedures

### 10.1 Bug Report Template

```markdown
## Bug Title
[Clear, concise description]

## Severity
[ ] Critical | [ ] High | [ ] Medium | [ ] Low

## Environment
- Browser: 
- OS: 
- Test Environment: 

## Steps to Reproduce
1. 
2. 
3. 

## Expected Result


## Actual Result


## Screenshots/Logs

## Additional Context
```

### 10.2 Severity Definitions

| Severity | Definition | SLA |
|----------|------------|-----|
| **Critical** | Application crash, data loss, security breach | Fix immediately |
| **High** | Major feature broken, no workaround | Fix within 24h |
| **Medium** | Feature partially working, workaround exists | Fix within 1 week |
| **Low** | Minor UI issue, cosmetic defect | Fix in next sprint |

### 10.3 Bug Lifecycle

```
New → Triaged → In Progress → Ready for Testing → Verified → Closed
                    ↓
                 Reopened
```

---

## 11. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database trigger failures | Medium | High | Comprehensive trigger tests, monitoring |
| Authentication bypass | Low | Critical | Security audit, penetration testing |
| RLS policy bypass | Medium | Critical | Multi-tenant isolation tests |
| Optimistic UI race conditions | Medium | Medium | Concurrency tests, error handling |
| Third-party dependency vulnerabilities | Medium | High | Regular dependency audits |
| Session management issues | Medium | High | Session invalidation tests |

---

## 12. Appendix

### 12.1 Test Data Requirements

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 5 | Various email formats |
| Products per user | 50 | Varied quantities and thresholds |
| Shopping list items | 10 | Mix of auto-generated and manual |

### 12.2 Useful Commands

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Start local Supabase
npx supabase start

# Reset test database
npx supabase db reset
```

### 12.3 Key Files for Testing

| File | Purpose |
|------|---------|
| `src/lib/services/*.ts` | Business logic (priority for unit tests) |
| `src/lib/schemas/*.ts` | Validation logic |
| `src/pages/api/**/*.ts` | API endpoints |
| `src/middleware/index.ts` | Auth middleware |
| `src/components/**/*.tsx` | React components |
| `supabase/migrations/*.sql` | Database schema |

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: QA Team*

