# NOTIFICATION SYSTEM - TL;DR VERSION

**Created**: July 10, 2026  
**Scope**: TripService, EmergencyService, PaymentService, NotificationService  
**Language**: C# (.NET)

---

## THE 30-SECOND SUMMARY

### Where Notifications Are Created:

1. **Trip Status Changes** (TripService)
   - File: `TripManagementService.cs` 
   - How: Direct HTTP POST to NotificationService
   - Status values: Started, Delayed, Finished
   - Targets: Admins

2. **Emergency Updates** (TripService)  
   - File: `EmergencyService.cs`
   - How: Direct HTTP POST to NotificationService
   - 2 notifications sent: One for driver, one for citizens
   - Includes: Emergency type and priority

3. **Payments** (PaymentService)
   - File: `ConfirmPaymentCommandHandler.cs`
   - How: Publishes event → NotificationService consumes
   - Amount & Currency sent: `{currency.ToUpperInvariant()} {amount:F2}`
   - Targets: Specific user (Citizen)

4. **Driver Assignments** (NotificationService)
   - File: `NotificationIntegrationEventHandler.cs`
   - How: Receives DriverAssignedEvent → Uses template
   - Template: "Driver assigned to Trip #{TripNumber}"
   - Includes: TripNumber, DepartureTime, VehicleInfo, RouteInfo

---

## THE 2-MINUTE DEEP DIVE

### Notification Entity Structure
```csharp
public class Notification
{
    public Guid UserId { get; set; }              // Empty = role-based
    public string? TargetRole { get; set; }       // "Admin", "Driver", "Citizen"
    public string Title { get; set; }             // Already formatted
    public string Message { get; set; }           // Already formatted
    public NotificationType Type { get; set; }    // TripUpdate, PaymentUpdate, etc.
}
```

### How Title & Message Are Formatted:

**Method 1 - Direct String Construction** (TripService, EmergencyService):
```csharp
var title = $"Trip Update: {trip.BusNumber}";
var message = $"Trip {trip.BusNumber} status changed to {newStatus}...";
```

**Method 2 - Template with Token Replacement** (PaymentService via NotificationService):
```csharp
// Template: "Driver assigned to Trip #{TripNumber}"
// Tokens: {"TripNumber": "T123", "DepartureTime": "14:30", ...}
// Result: "Driver assigned to Trip #T123"
```

**Method 3 - Simple Formatting** (Payment notifications):
```csharp
Message = $"Your payment of {currency.ToUpperInvariant()} {amount:F2}..."
// Result: "Your payment of AED 125.50 has been successfully completed."
```

### How Status Values Flow to Notifications:

```
Trip Status Changed
    ↓
trip.Status == TripStatus.Delayed  (enum)
    ↓
newStatus.ToString() = "Delayed"  (converts to string)
    ↓
Included in message: "status changed to Delayed"
```

### How Payment Amounts Appear:

```
Payment.Amount = 125.50m  (decimal, 2 places)
Payment.Currency = "AED"  (string code)
    ↓
Formatted: Amount:F2 = "125.50"
           Currency.ToUpperInvariant() = "AED"
    ↓
Final: "Your payment of AED 125.50 has been successfully completed."
```

### How Driver Preferences Are Used:

```
Driver has NotificationPreference record:
  - ReminderEnabled = true
  - ReminderMinutesBeforeDeparture = 30
    ↓
When trip assigned, reminder scheduled:
  - ReminderTime = DepartureTime - 30 minutes
    ↓
Reminder sent at scheduled time via ScheduledReminder table
```

---

## LANGUAGE & LOCALE HANDLING

**Current State**: 
- ❌ NO language preference stored anywhere
- ❌ NO multi-language templates
- ✅ Template system COULD support it with changes

**How Templates Work Now**:
- 5 English-only templates in database
- Token replacement with values
- All messages composed in English

---

## THE 5-MINUTE CODE WALKTHROUGH

