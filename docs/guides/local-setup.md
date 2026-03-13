# Configuração do Ambiente Local

Este guia descreve como subir a plataforma localmente para desenvolvimento e testes.

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24+
- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Git](https://git-scm.com/)

## Clonar o repositório

```bash
git clone https://github.com/sua-org/orders-platform.git
cd orders-platform
```

## Subir a infraestrutura com Docker

O repositório inclui um `docker-compose.yml` com todos os serviços de infraestrutura necessários:

```bash
docker compose up -d
```

Isso sobe:

| Serviço       | Porta local | Descrição              |
|---------------|-------------|------------------------|
| PostgreSQL    | 5432        | Banco de dados         |
| RabbitMQ      | 5672        | Broker de mensagens    |
| RabbitMQ UI   | 15672       | Painel de administração|
| Redis         | 6379        | Cache                  |
| Seq           | 5341 / 80   | Log viewer local       |

!!! tip "Credenciais locais"
    As credenciais padrão do RabbitMQ são `guest / guest`. O Seq não requer autenticação em ambiente local.

## Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

O `.env` já vem pré-configurado para o ambiente local. Não é necessário alterar nada para rodar os serviços básicos.

!!! warning "Nunca suba o .env"
    O arquivo `.env` está no `.gitignore`. Nunca comite credenciais ou segredos no repositório.

## Rodar as migrations

Execute as migrations do Entity Framework para criar o schema:

```bash
dotnet ef database update --project src/OrdersApi --startup-project src/OrdersApi
dotnet ef database update --project src/PaymentsService --startup-project src/PaymentsService
```

## Iniciar os serviços

=== "Todos de uma vez"

    ```bash
    dotnet run --project src/OrdersApi &
    dotnet run --project src/CatalogApi &
    dotnet run --project src/PaymentsService &
    dotnet run --project src/NotificationWorker
    ```

=== "Individualmente"

    ```bash
    # Terminal 1
    dotnet run --project src/OrdersApi

    # Terminal 2
    dotnet run --project src/PaymentsService
    ```

## Verificar que está funcionando

Acesse o Swagger do `orders-api`:

```
http://localhost:5000/swagger
```

Você pode criar um pedido de teste via Swagger ou curl:

```bash
curl -X POST http://localhost:5000/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-token" \
  -d '{
    "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "items": [{ "productId": "a1b2c3d4-0000-0000-0000-000000000001", "quantity": 1 }],
    "shippingAddress": {
      "street": "Rua Teste, 1",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310-100"
    }
  }'
```

## Rodar os testes

```bash
# Todos os testes
dotnet test

# Apenas testes unitários
dotnet test --filter Category=Unit

# Apenas testes de integração
dotnet test --filter Category=Integration
```

!!! note "Testes de integração"
    Os testes de integração requerem a infraestrutura Docker rodando. Certifique-se de executar `docker compose up -d` antes.

## Parar o ambiente

```bash
docker compose down
```

Para remover também os volumes (apaga dados do banco):

```bash
docker compose down -v
```
