using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleIdToTrip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'VehicleId' AND Object_ID = OBJECT_ID(N'dbo.Trips'))
BEGIN
    ALTER TABLE [Trips] ADD [VehicleId] uniqueidentifier NOT NULL CONSTRAINT DF_Trips_VehicleId DEFAULT '00000000-0000-0000-0000-000000000000';
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Trips_VehicleId' AND object_id = OBJECT_ID(N'dbo.Trips'))
BEGIN
    CREATE INDEX [IX_Trips_VehicleId] ON [Trips] ([VehicleId]);
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Trips_VehicleId' AND object_id = OBJECT_ID(N'dbo.Trips'))
BEGIN
    DROP INDEX [IX_Trips_VehicleId] ON [Trips];
END
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'VehicleId' AND Object_ID = OBJECT_ID(N'dbo.Trips'))
BEGIN
    ALTER TABLE [Trips] DROP COLUMN [VehicleId];
END
");
        }
    }
}