### Trip Status Notification (Lines to Find):
```
File: backend/TripService/TripService.Application/Services/TripManagementService.cs
Method: NotifyAdminsAsync()  [Lines 368-415]
What happens:
  1. Check status changed to Started/Delayed/Finished
  2. Build message string with trip details
  3. If Delayed, add delay, reason, admin contact to message
  4. POST /api/notification with:
     - UserId = Guid.Empty
     - TargetRole = "Admin"
     - Title = "Trip Update: {BusNumber}"
     - Message = "Trip {BusNumber} status changed to {Status}..."
     - Type = 1
  5. Error? Swallow it (don't block transaction)
```

### Payment Notification (Lines to Find):
```
File1: backend/PaymentService/PaymentService.Application/Features/Payments/Handlers/ConfirmPaymentCommandHandler.cs
Method: Handle()  [Lines 54-62]
What happens:
  1. Confirm payment via Stripe
  2. If Status == Succeeded, publish PaymentSuccessfulEvent with:
     - UserId
     - Amount (decimal)
     - Currency (string)

File2: backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs
Method: HandlePaymentSuccessfulAsync()  [Lines 258-268]
What happens:
  1. Create notification with:
     - UserId = event.UserId
     - TargetRole = "Citizen"
     - Title = "Payment Successful"
     - Message = $"Your payment of {currency.ToUpperInvariant()} {amount:F2}..."
     - Type = NotificationType.PaymentUpdate
  2. Save to database
  3. Send through all channels (InApp, FCM, Expo)
```

### Driver Assignment Notification (Lines to Find):
```
File: backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs
Method: HandleDriverAssignedAsync()  [Lines 81-120]
What happens:
  1. Receive DriverAssignedEvent
  2. Create token dictionary:
     {
       "TripNumber": event.TripNumber,
       "DepartureTime": event.DepartureTimeUtc.ToString("HH:mm"),
       "VehicleInfo": event.VehicleInfo,
       "RouteInfo": event.RouteInfo
     }
  3. Get template from database: "DriverAssignment"
  4. Replace tokens:
     "Driver assigned to Trip #{TripNumber}"
     → "Driver assigned to Trip #T123"
  5. Create notification with rendered content
  6. Schedule reminder based on driver's ReminderMinutesBeforeDeparture
```

---

## FILE LOCATIONS (Quick Reference)

| What | File |
|------|------|
| Trip status messages | `backend/TripService/.../TripManagementService.cs` |
| Emergency messages | `backend/TripService/.../EmergencyService.cs` |
| Payment events | `backend/PaymentService/.../ConfirmPaymentCommandHandler.cs` |
| All template rendering | `backend/NotificationService/.../NotificationIntegrationEventHandler.cs` |
| Templates stored in DB | `backend/NotificationService/.../DbSeeder.cs` |
| Driver profile | `backend/TripService/.../DriverProfile.cs` |
| User preferences | `backend/NotificationService/.../NotificationPreference.cs` |
| Notification entity | `backend/NotificationService/.../Notification.cs` |
| InApp channel | `backend/NotificationService/.../InAppNotificationChannel.cs` |

---

## KEY VALUES TO SEARCH FOR

**Trip Status Enum Values**:
```
Scheduled, Started, Delayed, Finished, Cancelled
(Only Start, Delayed, Finished trigger notifications)
```

**Emergency Type Examples**:
```
Medical, Mechanical, Accident, Security, etc.
(Stored as string in message)
```

**Emergency Priority Examples**:
```
Low, Medium, High, Critical
(Included in admin notification message)
```

**Emergency Status Examples**:
```
Reported, InProgress, Resolved, Escalated
(Sent to driver and citizens separately)
```

**Notification Types**:
```
TripUpdate (value: 1)
PaymentUpdate
ComplaintUpdate
BookingUpdate
```

**Template Keys** (5 total):
```
1. DriverAssignment
2. CitizenDepartureReminder
3. DriverDepartureReminder
4. ComplaintResponse
5. FavoriteRouteMatched
```

**Notification Targets**:
```
UserId = specific Guid  →  Notification for that one person
UserId = Guid.Empty + TargetRole  →  Notification for all users with that role
```

---

## WHAT'S MISSING FOR PRODUCTION

1. **Language Support**
   - Need: PreferredLanguage field in NotificationPreference
   - Need: Language-specific templates
   - Work: ~2-3 days

