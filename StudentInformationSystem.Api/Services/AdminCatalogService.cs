using Microsoft.EntityFrameworkCore;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Data;
using StudentInformationSystem.Api.Middleware;
using StudentInformationSystem.Api.Models;

namespace StudentInformationSystem.Api.Services;

public sealed class AdminCatalogService(ApplicationDbContext dbContext) : IAdminCatalogService
{
    private static readonly HashSet<string> CatalogTypes =
        ["positions", "designations", "access-levels"];

    public async Task<IReadOnlyList<AdminCatalogEntryResponse>> GetAllAsync(
        string catalogType,
        CancellationToken cancellationToken)
    {
        ValidateCatalogType(catalogType);
        var entries = await dbContext.AdminCatalogEntries
            .AsNoTracking()
            .Where(entry => entry.CatalogType == catalogType)
            .OrderBy(entry => entry.Name)
            .ToListAsync(cancellationToken);
        return entries.Select(ToResponse).ToArray();
    }

    public async Task<AdminCatalogEntryResponse> CreateAsync(
        string catalogType,
        AdminCatalogRequest request,
        CancellationToken cancellationToken)
    {
        ValidateCatalogType(catalogType);
        var name = request.Name.Trim();
        var normalizedName = NormalizeName(name);
        if (await dbContext.AdminCatalogEntries.AnyAsync(
                entry => entry.CatalogType == catalogType &&
                         entry.NormalizedName == normalizedName,
                cancellationToken))
        {
            throw new ResourceConflictException($"A {catalogType.TrimEnd('s')} with that name already exists.");
        }

        var now = DateTimeOffset.UtcNow;
        var entry = new AdminCatalogEntry
        {
            CatalogType = catalogType,
            Name = name,
            NormalizedName = normalizedName,
            Description = request.Description.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };
        dbContext.AdminCatalogEntries.Add(entry);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            dbContext.Entry(entry).State = EntityState.Detached;
            if (await dbContext.AdminCatalogEntries.AnyAsync(
                    current => current.CatalogType == catalogType &&
                               current.NormalizedName == normalizedName,
                    cancellationToken))
            {
                throw new ResourceConflictException(
                    $"A {catalogType.TrimEnd('s')} with that name already exists.");
            }

            throw;
        }

        return ToResponse(entry);
    }

    public async Task<AdminCatalogEntryResponse?> UpdateAsync(
        string catalogType,
        Guid id,
        AdminCatalogRequest request,
        CancellationToken cancellationToken)
    {
        ValidateCatalogType(catalogType);
        var entry = await dbContext.AdminCatalogEntries
            .SingleOrDefaultAsync(
                current => current.Id == id && current.CatalogType == catalogType,
                cancellationToken);
        if (entry is null) return null;

        var name = request.Name.Trim();
        var normalizedName = NormalizeName(name);
        if (await dbContext.AdminCatalogEntries.AnyAsync(
                current => current.CatalogType == catalogType &&
                           current.Id != id &&
                           current.NormalizedName == normalizedName,
                cancellationToken))
        {
            throw new ResourceConflictException($"A {catalogType.TrimEnd('s')} with that name already exists.");
        }

        entry.Name = name;
        entry.NormalizedName = normalizedName;
        entry.Description = request.Description.Trim();
        entry.UpdatedAt = DateTimeOffset.UtcNow;

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            dbContext.Entry(entry).State = EntityState.Detached;
            if (await dbContext.AdminCatalogEntries.AnyAsync(
                    current => current.CatalogType == catalogType &&
                               current.Id != id &&
                               current.NormalizedName == normalizedName,
                    cancellationToken))
            {
                throw new ResourceConflictException(
                    $"A {catalogType.TrimEnd('s')} with that name already exists.");
            }

            throw;
        }

        return ToResponse(entry);
    }

    public async Task<bool> DeleteAsync(
        string catalogType,
        Guid id,
        CancellationToken cancellationToken)
    {
        ValidateCatalogType(catalogType);
        var entry = await dbContext.AdminCatalogEntries
            .SingleOrDefaultAsync(
                current => current.Id == id && current.CatalogType == catalogType,
                cancellationToken);
        if (entry is null) return false;

        dbContext.AdminCatalogEntries.Remove(entry);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void ValidateCatalogType(string catalogType)
    {
        if (!CatalogTypes.Contains(catalogType))
        {
            throw new ArgumentException("The requested administrator catalog does not exist.", nameof(catalogType));
        }
    }

    private static string NormalizeName(string name) => name.ToUpperInvariant();

    private static AdminCatalogEntryResponse ToResponse(AdminCatalogEntry entry) =>
        new(entry.Id, entry.Name, entry.Description, entry.CreatedAt, entry.UpdatedAt);
}
