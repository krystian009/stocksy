# API Endpoint Implementation Plan: Create Product

## 1. Endpoint Overview

This endpoint allows authenticated users to create a new product in their inventory. The product will be uniquely identified by name within the user's scope, and will track quantity and minimum threshold for stock level monitoring.

**Purpose**: Add a new product to the authenticated user's inventory  
**Method**: POST  
**Path**: `/api/v1/products`  
**Authentication**: Required (user must be authenticated via Supabase Auth)

## 2. Request Details

### HTTP Method
`POST`

### URL Structure
```
/api/v1/products
```

### Headers
- `Content-Type: application/json`
- Authentication headers (handled by Supabase Auth middleware)

### Request Body

**Required Fields:**
```typescript
{
  name: string;          // Product name (min 3 characters)
  quantity: number;      // Current stock level (>= 0, integer)
  minimum_threshold: number;  // Low stock threshold (>= 0, integer)
}
```

**Example:**
```json
{
  "name": "Organic Coffee Beans",
  "quantity": 50,
  "minimum_threshold": 10
}
```

### Validation Rules

All validation will be performed using Zod schemas before database interaction:

1. **name**:
   - Type: string
   - Minimum length: 3 characters
   - Cannot be empty or whitespace-only

2. **quantity**:
   - Type: integer
   - Must be non-negative (>= 0)
   - Cannot be a decimal number

3. **minimum_threshold**:
   - Type: integer
   - Must be non-negative (>= 0)
   - Cannot be a decimal number

## 3. Used Types

### Command Model
```typescript
CreateProductCommand (from src/types.ts)
```
Used for validating and typing the incoming request body.

### Response DTO
```typescript
ProductDTO (from src/types.ts)
```
Used for typing and formatting the response payload.

### Database Types
```typescript
SupabaseClient (from src/db/supabase.client.ts)
```
Used for type-safe database operations.

## 4. Response Details

### Success Response (201 Created)

**Status Code**: `201 Created`

**Response Body**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Organic Coffee Beans",
  "quantity": 50,
  "minimum_threshold": 10
}
```

**Type**: `ProductDTO`

### Error Responses

#### 400 Bad Request
Invalid input data or validation failure.

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name must be at least 3 characters long"
    }
  ]
}
```

#### 401 Unauthorized
User is not authenticated.

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 409 Conflict
Product with the same name already exists for this user.

```json
{
  "error": "Conflict",
  "message": "A product with this name already exists in your inventory"
}
```

#### 500 Internal Server Error
Unexpected server or database error.

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## 5. Data Flow

### High-Level Flow
```
1. Client sends POST request to /api/v1/products
2. Astro middleware authenticates the user (context.locals.supabase)
3. API endpoint handler receives request
4. Request body is parsed and validated with Zod
5. Service layer is called with validated data and user ID
6. Service inserts product into database via Supabase client
7. Database enforces constraints (unique name per user, non-negative values)
8. Service returns created product as ProductDTO
9. API endpoint returns 201 response with product data
```

### Detailed Component Interactions

**1. API Route Handler** (`src/pages/api/v1/products/index.ts`)
   - Extract user session from `context.locals.supabase`
   - Guard: Return 401 if user not authenticated
   - Parse request body
   - Validate with Zod schema (CreateProductCommand)
   - Guard: Return 400 if validation fails
   - Call service layer with validated data
   - Handle service errors and return appropriate status codes
   - Return 201 with ProductDTO on success

**2. Service Layer** (`src/lib/services/product.service.ts`)
   - Receive userId and CreateProductCommand
   - Insert product into database using Supabase client
   - Handle database-specific errors (e.g., unique constraint violations)
   - Transform database response to ProductDTO
   - Return ProductDTO or throw error

**3. Database** (Supabase PostgreSQL)
   - Validate constraints:
     - name length >= 3
     - quantity >= 0
     - minimum_threshold >= 0
     - UNIQUE(user_id, name)
   - Auto-generate id and created_at
   - Return inserted row

### Database Query Pattern
```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    user_id: userId,
    name: command.name,
    quantity: command.quantity,
    minimum_threshold: command.minimum_threshold
  })
  .select('id, name, quantity, minimum_threshold')
  .single();
```

