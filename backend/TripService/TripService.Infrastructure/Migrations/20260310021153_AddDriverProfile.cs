using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDriverProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'dbo.DriverProfiles', N'U') IS NULL
BEGIN
    CREATE TABLE [DriverProfiles] (
        [Id] uniqueidentifier NOT NULL,
        [DriverId] uniqueidentifier NOT NULL,
        [LicenseNumber] nvarchar(100) NOT NULL,
        [LicenseExpiryDate] datetime2 NOT NULL,
        [LicenseCategory] nvarchar(max) NOT NULL,
        [IssuingAuthority] nvarchar(150) NOT NULL,
        [VehiclePlateNumber] nvarchar(50) NOT NULL,
        [VehicleModel] nvarchar(100) NOT NULL,
        [VehicleColor] nvarchar(50) NOT NULL,
        [RegistrationExpiryDate] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_DriverProfiles] PRIMARY KEY ([Id])
    );
END
");

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'dbo.Trips', N'U') IS NULL
BEGIN
    CREATE TABLE [Trips] (
        [Id] uniqueidentifier NOT NULL,
        [RouteId] uniqueidentifier NOT NULL,
        [DriverId] uniqueidentifier NOT NULL,
        [BusNumber] nvarchar(50) NOT NULL,
        [DepartureTime] datetime2 NOT NULL,
        [ArrivalTime] datetime2 NULL,
        [TotalSeats] int NOT NULL,
        [AvailableSeats] int NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Trips] PRIMARY KEY ([Id])
    );
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_DriverProfiles_DriverId' AND object_id = OBJECT_ID(N'dbo.DriverProfiles'))
BEGIN
    CREATE UNIQUE INDEX [IX_DriverProfiles_DriverId] ON [DriverProfiles] ([DriverId]);
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Trips_DriverId' AND object_id = OBJECT_ID(N'dbo.Trips'))
BEGIN
    CREATE INDEX [IX_Trips_DriverId] ON [Trips] ([DriverId]);
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Trips_RouteId' AND object_id = OBJECT_ID(N'dbo.Trips'))
BEGIN
    CREATE INDEX [IX_Trips_RouteId] ON [Trips] ([RouteId]);
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DriverProfiles");

            migrationBuilder.DropTable(
                name: "Trips");
        }
    }
}
