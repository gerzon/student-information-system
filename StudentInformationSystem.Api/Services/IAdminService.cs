using StudentInformationSystem.Api.Contracts;

namespace StudentInformationSystem.Api.Services;

public enum DeleteAdminResult
{
    Deleted,
    NotFound,
    CannotDeleteSelf,
    CannotDeleteLastAdministrator
}

public sealed record CreateAdminResult(AdminResponse? Admin, Dictionary<string, string[]> Errors)
{
    public bool Succeeded => Admin is not null;
}

public sealed record AdminLoginResult(AdminLoginResponse? Session, bool AlreadyLoggedIn);

public interface IAdminService
{
    Task<AdminLoginResult> LoginAsync(AdminLoginRequest request, CancellationToken cancellationToken);
    Task LogoutAsync(string adminId, Guid sessionId, CancellationToken cancellationToken);
    Task<IReadOnlyList<AdminResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<AdminResponse?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<CreateAdminResult> CreateAsync(CreateAdminRequest request, CancellationToken cancellationToken);
    Task<DeleteAdminResult> DeleteAsync(
        string id,
        string requestingAdminId,
        CancellationToken cancellationToken);
    Task EnsureBootstrapAdminAsync(string email, string password);
}
