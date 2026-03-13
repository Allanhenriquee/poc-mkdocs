using Scalar.AspNetCore;
using OrdersApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi("openapi", options =>
{
    options.AddDocumentTransformer((document, _, _) =>
    {
        document.Info = new()
        {
            Title = "Plataforma de Pedidos — API",
            Version = "v1",
            Description = """
                API RESTful da plataforma de pedidos e pagamentos.

                ## Autenticação

                Todas as requisições exigem um **JWT Bearer token** no header `Authorization`.

                ```
                Authorization: Bearer <token>
                ```

                ## Fluxo assíncrono

                A criação de pedido retorna `202 Accepted` imediatamente.
                O pagamento é processado de forma assíncrona via mensageria.
                Use `GET /v1/orders/{orderId}` para acompanhar o status.

                ## Erros

                Todos os erros seguem o formato **Problem Details (RFC 7807)**.
                """
        };

        document.Components ??= new();
        document.Components.SecuritySchemes ??= new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSecurityScheme>();
        document.Components.SecuritySchemes["bearerAuth"] = new()
        {
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "JWT obtido via endpoint de autenticação"
        };

        return Task.CompletedTask;
    });
});

// In-memory store para a POC
var db = new Dictionary<Guid, Order>();

var app = builder.Build();

// Expõe /openapi/openapi.json — usado pelo Scalar no MkDocs (GitHub Pages)
app.MapOpenApi();

// Scalar interativo ao rodar a API localmente
app.MapScalarApiReference("/scalar", options =>
{
    options.Title = "Plataforma de Pedidos";
    options.Theme = ScalarTheme.Purple;
    options.DarkMode = true;
    options.DefaultHttpClient = new(ScalarTarget.Shell, ScalarClient.Curl);
});

if (app.Environment.IsDevelopment())
    app.MapGet("/", () => Results.Redirect("/scalar")).ExcludeFromDescription();

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

var orders = app.MapGroup("/v1/orders").WithTags("Pedidos");

orders.MapPost("/", CreateOrder)
      .WithName("CreateOrder")
      .WithSummary("Criar pedido")
      .WithDescription("""
          Aceita um novo pedido para processamento assíncrono.

          Retorna `202 Accepted` imediatamente. O status é atualizado conforme
          o pagamento é processado. Use `GET /v1/orders/{orderId}` para acompanhar.
          """)
      .Produces<OrderCreatedResponse>(StatusCodes.Status202Accepted)
      .ProducesValidationProblem()
      .ProducesProblem(StatusCodes.Status401Unauthorized);

orders.MapGet("/", ListOrders)
      .WithName("ListOrders")
      .WithSummary("Listar pedidos")
      .WithDescription("Retorna lista paginada dos pedidos. Suporta paginação via `page` e `pageSize`.")
      .Produces<PagedResponse<Order>>()
      .ProducesProblem(StatusCodes.Status401Unauthorized);

orders.MapGet("/{orderId:guid}", GetOrder)
      .WithName("GetOrder")
      .WithSummary("Consultar pedido")
      .WithDescription("Retorna os detalhes completos de um pedido pelo seu identificador.")
      .Produces<Order>()
      .ProducesProblem(StatusCodes.Status404NotFound)
      .ProducesProblem(StatusCodes.Status401Unauthorized);

orders.MapDelete("/{orderId:guid}", CancelOrder)
      .WithName("CancelOrder")
      .WithSummary("Cancelar pedido")
      .WithDescription("""
          Cancela um pedido nos status `Pending` ou `Confirmed`.
          Pedidos `Shipped` ou `Delivered` não podem ser cancelados.
          """)
      .Produces(StatusCodes.Status204NoContent)
      .ProducesProblem(StatusCodes.Status404NotFound)
      .ProducesProblem(StatusCodes.Status409Conflict)
      .ProducesProblem(StatusCodes.Status401Unauthorized);

app.Run();

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

IResult CreateOrder(CreateOrderRequest request)
{
    if (request.Items is { Count: 0 })
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["items"] = ["Ao menos um item é obrigatório."]
        });

    var order = new Order(
        OrderId: Guid.NewGuid(),
        CustomerId: request.CustomerId,
        Items: request.Items.ConvertAll(i =>
            new OrderItem(i.ProductId, $"Produto {i.ProductId}", i.Quantity, 99.90m)),
        ShippingAddress: request.ShippingAddress,
        Status: OrderStatus.Pending,
        CreatedAt: DateTimeOffset.UtcNow,
        UpdatedAt: DateTimeOffset.UtcNow);

    db[order.OrderId] = order;

    return Results.Accepted(
        $"/v1/orders/{order.OrderId}",
        new OrderCreatedResponse(order.OrderId, order.Status, order.CreatedAt));
}

IResult ListOrders(int page = 1, int pageSize = 20)
{
    var items = db.Values
        .OrderByDescending(o => o.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToList();

    return Results.Ok(new PagedResponse<Order>(items, page, pageSize, db.Count));
}

IResult GetOrder(Guid orderId)
{
    return db.TryGetValue(orderId, out var order)
        ? Results.Ok(order)
        : Results.Problem(
            title: "Recurso não encontrado",
            detail: $"Pedido '{orderId}' não encontrado.",
            statusCode: StatusCodes.Status404NotFound,
            type: "https://api.orders.exemplo.com/errors/not-found");
}

IResult CancelOrder(Guid orderId)
{
    if (!db.TryGetValue(orderId, out var order))
        return Results.Problem(
            title: "Recurso não encontrado",
            detail: $"Pedido '{orderId}' não encontrado.",
            statusCode: StatusCodes.Status404NotFound,
            type: "https://api.orders.exemplo.com/errors/not-found");

    if (order.Status is OrderStatus.Shipped or OrderStatus.Delivered)
        return Results.Problem(
            title: "Operação inválida",
            detail: $"Pedido no status '{order.Status}' não pode ser cancelado.",
            statusCode: StatusCodes.Status409Conflict,
            type: "https://api.orders.exemplo.com/errors/conflict");

    db[orderId] = order with { Status = OrderStatus.Cancelled, UpdatedAt = DateTimeOffset.UtcNow };
    return Results.NoContent();
}
