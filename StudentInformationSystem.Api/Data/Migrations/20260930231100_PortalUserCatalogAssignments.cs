using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using StudentInformationSystem.Api.Data;

#nullable disable

namespace StudentInformationSystem.Api.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260930231100_PortalUserCatalogAssignments")]
public partial class PortalUserCatalogAssignments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "PortalUserPositions",
            columns: table => new
            {
                UserId = table.Column<string>(type: "text", nullable: false),
                PositionId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PortalUserPositions", assignment => new { assignment.UserId, assignment.PositionId });
                table.ForeignKey(
                    name: "FK_PortalUserPositions_AdminCatalogEntries_PositionId",
                    column: assignment => assignment.PositionId,
                    principalTable: "AdminCatalogEntries",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_PortalUserPositions_PortalUserProfiles_UserId",
                    column: assignment => assignment.UserId,
                    principalTable: "PortalUserProfiles",
                    principalColumn: "UserId",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "PortalUserDesignations",
            columns: table => new
            {
                UserId = table.Column<string>(type: "text", nullable: false),
                DesignationId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PortalUserDesignations", assignment => new { assignment.UserId, assignment.DesignationId });
                table.ForeignKey(
                    name: "FK_PortalUserDesignations_AdminCatalogEntries_DesignationId",
                    column: assignment => assignment.DesignationId,
                    principalTable: "AdminCatalogEntries",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_PortalUserDesignations_PortalUserProfiles_UserId",
                    column: assignment => assignment.UserId,
                    principalTable: "PortalUserProfiles",
                    principalColumn: "UserId",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_PortalUserPositions_PositionId",
            table: "PortalUserPositions",
            column: "PositionId");
        migrationBuilder.CreateIndex(
            name: "IX_PortalUserDesignations_DesignationId",
            table: "PortalUserDesignations",
            column: "DesignationId");

        migrationBuilder.Sql("""
            INSERT INTO "PortalUserPositions" ("UserId", "PositionId")
            SELECT "UserId", "PositionId"
            FROM "PortalUserProfiles"
            WHERE "PositionId" IS NOT NULL;

            INSERT INTO "PortalUserDesignations" ("UserId", "DesignationId")
            SELECT "UserId", "DesignationId"
            FROM "PortalUserProfiles"
            WHERE "DesignationId" IS NOT NULL;
            """);

        migrationBuilder.DropForeignKey(
            name: "FK_PortalUserProfiles_AdminCatalogEntries_DesignationId",
            table: "PortalUserProfiles");
        migrationBuilder.DropForeignKey(
            name: "FK_PortalUserProfiles_AdminCatalogEntries_PositionId",
            table: "PortalUserProfiles");
        migrationBuilder.DropIndex(
            name: "IX_PortalUserProfiles_DesignationId",
            table: "PortalUserProfiles");
        migrationBuilder.DropIndex(
            name: "IX_PortalUserProfiles_PositionId",
            table: "PortalUserProfiles");
        migrationBuilder.DropColumn(name: "DesignationId", table: "PortalUserProfiles");
        migrationBuilder.DropColumn(name: "PositionId", table: "PortalUserProfiles");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "PositionId",
            table: "PortalUserProfiles",
            type: "uuid",
            nullable: true);
        migrationBuilder.AddColumn<Guid>(
            name: "DesignationId",
            table: "PortalUserProfiles",
            type: "uuid",
            nullable: true);
        migrationBuilder.CreateIndex(
            name: "IX_PortalUserProfiles_PositionId",
            table: "PortalUserProfiles",
            column: "PositionId");
        migrationBuilder.CreateIndex(
            name: "IX_PortalUserProfiles_DesignationId",
            table: "PortalUserProfiles",
            column: "DesignationId");
        migrationBuilder.AddForeignKey(
            name: "FK_PortalUserProfiles_AdminCatalogEntries_PositionId",
            table: "PortalUserProfiles",
            column: "PositionId",
            principalTable: "AdminCatalogEntries",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
        migrationBuilder.AddForeignKey(
            name: "FK_PortalUserProfiles_AdminCatalogEntries_DesignationId",
            table: "PortalUserProfiles",
            column: "DesignationId",
            principalTable: "AdminCatalogEntries",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.Sql("""
            UPDATE "PortalUserProfiles" AS profile
            SET "PositionId" = (
                SELECT assignment."PositionId"
                FROM "PortalUserPositions" AS assignment
                WHERE assignment."UserId" = profile."UserId"
                ORDER BY assignment."PositionId"
                LIMIT 1
            );

            UPDATE "PortalUserProfiles" AS profile
            SET "DesignationId" = (
                SELECT assignment."DesignationId"
                FROM "PortalUserDesignations" AS assignment
                WHERE assignment."UserId" = profile."UserId"
                ORDER BY assignment."DesignationId"
                LIMIT 1
            );
            """);
        migrationBuilder.DropTable(name: "PortalUserPositions");
        migrationBuilder.DropTable(name: "PortalUserDesignations");
    }
}
