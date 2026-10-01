using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudentInformationSystem.Api.Contracts;
using StudentInformationSystem.Api.Data;
using StudentInformationSystem.Api.Models;

namespace StudentInformationSystem.Api.Services;

public sealed class PortalUserService(
    UserManager<IdentityUser> userManager,
    SignInManager<IdentityUser> signInManager,
    ApplicationDbContext dbContext,
    IConfiguration configuration) : IPortalUserService
{
    private const string PortalUserRole = "User";
    private static readonly HashSet<string> LegacyPortalRoles = ["Student", "Faculty", "Staff"];
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromHours(1);

    public async Task<IReadOnlyList<PortalUserResponse>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        var users = await (
            from profile in dbContext.PortalUserProfiles.AsNoTracking()
            join user in dbContext.Users.AsNoTracking() on profile.UserId equals user.Id
            orderby profile.LastName, profile.FirstName
            select new { Profile = profile, user.Email })
            .ToListAsync(cancellationToken);
        return await AddCatalogAssignmentsAsync(
            users.Select(item => (item.Profile, item.Email!)).ToArray(),
            cancellationToken);
    }

    public async Task<PortalUserResponse?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken)
    {
        var user = await (
            from profile in dbContext.PortalUserProfiles.AsNoTracking()
            join identityUser in dbContext.Users.AsNoTracking() on profile.UserId equals identityUser.Id
            where profile.UserId == id
            select new { Profile = profile, identityUser.Email })
            .SingleOrDefaultAsync(cancellationToken);
        if (user is null) return null;

        return (await AddCatalogAssignmentsAsync(
            [(user.Profile, user.Email!)],
            cancellationToken))[0];
    }

    public async Task<CreatePortalUserResult> CreateAsync(
        CreatePortalUserRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var positionIds = (request.PositionIds ?? []).Distinct().ToArray();
        var designationIds = (request.DesignationIds ?? []).Distinct().ToArray();
        var requestedCatalogIds = positionIds.Concat(designationIds).Distinct().ToArray();
        var catalogEntries = requestedCatalogIds.Length == 0
            ? new Dictionary<Guid, AdminCatalogEntry>()
            : await dbContext.AdminCatalogEntries
                .AsNoTracking()
                .Where(entry => requestedCatalogIds.Contains(entry.Id))
                .ToDictionaryAsync(entry => entry.Id, cancellationToken);

        var errors = new Dictionary<string, string[]>();
        if (positionIds.Any(id =>
                !catalogEntries.TryGetValue(id, out var entry) ||
                entry.CatalogType != "positions"))
        {
            errors["PositionIds"] = ["Select only valid positions."];
        }
        if (designationIds.Any(id =>
                !catalogEntries.TryGetValue(id, out var entry) ||
                entry.CatalogType != "designations"))
        {
            errors["DesignationIds"] = ["Select only valid designations."];
        }
        if (errors.Count > 0)
        {
            return new CreatePortalUserResult(null, errors);
        }

        await using var transaction = dbContext.Database.IsRelational()
            ? await dbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;
        var email = request.Email.Trim();
        var user = new IdentityUser
        {
            UserName = email,
            Email = email,
            LockoutEnabled = true
        };
        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return new CreatePortalUserResult(null, ToErrors(createResult.Errors));
        }

        var roleResult = await userManager.AddToRoleAsync(user, PortalUserRole);
        if (!roleResult.Succeeded)
        {
            await userManager.DeleteAsync(user);
            return new CreatePortalUserResult(null, ToErrors(roleResult.Errors));
        }

        var profile = new PortalUserProfile
        {
            UserId = user.Id,
            UserType = PortalUserRole,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim()
        };
        dbContext.PortalUserProfiles.Add(profile);
        dbContext.PortalUserPositions.AddRange(positionIds.Select(id =>
            new PortalUserPosition { UserId = user.Id, PositionId = id }));
        dbContext.PortalUserDesignations.AddRange(designationIds.Select(id =>
            new PortalUserDesignation { UserId = user.Id, DesignationId = id }));
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = (await AddCatalogAssignmentsAsync(
            [(profile, user.Email!)],
            cancellationToken))[0];
        if (transaction is not null)
        {
            await transaction.CommitAsync(cancellationToken);
        }
        return new CreatePortalUserResult(response, new Dictionary<string, string[]>());
    }

    public async Task<PortalUserOperationResult> UpdateAsync(
        string id,
        UpdatePortalUserRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(id);
        var profile = await dbContext.PortalUserProfiles
            .SingleOrDefaultAsync(candidate => candidate.UserId == id, cancellationToken);
        if (user is null || profile is null || profile.UserType != PortalUserRole)
        {
            return new PortalUserOperationResult(null, new Dictionary<string, string[]>(), NotFound: true);
        }

        var positionIds = (request.PositionIds ?? []).Distinct().ToArray();
        var designationIds = (request.DesignationIds ?? []).Distinct().ToArray();
        var catalogErrors = await ValidateCatalogAssignmentsAsync(
            positionIds, designationIds, cancellationToken);
        if (catalogErrors.Count > 0)
        {
            return new PortalUserOperationResult(null, catalogErrors);
        }

        await using var transaction = dbContext.Database.IsRelational()
            ? await dbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;
        var email = request.Email.Trim();
        var emailResult = await userManager.SetEmailAsync(user, email);
        if (!emailResult.Succeeded)
        {
            return new PortalUserOperationResult(null, ToErrors(emailResult.Errors));
        }
        var userNameResult = await userManager.SetUserNameAsync(user, email);
        if (!userNameResult.Succeeded)
        {
            return new PortalUserOperationResult(null, ToErrors(userNameResult.Errors));
        }

        profile.FirstName = request.FirstName.Trim();
        profile.LastName = request.LastName.Trim();
        var oldPositions = await dbContext.PortalUserPositions
            .Where(assignment => assignment.UserId == id)
            .ToListAsync(cancellationToken);
        var oldDesignations = await dbContext.PortalUserDesignations
            .Where(assignment => assignment.UserId == id)
            .ToListAsync(cancellationToken);
        dbContext.PortalUserPositions.RemoveRange(oldPositions);
        dbContext.PortalUserDesignations.RemoveRange(oldDesignations);
        dbContext.PortalUserPositions.AddRange(positionIds.Select(positionId =>
            new PortalUserPosition { UserId = id, PositionId = positionId }));
        dbContext.PortalUserDesignations.AddRange(designationIds.Select(designationId =>
            new PortalUserDesignation { UserId = id, DesignationId = designationId }));
        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = (await AddCatalogAssignmentsAsync([(profile, user.Email!)], cancellationToken))[0];
        if (transaction is not null)
        {
            await transaction.CommitAsync(cancellationToken);
        }
        return new PortalUserOperationResult(updated, new Dictionary<string, string[]>());
    }

    public async Task<PortalUserOperationResult> ResetPasswordAsync(
        string id,
        ResetPortalUserPasswordRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await userManager.FindByIdAsync(id);
        var profileExists = await dbContext.PortalUserProfiles
            .AnyAsync(profile => profile.UserId == id && profile.UserType == PortalUserRole, cancellationToken);
        if (user is null || !profileExists)
        {
            return new PortalUserOperationResult(null, new Dictionary<string, string[]>(), NotFound: true);
        }

        var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
        var result = await userManager.ResetPasswordAsync(user, resetToken, request.Password);
        return result.Succeeded
            ? new PortalUserOperationResult(null, new Dictionary<string, string[]>(), Completed: true)
            : new PortalUserOperationResult(null, ToErrors(result.Errors));
    }

    public async Task<PortalUserOperationResult> DeleteAsync(
        string id,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await userManager.FindByIdAsync(id);
        if (user is null || !await dbContext.PortalUserProfiles
                .AnyAsync(profile => profile.UserId == id && profile.UserType == PortalUserRole, cancellationToken))
        {
            return new PortalUserOperationResult(null, new Dictionary<string, string[]>(), NotFound: true);
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return new PortalUserOperationResult(null, ToErrors(result.Errors));
        }
        return new PortalUserOperationResult(null, new Dictionary<string, string[]>(), Completed: true);
    }

    public async Task<PortalLoginResult> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return new PortalLoginResult(null, true);
        }

        var profile = await dbContext.PortalUserProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(candidate => candidate.UserId == user.Id, cancellationToken);
        if (profile is null ||
            (profile.UserType != PortalUserRole && !LegacyPortalRoles.Contains(profile.UserType)))
        {
            return new PortalLoginResult(null, true);
        }

        var signInResult = await signInManager.CheckPasswordSignInAsync(
            user, password, lockoutOnFailure: true);
        if (!signInResult.Succeeded || !await userManager.IsInRoleAsync(user, profile.UserType))
        {
            return new PortalLoginResult(null, true);
        }

        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.Add(TokenLifetime);
        var issuer = configuration["Jwt:Issuer"] ?? "StudentInformationSystem.Api";
        var audience = configuration["Jwt:Audience"] ?? "StudentInformationSystem.Client";
        var signingKey = configuration["Jwt:SigningKey"]
            ?? throw new InvalidOperationException("Jwt:SigningKey must be configured.");
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Role, profile.UserType),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            now.UtcDateTime,
            expiresAt.UtcDateTime,
            credentials);
        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        return new PortalLoginResult(
            new AuthLoginResponse(accessToken, expiresAt, profile.UserType),
            false);
    }

    private async Task<IReadOnlyList<PortalUserResponse>> AddCatalogAssignmentsAsync(
        IReadOnlyList<(PortalUserProfile Profile, string Email)> users,
        CancellationToken cancellationToken)
    {
        if (users.Count == 0) return [];
        var userIds = users.Select(item => item.Profile.UserId).ToArray();
        var positionAssignments = await (
            from assignment in dbContext.PortalUserPositions.AsNoTracking()
            join entry in dbContext.AdminCatalogEntries.AsNoTracking()
                on assignment.PositionId equals entry.Id
            where userIds.Contains(assignment.UserId) && entry.CatalogType == "positions"
            select new
            {
                assignment.UserId,
                Value = new PortalCatalogAssignmentResponse(entry.Id, entry.Name)
            })
            .ToListAsync(cancellationToken);
        var designationAssignments = await (
            from assignment in dbContext.PortalUserDesignations.AsNoTracking()
            join entry in dbContext.AdminCatalogEntries.AsNoTracking()
                on assignment.DesignationId equals entry.Id
            where userIds.Contains(assignment.UserId) && entry.CatalogType == "designations"
            select new
            {
                assignment.UserId,
                Value = new PortalCatalogAssignmentResponse(entry.Id, entry.Name)
            })
            .ToListAsync(cancellationToken);
        var positionsByUser = positionAssignments
            .GroupBy(item => item.UserId)
            .ToDictionary(group => group.Key, group => (IReadOnlyList<PortalCatalogAssignmentResponse>)
                group.Select(item => item.Value).OrderBy(item => item.Name).ToArray());
        var designationsByUser = designationAssignments
            .GroupBy(item => item.UserId)
            .ToDictionary(group => group.Key, group => (IReadOnlyList<PortalCatalogAssignmentResponse>)
                group.Select(item => item.Value).OrderBy(item => item.Name).ToArray());

        return users.Select(item => new PortalUserResponse(
            item.Profile.UserId,
            item.Profile.FirstName,
            item.Profile.LastName,
            item.Email,
            positionsByUser.GetValueOrDefault(item.Profile.UserId, []),
            designationsByUser.GetValueOrDefault(item.Profile.UserId, []))).ToArray();
    }

    private async Task<Dictionary<string, string[]>> ValidateCatalogAssignmentsAsync(
        Guid[] positionIds,
        Guid[] designationIds,
        CancellationToken cancellationToken)
    {
        var requestedIds = positionIds.Concat(designationIds).Distinct().ToArray();
        var entries = requestedIds.Length == 0
            ? new Dictionary<Guid, AdminCatalogEntry>()
            : await dbContext.AdminCatalogEntries
                .AsNoTracking()
                .Where(entry => requestedIds.Contains(entry.Id))
                .ToDictionaryAsync(entry => entry.Id, cancellationToken);
        var errors = new Dictionary<string, string[]>();
        if (positionIds.Any(id => !entries.TryGetValue(id, out var entry) ||
                                  entry.CatalogType != "positions"))
        {
            errors["PositionIds"] = ["Select only valid positions."];
        }
        if (designationIds.Any(id => !entries.TryGetValue(id, out var entry) ||
                                     entry.CatalogType != "designations"))
        {
            errors["DesignationIds"] = ["Select only valid designations."];
        }
        return errors;
    }

    private static Dictionary<string, string[]> ToErrors(IEnumerable<IdentityError> errors) =>
        errors.GroupBy(error => error.Code)
            .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray());
}
