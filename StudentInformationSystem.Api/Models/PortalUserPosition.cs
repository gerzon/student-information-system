namespace StudentInformationSystem.Api.Models;

public sealed class PortalUserPosition
{
    public required string UserId { get; set; }
    public Guid PositionId { get; set; }
}
