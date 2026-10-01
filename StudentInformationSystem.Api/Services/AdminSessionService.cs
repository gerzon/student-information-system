using Microsoft.EntityFrameworkCore;
using StudentInformationSystem.Api.Data;
using StudentInformationSystem.Api.Models;

namespace StudentInformationSystem.Api.Services;

public sealed class AdminSessionService(ApplicationDbContext dbContext) : IAdminSessionService
{
    public async Task<bool> TryStartSessionAsync(
        string adminId,
        Guid sessionId,
        DateTimeOffset expiresAt,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var existingSession = await dbContext.AdminLoginSessions
            .SingleOrDefaultAsync(session => session.AdminId == adminId, cancellationToken);

        if (existingSession is not null && existingSession.ExpiresAt > now)
        {
            return false;
        }

        if (existingSession is not null)
        {
            dbContext.AdminLoginSessions.Remove(existingSession);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var newSession = new AdminLoginSession
        {
            AdminId = adminId,
            SessionId = sessionId,
            ExpiresAt = expiresAt
        };
        dbContext.AdminLoginSessions.Add(newSession);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException)
        {
            dbContext.Entry(newSession).State = EntityState.Detached;
            var activeSessionExists = await dbContext.AdminLoginSessions
                .AnyAsync(
                    session => session.AdminId == adminId && session.ExpiresAt > DateTimeOffset.UtcNow,
                    cancellationToken);
            if (activeSessionExists)
            {
                return false;
            }

            throw;
        }
    }

    public Task<bool> IsSessionActiveAsync(
        string adminId,
        Guid sessionId,
        DateTimeOffset now,
        CancellationToken cancellationToken) =>
        dbContext.AdminLoginSessions.AnyAsync(
            session => session.AdminId == adminId &&
                       session.SessionId == sessionId &&
                       session.ExpiresAt > now,
            cancellationToken);

    public async Task EndSessionAsync(
        string adminId,
        Guid sessionId,
        CancellationToken cancellationToken)
    {
        var session = await dbContext.AdminLoginSessions
            .SingleOrDefaultAsync(
                current => current.AdminId == adminId && current.SessionId == sessionId,
                cancellationToken);
        if (session is null)
        {
            return;
        }

        dbContext.AdminLoginSessions.Remove(session);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
