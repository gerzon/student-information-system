using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using StudentInformationSystem.Api.Data;

#nullable disable

namespace StudentInformationSystem.Api.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260930211500_AdminCatalogEntries")]
public partial class AdminCatalogEntries : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AdminCatalogEntries",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CatalogType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                NormalizedName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AdminCatalogEntries", entry => entry.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AdminCatalogEntries_CatalogType_NormalizedName",
            table: "AdminCatalogEntries",
            columns: new[] { "CatalogType", "NormalizedName" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AdminCatalogEntries");
    }
}
