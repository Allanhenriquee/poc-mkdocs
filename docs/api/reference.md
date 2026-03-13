# Referência da API

Base URL de produção: `https://api.orders.exemplo.com/v1`

Todas as requisições devem conter o header:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Pedidos

### Criar pedido

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
    "street": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  }
}
```

**Resposta de sucesso — 202 Accepted:**

```json
{
  "orderId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "Pending",
  "createdAt": "2026-03-13T10:00:00Z"
}
```

!!! info "Por que 202?"
    A criação do pedido é assíncrona. O status `Pending` significa que o pedido foi aceito e o processamento de pagamento está em andamento. Use o endpoint de consulta para acompanhar o status.

**Erros possíveis:**

| Código | Descrição                                   |
|--------|---------------------------------------------|
| 400    | Request inválida (campos obrigatórios ausentes) |
| 422    | Produto indisponível em estoque             |
| 401    | Token ausente ou inválido                   |

---

### Consultar pedido

```
GET /orders/{orderId}
```

**Resposta de sucesso — 200 OK:**

```json
{
  "orderId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "Confirmed",
  "total": 199.90,
  "items": [
    {
      "productId": "a1b2c3d4-0000-0000-0000-000000000001",
      "productName": "Tênis Running Pro",
      "quantity": 2,
      "unitPrice": 99.95
    }
  ],
  "createdAt": "2026-03-13T10:00:00Z",
  "updatedAt": "2026-03-13T10:00:45Z"
}
```

**Status possíveis do pedido:**

| Status      | Descrição                                    |
|-------------|----------------------------------------------|
| `Pending`   | Aguardando processamento de pagamento        |
| `Confirmed` | Pagamento confirmado                         |
| `Cancelled` | Cancelado (por falha no pagamento ou cliente)|
| `Shipped`   | Enviado para entrega                         |
| `Delivered` | Entregue ao cliente                          |

---

### Cancelar pedido

```
DELETE /orders/{orderId}
```

Cancela um pedido que ainda esteja no status `Pending` ou `Confirmed`.

**Resposta de sucesso — 204 No Content**

**Erros possíveis:**

| Código | Descrição                                   |
|--------|---------------------------------------------|
| 404    | Pedido não encontrado                       |
| 409    | Pedido não pode ser cancelado no status atual |

---

## Paginação

Endpoints de listagem suportam paginação via query parameters:

```
GET /orders?page=1&pageSize=20
```

**Resposta:**

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

## Formato de erros

Todos os erros seguem o formato **Problem Details** (RFC 7807):

```json
{
  "type": "https://api.orders.exemplo.com/errors/validation",
  "title": "Requisição inválida",
  "status": 400,
  "detail": "O campo 'customerId' é obrigatório.",
  "traceId": "00-a1b2c3d4e5f6-b7c8d9e0f1a2-00"
}
```
