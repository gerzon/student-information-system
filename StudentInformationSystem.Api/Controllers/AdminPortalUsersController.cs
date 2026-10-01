using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Services;

namespace StudentInformationSystem.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrator")]
[Route("api/admin/portal-users")]
public sealed class AdminPortalUsersController(IPortalUserService portalUserService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<PortalUserResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PortalUserResponse>>> GetAll(
        CancellationToken cancellationToken) =>
        Ok(await portalUserService.GetAllAsync(cancellationToken));

    [HttpGet("{id}")]
    [ProducesResponseType<PortalUserResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PortalUserResponse>> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        var user = await portalUserService.GetByIdAsync(id, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    [ProducesResponseType<PortalUserResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PortalUserResponse>> Create(
        CreatePortalUserRequest request,
        CancellationToken cancellationToken)
    {
        var result = await portalUserService.CreateAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            if (result.Errors.ContainsKey("DuplicateEmail"))
            {
                return Conflict(new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "Account already exists",
                    Detail = "An account with that email already exists."
                });
            }

            return BadRequest(new ValidationProblemDetails(result.Errors));
        }

        return CreatedAtAction(nameof(GetAll), result.User);
    }

    [HttpPut("{id}")]
    [ProducesResponseType<PortalUserResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PortalUserResponse>> Update(
        string id,
        UpdatePortalUserRequest request,
        CancellationToken cancellationToken)
    {
        var result = await portalUserService.UpdateAsync(id, request, cancellationToken);
        if (result.NotFound) return NotFound();
        if (!result.Succeeded)
        {
            if (result.Errors.ContainsKey("DuplicateEmail"))
            {
                return Conflict(new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "Account already exists",
                    Detail = "An account with that email already exists."
                });
            }
            return BadRequest(new ValidationProblemDetails(result.Errors));
        }
        return Ok(result.User);
    }

    [HttpPost("{id}/reset-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPassword(
        string id,
        ResetPortalUserPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await portalUserService.ResetPasswordAsync(id, request, cancellationToken);
        if (result.NotFound) return NotFound();
        if (!result.Succeeded) return BadRequest(new ValidationProblemDetails(result.Errors));
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var result = await portalUserService.DeleteAsync(id, cancellationToken);
        if (result.NotFound) return NotFound();
        if (!result.Succeeded) return BadRequest(new ValidationProblemDetails(result.Errors));
        return NoContent();
    }
}
