# Notification System - Quick Reference Guide

## 1. TRIP STATUS NOTIFICATIONS

### File: `backend/TripService/TripService.Application/Services/TripManagementService.cs`

**Lines 368-415**: `NotifyAdminsAsync()` - Called when trip status changes to Started, Delayed, or Finished

```
Status Values Sent:
- Started
- Delayed (includes: DelayMinutes, DelayReason, AdminContact)
- Finished
- Cancelled (not notified)

Target: TargetRole = "Admin"
```

---

## 2. EMERGENCY NOTIFICATIONS

### File: `backend/TripService/TripService.Application/Services/EmergencyService.cs`

**Lines 49-75**: Emergency creation notification
- Notifies: Admins
- Title format: `"Emergency Reported: {Type}"`
- Includes: Priority, Reporter role/ID

**Lines 124-188**: Emergency status update notification
- Notifies: Driver (direct UserId) + Citizens (by TargetRole)
- Title format: `"Emergency Status Updated: {Type}"`
- Message includes new status value

---

## 3. PAYMENT NOTIFICATIONS

### File: `backend/PaymentService/PaymentService.Application/Features/Payments/Handlers/ConfirmPaymentCommandHandler.cs`

**Lines 54-62**: Publishes `PaymentSuccessfulEvent` containing:
- `Amount` (decimal)
- `Currency` (string, e.g., "AED", "USD")
- `UserId`

### File: `backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs`

**Lines 258-268**: Handles `PaymentSuccessfulEvent`
- Title: `"Payment Successful"`
- Message format: `"Your payment of {CURRENCY} {Amount:F2} has been successfully completed. Thank you."`

Example output: `"Your payment of AED 125.50 has been successfully completed. Thank you."`

---

## 4. DRIVER ASSIGNMENT NOTIFICATIONS

### File: `backend/TripService/TripService.Application/Services/TripManagementService.cs`

**Lines 164-190**: Driver assignment notification
- Direct HTTP POST to NotificationService
- Format: `"New Trip Assigned: {BusNumber}"`
- Message includes: Trip number, departure time

### File: `backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs`

**Lines 81-120**: Template-based driver notification
- Template key: `"DriverAssignment"`
- Token values: TripNumber, DepartureTime (HH:mm), VehicleInfo, RouteInfo
- Template Title: `"Driver assigned to Trip #{TripNumber}"`
- Template Body: `"You have been assigned to Trip #{TripNumber} departing at {DepartureTime}. Vehicle: {VehicleInfo}. Route: {RouteInfo}."`

---

## 5. TEMPLATE SYSTEM

### File: `backend/NotificationService/NotificationService.Infrastructure/Data/DbSeeder.cs`

**Lines 25-68**: Seeded notification templates:

| Key | Usage | Title Template | Body Template |
|-----|-------|---|---|
| `DriverAssignment` | Driver assigned to trip | `Driver assigned to Trip #{TripNumber}` | `You have been assigned to Trip #{TripNumber} departing at {DepartureTime}...` |
| `CitizenDepartureReminder` | Trip departure reminder for citizen | `Trip #{TripNumber} departs soon` | `Your trip from {StartLocation} to {Destination} departs at {DepartureTime}.` |
| `DriverDepartureReminder` | Trip departure reminder for driver | `Reminder: Trip #{TripNumber} departs soon` | `Trip #{TripNumber} departs at {DepartureTime}...` |
| `ComplaintResponse` | Complaint has new response | `Complaint response received` | `Your complaint '{ComplaintTitle}' has a response: {ResponseSummary}.` |
| `FavoriteRouteMatched` | New trip on favorite route | `New route available: {StartLocation} → {Destination}` | `A new trip matching your favorite route...` |

### File: `backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs`

**Lines 229-250**: Template rendering with token replacement
```csharp
ReplaceTemplateTokens(template, values)  // Case-insensitive replacement
```

---

## 6. DRIVER PROFILE & PREFERENCES

### File: `backend/TripService/TripService.Domain/Entities/DriverProfile.cs`

⚠️ **NO language/locale field**
- LicenseNumber, LicenseExpiryDate
- LicenseCategory, IssuingAuthority
- VehiclePlateNumber, VehicleModel, VehicleColor

### File: `backend/NotificationService/NotificationService.Domain/Entities/NotificationPreference.cs`

✓ Stored per user/role:
- `ReminderEnabled` (bool)
- `ReminderMinutesBeforeDeparture` (int)

⚠️ **NO language/locale field**

---

## 7. NOTIFICATION CHANNELS

