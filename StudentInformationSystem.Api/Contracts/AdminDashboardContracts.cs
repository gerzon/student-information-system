namespace StudentInformationSystem.Api.Contracts;

/// <summary>Summary data displayed on the administrator dashboard.</summary>
public sealed record AdminDashboardResponse(
    int StudentCount,
    int AdminCount,
    IReadOnlyList<StudentResponse> RecentStudents);
