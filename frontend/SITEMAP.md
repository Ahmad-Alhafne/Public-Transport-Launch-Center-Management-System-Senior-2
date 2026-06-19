# Frontend Sitemap

This document lists the primary frontend routes and key page files for the project.

## Public / Auth
- `/` — Landing / app entry
- `/login` — Sign in ([frontend/src/pages/auth/Login.jsx](frontend/src/pages/auth/Login.jsx))
- `/register` — Register ([frontend/src/pages/auth/Register.jsx](frontend/src/pages/auth/Register.jsx))

## Dashboard (role redirects)
- `/dashboard` — redirects per role to:
  - Admin: `/admin/routes`
  - Driver: `/driver/trips`
  - Citizen: `/citizen/trips`
  - Auditor: `/auditor/dashboard`
  (See: [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx))

## Admin area
- `/admin/routes` — Manage routes ([frontend/src/pages/admin/ManageRoutes.jsx](frontend/src/pages/admin/ManageRoutes.jsx))
- `/admin/trips` — Manage trips ([frontend/src/pages/admin/ManageTrips.jsx](frontend/src/pages/admin/ManageTrips.jsx))
- `/admin/trips/:id` — Trip details ([frontend/src/pages/admin/TripDetails.jsx](frontend/src/pages/admin/TripDetails.jsx))
- `/admin/vehicles` — Manage vehicles ([frontend/src/pages/admin/ManageVehicles.jsx](frontend/src/pages/admin/ManageVehicles.jsx))
- `/admin/drivers` — Manage drivers ([frontend/src/pages/admin/ManageDrivers.jsx](frontend/src/pages/admin/ManageDrivers.jsx))
- `/admin/auditors` — Manage auditors ([frontend/src/pages/admin/ManageAuditors.jsx](frontend/src/pages/admin/ManageAuditors.jsx))
- `/admin/auditors/:id` — Auditor details ([frontend/src/pages/admin/ManageAuditorsDetails.jsx](frontend/src/pages/admin/ManageAuditorsDetails.jsx))
- `/admin/users` — Manage users ([frontend/src/pages/admin/ManageUsers.jsx](frontend/src/pages/admin/ManageUsers.jsx))
- `/admin/complaints` — Admin complaints ([frontend/src/pages/admin/ManageComplaints.jsx](frontend/src/pages/admin/ManageComplaints.jsx))
- `/admin/profile` — Admin profile

## Driver area
- `/driver/profile` — Driver profile ([frontend/src/pages/driver/DriverProfile.jsx](frontend/src/pages/driver/DriverProfile.jsx))
- `/driver/trips` — Driver trips ([frontend/src/pages/driver/DriverTrips.jsx](frontend/src/pages/driver/DriverTrips.jsx))
- `/driver/complaints` — Driver complaints

## Citizen area
- `/citizen/profile` — Citizen profile ([frontend/src/pages/citizen/MyProfile.jsx](frontend/src/pages/citizen/MyProfile.jsx))
- `/citizen/trips` — Available trips ([frontend/src/pages/citizen/Trips.jsx](frontend/src/pages/citizen/Trips.jsx))
- `/citizen/favorites` — Favorite trips
- `/citizen/bookings` — My bookings
- `/citizen/complaints` — Citizen complaints

## Auditor area
- `/auditor/dashboard` — Auditor dashboard ([frontend/src/pages/auditor/AuditorDashboard.jsx](frontend/src/pages/auditor/AuditorDashboard.jsx))
- `/auditor/profile` — Auditor profile ([frontend/src/pages/auditor/AuditorProfile.jsx](frontend/src/pages/auditor/AuditorProfile.jsx))
- `/auditor/available` — Available trips to audit ([frontend/src/pages/auditor/AvailableTrips.jsx](frontend/src/pages/auditor/AvailableTrips.jsx))
- `/auditor/active` — Active audit (assigned trip)
- `/auditor/history` — Audit history ([frontend/src/pages/auditor/AuditHistory.jsx](frontend/src/pages/auditor/AuditHistory.jsx))

## Shared / Utilities
- `/notifications` — Notifications (component: `NotificationBell`)
- `/settings` — App settings
- Navbar component: [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx)

## API / Service clients (frontend calls)
- Auth: `/auth/login`, `/auth/register`
- Trips: `/api/trip` (TripService)
- Audit: `/api/audit/available-trips`, `/api/audit/pick-trip`
- Users: `/api/users` (AuthService)

---
This sitemap is a quick reference — expand sections with more file links or route parameters as needed.
