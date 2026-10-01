using StudentInformationSystem.Api.Contracts;

namespace StudentInformationSystem.Api.Services;

public interface IAdminCatalogService
{
    Task<IReadOnlyList<AdminCatalogEntryResponse>> GetAllAsync(
        string catalogType,
        CancellationToken cancellationToken);

    Task<AdminCatalogEntryResponse> CreateAsync(
        string catalogType,
        AdminCatalogRequest request,
        CancellationToken cancellationToken);

    Task<AdminCatalogEntryResponse?> UpdateAsync(
        string catalogType,
        Guid id,
        AdminCatalogRequest request,
        CancellationToken cancellationToken);

    Task<bool> DeleteAsync(string catalogType, Guid id, CancellationToken cancellationToken);
}
