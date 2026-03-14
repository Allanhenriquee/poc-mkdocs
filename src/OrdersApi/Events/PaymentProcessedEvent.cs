using System.ComponentModel;

namespace OrdersApi.Events;

/// <summary>Payload do evento payment.processed.v1 — consumido do serviço de pagamentos quando o gateway aprova.</summary>
public record PaymentProcessedEvent(
    Guid OrderId,

    [property: Description("ID da transação retornado pelo gateway (ex: pi_3N8XkV2eZvKYlo2C)")]
    string PaymentId,

    decimal Amount,

    [property: Description("Gateway utilizado: Stripe | PayPal | PagBank")]
    string Gateway,

    DateTimeOffset ProcessedAt
);
