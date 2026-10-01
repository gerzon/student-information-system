namespace StudentInformationSystem.Api.Models;

public sealed class AdminAccountAssignment
{
    public required string AdminId { get; set; }
    public Guid? PositionId { get; set; }
    public Guid? DesignationId { get; set; }
}
