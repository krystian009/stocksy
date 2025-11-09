# Stocksy API Sample Requests

The following `curl` snippets target a local Astro dev server running on port `3000`. Update headers or payloads as needed.

## Products

### GET /api/v1/products

Fetch paginated products.

```bash
curl "http://localhost:3000/api/v1/products?page=1&limit=10&sort=name&order=asc"
```

Invalid query (limit exceeds allowed maximum):

```bash
curl "http://localhost:3000/api/v1/products?limit=500"
```

Invalid order value:

```bash
curl "http://localhost:3000/api/v1/products?order=up"
```

### POST /api/v1/products

Create a new product.

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apples",
    "quantity": 12,
    "minimum_threshold": 3
  }'
```

Invalid payload (fails validation because `name` is too short):

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "quantity": 5,
    "minimum_threshold": 1
  }'
```

Missing required field (`minimum_threshold`):

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bananas",
    "quantity": 10
  }'
```

### PATCH /api/v1/products/{id}

Update an existing product.

```bash
curl -X PATCH http://localhost:3000/api/v1/products/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apples Gala",
    "minimum_threshold": 4
  }'
```

Invalid payload (empty body):

```bash
curl -X PATCH http://localhost:3000/api/v1/products/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{}'
```

Conflict example (attempt to rename to an existing product for the same user):

```bash
curl -X PATCH http://localhost:3000/api/v1/products/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apples"
  }'
```

### DELETE /api/v1/products/{id}

Delete a product by ID.

```bash
curl -X DELETE http://localhost:3000/api/v1/products/00000000-0000-0000-0000-000000000000
```

Not found (product does not exist for the user):

```bash
curl -X DELETE http://localhost:3000/api/v1/products/11111111-1111-1111-1111-111111111111
```

Missing ID (wrong URL):

```bash
curl -X DELETE http://localhost:3000/api/v1/products/
```


## Shopping List

### GET /api/v1/shopping-list

Fetch all items on the user's shopping list.

```bash
curl "http://localhost:3000/api/v1/shopping-list"
```

### PATCH /api/v1/shopping-list/{itemId}

Update the `quantity_to_purchase` for a shopping list item.

```bash
curl -X PATCH http://localhost:3000/api/v1/shopping-list/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity_to_purchase": 25
  }'
```

Invalid payload (quantity must be a positive number):

```bash
curl -X PATCH http://localhost:3000/api/v1/shopping-list/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity_to_purchase": 0
  }'
```

### POST /api/v1/shopping-list/{itemId}/check-in

Mark a single shopping list item as purchased, which updates the corresponding product's inventory.

```bash
curl -X POST http://localhost:3000/api/v1/shopping-list/00000000-0000-0000-0000-000000000000/check-in
```

Not found (item does not exist for the user):

```bash
curl -X POST http://localhost:3000/api/v1/shopping-list/11111111-1111-1111-1111-111111111111/check-in
```

### POST /api/v1/shopping-list/check-in

Mark all shopping list items as purchased (bulk check-in).

```bash
curl -X POST http://localhost:3000/api/v1/shopping-list/check-in
```

