# System API Documentation

This document lists the current REST APIs across services in the workspace. Each service section includes endpoints, HTTP methods, referenced DTOs, and links to controller source files.

> Note: Most backend projects enable runtime Swagger/OpenAPI generation (see each project's `Program.cs`). No static OpenAPI YAML/JSON files were found.

---

## AuthService
- Controllers:
  - [backend/AuthService/AuthService.Api/Controllers/AuthController.cs](backend/AuthService/AuthService.Api/Controllers/AuthController.cs)
  - [backend/AuthService/AuthService.Api/Controllers/UsersController.cs](backend/AuthService/AuthService.Api/Controllers/UsersController.cs)
- Key endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/users`
  - `GET /api/users/{id:guid}`
  - `GET /api/users/drivers` / `POST /api/users/drivers` / `PUT /api/users/drivers/{id:guid}` / `DELETE /api/users/drivers/{id:guid}`
  - `GET /api/users/auditors` / `POST /api/users/auditors` / `PUT /api/users/auditors/{id:guid}` / `DELETE /api/users/auditors/{id:guid}`
  - `POST /api/users/by-ids`
  - `GET /api/users/me` / `PUT /api/users/me`
  - `PATCH /api/users/{id:guid}/phone` / `PATCH /api/users/{id:guid}/password`
  - `GET /api/users/admin-contact`
- Common DTOs: `RegisterDto`, `LoginDto`, `CreateDriverDto`, `UpdateDriverDto`, `CreateAuditorDto`, `UpdateUserDto`, `GetUsersByIdsDto`, `AdminProfileDto`, `UpdatePhoneDto`, `UpdatePasswordDto`.

---

## BookingService
- Controller:
  - [backend/BookingService/BookingService.Api/Controllers/BookingController.cs](backend/BookingService/BookingService.Api/Controllers/BookingController.cs)
- Key endpoints:
  - `GET /api/booking`
  - `GET /api/booking/{id:guid}`
  - `GET /api/booking/my` / `GET /api/booking/my/active` / `GET /api/booking/my/history`
  - `GET /api/booking/trip/{tripId:guid}`
  - `POST /api/booking`
  - `POST /api/booking/cancel`
- Common DTOs: `CreateBookingDto`, `CancelBookingDto`.

---

## ComplaintService
- Controller:
  - [backend/ComplaintService/ComplaintService.Api/Controllers/ComplaintController.cs](backend/ComplaintService/ComplaintService.Api/Controllers/ComplaintController.cs)
- Key endpoints:
  - `GET /api/complaint`
  - `GET /api/complaint/{id:guid}`
  - `GET /api/complaint/my`
  - `POST /api/complaint`
  - `PATCH /api/complaint/{id:guid}/status`
  - `PATCH /api/complaint/{id:guid}/respond`
- Common DTOs: `CreateComplaintDto`, `UpdateComplaintStatusDto`, `RespondToComplaintDto`.

---

## TripService
- Controllers:
  - [backend/TripService/TripService.Api/Controllers/TripController.cs](backend/TripService/TripService.Api/Controllers/TripController.cs)
  - [backend/TripService/TripService.Api/Controllers/DriverProfileController.cs](backend/TripService/TripService.Api/Controllers/DriverProfileController.cs)
  - [backend/TripService/TripService.Api/Controllers/DriverChangeRequestController.cs](backend/TripService/TripService.Api/Controllers/DriverChangeRequestController.cs)
- Key endpoints (selected):
  - `GET /api/trip` / `GET /api/trip/{id:guid}` / `GET /api/trip/active` / `GET /api/trip/history`
  - `GET /api/trip/driver/{driverId:guid}` / `GET /api/trip/route/{routeId:guid}`
  - `POST /api/trip` / `PUT /api/trip/{id:guid}` / `PATCH /api/trip/{id:guid}/status` / `DELETE /api/trip/{id:guid}`
  - `POST /api/trip/{id:guid}/decrement-seat` / `POST /api/trip/{id:guid}/increment-seat`
  - Driver profile endpoints: `GET /api/driver/profile/{driverId:guid}`, `GET /api/driver/profile/me`, `POST /api/driver/profile`, `PUT /api/driver/profile/{driverId:guid}`, `DELETE /api/driver/profile/{driverId:guid}`
  - Driver change requests: `POST /api/driver/change-requests`, `GET /api/driver/change-requests/my`, `GET /api/driver/change-requests/{requestId:guid}`, `PATCH /api/driver/change-requests/{requestId:guid}/status`
- Common DTOs: `CreateTripDto`, `UpdateTripDto`, `UpdateTripStatusDto`, `SeatAdjustmentDto`, `CreateDriverProfileDto`, `UpdateDriverProfileDto`, `CreateDriverChangeRequestDto`, `UpdateDriverChangeRequestStatusDto`.

---

## RouteService
- Controller:
  - [backend/RouteService/RouteService.Api/Controllers/RouteController.cs](backend/RouteService/RouteService.Api/Controllers/RouteController.cs)
- Key endpoints:
  - `GET /api/route`
  - `GET /api/route/{id:guid}`
  - `POST /api/route`
  - `PUT /api/route/{id:guid}`
  - `DELETE /api/route/{id:guid}`
- Common DTOs: `CreateRouteDto`, `UpdateRouteDto`.

---

## VehicleService
- Controller:
  - [backend/VehicleService/VehicleService.Api/Controllers/VehicleController.cs](backend/VehicleService/VehicleService.Api/Controllers/VehicleController.cs)
- Key endpoints:
  - `GET /api/vehicle`
  - `GET /api/vehicle/{id:guid}`
  - `POST /api/vehicle`
  - `PUT /api/vehicle/{id:guid}`
  - `DELETE /api/vehicle/{id:guid}`
- Common DTOs: `CreateVehicleDto`, `UpdateVehicleDto`.

---

## NotificationService
- Controllers:
  - [backend/NotificationService/NotificationService.Api/Controllers/NotificationController.cs](backend/NotificationService/NotificationService.Api/Controllers/NotificationController.cs)
  - [backend/NotificationService/NotificationService.Api/Controllers/NotificationPreferencesController.cs](backend/NotificationService/NotificationService.Api/Controllers/NotificationPreferencesController.cs)
  - [backend/NotificationService/NotificationService.Api/Controllers/RemindersController.cs](backend/NotificationService/NotificationService.Api/Controllers/RemindersController.cs)
- Key endpoints:
  - `GET /api/notification/my` / `GET /api/notification/{id:guid}`
  - `PATCH /api/notification/{id:guid}/read`
  - `GET /api/notification/unread-count`
  - `PATCH /api/notification/read-all`
  - `DELETE /api/notification/{id:guid}`
  - `POST /api/notification`
  - Preferences: `GET /api/notification/preferences`, `PUT /api/notification/preferences`
  - Reminders: `GET /api/notification/reminders/{tripId:guid}`, `POST /api/notification/reminders`, `DELETE /api/notification/reminders/{tripId:guid}`
- Common DTOs: `CreateNotificationDto`, `UnreadCountDto`, `UpdateNotificationPreferenceDto`, `CreateScheduledReminderDto`.

---

## AuditService
- Controller:
  - [backend/AuditService/AuditService.Api/Controllers/AuditController.cs](backend/AuditService/AuditService.Api/Controllers/AuditController.cs)
- Key endpoints:
  - `GET /api/audit/available-trips`
  - `POST /api/audit/pick-trip`
  - `POST /api/audit/scan`
  - `POST /api/audit/validate`
- Common DTOs: `AuditRecordDto`, `ValidateQrRequest`, `ValidateQrResponse`.

---

## ApiGateway
- Controller(s):
  - [backend/ApiGateway/ApiGateway/Controllers/AdminTripDetailsController.cs](backend/ApiGateway/ApiGateway/Controllers/AdminTripDetailsController.cs)
- Key endpoint:
  - `GET /api/admin/trips/{id:guid}/details` — composes data from TripService, RouteService, BookingService, and AuthService.
- DTOs: `ApiGateway.DTOs.TripDetailsDto`, `ApiGateway.DTOs.PassengerDto`, `ApiGateway.DTOs.SeatUsageSummaryDto`.

---

## Frontend
- API client mappings:
  - [frontend/src/services/api.js](frontend/src/services/api.js)
  - The client uses `API_BASE` from `frontend/src/config` and maps to backend paths such as `/auth`, `/route`, `/trip`, `/vehicle`, `/users`, `/booking`, `/complaint`, `/notification`, `/driver/profile`, `/driver/change-requests`, `/admin/trips`, `/audit`.

---

## Next steps & notes
- If you want a more detailed API doc (OpenAPI-style) I can:
  - Extract DTO property definitions and include request/response schemas.
  - Generate per-service OpenAPI YAML/JSON from code or produce example requests/responses.
- Tell me whether you prefer a single combined spec or separate per-service specs.

---

Generated on: 2026-06-10