### File: `backend/NotificationService/NotificationService.Api/Channels/`

**InAppNotificationChannel.cs**: Uses SignalR to broadcast to connected clients
- Sends notification DTO to user group
- Format: full NotificationDto with Id, UserId, Title, Message, Type, etc.

**FcmNotificationSender.cs**: Firebase Cloud Messaging
- For push notifications to mobile devices

**ExpoNotificationSender.cs**: Expo push notifications
- Alternative push service for mobile apps

### Implementation Flow:
```
CreateNotificationAsync()
  └─> For each INotificationChannel:
      └─> channel.SendAsync(notification)
```

---

## 8. DIRECT HTTP CALLS (Bypassing Events)

### Trip Status Updates
```
POST {notificationServiceUrl}/api/notification
{
    "UserId": "00000000-0000-0000-0000-000000000000",  // Empty for role-based
    "TargetRole": "Admin",
    "Title": "Trip Update: BUS123",
    "Message": "Trip BUS123 status changed to Delayed. Delay: 30 min. Reason: Traffic.",
    "Type": 1  // NotificationType.TripUpdate
}
```

### Emergency Notifications
```
POST {notificationServiceUrl}/api/notification
{
    "UserId": "00000000-0000-0000-0000-000000000000",  // Empty for role-based
    "TargetRole": "Admin",
    "Title": "Emergency Reported: Medical",
    "Message": "Trip BUS123 - Medical - Priority: High. Reporter: Citizen {id}.",
    "Type": "AdminAnnouncement"
}
```

---

## 9. NOTIFICATION ENTITY STRUCTURE

### File: `backend/NotificationService/NotificationService.Domain/Entities/Notification.cs`

```
✓ Id (Guid)
✓ UserId (Guid)           - Specific user, or Empty for role-based
✓ TargetRole (string?)    - "Admin", "Driver", "Citizen", or null
✓ Title (string)          - Formatted/rendered title
✓ Message (string)        - Formatted/rendered message
✓ Type (NotificationType) - TripUpdate, PaymentUpdate, ComplaintUpdate, BookingUpdate
✓ IsRead (bool)
✓ CreatedAt (DateTime)
```

---

## 10. KEY DISCOVERY POINTS

### Where status values come from:
- Trip statuses: Trip object properties (Status, DelayMinutes, DelayReason, AdminContact)
- Emergency statuses: EmergencyReport Status property
- Payment status: Payment.Status (Succeeded, Failed, etc.)

### Where amounts are formatted:
- PaymentService keeps Amount as `decimal` with `HasPrecision(18, 2)`
- Format in notification: `{currency.ToUpperInvariant()} {amount:F2}`

### Where language/locale handling happens:
- **Currently**: Not implemented; templates are hardcoded in English
- **Token system**: Allows different content, but not different languages
- **Future**: Need to add language field to NotificationPreference

### Where messages are created:
1. **Direct**: TripService, EmergencyService - compose message strings locally
2. **Event-driven**: PaymentService publishes event → NotificationIntegrationEventHandler handles it
3. **Template-based**: Through NotificationIntegrationEventHandler with token replacement

---

## 11. NOTIFICATION FLOW DIAGRAM

### Direct HTTP Flow (Trip/Emergency):
```
TripService/EmergencyService
  ↓
Create HTTP client & build payload
  ↓
POST to NotificationService/api/notification
  ↓
NotificationManagementService.CreateNotificationAsync()
  ↓
Save to NotificationRepository
  ↓
Send through all channels (InApp, FCM, Expo)
  ↓
Publish NotificationCreatedEvent
```

### Event-Driven Flow (Payment):
```
PaymentService
  ↓
ConfirmPaymentCommandHandler
  ↓
Publish PaymentSuccessfulEvent (via RabbitMQ)
  ↓
NotificationService (Consumer)
  ↓
NotificationIntegrationEventHandler.HandleAsync()
  ↓
HandlePaymentSuccessfulAsync()
  ↓
CreateNotificationAsync() with formatted amount
  ↓
Save & Send through channels
```

### Template-Based Flow (Driver Assignment):
```
TripService publishes DriverAssignedEvent
  ↓
NotificationIntegrationEventHandler
  ↓
HandleDriverAssignedAsync()
  ↓
Prepare token values: {TripNumber, DepartureTime, VehicleInfo, RouteInfo}
  ↓
RenderTemplateAsync("DriverAssignment", values)
  ↓
Get template from database
  ↓
ReplaceTemplateTokens() → Replace {Token} with values
  ↓
CreateNotificationAsync() with rendered title & body
  ↓
Save & Send through channels
```
