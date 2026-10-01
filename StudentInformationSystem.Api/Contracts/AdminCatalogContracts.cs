using System.ComponentModel.DataAnnotations;

namespace StudentInformationSystem.Api.Contracts;

public sealed record AdminCatalogRequest
{
    [Required, StringLength(100, MinimumLength = 1)]
    public required string Name { get; init; }

    [StringLength(500)]
    public string Description { get; init; } = string.Empty;
}

public sealed record AdminCatalogEntryResponse(
    Guid Id,
    string Name,
    string Description,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
