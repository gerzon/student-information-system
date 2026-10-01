using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using StudentInformationSystem.Api.Data;

#nullable disable

namespace StudentInformationSystem.Api.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260930223600_AdminAccountAssignments")]
public partial class AdminAccountAssignments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AdminAccountAssignments",
            columns: table => new
            {
                AdminId = table.Column<string>(type: "text", nullable: false),
                PositionId = table.Column<Guid>(type: "uuid", nullable: true),
                DesignationId = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AdminAccountAssignments", assignment => assignment.AdminId);
                table.ForeignKey(
                    name: "FK_AdminAccountAssignments_AdminCatalogEntries_DesignationId",
                    column: assignment => assignment.DesignationId,
                    principalTable: "AdminCatalogEntries",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_AdminAccountAssignments_AdminCatalogEntries_PositionId",
                    column: assignment => assignment.PositionId,
                    principalTable: "AdminCatalogEntries",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_AdminAccountAssignments_AspNetUsers_AdminId",
                    column: assignment => assignment.AdminId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AdminAccountAssignments_DesignationId",
            table: "AdminAccountAssignments",
            column: "DesignationId");

        migrationBuilder.CreateIndex(
            name: "IX_AdminAccountAssignments_PositionId",
            table: "AdminAccountAssignments",
            column: "PositionId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AdminAccountAssignments");
    }
}
