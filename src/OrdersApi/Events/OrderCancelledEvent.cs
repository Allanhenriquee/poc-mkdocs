using System.ComponentModel;

namespace OrdersApi.Events;

/// <summary>Payload do evento order.cancelled.v1 — publicado ao cancelar DELETE /v1/orders/{orderId}.</summary>
public record OrderCancelledEvent(
    Guid OrderId,
    Guid CustomerId,

    [property: Description("Motivo do cancelamento: CustomerRequest | PaymentFailed | OutOfStock | SystemTimeout")]
    string Reason,

    DateTimeOffset CancelledAt
);
