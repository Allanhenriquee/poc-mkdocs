namespace OrdersApi.Models;

public record OrderItemRequest(Guid ProductId, int Quantity);

public record CreateOrderRequest(
    Guid CustomerId,
    List<OrderItemRequest> Items,
    Address ShippingAddress);
