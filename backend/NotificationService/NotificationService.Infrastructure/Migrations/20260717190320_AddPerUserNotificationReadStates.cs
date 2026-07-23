using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NotificationService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerUserNotificationReadStates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NotificationReadStates",
                columns: table => new
                {
                    NotificationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationReadStates", x => new { x.NotificationId, x.UserId });
                    table.ForeignKey(
                        name: "FK_NotificationReadStates_Notifications_NotificationId",
                        column: x => x.NotificationId,
                        principalTable: "Notifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(
                "UPDATE [Notifications] SET [TargetRole] = NULL WHERE [UserId] <> '00000000-0000-0000-0000-000000000000'");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Notifications_Recipient",
                table: "Notifications",
                sql: "[UserId] = '00000000-0000-0000-0000-000000000000' OR [TargetRole] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationReadStates_UserId",
                table: "NotificationReadStates",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationReadStates");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Notifications_Recipient",
                table: "Notifications");
        }
    }
}
