# Notification System - Code Snippets Reference

## Search for These Specific Code Sections

### 1. TRIP STATUS CHANGE NOTIFICATION

**File**: `backend/TripService/TripService.Application/Services/TripManagementService.cs`

**Method**: `NotifyAdminsAsync()`

**Context**: Called from `UpdateTripStatusAsync()` after trip status is updated

**What to Find**:
```csharp
// Pattern: Building notification message for different statuses
if (newStatus == TripStatus.Delayed)
{
    message += $" Delay: {trip.DelayMinutes ?? 0} min.";
    if (!string.IsNullOrWhiteSpace(trip.DelayReason))
        message += $" Reason: {trip.DelayReason}.";
    if (!string.IsNullOrWhiteSpace(trip.AdminContact))
        message += $" Admin contact: {trip.AdminContact}.";
}
```

**Status Values Used**: Started, Delayed, Finished (Cancelled is filtered out)

---

### 2. DRIVER ASSIGNMENT NOTIFICATION

**File**: `backend/TripService/TripService.Application/Services/TripManagementService.cs`

**Context**: Called from `CreateTripAsync()` after trip is created and driver assigned

**What to Find**:
```csharp
// Pattern: Creating notification via direct HTTP call
var title = $"New Trip Assigned: {trip.BusNumber}";
var message = $"You have been assigned to trip {trip.BusNumber} ({trip.Id}). Departure: {trip.DepartureTime:u}.";

var payload = new
{
    UserId = trip.DriverId,
    Title = title,
    Message = message,
    Type = 1  // NotificationType.TripUpdate
};

await httpClient.PostAsJsonAsync("api/notification", payload);
```

**Key Details**:
- BusNumber used in title
- DepartureTime formatted as universal time (`:u` format)
- Type = 1 maps to `NotificationType.TripUpdate`

---

### 3. EMERGENCY REPORT NOTIFICATION

**File**: `backend/TripService/TripService.Application/Services/EmergencyService.cs`

**Method**: `CreateEmergencyAsync()`

**What to Find**:
```csharp
var title = $"Emergency Reported: {report.Type}";
var message = $"Trip {trip.BusNumber} ({trip.Id}) - {report.Type} - Priority: {report.Priority}. Reporter: {reporterRole} {reporterId}.";

var payload = new { 
    UserId = Guid.Empty, 
    TargetRole = "Admin", 
    Title = title, 
    Message = message, 
    Type = "AdminAnnouncement" 
};

await http.PostAsJsonAsync("api/notification", payload);
```

