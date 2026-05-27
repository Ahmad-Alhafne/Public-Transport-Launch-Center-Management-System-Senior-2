using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTripDelayFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'AdminContact' AND Object_ID = OBJECT_ID(N'dbo.Trips'))
BEGIN
    ALTER TABLE [Trips] ADD [AdminContact] nvarchar(max) NULL;
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'DelayMinutes' AND Object_ID = OBJECT_ID(N'dbo.Trips'))
BEGIN
    ALTER TABLE [Trips] ADD [DelayMinutes] int NULL;
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'DelayReason' AND Object_ID = OBJECT_ID(N'dbo.Trips'))
BEGIN
    ALTER TABLE [Trips] ADD [DelayReason] nvarchar(max) NULL;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'AdminContact' AND Object_ID = OBJECT_ID(N'dbo.Trips'))
BEGIN
    ALTER TABLE [Trips] DROP COLUMN [AdminContact];
END
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'DelayMinutes' AND Object_ID = OBJECT_ID(N'dbo.Trips'))
BEGIN
    ALTER TABLE [Trips] DROP COLUMN [DelayMinutes];
END
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'DelayReason' AND Object_ID = OBJECT_ID(N'dbo.Trips'))
BEGIN
    ALTER TABLE [Trips] DROP COLUMN [DelayReason];
END
");
        }
    }
}
