using StudentInformationSystem.Api.Contracts;

namespace StudentInformationSystem.Api.Services;

public interface IAdminDashboardService
{
    Task<AdminDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken);
}