## 6. Security Considerations

### Authentication
- **Required**: User must be authenticated via Supabase Auth
- **Implementation**: Check `context.locals.supabase.auth.getUser()`
- **Guard Clause**: Return 401 immediately if no valid session

### Authorization
- **User Isolation**: Products are implicitly scoped to the authenticated user via `user_id` foreign key
- **Implementation**: Always use authenticated user's ID from session, never accept from request body
- **Protection**: Database-level isolation prevents cross-user data access

### Input Validation
- **Layer 1 (API)**: Zod schema validation for type safety and business rules
- **Layer 2 (Database)**: PostgreSQL constraints as final safety net
- **Protection**: Prevents malformed data, SQL injection (via parameterized queries), and business rule violations

### Data Integrity
- **Unique Constraint**: Prevents duplicate product names per user
- **Non-Negative Constraints**: Ensures quantity and threshold are valid
- **Name Length**: Ensures meaningful product names

### Threats Mitigated
| Threat | Mitigation |
|--------|-----------|
| Unauthorized Access | Authentication check with early return |
| SQL Injection | Supabase client uses parameterized queries |
| Data Tampering | Zod validation + database constraints |
| User ID Spoofing | User ID from authenticated session only |
| Mass Assignment | Explicit field mapping via CreateProductCommand |
| XSS | JSON responses prevent script injection |

## 7. Error Handling

### Error Handling Strategy
- **Early Returns**: Use guard clauses for authentication and validation
- **Specific Status Codes**: Map errors to appropriate HTTP status codes
- **User-Friendly Messages**: Provide clear, actionable error messages
- **Error Logging**: Log unexpected errors for debugging (exclude sensitive data)

### Error Scenarios

#### 1. Authentication Failure (401)
**Trigger**: `context.locals.supabase.auth.getUser()` returns no user
```typescript
if (!user) {
  return new Response(JSON.stringify({
    error: 'Unauthorized',
    message: 'Authentication required'
  }), { status: 401 });
}
```

#### 2. Invalid Request Body Format (400)
**Trigger**: Request body is not valid JSON
```typescript
try {
  body = await request.json();
} catch (error) {
  return new Response(JSON.stringify({
    error: 'Bad Request',
    message: 'Invalid JSON in request body'
  }), { status: 400 });
}
```

#### 3. Validation Error (400)
**Trigger**: Zod schema validation fails
```typescript
const result = CreateProductSchema.safeParse(body);
if (!result.success) {
  return new Response(JSON.stringify({
    error: 'Validation failed',
    details: result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }))
  }), { status: 400 });
}
```

#### 4. Duplicate Product Name (409)
**Trigger**: Database unique constraint violation (PostgreSQL error code 23505)
```typescript
if (error?.code === '23505') {
  return new Response(JSON.stringify({
    error: 'Conflict',
    message: 'A product with this name already exists in your inventory'
  }), { status: 409 });
}
```

#### 5. Database Constraint Violation (400)
**Trigger**: Other database constraints violated (e.g., negative values)
```typescript
if (error?.code?.startsWith('23')) {
  return new Response(JSON.stringify({
    error: 'Bad Request',
    message: 'Invalid data provided'
  }), { status: 400 });
}
```

#### 6. Unexpected Server Error (500)
**Trigger**: Any unhandled error
```typescript
console.error('Unexpected error creating product:', error);
return new Response(JSON.stringify({
  error: 'Internal Server Error',
  message: 'An unexpected error occurred'
}), { status: 500 });
```

### Error Flow Pattern
```
1. Guard: Check authentication → 401
2. Guard: Parse JSON → 400
3. Guard: Validate with Zod → 400
4. Try: Call service
   - Catch duplicate name → 409
   - Catch constraint violation → 400
   - Catch other database errors → 500
   - Catch unexpected errors → 500
5. Return: 201 with data
```

## 8. Performance Considerations

### Database Operations
- **Single Insert**: One database operation per request
- **Index Usage**: Query uses primary key (id) and unique index (user_id, name)
- **No N+1 Queries**: Direct insert with single select
- **Optimization**: Use `.single()` to return exactly one row

