using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Services;

namespace StudentInformationSystem.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrator")]
[Route("api/admin/catalogs/{catalogType}")]
public sealed class AdminCatalogController(IAdminCatalogService catalogService) : ControllerBase
{
    private static readonly HashSet<string> CatalogTypes =
        ["positions", "designations", "access-levels"];

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<AdminCatalogEntryResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AdminCatalogEntryResponse>>> GetAll(
        string catalogType,
        CancellationToken cancellationToken)
    {
        if (!IsSupportedCatalog(catalogType)) return NotFound();
        return Ok(await catalogService.GetAllAsync(catalogType, cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType<AdminCatalogEntryResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AdminCatalogEntryResponse>> Create(
        string catalogType,
        AdminCatalogRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsSupportedCatalog(catalogType)) return NotFound();
        var entry = await catalogService.CreateAsync(catalogType, request, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { catalogType }, entry);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<AdminCatalogEntryResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AdminCatalogEntryResponse>> Update(
        string catalogType,
        Guid id,
        AdminCatalogRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsSupportedCatalog(catalogType)) return NotFound();
        var entry = await catalogService.UpdateAsync(catalogType, id, request, cancellationToken);
        return entry is null ? NotFound() : Ok(entry);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        string catalogType,
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!IsSupportedCatalog(catalogType)) return NotFound();
        return await catalogService.DeleteAsync(catalogType, id, cancellationToken)
            ? NoContent()
            : NotFound();
    }

    private static bool IsSupportedCatalog(string catalogType) =>
        CatalogTypes.Contains(catalogType);
}
