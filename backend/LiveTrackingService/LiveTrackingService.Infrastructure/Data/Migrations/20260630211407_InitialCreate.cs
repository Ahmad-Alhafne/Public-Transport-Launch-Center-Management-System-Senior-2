using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LiveTrackingService.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LiveTripTrackings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TripId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DriverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CurrentLatitude = table.Column<double>(type: "float", nullable: false),
                    CurrentLongitude = table.Column<double>(type: "float", nullable: false),
                    CurrentSpeed = table.Column<double>(type: "float", nullable: true),
                    LastUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrackingStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiveTripTrackings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrackingHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TripId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    Speed = table.Column<double>(type: "float", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackingHistories", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "LiveTripTrackings",
                columns: new[] { "Id", "CurrentLatitude", "CurrentLongitude", "CurrentSpeed", "DriverId", "LastUpdatedAt", "TrackingStatus", "TripId", "VehicleId" },
                values: new object[] { new Guid("a1111111-1111-1111-1111-111111111111"), 31.949999999999999, 35.933300000000003, 58.399999999999999, new Guid("c3333333-3333-3333-3333-333333333333"), new DateTime(2026, 6, 30, 21, 14, 6, 561, DateTimeKind.Utc).AddTicks(4693), "Active", new Guid("b2222222-2222-2222-2222-222222222222"), new Guid("d4444444-4444-4444-4444-444444444444") });

            migrationBuilder.InsertData(
                table: "TrackingHistories",
                columns: new[] { "Id", "Latitude", "Longitude", "Speed", "Timestamp", "TripId" },
                values: new object[,]
                {
                    { new Guid("e5555555-5555-5555-5555-555555555555"), 31.949999999999999, 35.933300000000003, 52.100000000000001, new DateTime(2026, 6, 30, 21, 12, 6, 561, DateTimeKind.Utc).AddTicks(5547), new Guid("b2222222-2222-2222-2222-222222222222") },
                    { new Guid("f6666666-6666-6666-6666-666666666666"), 31.9512, 35.935000000000002, 58.399999999999999, new DateTime(2026, 6, 30, 21, 13, 6, 561, DateTimeKind.Utc).AddTicks(5556), new Guid("b2222222-2222-2222-2222-222222222222") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_LiveTripTrackings_TripId",
                table: "LiveTripTrackings",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_TrackingHistories_TripId",
                table: "TrackingHistories",
                column: "TripId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LiveTripTrackings");

            migrationBuilder.DropTable(
                name: "TrackingHistories");
        }
    }
}
