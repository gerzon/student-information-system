using Microsoft.EntityFrameworkCore;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Data;
using StudentInformationSystem.Api.Models;

namespace StudentInformationSystem.Api.Services;

public sealed class AdminDashboardService(ApplicationDbContext dbContext) : IAdminDashboardService
{
    private const int RecentStudentLimit = 5;
    private const string AdministratorRole = "Administrator";

    public async Task<AdminDashboardResponse> GetDashboardAsync(
        CancellationToken cancellationToken)
    {
        var studentCount = await dbContext.Students
            .CountAsync(cancellationToken);

        var administratorRoleId = await dbContext.Roles
            .AsNoTracking()
            .Where(role => role.Name == AdministratorRole)
            .Select(role => role.Id)
            .SingleOrDefaultAsync(cancellationToken);

        var adminCount = administratorRoleId is null
            ? 0
            : await dbContext.UserRoles
                .AsNoTracking()
                .CountAsync(userRole => userRole.RoleId == administratorRoleId, cancellationToken);

        var recentStudents = await dbContext.Students
            .AsNoTracking()
            .OrderByDescending(student => student.CreatedAt)
            .ThenBy(student => student.Id)
            .Take(RecentStudentLimit)
            .Select(student => ToResponse(student))
            .ToListAsync(cancellationToken);

        return new AdminDashboardResponse(studentCount, adminCount, recentStudents);
    }

    private static StudentResponse ToResponse(Student student) =>
        new(student.Id, student.StudentNumber, student.FirstName, student.LastName,
            student.Email, student.EnrollmentDate, student.CreatedAt);
}
