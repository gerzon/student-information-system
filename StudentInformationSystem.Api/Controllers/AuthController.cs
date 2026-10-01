using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Services;

namespace StudentInformationSystem.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    UserManager<IdentityUser> userManager,
    IAdminService adminService,
    IPortalUserService portalUserService) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType<AuthLoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Login(
        AdminLoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is not null && await userManager.IsInRoleAsync(user, "Administrator"))
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
                ? InvalidCredentials()
                : Ok(new AuthLoginResponse(
                    result.Session.AccessToken,
                    result.Session.ExpiresAt,
                    "Administrator"));
        }

        var portalResult = await portalUserService.LoginAsync(
            request.Email, request.Password, cancellationToken);
        return portalResult.Session is null
            ? InvalidCredentials()
            : Ok(portalResult.Session);
    }

    private UnauthorizedObjectResult InvalidCredentials() =>
        Unauthorized(new ProblemDetails
        {
            Status = StatusCodes.Status401Unauthorized,
            Title = "Invalid credentials",
            Detail = "The supplied email or password is incorrect."
        });
}