### Validation Performance
- **Zod**: Efficient runtime validation with minimal overhead
- **Early Exit**: Fail fast on validation errors before database call

### Response Time Expectations
- **Target**: < 200ms for typical request
- **Breakdown**:
  - Authentication check: ~10ms
  - Validation: ~5ms
  - Database insert: ~50-100ms
  - JSON serialization: ~5ms

### Potential Bottlenecks
1. **Database Connection**: Mitigated by Supabase connection pooling
2. **Network Latency**: Minimal data transfer (small payload)
3. **Validation**: Negligible overhead with Zod

### Scalability Considerations
- **Horizontal Scaling**: Stateless endpoint, scales with application instances
- **Database**: Supabase handles connection pooling and load balancing
- **Rate Limiting**: Consider implementing rate limiting for abuse prevention (not in current scope)

## 9. Implementation Steps

### Step 1: Create Zod Validation Schema
**File**: `src/pages/api/v1/products/index.ts`

Create a Zod schema that matches the CreateProductCommand interface:

```typescript
import { z } from 'zod';

const CreateProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').trim(),
  quantity: z.number().int('Quantity must be an integer').nonnegative('Quantity cannot be negative'),
  minimum_threshold: z.number().int('Minimum threshold must be an integer').nonnegative('Minimum threshold cannot be negative')
});
```

### Step 2: Create Product Service
**File**: `src/lib/services/product.service.ts`

Implement the service layer function:

```typescript
import type { SupabaseClient } from '@/db/supabase.client';
import type { CreateProductCommand, ProductDTO } from '@/types';

export async function createProduct(
  supabase: SupabaseClient,
  userId: string,
  command: CreateProductCommand
): Promise<ProductDTO> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      name: command.name,
      quantity: command.quantity,
      minimum_threshold: command.minimum_threshold
    })
    .select('id, name, quantity, minimum_threshold')
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create product');
  }

  return data;
}
```

**Responsibilities**:
- Accept Supabase client, user ID, and validated command
- Execute database insert operation
- Handle and throw database errors for API layer to catch
- Return ProductDTO

### Step 3: Create API Route Handler
**File**: `src/pages/api/v1/products/index.ts`

Implement the POST handler:

```typescript
import type { APIContext } from 'astro';
import { z } from 'zod';
import { createProduct } from '@/lib/services/product.service';
import type { CreateProductCommand } from '@/types';

export const prerender = false;

const CreateProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').trim(),
  quantity: z.number().int('Quantity must be an integer').nonnegative('Quantity cannot be negative'),
  minimum_threshold: z.number().int('Minimum threshold must be an integer').nonnegative('Minimum threshold cannot be negative')
});

export async function POST(context: APIContext) {
  const supabase = context.locals.supabase;

  // Guard: Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return new Response(JSON.stringify({
      error: 'Unauthorized',
      message: 'Authentication required'
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Guard: Parse request body
  let body: unknown;
  try {
    body = await context.request.json();
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Bad Request',
      message: 'Invalid JSON in request body'
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Guard: Validate request body
  const validationResult = CreateProductSchema.safeParse(body);
  if (!validationResult.success) {
    return new Response(JSON.stringify({
      error: 'Validation failed',
      details: validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Call service layer
  try {
    const command: CreateProductCommand = validationResult.data;
    const product = await createProduct(supabase, user.id, command);

    return new Response(JSON.stringify(product), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    // Handle duplicate product name
    if (error?.code === '23505') {
      return new Response(JSON.stringify({
        error: 'Conflict',
        message: 'A product with this name already exists in your inventory'
      }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle other database constraint violations
    if (error?.code?.startsWith('23')) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Invalid data provided'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log unexpected errors
    console.error('Unexpected error creating product:', error);

    // Return generic error
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**Responsibilities**:
- Extract Supabase client from context.locals
- Authenticate user with guard clause (return 401 early)
- Parse and validate request body (return 400 early)
- Call service layer with validated data
- Map errors to appropriate HTTP status codes
- Return 201 with ProductDTO on success

### Step 4: Test Authentication Flow
Test that unauthenticated requests are rejected:

```bash
curl -X POST http://localhost:4321/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "quantity": 10, "minimum_threshold": 5}'
```

**Expected**: 401 Unauthorized

### Step 5: Test Validation
Test various validation scenarios:

**Test 1: Invalid name (too short)**
```bash
curl -X POST http://localhost:4321/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "AB", "quantity": 10, "minimum_threshold": 5}'
```
**Expected**: 400 with validation error for name field

**Test 2: Negative quantity**
```bash
curl -X POST http://localhost:4321/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Test Product", "quantity": -5, "minimum_threshold": 5}'
```
**Expected**: 400 with validation error for quantity field

**Test 3: Invalid data type**
```bash
curl -X POST http://localhost:4321/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Test Product", "quantity": "ten", "minimum_threshold": 5}'
```
**Expected**: 400 with validation error for quantity type

### Step 6: Test Successful Creation
Test the happy path:

```bash
curl -X POST http://localhost:4321/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Organic Coffee Beans", "quantity": 50, "minimum_threshold": 10}'
```

**Expected**: 201 Created with ProductDTO
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Organic Coffee Beans",
  "quantity": 50,
  "minimum_threshold": 10
}
```

