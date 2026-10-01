namespace StudentInformationSystem.Api.Models;

public sealed class PortalUserDesignation
{
    public required string UserId { get; set; }
    public Guid DesignationId { get; set; }
}
