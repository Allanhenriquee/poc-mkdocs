using System.ComponentModel;

namespace OrdersApi.Events;

/// <summary>Payload do evento payment.failed.v1 — consumido do serviço de pagamentos quando o gateway recusa.</summary>
public record PaymentFailedEvent(
    Guid OrderId,

    [property: Description("Código de falha: InsufficientFunds | CardDeclined | Timeout | InvalidCard | FraudSuspicion")]
    string FailureCode,

    [property: Description("Mensagem legível da falha para logging e suporte")]
    string FailureReason,

    DateTimeOffset AttemptedAt
);
