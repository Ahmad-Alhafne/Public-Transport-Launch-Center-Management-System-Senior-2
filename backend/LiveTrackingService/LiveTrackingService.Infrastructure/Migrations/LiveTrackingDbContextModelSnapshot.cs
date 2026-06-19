using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using LiveTrackingService.Infrastructure.Data;

#nullable disable

namespace LiveTrackingService.Infrastructure.Migrations
{
    [DbContext(typeof(LiveTrackingDbContext))]
    partial class LiveTrackingDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0");

            modelBuilder.Entity("LiveTrackingService.Domain.Entities.LiveTripTracking", b =>
            {
                b.Property<Guid>("Id").ValueGeneratedOnAdd();
                b.Property<Guid>("TripId");
                b.Property<Guid>("DriverId");
                b.Property<Guid>("VehicleId");
                b.Property<double>("CurrentLatitude");
                b.Property<double>("CurrentLongitude");
                b.Property<double?>("CurrentSpeed");
                b.Property<DateTime>("LastUpdatedAt");
                b.Property<string>("TrackingStatus");
                b.HasKey("Id");
                b.ToTable("LiveTripTrackings");
            });

            modelBuilder.Entity("LiveTrackingService.Domain.Entities.TrackingHistory", b =>
            {
                b.Property<Guid>("Id").ValueGeneratedOnAdd();
                b.Property<Guid>("TripId");
                b.Property<double>("Latitude");
                b.Property<double>("Longitude");
                b.Property<double?>("Speed");
                b.Property<DateTime>("Timestamp");
                b.HasKey("Id");
                b.ToTable("TrackingHistories");
            });
        }
    }
}