2. **Localized Date/Time Formatting**
   - Currently: Always HH:mm (24-hour)
   - Need: Locale-aware formatting
   - Work: ~1 day

3. **Email Notifications**
   - Currently: Only InApp (SignalR), FCM, Expo
   - Missing: Email channel
   - Work: ~2-3 days

4. **SMS Notifications**
   - Currently: Not implemented
   - Missing: SMS channel
   - Work: ~2-3 days

5. **Notification Images/Icons**
   - Currently: Just Title + Message
   - Missing: Support for icon/image URLs
   - Work: ~1-2 days

6. **Rich HTML Messages**
   - Currently: Plain text only
   - Missing: HTML formatting support
   - Work: ~1-2 days

---

## DEBUGGING CHECKLIST

- [ ] Is NotificationService running?
- [ ] Check URL configuration in each service
- [ ] Are database migrations applied?
- [ ] Check DbSeeder ran (5 templates should exist)
- [ ] For direct calls: Check HTTP error handling (may be swallowed)
- [ ] For payment: Check Payment.Status == Succeeded before event published
- [ ] For templates: Verify all token placeholders have values
- [ ] For reminders: Check NotificationPreference.ReminderEnabled = true
- [ ] For drivers: Check DriverProfile exists (though it has no language field)
- [ ] Look in logs: Errors are often silently caught

---

## FASTEST WAY TO ADD A NEW NOTIFICATION

### Option A: Direct HTTP Call (Fast, Simple)
1. Go to `TripManagementService.cs` or `EmergencyService.cs`
2. Build string: `var title = "..."; var message = "...";`
3. POST to NotificationService with payload
4. Done! Takes 10 minutes

### Option B: Event-Based (Robust, Scalable)
1. Create integration event class
2. Publish from source service  
3. Add handler in NotificationIntegrationEventHandler
4. Create or use existing template
5. Done! Takes 30-45 minutes

### Option C: Template-Based (Configurable, i18n-ready)
1. Add row to NotificationTemplates table
2. Add handler method in NotificationIntegrationEventHandler
3. Call RenderTemplateAsync with token values
4. Done! Takes 45-60 minutes (includes migration)

---

## SUMMARY TABLE

| Aspect | Implementation | Where |
|--------|---|---|
| Trip status messages | Direct HTTP calls with string formatting | TripManagementService |
| Emergency messages | Direct HTTP calls with string formatting | EmergencyService |
| Payment messages | Event → Handler → Template rendering | PaymentService + NotificationService |
| Driver assignments | Event → Handler → Template rendering | TripService + NotificationService |
| Status storage | Enum.ToString() → string in message | Various services |
| Amount storage | Decimal with 2 places | PaymentService |
| Amount formatting | `{amount:F2}` with uppercase currency | NotificationIntegrationEventHandler |
| Language support | ❌ Not implemented | - |
| Locale support | ❌ Not implemented | - |
| Message persistence | Database (Notifications table) | NotificationService |
| Delivery channels | InApp (SignalR), FCM, Expo | NotificationService |
| Preferences | Reminder enable/disable + minutes | NotificationPreference table |
| Templates | 5 hardcoded English templates | DbSeeder.cs |

---

## MOST IMPORTANT FILES TO KNOW

**Must Read:**
1. `TripManagementService.cs` - Trip status notifications
2. `EmergencyService.cs` - Emergency notifications  
3. `ConfirmPaymentCommandHandler.cs` - Payment event creation
4. `NotificationIntegrationEventHandler.cs` - Event → Message mapping

**Should Know:**
5. `Notification.cs` - Entity structure
6. `DbSeeder.cs` - Template definitions
7. `InAppNotificationChannel.cs` - How it's delivered

**Reference:**
8. `NotificationTemplate.cs` - Template entity
9. `NotificationPreference.cs` - User preferences

---

**For detailed info**: See NOTIFICATION_SYSTEM_ANALYSIS.md  
**For quick lookups**: See NOTIFICATION_QUICK_REFERENCE.md  
**For exact code**: See NOTIFICATION_CODE_SNIPPETS.md  
**For navigation**: See NOTIFICATION_INDEX.md
