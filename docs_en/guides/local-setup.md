# Local Environment Setup

This guide describes how to run the platform locally for development and testing.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24+
- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Git](https://git-scm.com/)

## Clone the repository

```bash
git clone https://github.com/your-org/orders-platform.git
cd orders-platform
```

## Start infrastructure with Docker

The repository includes a `docker-compose.yml` with all required infrastructure services:

```bash
docker compose up -d
```

This starts:

| Service       | Local port | Description             |
|---------------|------------|-------------------------|
| PostgreSQL    | 5432       | Database                |
| RabbitMQ      | 5672       | Message broker          |
| RabbitMQ UI   | 15672      | Management panel        |
| Redis         | 6379       | Cache                   |
| Seq           | 5341 / 80  | Local log viewer        |

!!! tip "Local credentials"
    Default RabbitMQ credentials are `guest / guest`. Seq does not require authentication in the local environment.

## Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

The `.env` file comes pre-configured for the local environment. No changes are needed to run the basic services.

!!! warning "Never commit .env"
    The `.env` file is in `.gitignore`. Never commit credentials or secrets to the repository.

## Run migrations

Run the Entity Framework migrations to create the schema:

```bash
dotnet ef database update --project src/OrdersApi --startup-project src/OrdersApi
dotnet ef database update --project src/PaymentsService --startup-project src/PaymentsService
```

## Start the services

=== "All at once"

    ```bash
    dotnet run --project src/OrdersApi &
    dotnet run --project src/CatalogApi &
    dotnet run --project src/PaymentsService &
    dotnet run --project src/NotificationWorker
    ```

=== "Individually"

    ```bash
    # Terminal 1
    dotnet run --project src/OrdersApi

    # Terminal 2
    dotnet run --project src/PaymentsService
    ```

## Verify it is running

Access the `orders-api` Swagger:

```
http://localhost:5000/swagger
```

You can create a test order via Swagger or curl:

```bash
curl -X POST http://localhost:5000/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-token" \
  -d '{
    "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "items": [{ "productId": "a1b2c3d4-0000-0000-0000-000000000001", "quantity": 1 }],
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }'
```

## Run tests

```bash
# All tests
dotnet test

# Unit tests only
dotnet test --filter Category=Unit

# Integration tests only
dotnet test --filter Category=Integration
```

!!! note "Integration tests"
    Integration tests require Docker infrastructure to be running. Make sure to run `docker compose up -d` first.

## Stop the environment

```bash
docker compose down
```

To also remove volumes (deletes database data):

```bash
docker compose down -v
```
