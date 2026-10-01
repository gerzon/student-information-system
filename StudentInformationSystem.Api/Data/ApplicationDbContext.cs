using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudentInformationSystem.Api.Models;

namespace StudentInformationSystem.Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<IdentityUser, IdentityRole, string>(options)
{
    public DbSet<Student> Students => Set<Student>();
    public DbSet<AdminLoginSession> AdminLoginSessions => Set<AdminLoginSession>();
    public DbSet<AdminCatalogEntry> AdminCatalogEntries => Set<AdminCatalogEntry>();
    public DbSet<AdminAccountAssignment> AdminAccountAssignments => Set<AdminAccountAssignment>();
    public DbSet<PortalUserProfile> PortalUserProfiles => Set<PortalUserProfile>();
    public DbSet<PortalUserPosition> PortalUserPositions => Set<PortalUserPosition>();
    public DbSet<PortalUserDesignation> PortalUserDesignations => Set<PortalUserDesignation>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Student>(entity =>
        {
            entity.HasKey(student => student.Id);
            entity.HasIndex(student => student.StudentNumber).IsUnique();
            entity.HasIndex(student => student.Email).IsUnique();
            entity.Property(student => student.StudentNumber).HasMaxLength(30).IsRequired();
            entity.Property(student => student.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(student => student.LastName).HasMaxLength(100).IsRequired();
            entity.Property(student => student.Email).HasMaxLength(254).IsRequired();
        });

        builder.Entity<AdminLoginSession>(entity =>
        {
            entity.HasKey(session => session.AdminId);
            entity.Property(session => session.AdminId).HasColumnType("text");
            entity.Property(session => session.SessionId).IsRequired();
            entity.HasOne<IdentityUser>()
                .WithMany()
                .HasForeignKey(session => session.AdminId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AdminCatalogEntry>(entity =>
        {
            entity.HasKey(entry => entry.Id);
            entity.HasIndex(entry => new { entry.CatalogType, entry.NormalizedName }).IsUnique();
            entity.Property(entry => entry.CatalogType).HasMaxLength(32).IsRequired();
            entity.Property(entry => entry.Name).HasMaxLength(100).IsRequired();
            entity.Property(entry => entry.NormalizedName).HasMaxLength(100).IsRequired();
            entity.Property(entry => entry.Description).HasMaxLength(500).IsRequired();
        });

        builder.Entity<AdminAccountAssignment>(entity =>
        {
            entity.HasKey(assignment => assignment.AdminId);
            entity.Property(assignment => assignment.AdminId).HasColumnType("text");
            entity.HasOne<IdentityUser>()
                .WithOne()
                .HasForeignKey<AdminAccountAssignment>(assignment => assignment.AdminId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<AdminCatalogEntry>()
                .WithMany()
                .HasForeignKey(assignment => assignment.PositionId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne<AdminCatalogEntry>()
                .WithMany()
                .HasForeignKey(assignment => assignment.DesignationId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<PortalUserProfile>(entity =>
        {
            entity.HasKey(profile => profile.UserId);
            entity.Property(profile => profile.UserId).HasColumnType("text");
            entity.Property(profile => profile.UserType).HasMaxLength(16).IsRequired();
            entity.Property(profile => profile.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(profile => profile.LastName).HasMaxLength(100).IsRequired();
            entity.HasOne<IdentityUser>()
                .WithOne()
                .HasForeignKey<PortalUserProfile>(profile => profile.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PortalUserPosition>(entity =>
        {
            entity.HasKey(assignment => new { assignment.UserId, assignment.PositionId });
            entity.HasOne<PortalUserProfile>()
                .WithMany()
                .HasForeignKey(assignment => assignment.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<AdminCatalogEntry>()
                .WithMany()
                .HasForeignKey(assignment => assignment.PositionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PortalUserDesignation>(entity =>
        {
            entity.HasKey(assignment => new { assignment.UserId, assignment.DesignationId });
            entity.HasOne<PortalUserProfile>()
                .WithMany()
                .HasForeignKey(assignment => assignment.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<AdminCatalogEntry>()
                .WithMany()
                .HasForeignKey(assignment => assignment.DesignationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
