using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Services;

namespace StudentInformationSystem.Api.Controllers;

[ApiController]
[Route("api/admin-auth")]
public sealed class AdminAuthController(IAdminService adminService) : ControllerBase
{
    /// <summary>Authenticates an administrator and returns a bearer token.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType<AdminLoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Login(
        AdminLoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await adminService.LoginAsync(request, cancellationToken);
        if (result.AlreadyLoggedIn)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Administrator already signed in",
                Detail = "This administrator is already signed in on another device. Sign out there or wait for the session to expire."
            });
        }

        return result.Session is null
            ? Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid credentials",
                Detail = "The supplied email or password is incorrect."
            })
            : Ok(result.Session);
    }

    [HttpPost("logout")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var sessionValue = User.FindFirstValue("jti");
        if (string.IsNullOrWhiteSpace(adminId) || !Guid.TryParse(sessionValue, out var sessionId))
        {
            return Unauthorized();
        }

        await adminService.LogoutAsync(adminId, sessionId, cancellationToken);
        return NoContent();
    }
}
