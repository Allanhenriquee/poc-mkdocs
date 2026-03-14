using System.ComponentModel;

namespace OrdersApi.Events;

/// <summary>Payload do evento order.created.v1 — publicado ao aceitar POST /v1/orders.</summary>
public record OrderCreatedEvent(
    [property: Description("Identificador único do pedido")]
    Guid OrderId,

    [property: Description("Identificador do cliente")]
    Guid CustomerId,

    [property: Description("Itens incluídos no pedido (snapshot no momento da criação)")]
    List<OrderItemEventPayload> Items,

    [property: Description("Endereço de entrega informado pelo cliente")]
    AddressEventPayload ShippingAddress,

    [property: Description("Valor total calculado (soma dos subtotais)")]
    decimal TotalAmount
);

public record OrderItemEventPayload(
    Guid ProductId,
    [property: Description("Nome do produto no momento da compra (snapshot)")]
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    [property: Description("Quantity × UnitPrice")]
    decimal Subtotal
);

public record AddressEventPayload(
    string Street,
    string City,
    [property: Description("Sigla do estado (UF)")]
    string State,
    [property: Description("CEP no formato 00000-000")]
    string ZipCode
);