**Key Details**:
- EmergencyType enum value used in title
- Priority enum value included in message
- Targets "Admin" role
- UserId is Empty (means it's role-based, not user-specific)

---

### 4. EMERGENCY STATUS UPDATE NOTIFICATION

**File**: `backend/TripService/TripService.Application/Services/EmergencyService.cs`

**Method**: `UpdateStatusAsync()` - sends TWO notifications

**For Driver**:
```csharp
var title = $"Emergency Status Updated: {r.Type}";
var message = $"Trip {trip.BusNumber} ({trip.Id}) emergency status changed to {r.Status}.";

var payloadDriver = new { 
    UserId = trip.DriverId,  // Direct user ID
    TargetRole = (string?)null, 
    Title = title, 
    Message = message, 
    Type = "TripUpdate" 
};
```

**For Citizens**:
```csharp
var title2 = $"Emergency Update: {r.Type}";
var message2 = $"Trip {trip.BusNumber} ({trip.Id}) emergency status is now {r.Status}.";

var payloadCitizens = new { 
    UserId = Guid.Empty,  // Empty for role-based
    TargetRole = "Citizen", 
    Title = title2, 
    Message = message2, 
    Type = "AdminAnnouncement" 
};
```

**Status Value**: Comes from `EmergencyStatus` enum (e.g., "Resolved", "Escalated", etc.)

---

### 5. PAYMENT SUCCESS EVENT PUBLISHING

**File**: `backend/PaymentService/PaymentService.Application/Features/Payments/Handlers/ConfirmPaymentCommandHandler.cs`

**Method**: `Handle()` - where event is published

**What to Find**:
```csharp
if (payment.Status == PaymentStatus.Succeeded)
{
    await _eventPublisher.PublishAsync(new PaymentSuccessfulEvent
    {
        PaymentId = payment.Id,
        BookingId = payment.BookingId,
        UserId = payment.UserId,
        Amount = payment.Amount,              // decimal type
        Currency = payment.Currency,          // string like "AED", "USD"
        PaymentIntentId = payment.PaymentIntentId
    });
}
```

**Key Details**:
- Amount is decimal type with 2 decimal places
- Currency is stored as string (currency code)
- Event published only when Status == Succeeded
- UserId is included for notification targeting

---

### 6. PAYMENT NOTIFICATION CREATION

**File**: `backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs`

**Method**: `HandlePaymentSuccessfulAsync()`

**What to Find**:
```csharp
await _notificationService.CreateNotificationAsync(new CreateNotificationDto
{
    UserId = eventPayload.UserId,
    TargetRole = "Citizen",
    Title = "Payment Successful",
    Message = $"Your payment of {eventPayload.Currency.ToUpperInvariant()} {eventPayload.Amount:F2} has been successfully completed. Thank you.",
    Type = NotificationType.PaymentUpdate
});
```

**Message Format Pattern**: 
- `{Currency uppercase} {Amount with 2 decimals}`
- Example: "AED 125.50" or "USD 99.99"

**Amount Formatting**: `{amount:F2}` ensures exactly 2 decimal places

---

### 7. TEMPLATE-BASED NOTIFICATION (Driver Assignment)

**File**: `backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs`

**Method**: `HandleDriverAssignedAsync()`

**What to Find**:
```csharp
var values = new Dictionary<string, string>
{
    ["TripNumber"] = eventPayload.TripNumber,
    ["DepartureTime"] = eventPayload.DepartureTimeUtc.ToString("HH:mm"),  // 24-hour format
    ["VehicleInfo"] = eventPayload.VehicleInfo,
    ["RouteInfo"] = eventPayload.RouteInfo
};

var (title, body) = await RenderTemplateAsync("DriverAssignment", values);

await _notificationService.CreateNotificationAsync(new CreateNotificationDto
{
    UserId = eventPayload.DriverId,
    TargetRole = "Driver",
    Title = title,
    Message = body,
    Type = NotificationType.TripUpdate
});
```

**Template Key**: `"DriverAssignment"`

**Rendered Output Example**:
- Title: `"Driver assigned to Trip #T123"`
- Message: `"You have been assigned to Trip #T123 departing at 14:30. Vehicle: Toyota Hiace, White. Route: Dubai → Abu Dhabi."`

---

### 8. TEMPLATE TOKEN REPLACEMENT

**File**: `backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs`

**Method**: `ReplaceTemplateTokens()`

**What to Find**:
```csharp
private static string ReplaceTemplateTokens(string template, IDictionary<string, string> values)
{
    var result = template;
    foreach (var pair in values)
    {
        // Case-insensitive replacement of {TokenName} with value
        result = result.Replace($"{{{pair.Key}}}", pair.Value, StringComparison.OrdinalIgnoreCase);
    }
    return result;
}
```

**How It Works**:
1. Template containing `{TokenName}` placeholders
2. Dictionary with token keys and values
3. Each `{TokenName}` replaced with corresponding value
4. Case-insensitive (so `{tripnumber}`, `{TripNumber}`, `{TRIPNUMBER}` all work)

---

### 9. NOTIFICATION TEMPLATE SEEDING

**File**: `backend/NotificationService/NotificationService.Infrastructure/Data/DbSeeder.cs`

**Method**: `EnsureDefaultTemplatesAsync()`

**What to Find** - All 5 templates:

#### Template 1: Driver Assignment
```csharp
new NotificationTemplate
{
    Key = "DriverAssignment",
    Type = NotificationType.TripUpdate,
    TitleTemplate = "Driver assigned to Trip #{TripNumber}",
    BodyTemplate = "You have been assigned to Trip #{TripNumber} departing at {DepartureTime}. Vehicle: {VehicleInfo}. Route: {RouteInfo}.",
}
```

#### Template 2: Citizen Departure Reminder
```csharp
new NotificationTemplate
{
    Key = "CitizenDepartureReminder",
    Type = NotificationType.TripUpdate,
    TitleTemplate = "Trip #{TripNumber} departs soon",
    BodyTemplate = "Your trip from {StartLocation} to {Destination} departs at {DepartureTime}.",
}
```

#### Template 3: Driver Departure Reminder
```csharp
new NotificationTemplate
{
    Key = "DriverDepartureReminder",
    Type = NotificationType.TripUpdate,
    TitleTemplate = "Reminder: Trip #{TripNumber} departs soon",
    BodyTemplate = "Trip #{TripNumber} departs at {DepartureTime}. Vehicle: {VehicleInfo}. Route: {RouteInfo}",
}
```

#### Template 4: Complaint Response
```csharp
new NotificationTemplate
{
    Key = "ComplaintResponse",
    Type = NotificationType.ComplaintUpdate,
    TitleTemplate = "Complaint response received",
    BodyTemplate = "Your complaint '{ComplaintTitle}' has a response: {ResponseSummary}.",
}
```

#### Template 5: Favorite Route Matched
```csharp
new NotificationTemplate
{
    Key = "FavoriteRouteMatched",
    Type = NotificationType.BookingUpdate,
    TitleTemplate = "New route available: {StartLocation} → {Destination}",
    BodyTemplate = "A new trip matching your favorite route {StartLocation} → {Destination} at {DepartureTime} is now available.",
}
```

---

### 10. NOTIFICATION PREFERENCE HANDLING

**File**: `backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs`

**Context**: Called after rendering template

**What to Find**:
```csharp
// Get user's reminder preferences
var preference = await _preferenceService.GetPreferencesAsync(eventPayload.DriverId, "Driver");
if (!preference.ReminderEnabled)
{
    return;  // Skip scheduling reminder if disabled
}

// Calculate when to send reminder based on departure time and preference
var reminderAtUtc = eventPayload.DepartureTimeUtc.AddMinutes(-preference.ReminderMinutesBeforeDeparture);
if (reminderAtUtc < DateTime.UtcNow)
{
    reminderAtUtc = DateTime.UtcNow;  // If time has passed, send immediately
}

// Create scheduled reminder
await _repository.AddScheduledReminderAsync(new ScheduledReminder
{
    TripId = eventPayload.TripId,
    UserId = eventPayload.DriverId,
    Role = "Driver",
    TargetRole = "Driver",
    TripNumber = eventPayload.TripNumber,
    DepartureTimeUtc = eventPayload.DepartureTimeUtc,
    ReminderAtUtc = reminderAtUtc,
    CorrelationId = eventPayload.EventId.ToString()
});
```

**Key Points**:
- `ReminderEnabled` property checked first
- `ReminderMinutesBeforeDeparture` subtracted from departure time
- Can't schedule reminder in the past (uses DateTime.UtcNow as minimum)
- Reminder stored in separate table for scheduled execution

---

### 11. IN-APP NOTIFICATION CHANNEL

**File**: `backend/NotificationService/NotificationService.Api/Channels/InAppNotificationChannel.cs`

**Method**: `SendAsync()`

**What to Find**:
```csharp
public async Task SendAsync(Notification notification)
{
    if (notification.UserId == Guid.Empty)
    {
        return;  // Can't send in-app notification without specific user
    }

    var group = NotificationHub.GetUserGroup(notification.UserId.ToString());
    await _hubContext.Clients.Group(group).ReceiveNotification(new NotificationDto
    {
        Id = notification.Id,
        UserId = notification.UserId,
        TargetRole = notification.TargetRole,
        Title = notification.Title,
        Message = notification.Message,
        Type = notification.Type,
        IsRead = notification.IsRead,
        CreatedAt = notification.CreatedAt
    });
}
```

**Key Flow**:
1. Skips if UserId is Empty (role-based notifications can't be sent in-app)
2. Gets user's SignalR group
3. Sends NotificationDto to that group
4. Connected clients receive via `ReceiveNotification` method

---

### 12. NOTIFICATION CREATION IN MANAGEMENT SERVICE

**File**: `backend/NotificationService/NotificationService.Application/Services/NotificationManagementService.cs`

**Method**: `CreateNotificationAsync()`

**What to Find**:
```csharp
public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto)
{
    var notification = new Notification
    {
        UserId = dto.UserId,
        TargetRole = dto.TargetRole,
        Title = dto.Title,
        Message = dto.Message,
        Type = dto.Type,
        IsRead = false,
        CreatedAt = DateTime.UtcNow
    };

    await _repository.AddAsync(notification);
    await _repository.SaveChangesAsync();

    // Send through ALL configured notification channels
    foreach (var channel in _channels)
    {
        await channel.SendAsync(notification);
    }

    // Publish event for other services
    await _eventPublisher.PublishAsync(new NotificationCreatedEvent
    {
        NotificationId = notification.Id,
        UserId = notification.UserId,
        TargetRole = notification.TargetRole ?? string.Empty,
        Title = notification.Title,
        Message = notification.Message,
        NotificationType = notification.Type.ToString(),
        CreatedAtUtc = notification.CreatedAt
    });

    return MapToDto(notification);
}
```

**Flow**:
1. Create Notification entity with provided data
2. Save to database
3. Send through all channels (InApp, FCM, Expo) simultaneously
4. Publish NotificationCreatedEvent
5. Return DTO representation

---

## COMMON PATTERNS TO SEARCH FOR

### Find HTTP calls to NotificationService:
```
grep -r "api/notification" backend/
```
**Locations**: TripService, EmergencyService (direct HTTP POST)

### Find template usage:
```
grep -r "RenderTemplateAsync\|TemplateService\|BodyTemplate" backend/
```
**Location**: NotificationIntegrationEventHandler

### Find amount formatting:
```
grep -r "Amount.*Format\|:F2\|Currency" backend/
```
**Locations**: ConfirmPaymentCommandHandler, NotificationIntegrationEventHandler

### Find status-to-notification mapping:
```
grep -r "TripStatus\|EmergencyStatus\|newStatus" backend/
```
**Locations**: TripManagementService, EmergencyService

### Find preference handling:
```
grep -r "NotificationPreference\|ReminderEnabled\|ReminderMinutes" backend/
```
**Locations**: NotificationIntegrationEventHandler, PreferenceService

---

## DEBUGGING TIPS

1. **No driver notification received?**
   - Check: `TripManagementService.cs` lines 164-190 for HTTP error handling
   - Error is swallowed silently (try-catch block)
   - Check NotificationService is running at configured URL

2. **Amount formatting wrong?**
   - Look for: `{amount:F2}` in NotificationIntegrationEventHandler
   - Verify: `Currency.ToUpperInvariant()` is being called
   - Check: Payment's Currency and Amount fields in database

3. **Status not appearing in message?**
   - Trip/Emergency status is just `.ToString()` of the enum
   - Not templated, just concatenated into message string

4. **Template not rendering?**
   - Check: Template key exists in database (run DbSeeder)
   - Verify: All token placeholders in template have corresponding dictionary entries
   - Token matching is case-insensitive

5. **No language localization?**
   - Current: All templates are English only
   - To add: Need to modify template key to include language (e.g., "DriverAssignment_AR" for Arabic)
   - Also need: PreferredLanguage field in NotificationPreference
