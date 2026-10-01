namespace StudentInformationSystem.Api.Models;

public sealed class AdminLoginSession
{
    public required string AdminId { get; set; }
    public Guid SessionId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}