### Step 7: Test Duplicate Product Name
Test unique constraint:

```bash
# Create product first (from Step 6)
# Then try to create again with same name
curl -X POST http://localhost:4321/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Organic Coffee Beans", "quantity": 30, "minimum_threshold": 5}'
```

**Expected**: 409 Conflict

### Step 8: Verify Database State
Check that the product was inserted correctly:

```sql
SELECT id, user_id, name, quantity, minimum_threshold, created_at
FROM products
WHERE user_id = '<user_id>';
```

**Verify**:
- Product exists with correct data
- created_at is automatically set
- user_id matches authenticated user

### Step 9: Integration Testing
Create integration tests covering:
- Authenticated user can create product
- Unauthenticated requests fail with 401
- Invalid data returns 400 with details
- Duplicate names return 409
- Valid product returns 201 with correct shape

### Step 10: Documentation and Code Review
- Ensure code follows project conventions
- Add JSDoc comments to service function
- Update API documentation if needed
- Submit for code review

## 10. Testing Checklist

### Unit Tests (Service Layer)
- [ ] Successfully creates product with valid data
- [ ] Throws error when database insert fails
- [ ] Handles duplicate name constraint violation
- [ ] Returns ProductDTO with all required fields

### Integration Tests (API Route)
- [ ] Returns 401 when user not authenticated
- [ ] Returns 400 when JSON is malformed
- [ ] Returns 400 when validation fails (name too short)
- [ ] Returns 400 when validation fails (negative quantity)
- [ ] Returns 400 when validation fails (negative threshold)
- [ ] Returns 409 when duplicate product name
- [ ] Returns 201 with ProductDTO when successful
- [ ] Sets correct Content-Type header
- [ ] Product is associated with authenticated user

### Database Tests
- [ ] Unique constraint enforced (user_id, name)
- [ ] Name length constraint enforced (>= 3)
- [ ] Quantity constraint enforced (>= 0)
- [ ] Threshold constraint enforced (>= 0)
- [ ] created_at auto-generated
- [ ] id auto-generated as UUID

### Security Tests
- [ ] Cannot create product for another user
- [ ] Cannot bypass authentication
- [ ] SQL injection attempts fail safely
- [ ] XSS attempts in product name are neutralized

## 11. Additional Notes

### Future Enhancements
- Add bulk product creation endpoint
- Implement product name fuzzy matching for duplicates
- Add product categories/tags
- Enable product image uploads
- Implement audit logging for product creation

### Monitoring
Consider adding metrics for:
- Product creation success rate
- Average response time
- Validation failure rate by field
- Duplicate name conflict rate

### Related Endpoints
This endpoint is part of the Products resource. Related endpoints include:
- GET /api/v1/products - List products
- GET /api/v1/products/:id - Get single product
- PATCH /api/v1/products/:id - Update product
- DELETE /api/v1/products/:id - Delete product

