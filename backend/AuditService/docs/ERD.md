# AuditService ERD

Entities (core):

- AuditRecord
  - Id (PK, uniqueidentifier)
  - TripId (uniqueidentifier) — references TripService Trip.Id (no FK)
  - BookingId (uniqueidentifier) — references BookingService Booking.Id (no FK)
  - CitizenId (uniqueidentifier) — references AuthService User.Id (no FK)
  - AuditorId (uniqueidentifier) — references AuthService User.Id (no FK)
  - ScanTime (datetimeoffset)
  - Result (int) — enum AuditResult { Approved, Rejected, Duplicate, WrongTrip, InvalidQRCode }
  - Notes (nvarchar(max), nullable)

- TripAudit
  - Id (PK, uniqueidentifier)
  - TripId (uniqueidentifier) — TripService Trip.Id (no FK)
  - AuditorId (uniqueidentifier) — AuthService User.Id
  - AssignedAt (datetimeoffset)
  - Status (int) — enum AuditStatus { Available, Assigned, InProgress, Completed, Cancelled }
  - CompletedAt (datetimeoffset, nullable)

Relationships & constraints (logical):
- One TripAudit represents one auditing session for a Trip. Multiple historical TripAudits are allowed, but only one active (Assigned/InProgress) per Trip at a time.
- AuditRecord links a scanned Booking -> Trip for auditing. Multiple AuditRecords may exist for the same Trip, but a Booking should have at most one `Approved` AuditRecord per Trip.

Notes: AuditService stores only IDs for external entities (Trips, Bookings, Users). Cross-service consistency is enforced via APIs and optimistic checks or transactions.
