using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Services;

namespace StudentInformationSystem.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrator")]
[Route("api/admin/dashboard")]
public sealed class AdminDashboardController(IAdminDashboardService dashboardService) : ControllerBase
{
    /// <summary>Returns summary data for the administrator dashboard.</summary>
    [HttpGet]
    [ProducesResponseType<AdminDashboardResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminDashboardResponse>> GetDashboard(
        CancellationToken cancellationToken)
    {
        return Ok(await dashboardService.GetDashboardAsync(cancellationToken));
    }
}
