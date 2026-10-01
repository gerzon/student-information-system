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

public sealed class AdminService(
    UserManager<IdentityUser> userManager,
    SignInManager<IdentityUser> signInManager,
    RoleManager<IdentityRole> roleManager,
    ApplicationDbContext dbContext,
    IAdminSessionService adminSessionService,
    IConfiguration configuration) : IAdminService
{
    private const string AdministratorRole = "Administrator";
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromHours(1);

    public async Task<AdminLoginResult> LoginAsync(
        AdminLoginRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.IsInRoleAsync(user, AdministratorRole))
        {
            return new AdminLoginResult(null, false);
        }

        var signInResult = await signInManager.CheckPasswordSignInAsync(
            user, request.Password, lockoutOnFailure: true);
        if (!signInResult.Succeeded)
        {
            return new AdminLoginResult(null, false);
        }

        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.Add(TokenLifetime);
        var issuer = configuration["Jwt:Issuer"] ?? "StudentInformationSystem.Api";
        var audience = configuration["Jwt:Audience"] ?? "StudentInformationSystem.Client";
        var signingKey = configuration["Jwt:SigningKey"]
            ?? throw new InvalidOperationException("Jwt:SigningKey must be configured.");
        var sessionId = Guid.NewGuid();
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Role, AdministratorRole),
            new Claim(JwtRegisteredClaimNames.Jti, sessionId.ToString())
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

        if (!await adminSessionService.TryStartSessionAsync(
                user.Id, sessionId, expiresAt, cancellationToken))
        {
            return new AdminLoginResult(null, true);
        }

        return new AdminLoginResult(new AdminLoginResponse(accessToken, expiresAt), false);
    }

    public Task LogoutAsync(string adminId, Guid sessionId, CancellationToken cancellationToken) =>
        adminSessionService.EndSessionAsync(adminId, sessionId, cancellationToken);

    public async Task<IReadOnlyList<AdminResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var administratorRoleId = await roleManager.Roles
            .Where(role => role.Name == AdministratorRole)
            .Select(role => role.Id)
            .SingleOrDefaultAsync(cancellationToken);
        if (administratorRoleId is null)
        {
            return [];
        }

        return await (
            from user in dbContext.Users.AsNoTracking()
            join userRole in dbContext.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
            where userRole.RoleId == administratorRoleId
            orderby user.Email
            select new AdminResponse(user.Id, user.Email!))
            .ToListAsync(cancellationToken);
    }

    public async Task<AdminResponse?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        var administratorRoleId = await roleManager.Roles
            .Where(role => role.Name == AdministratorRole)
            .Select(role => role.Id)
            .SingleOrDefaultAsync(cancellationToken);
        if (administratorRoleId is null)
        {
            return null;
        }

        return await (
            from user in dbContext.Users.AsNoTracking()
            join userRole in dbContext.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
            where user.Id == id && userRole.RoleId == administratorRoleId
            select new AdminResponse(user.Id, user.Email!))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<CreateAdminResult> CreateAsync(
        CreateAdminRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
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
            return new CreateAdminResult(null, ToErrors(createResult.Errors));
        }

        var roleResult = await userManager.AddToRoleAsync(user, AdministratorRole);
        if (!roleResult.Succeeded)
        {
            await userManager.DeleteAsync(user);
            return new CreateAdminResult(null, ToErrors(roleResult.Errors));
        }

        return new CreateAdminResult(
            new AdminResponse(user.Id, user.Email!),
            new Dictionary<string, string[]>());
    }

    public async Task<DeleteAdminResult> DeleteAsync(
        string id,
        string requestingAdminId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await userManager.FindByIdAsync(id);
        if (user is null || !await userManager.IsInRoleAsync(user, AdministratorRole))
        {
            return DeleteAdminResult.NotFound;
        }

        if (string.Equals(id, requestingAdminId, StringComparison.Ordinal))
        {
            return DeleteAdminResult.CannotDeleteSelf;
        }

        var admins = await userManager.GetUsersInRoleAsync(AdministratorRole);
        if (admins.Count <= 1)
        {
            return DeleteAdminResult.CannotDeleteLastAdministrator;
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException("The administrator account could not be deleted.");
        }

        return DeleteAdminResult.Deleted;
    }

    public async Task EnsureBootstrapAdminAsync(string email, string password)
    {
        if (!await roleManager.RoleExistsAsync(AdministratorRole))
        {
            var roleResult = await roleManager.CreateAsync(new IdentityRole(AdministratorRole));
            if (!roleResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Could not create the Administrator role: {string.Join("; ", roleResult.Errors.Select(error => error.Code))}");
            }
        }

        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        var normalizedEmail = email.Trim();
        var user = await userManager.FindByEmailAsync(normalizedEmail);
        if (user is null)
        {
            user = new IdentityUser
            {
                UserName = normalizedEmail,
                Email = normalizedEmail,
                LockoutEnabled = true
            };
            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Could not create the bootstrap administrator: {string.Join("; ", createResult.Errors.Select(error => error.Code))}");
            }
        }

        if (!user.LockoutEnabled)
        {
            var lockoutResult = await userManager.SetLockoutEnabledAsync(user, true);
            if (!lockoutResult.Succeeded)
            {
                throw new InvalidOperationException("Could not enable lockout for the bootstrap administrator.");
            }
        }

        if (!await userManager.IsInRoleAsync(user, AdministratorRole))
        {
            var addRoleResult = await userManager.AddToRoleAsync(user, AdministratorRole);
            if (!addRoleResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Could not assign the Administrator role: {string.Join("; ", addRoleResult.Errors.Select(error => error.Code))}");
            }
        }
    }

    private static Dictionary<string, string[]> ToErrors(IEnumerable<IdentityError> errors) =>
        errors.GroupBy(error => error.Code)
            .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray());

}
