using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using StudentInformationSystem.Api.Data;

#nullable disable

namespace StudentInformationSystem.Api.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260930225500_PortalUserProfiles")]
public partial class PortalUserProfiles : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "PortalUserProfiles",
            columns: table => new
            {
                UserId = table.Column<string>(type: "text", nullable: false),
                UserType = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                PositionId = table.Column<Guid>(type: "uuid", nullable: true),
                DesignationId = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PortalUserProfiles", profile => profile.UserId);
                table.ForeignKey(
                    name: "FK_PortalUserProfiles_AdminCatalogEntries_DesignationId",
                    column: profile => profile.DesignationId,
                    principalTable: "AdminCatalogEntries",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_PortalUserProfiles_AdminCatalogEntries_PositionId",
                    column: profile => profile.PositionId,
                    principalTable: "AdminCatalogEntries",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_PortalUserProfiles_AspNetUsers_UserId",
                    column: profile => profile.UserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_PortalUserProfiles_DesignationId",
            table: "PortalUserProfiles",
            column: "DesignationId");

        migrationBuilder.CreateIndex(
            name: "IX_PortalUserProfiles_PositionId",
            table: "PortalUserProfiles",
            column: "PositionId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "PortalUserProfiles");
    }
}
