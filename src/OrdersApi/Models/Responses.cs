namespace OrdersApi.Models;

public record OrderCreatedResponse(
    Guid OrderId,
    OrderStatus Status,
    DateTimeOffset CreatedAt);

public record PagedResponse<T>(
    List<T> Data,
    int Page,
    int PageSize,
    int TotalCount)
{
    public int TotalPages => TotalCount == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}
