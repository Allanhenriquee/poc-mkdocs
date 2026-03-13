namespace OrdersApi.Models;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Shipped,
    Delivered
}

public record Address(
    string Street,
    string City,
    string State,
    string ZipCode);

public record OrderItem(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice)
{
    public decimal Subtotal => Quantity * UnitPrice;
}

public record Order(
    Guid OrderId,
    Guid CustomerId,
    List<OrderItem> Items,
    Address ShippingAddress,
    OrderStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public decimal Total => Items.Sum(i => i.Subtotal);
}
