# Sitemap

This document describes the frontend navigation structure for the Public Transport Launch Center Management System.
It is organized by route, user role, and page purpose so it can be used as a reference for drawing a site map.

## Overview

- Public pages:
  - `/login` — Login page
  - `/register` — User registration page
- Protected pages: require authentication
  - `MainLayout` wraps the authenticated area
  - `/` — Dashboard (landing page after login)
  - `/notifications` — Notifications center

## Role-based sections

### Admin section

- `/admin/routes` — Manage routes
  - `/admin/routes/:routeId` — View and edit a specific route
- `/admin/trips` — Manage trips
  - `/admin/trips/:tripId` — View and edit a specific trip
- `/admin/drivers` — Manage drivers
  - `/admin/drivers/:id` — View driver details
- `/admin/users` — Manage users
  - `/admin/users/:id` — View user details
- `/admin/vehicles` — Manage vehicles
  - `/admin/vehicles/:vehicleId` — View vehicle details
- `/admin/complaints` — View and manage complaints
- `/admin/profile` — Admin profile settings

### Driver section

- `/driver/profile` — Driver profile
- `/driver/trips` — Driver trip assignments
- `/driver/complaints` — Driver complaint submission

### Citizen section

- `/citizen/profile` — Citizen profile
- `/citizen/trips` — Browse trips
- `/citizen/favorites` — Favorite trips
- `/citizen/bookings` — My bookings
- `/citizen/complaints` — Citizen complaint submission

## Notes

- The protected routes are rendered inside `MainLayout`.
- The `ProtectedRoute` component enforces authentication and role restrictions.
- A catch-all route redirects unknown paths to `/`.
- `SubmitComplaint` is accessible to both `Citizen` and `Driver` roles.

## Mermaid diagram

Use this diagram as a starting point for drawing the sitemap.

```mermaid
flowchart TD
  Public[Public Pages]
  Public --> Login[/login\nLogin]
  Public --> Register[/register\nRegister]

  Auth[Authenticated Area]
  Auth --> Dashboard[/\nDashboard]
  Auth --> Notifications[/notifications\nNotifications]

  Admin[Admin]
  Admin --> AdminRoutes[/admin/routes\nManage Routes]
  AdminRoutes --> RouteDetails[/admin/routes/:routeId\nRoute Details]
  Admin --> AdminTrips[/admin/trips\nManage Trips]
  AdminTrips --> TripDetails[/admin/trips/:tripId\nTrip Details]
  Admin --> AdminDrivers[/admin/drivers\nManage Drivers]
  AdminDrivers --> DriverDetails[/admin/drivers/:id\nDriver Details]
  Admin --> AdminUsers[/admin/users\nManage Users]
  AdminUsers --> UserDetails[/admin/users/:id\nUser Details]
  Admin --> AdminVehicles[/admin/vehicles\nManage Vehicles]
  AdminVehicles --> VehicleDetails[/admin/vehicles/:vehicleId\nVehicle Details]
  Admin --> AdminComplaints[/admin/complaints\nComplaints]
  Admin --> AdminProfile[/admin/profile\nProfile]

  Driver[Driver]
  Driver --> DriverProfile[/driver/profile\nProfile]
  Driver --> DriverTrips[/driver/trips\nTrips]
  Driver --> DriverComplaints[/driver/complaints\nComplaints]

  Citizen[Citizen]
  Citizen --> CitizenProfile[/citizen/profile\nProfile]
  Citizen --> CitizenTrips[/citizen/trips\nTrips]
  Citizen --> CitizenFavorites[/citizen/favorites\nFavorites]
  Citizen --> CitizenBookings[/citizen/bookings\nBookings]
  Citizen --> CitizenComplaints[/citizen/complaints\nComplaints]

  Auth --> Admin
  Auth --> Driver
  Auth --> Citizen
```

## Recommended use

- Use the route tree above to draw blocks for public, admin, driver, and citizen sections.
- Add dynamic child pages under the parent routes for `:routeId`, `:tripId`, `:id`, and `:vehicleId`.
- Mark authentication and role restrictions on the diagram because `MainLayout` is only available after login.
