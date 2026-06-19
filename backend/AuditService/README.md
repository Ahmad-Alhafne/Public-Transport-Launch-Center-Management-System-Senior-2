# AuditService

This service provides QR-based trip auditing and boarding verification. Scaffolded with Clean Architecture layers:

- AuditService.Domain
- AuditService.Application
- AuditService.Infrastructure
- AuditService.Api

Next steps:
- Update `AuthService` to add `Auditor` role and include role in JWT claims.
- Add QR generation in `BookingService` when bookings are created.
- Wire up Ocelot configuration to expose `AuditService.Api` endpoints.
