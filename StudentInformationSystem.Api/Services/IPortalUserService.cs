using StudentInformationSystem.Api.Contracts;

namespace StudentInformationSystem.Api.Services;

public sealed record CreatePortalUserResult(
    PortalUserResponse? User,
    Dictionary<string, string[]> Errors)
{
    public bool Succeeded => User is not null;
}

public sealed record PortalUserOperationResult(
    PortalUserResponse? User,
    Dictionary<string, string[]> Errors,
    bool NotFound = false,
    bool Completed = false)
{
    public bool Succeeded => Completed || User is not null && Errors.Count == 0;
}

public sealed record PortalLoginResult(
    AuthLoginResponse? Session,
    bool InvalidCredentials);

public interface IPortalUserService
{
    Task<IReadOnlyList<PortalUserResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<CreatePortalUserResult> CreateAsync(
        CreatePortalUserRequest request,
        CancellationToken cancellationToken);
    Task<PortalUserResponse?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<PortalUserOperationResult> UpdateAsync(
        string id,
        UpdatePortalUserRequest request,
        CancellationToken cancellationToken);
    Task<PortalUserOperationResult> ResetPasswordAsync(
        string id,
        ResetPortalUserPasswordRequest request,
        CancellationToken cancellationToken);
    Task<PortalUserOperationResult> DeleteAsync(string id, CancellationToken cancellationToken);
    Task<PortalLoginResult> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken);
}
