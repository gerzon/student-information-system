using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Services;

namespace StudentInformationSystem.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrator")]
[Route("api/admins")]
public sealed class AdminController(IAdminService adminService) : ControllerBase
{
    /// <summary>Returns all administrator accounts.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<AdminResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AdminResponse>>> GetAdmins(
        CancellationToken cancellationToken)
    {
        return Ok(await adminService.GetAllAsync(cancellationToken));
    }

    /// <summary>Returns one administrator account.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType<AdminResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminResponse>> GetAdmin(
        string id,
        CancellationToken cancellationToken)
    {
        var admin = await adminService.GetByIdAsync(id, cancellationToken);
        return admin is null ? NotFound() : Ok(admin);
    }

    /// <summary>Creates an administrator account.</summary>
    [HttpPost]
    [ProducesResponseType<AdminResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AdminResponse>> CreateAdmin(
        CreateAdminRequest request,
        CancellationToken cancellationToken)
    {
        var result = await adminService.CreateAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            if (result.Errors.Keys.Contains("DuplicateEmail", StringComparer.Ordinal))
            {
                return Conflict(new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "Administrator already exists",
                    Detail = "An account with that email already exists."
                });
            }

            return BadRequest(new ValidationProblemDetails(result.Errors));
        }

        return CreatedAtAction(nameof(GetAdmin), new { id = result.Admin!.Id }, result.Admin);
    }

    /// <summary>Deletes an administrator account.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteAdmin(string id, CancellationToken cancellationToken)
    {
        var currentAdminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(currentAdminId))
        {
            return Unauthorized();
        }

        var result = await adminService.DeleteAsync(id, currentAdminId, cancellationToken);
        return result switch
        {
            DeleteAdminResult.Deleted => NoContent(),
            DeleteAdminResult.NotFound => NotFound(),
            DeleteAdminResult.CannotDeleteSelf => Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Cannot delete the current account",
                Detail = "Sign in with another administrator account to delete this account."
            }),
            DeleteAdminResult.CannotDeleteLastAdministrator => Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Cannot delete the last administrator",
                Detail = "At least one administrator account must remain."
            }),
            _ => throw new InvalidOperationException("Unexpected administrator deletion result.")
        };
    }
}
