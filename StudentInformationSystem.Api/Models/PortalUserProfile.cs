namespace StudentInformationSystem.Api.Models;

public sealed class PortalUserProfile
{
    public required string UserId { get; set; }
    public required string UserType { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
}
