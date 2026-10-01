namespace StudentInformationSystem.Api.Services;

public interface IAdminSessionService
{
    Task<bool> TryStartSessionAsync(
        string adminId,
        Guid sessionId,
        DateTimeOffset expiresAt,
        CancellationToken cancellationToken);

    Task<bool> IsSessionActiveAsync(
        string adminId,
        Guid sessionId,
        DateTimeOffset now,
        CancellationToken cancellationToken);

    Task EndSessionAsync(
        string adminId,
        Guid sessionId,
        CancellationToken cancellationToken);
}
