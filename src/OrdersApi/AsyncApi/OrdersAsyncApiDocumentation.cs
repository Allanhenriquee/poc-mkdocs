using OrdersApi.Events;
using Saunter.Attributes;

namespace OrdersApi.AsyncApi;

/// <summary>
/// Classe decorativa para documentação AsyncAPI via Saunter.
/// Não contém lógica de negócio — apenas declara canais e operações
/// para que o Saunter gere o spec /asyncapi/asyncapi.json automaticamente.
/// </summary>
[AsyncApi]
public sealed class OrdersAsyncApiDocumentation
{
    // ── Eventos publicados pela Orders API ────────────────────────────────────

    [Channel("orders.created",
        Description = "Publicado imediatamente após POST /v1/orders. " +
                      "O pagamento ainda não foi processado neste ponto — status inicial é Pending (atualizado).")]
    [PublishOperation(typeof(OrderCreatedEvent),
        Summary = "Pedido aceito para processamento assíncrono",
        Description = "Downstream services devem aguardar payments.processed para confirmar.")]
    public void OrderCreated() { }

    [Channel("orders.cancelled",
        Description = "Publicado quando DELETE /v1/orders/{orderId} cancela o pedido. " +
                      "Apenas status Pending ou Confirmed podem ser cancelados.")]
    [PublishOperation(typeof(OrderCancelledEvent),
        Summary = "Pedido cancelado pelo cliente ou sistema")]
    public void OrderCancelled() { }

    // ── Eventos consumidos pela Orders API ────────────────────────────────────

    [Channel("payments.processed",
        Description = "Consumido do serviço de pagamentos quando o gateway aprova a transação. " +
                      "Atualiza o status do pedido para Confirmed.")]
    [SubscribeOperation(typeof(PaymentProcessedEvent),
        Summary = "Pagamento aprovado pelo gateway",
        Description = "Use orderId como chave de idempotência ao processar este evento.")]
    public void PaymentProcessed() { }

    [Channel("payments.failed",
        Description = "Consumido do serviço de pagamentos quando o gateway recusa a transação. " +
                      "Atualiza o status do pedido para PaymentFailed.")]
    [SubscribeOperation(typeof(PaymentFailedEvent),
        Summary = "Pagamento recusado pelo gateway",
        Description = "O cliente pode tentar novo pagamento ou o pedido é cancelado automaticamente.")]
    public void PaymentFailed() { }
}
