using System.ComponentModel.DataAnnotations;

namespace StudentInformationSystem.Api.Contracts;

/// <summary>Credentials for an administrator signing in.</summary>
public sealed record AdminLoginRequest
{
    [Required, EmailAddress, StringLength(254)]
    public required string Email { get; init; }

    [Required]
    public required string Password { get; init; }
}

/// <summary>Credentials for creating an administrator account.</summary>
public sealed record CreateAdminRequest
{
    [Required, EmailAddress, StringLength(254)]
    public required string Email { get; init; }

    [Required, MinLength(12), StringLength(128)]
    public required string Password { get; init; }

}

/// <summary>An administrator account without credential details.</summary>
public sealed record AdminResponse(string Id, string Email);

public sealed record CreatePortalUserRequest
{
    [Required, StringLength(100, MinimumLength = 1)]
    public required string FirstName { get; init; }

    [Required, StringLength(100, MinimumLength = 1)]
    public required string LastName { get; init; }

    [Required, EmailAddress, StringLength(254)]
    public required string Email { get; init; }

    [Required, MinLength(12), StringLength(128)]
    public required string Password { get; init; }

    public Guid[] PositionIds { get; init; } = [];
    public Guid[] DesignationIds { get; init; } = [];
}

/// <summary>Profile and catalog assignments used to update a front-end user.</summary>
public sealed record UpdatePortalUserRequest
{
    [Required, StringLength(100, MinimumLength = 1)]
    public required string FirstName { get; init; }

    [Required, StringLength(100, MinimumLength = 1)]
    public required string LastName { get; init; }

    [Required, EmailAddress, StringLength(254)]
    public required string Email { get; init; }

    public Guid[] PositionIds { get; init; } = [];
    public Guid[] DesignationIds { get; init; } = [];
}

/// <summary>A replacement password for an existing front-end user.</summary>
public sealed record ResetPortalUserPasswordRequest
{
    [Required, MinLength(12), StringLength(128)]
    public required string Password { get; init; }
}

/// <summary>One catalog assignment attached to a front-end user.</summary>
public sealed record PortalCatalogAssignmentResponse(Guid Id, string Name);

/// <summary>A front-end user account and its assigned positions and designations.</summary>
public sealed record PortalUserResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    IReadOnlyList<PortalCatalogAssignmentResponse> Positions,
    IReadOnlyList<PortalCatalogAssignmentResponse> Designations);

public sealed record AuthLoginResponse(string AccessToken, DateTimeOffset ExpiresAt, string Role);

/// <summary>A bearer token and its expiration time.</summary>
public sealed record AdminLoginResponse(string AccessToken, DateTimeOffset ExpiresAt);
