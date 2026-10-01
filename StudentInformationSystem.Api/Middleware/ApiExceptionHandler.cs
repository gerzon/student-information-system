using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace StudentInformationSystem.Api.Middleware;

public sealed class ResourceConflictException(string message) : Exception(message);

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not ResourceConflictException conflictException)
        {
            return false;
        }

        logger.LogWarning(exception, "Request conflict at {Path}", httpContext.Request.Path);
        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = "Conflict",
            Detail = conflictException.Message,
            Instance = httpContext.Request.Path
        }, cancellationToken);
        return true;
    }
}
