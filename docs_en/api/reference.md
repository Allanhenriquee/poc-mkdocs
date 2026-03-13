# API Reference

Production base URL: `https://api.orders.exemplo.com/v1`

All requests must include the following headers:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Orders

### Create order

```
POST /orders
```

**Request body:**

```json
{
  "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "items": [
    {
      "productId": "a1b2c3d4-0000-0000-0000-000000000001",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

**Success response — 202 Accepted:**

```json
{
  "orderId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "Pending",
  "createdAt": "2026-03-13T10:00:00Z"
}
```

!!! info "Why 202?"
    Order creation is asynchronous. The `Pending` status means the order was accepted and payment processing is underway. Use the get order endpoint to track the current status.

**Possible errors:**

| Code | Description                                      |
|------|--------------------------------------------------|
| 400  | Invalid request (missing required fields)        |
| 422  | Product out of stock                             |
| 401  | Missing or invalid token                         |

---

### Get order

```
GET /orders/{orderId}
```

**Success response — 200 OK:**

```json
{
  "orderId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "Confirmed",
  "total": 199.90,
  "items": [
    {
      "productId": "a1b2c3d4-0000-0000-0000-000000000001",
      "productName": "Running Pro Sneakers",
      "quantity": 2,
      "unitPrice": 99.95
    }
  ],
  "createdAt": "2026-03-13T10:00:00Z",
  "updatedAt": "2026-03-13T10:00:45Z"
}
```

**Possible order statuses:**

| Status      | Description                                       |
|-------------|---------------------------------------------------|
| `Pending`   | Awaiting payment processing                       |
| `Confirmed` | Payment confirmed                                 |
| `Cancelled` | Cancelled (payment failure or customer request)   |
| `Shipped`   | Dispatched for delivery                           |
| `Delivered` | Delivered to customer                             |

---

### Cancel order

```
DELETE /orders/{orderId}
```

Cancels an order that is still in `Pending` or `Confirmed` status.

**Success response — 204 No Content**

**Possible errors:**

| Code | Description                                         |
|------|-----------------------------------------------------|
| 404  | Order not found                                     |
| 409  | Order cannot be cancelled in its current status     |

---

## Pagination

List endpoints support pagination via query parameters:

```
GET /orders?page=1&pageSize=20
```

**Response:**

```json
{
  "data": [ ... ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 143,
  "totalPages": 8
}
```

---

## Error Format

All errors follow the **Problem Details** format (RFC 7807):

```json
{
  "type": "https://api.orders.exemplo.com/errors/validation",
  "title": "Invalid request",
  "status": 400,
  "detail": "The field 'customerId' is required.",
  "traceId": "00-a1b2c3d4e5f6-b7c8d9e0f1a2-00"
}
```
