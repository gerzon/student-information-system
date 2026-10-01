using System.ComponentModel.DataAnnotations;

namespace StudentInformationSystem.Api.Contracts;

/// <summary>Information required to register a student.</summary>
public sealed record CreateStudentRequest
{
    [Required, StringLength(30, MinimumLength = 1)]
    public required string StudentNumber { get; init; }

    [Required, StringLength(100, MinimumLength = 1)]
    public required string FirstName { get; init; }

    [Required, StringLength(100, MinimumLength = 1)]
    public required string LastName { get; init; }

    [Required, EmailAddress, StringLength(254)]
    public required string Email { get; init; }

    public required DateOnly EnrollmentDate { get; init; }
}

/// <summary>Student information that can be changed by an administrator.</summary>
public sealed record UpdateStudentRequest
{
    [Required, StringLength(30, MinimumLength = 1)]
    public required string StudentNumber { get; init; }

    [Required, StringLength(100, MinimumLength = 1)]
    public required string FirstName { get; init; }

    [Required, StringLength(100, MinimumLength = 1)]
    public required string LastName { get; init; }

    [Required, EmailAddress, StringLength(254)]
    public required string Email { get; init; }

    public required DateOnly EnrollmentDate { get; init; }
}

/// <summary>A student record returned by the API.</summary>
public sealed record StudentResponse(
    Guid Id,
    string StudentNumber,
    string FirstName,
    string LastName,
    string Email,
    DateOnly EnrollmentDate,
    DateTimeOffset CreatedAt);
