namespace StudentInformationSystem.Api.Models;

public sealed class AdminCatalogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string CatalogType { get; set; }
    public required string Name { get; set; }
    public required string NormalizedName { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
