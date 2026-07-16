using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiveTrackingService.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedLiveTrackingData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "LiveTripTrackings",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-1111-1111-1111-111111111111"),
                column: "LastUpdatedAt",
                value: new DateTime(2026, 6, 30, 21, 14, 40, 670, DateTimeKind.Utc).AddTicks(1353));

            migrationBuilder.UpdateData(
                table: "TrackingHistories",
                keyColumn: "Id",
                keyValue: new Guid("e5555555-5555-5555-5555-555555555555"),
                column: "Timestamp",
                value: new DateTime(2026, 6, 30, 21, 12, 40, 670, DateTimeKind.Utc).AddTicks(2201));

            migrationBuilder.UpdateData(
                table: "TrackingHistories",
                keyColumn: "Id",
                keyValue: new Guid("f6666666-6666-6666-6666-666666666666"),
                column: "Timestamp",
                value: new DateTime(2026, 6, 30, 21, 13, 40, 670, DateTimeKind.Utc).AddTicks(2209));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "LiveTripTrackings",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-1111-1111-1111-111111111111"),
                column: "LastUpdatedAt",
                value: new DateTime(2026, 6, 30, 21, 14, 6, 561, DateTimeKind.Utc).AddTicks(4693));

            migrationBuilder.UpdateData(
                table: "TrackingHistories",
                keyColumn: "Id",
                keyValue: new Guid("e5555555-5555-5555-5555-555555555555"),
                column: "Timestamp",
                value: new DateTime(2026, 6, 30, 21, 12, 6, 561, DateTimeKind.Utc).AddTicks(5547));

            migrationBuilder.UpdateData(
                table: "TrackingHistories",
                keyColumn: "Id",
                keyValue: new Guid("f6666666-6666-6666-6666-666666666666"),
                column: "Timestamp",
                value: new DateTime(2026, 6, 30, 21, 13, 6, 561, DateTimeKind.Utc).AddTicks(5556));
        }
    }
}
