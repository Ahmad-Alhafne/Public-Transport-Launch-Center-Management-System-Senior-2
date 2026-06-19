# BookingService QR Specification

Overview:
- When a booking is created a signed QR token is generated and stored on the booking record as `QrToken`.
- The token payload encodes: `BookingId|PassengerId|TripId|BookedAt` (ISO-8601 UTC).
- The token format is: `{base64url(payload)}.{base64url(hmac256(payload, secret))}`

Generation:
- Secret: `QrOptions:Secret` in service configuration. If not present, service falls back to `JwtOptions:SecretKey`.
- The BookingService generates the token after the booking row is saved (so `Booking.Id` is available), stores `QrToken` and `QrGeneratedAt`.

Validation (performed by AuditService):
- AuditService should:
  1. Split token on `.` into payload and signature.
  2. Base64url-decode payload and signature.
  3. Recompute HMAC-SHA256(payload, secret) using the same secret (shared or obtained via secure channel).
  4. Compare signatures using constant-time comparison.
  5. Parse payload into BookingId, PassengerId, TripId, BookedAt and verify consistency with BookingService (via API) and that booking is still valid and belongs to the trip.
  6. Enforce timestamp rules: token must be generated before trip departure and scans must be within allowed time window to avoid replay.

Usage in UI:
- The frontend displays the token as a QR image (the token string encoded into the QR). The QR content is the token string; scanners send that string to AuditService for validation.

Security notes:
- Use a strong secret in production and rotate periodically.
- Consider using asymmetric signatures (RSA/ECDSA) if AuditService should validate without sharing a symmetric secret.
- Store and transmit tokens only over TLS.
