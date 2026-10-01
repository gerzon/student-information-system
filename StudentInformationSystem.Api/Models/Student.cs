namespace StudentInformationSystem.Api.Models;

public sealed class Student
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string StudentNumber { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public DateOnly EnrollmentDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
