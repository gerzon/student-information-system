using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using StudentInformationSystem.Api.Data;

#nullable disable

namespace StudentInformationSystem.Api.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260930201500_AdminLoginSessions")]
public partial class AdminLoginSessions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AdminLoginSessions",
            columns: table => new
            {
                AdminId = table.Column<string>(type: "text", nullable: false),
                SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AdminLoginSessions", session => session.AdminId);
                table.ForeignKey(
                    name: "FK_AdminLoginSessions_AspNetUsers_AdminId",
                    column: session => session.AdminId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AdminLoginSessions");
    }
}
