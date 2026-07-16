# Notification System Analysis - Backend Services

## Overview
This document details all notification creation, formatting, and sending patterns across the backend services (TripService, EmergencyService, PaymentService, and NotificationService).

---

## 1. NOTIFICATION CREATION & FORMATTING

### 1.1 Core Notification Entity
**Location**: [backend/NotificationService/NotificationService.Domain/Entities/Notification.cs](backend/NotificationService/NotificationService.Domain/Entities/Notification.cs)

```csharp
public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string? TargetRole { get; set; }
    public string Title { get; set; } = string.Empty;      // Formatted title
    public string Message { get; set; } = string.Empty;     // Formatted message
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

**Key Properties**:
- `Title`: The notification title (formatted with values)
- `Message`: The notification message body (formatted with values)
- `TargetRole`: Can be "Admin", "Driver", "Citizen", or null for specific user
- `Type`: NotificationType enum (TripUpdate, PaymentUpdate, ComplaintUpdate, BookingUpdate)

### 1.2 Notification Management Service
**Location**: [backend/NotificationService/NotificationService.Application/Services/NotificationManagementService.cs](backend/NotificationService/NotificationService.Application/Services/NotificationManagementService.cs)

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

    // Send through all configured channels (InApp, FCM, Expo, etc.)
    foreach (var channel in _channels)
    {
        await channel.SendAsync(notification);
    }

    // Publish event
    await _eventPublisher.PublishAsync(new NotificationCreatedEvent { ... });
    
    return MapToDto(notification);
}
```

---

## 2. TRIP STATUS UPDATE NOTIFICATIONS

### 2.1 Trip Status Change Handler
**Location**: [backend/TripService/TripService.Application/Services/TripManagementService.cs](backend/TripService/TripService.Application/Services/TripManagementService.cs) - Lines 368-415

**Method**: `NotifyAdminsAsync(Trip trip, TripStatus oldStatus, TripStatus newStatus, string? jwtToken)`

```csharp
private async Task NotifyAdminsAsync(Trip trip, TripStatus oldStatus, TripStatus newStatus, string? jwtToken)
{
    // Only notify on meaningful status transitions
    if (oldStatus == newStatus)
        return;

    if (newStatus != TripStatus.Started && newStatus != TripStatus.Delayed && newStatus != TripStatus.Finished)
        return;

    try
    {
        using var httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(_notificationServiceUrl);

        if (!string.IsNullOrEmpty(jwtToken))
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
        }

        // Build notification message with status details
        var title = $"Trip Update: {trip.BusNumber}";
        var message = $"Trip {trip.BusNumber} ({trip.Id}) status changed to {newStatus}. Departure: {trip.DepartureTime:u}.";

        // Add additional details for DELAYED status
        if (newStatus == TripStatus.Delayed)
        {
            message += $" Delay: {trip.DelayMinutes ?? 0} min.";
            if (!string.IsNullOrWhiteSpace(trip.DelayReason))
                message += $" Reason: {trip.DelayReason}.";
            if (!string.IsNullOrWhiteSpace(trip.AdminContact))
                message += $" Admin contact: {trip.AdminContact}.";
        }

        var payload = new
        {
            UserId = Guid.Empty,
            TargetRole = "Admin",
            Title = title,
            Message = message,
            Type = 1  // NotificationType.TripUpdate
        };

        await httpClient.PostAsJsonAsync("api/notification", payload);
    }
    catch
    {
        // Swallow errors - notification should not block status updates
    }
}
```

### 2.2 Trip Status Values
**Location**: [backend/TripService/TripService.Domain/Enums/TripStatus.cs](backend/TripService/TripService.Domain/Enums/TripStatus.cs)

Status values passed in notifications:
- `Scheduled`
- `Started`
- `Delayed` (with DelayMinutes, DelayReason, AdminContact)
- `Finished`
- `Cancelled`

### 2.3 Driver Assignment Notification
**Location**: [backend/TripService/TripService.Application/Services/TripManagementService.cs](backend/TripService/TripService.Application/Services/TripManagementService.cs) - Lines 164-190

```csharp
// Notify assigned driver about new trip
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

---

## 3. EMERGENCY STATUS UPDATE NOTIFICATIONS

### 3.1 Emergency Report Creation
**Location**: [backend/TripService/TripService.Application/Services/EmergencyService.cs](backend/TripService/TripService.Application/Services/EmergencyService.cs) - Lines 49-75

When emergency is reported:
```csharp
// Notify admin role that an emergency has been reported
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

### 3.2 Emergency Status Update Handler
**Location**: [backend/TripService/TripService.Application/Services/EmergencyService.cs](backend/TripService/TripService.Application/Services/EmergencyService.cs) - Lines 124-188

**Notifies TWO parties**:

#### Driver Notification:
```csharp
var title = $"Emergency Status Updated: {r.Type}";
var message = $"Trip {trip.BusNumber} ({trip.Id}) emergency status changed to {r.Status}.";

var payloadDriver = new { 
    UserId = trip.DriverId, 
    TargetRole = (string?)null, 
    Title = title, 
    Message = message, 
    Type = "TripUpdate" 
};

await http.PostAsJsonAsync("api/notification", payloadDriver);
```

#### Citizen Notification:
```csharp
var title2 = $"Emergency Update: {r.Type}";
var message2 = $"Trip {trip.BusNumber} ({trip.Id}) emergency status is now {r.Status}.";

var payloadCitizens = new { 
    UserId = Guid.Empty, 
    TargetRole = "Citizen", 
    Title = title2, 
    Message = message2, 
    Type = "AdminAnnouncement" 
};

await http2.PostAsJsonAsync("api/notification", payloadCitizens);
```

### 3.3 Emergency Status Enum
Tracks emergency resolution status through notifications.

---

## 4. PAYMENT NOTIFICATIONS WITH AMOUNTS

### 4.1 Payment Success Event
**Location**: [backend/PaymentService/PaymentService.Application/IntegrationEvents/PaymentSuccessfulEvent.cs](backend/PaymentService/PaymentService.Application/IntegrationEvents/PaymentSuccessfulEvent.cs)

```csharp
public class PaymentSuccessfulEvent : IntegrationEvent
{
    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }           // Payment amount
    public string Currency { get; set; }          // Currency code (e.g., "USD", "AED")
    public string PaymentIntentId { get; set; }
}
```

### 4.2 Payment Confirmation Handler
**Location**: [backend/PaymentService/PaymentService.Application/Features/Payments/Handlers/ConfirmPaymentCommandHandler.cs](backend/PaymentService/PaymentService.Application/Features/Payments/Handlers/ConfirmPaymentCommandHandler.cs) - Lines 28-60

```csharp
public async Task<PaymentDto> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
{
    ValidateRequest(request);

    var payment = await _repository.GetByPaymentIntentIdAsync(request.PaymentIntentId);
    if (payment == null)
    {
        throw new InvalidOperationException($"Payment with PaymentIntentId '{request.PaymentIntentId}' not found.");
    }

    var intent = await _stripePaymentGateway.ConfirmPaymentIntentAsync(
        request.PaymentIntentId,
        request.CardNumber ?? string.Empty,
        request.ExpMonth ?? 0,
        request.ExpYear ?? 0,
        request.Cvc ?? string.Empty,
        request.PaymentMethodToken ?? string.Empty);
    
    payment.Status = MapStatus(intent.Status);
    payment.PaymentMethod = "card";
    payment.UpdatedAt = DateTime.UtcNow;

    await _repository.UpdateAsync(payment);
    await _repository.SaveChangesAsync();

    // Publish success event with amount and currency
    if (payment.Status == PaymentStatus.Succeeded)
    {
        await _eventPublisher.PublishAsync(new PaymentSuccessfulEvent
        {
            PaymentId = payment.Id,
            BookingId = payment.BookingId,
            UserId = payment.UserId,
            Amount = payment.Amount,              // Decimal amount
            Currency = payment.Currency,          // Currency code
            PaymentIntentId = payment.PaymentIntentId
        });
    }

    return MapToDto(payment);
}
```

### 4.3 Payment Notification Creation
**Location**: [backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs](backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs) - Lines 258-268

```csharp
private async Task HandlePaymentSuccessfulAsync(PaymentSuccessfulEvent? eventPayload)
{
    if (eventPayload == null)
    {
        return;
    }

    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
    {
        UserId = eventPayload.UserId,
        TargetRole = "Citizen",
        Title = "Payment Successful",
        Message = $"Your payment of {eventPayload.Currency.ToUpperInvariant()} {eventPayload.Amount:F2} has been successfully completed. Thank you.",
        Type = NotificationType.PaymentUpdate
    });
}
```

**Key Points**:
- Amount is stored as `decimal` in Payment entity
- Currency is formatted to uppercase
- Amount formatted with `:F2` (2 decimal places)
- Final format: `{Currency} {Amount}` (e.g., "AED 125.50")

---

## 5. DRIVER NOTIFICATIONS & LANGUAGE/LOCALE HANDLING

### 5.1 Driver Profile Entity
**Location**: [backend/TripService/TripService.Domain/Entities/DriverProfile.cs](backend/TripService/TripService.Domain/Entities/DriverProfile.cs)

```csharp
public class DriverProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DriverId { get; set; }
    
    // License information
    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public LicenseCategory LicenseCategory { get; set; }
    public string IssuingAuthority { get; set; } = string.Empty;
    
    // Vehicle information
    public string VehiclePlateNumber { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleColor { get; set; } = string.Empty;
    public DateTime RegistrationExpiryDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

⚠️ **Note**: DriverProfile does NOT contain language or locale preferences.

### 5.2 Notification Preference Entity
**Location**: [backend/NotificationService/NotificationService.Domain/Entities/NotificationPreference.cs](backend/NotificationService/NotificationService.Domain/Entities/NotificationPreference.cs)

```csharp
public class NotificationPreference
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool ReminderEnabled { get; set; } = true;
    public int ReminderMinutesBeforeDeparture { get; set; } = 30;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

⚠️ **Note**: NotificationPreference does NOT contain language/locale properties. Only reminder-related settings.

### 5.3 Notification Template System (Language Handling)
**Location**: [backend/NotificationService/NotificationService.Domain/Entities/NotificationTemplate.cs](backend/NotificationService/NotificationService.Domain/Entities/NotificationTemplate.cs)

```csharp
public class NotificationTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Key { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string TitleTemplate { get; set; } = string.Empty;    // Template with placeholders
    public string BodyTemplate { get; set; } = string.Empty;     // Template with placeholders
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

### 5.4 Template Seeding
**Location**: [backend/NotificationService/NotificationService.Infrastructure/Data/DbSeeder.cs](backend/NotificationService/NotificationService.Infrastructure/Data/DbSeeder.cs) - Lines 25-68

Default templates include:

| Key | TitleTemplate | BodyTemplate |
|-----|---------------|----|
| `DriverAssignment` | `Driver assigned to Trip #{TripNumber}` | `You have been assigned to Trip #{TripNumber} departing at {DepartureTime}. Vehicle: {VehicleInfo}. Route: {RouteInfo}.` |
| `CitizenDepartureReminder` | `Trip #{TripNumber} departs soon` | `Your trip from {StartLocation} to {Destination} departs at {DepartureTime}.` |
| `DriverDepartureReminder` | `Reminder: Trip #{TripNumber} departs soon` | `Trip #{TripNumber} departs at {DepartureTime}. Vehicle: {VehicleInfo}. Route: {RouteInfo}` |
| `ComplaintResponse` | `Complaint response received` | `Your complaint '{ComplaintTitle}' has a response: {ResponseSummary}.` |
| `FavoriteRouteMatched` | `New route available: {StartLocation} → {Destination}` | `A new trip matching your favorite route {StartLocation} → {Destination} at {DepartureTime} is now available.` |

### 5.5 Template Token Replacement
**Location**: [backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs](backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs) - Lines 229-250

```csharp
private async Task<(string title, string body)> RenderTemplateAsync(string key, IDictionary<string, string> values)
{
    var template = await _templateService.GetTemplateByKeyAsync(key);
    if (template == null)
    {
        throw new InvalidOperationException($"Notification template '{key}' could not be found.");
    }

    var title = ReplaceTemplateTokens(template.TitleTemplate, values);
    var body = ReplaceTemplateTokens(template.BodyTemplate, values);
    return (title, body);
}

private static string ReplaceTemplateTokens(string template, IDictionary<string, string> values)
{
    var result = template;
    foreach (var pair in values)
    {
        // Replace {TokenName} with value in case-insensitive manner
        result = result.Replace($"{{{pair.Key}}}", pair.Value, StringComparison.OrdinalIgnoreCase);
    }
    return result;
}
```

### 5.6 Driver Assignment Example with Template Rendering
**Location**: [backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs](backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs) - Lines 81-120

```csharp
private async Task HandleDriverAssignedAsync(DriverAssignedEvent? eventPayload)
{
    if (eventPayload == null)
    {
        return;
    }

    // Prepare token values for template replacement
    var values = new Dictionary<string, string>
    {
        ["TripNumber"] = eventPayload.TripNumber,
        ["DepartureTime"] = eventPayload.DepartureTimeUtc.ToString("HH:mm"),
        ["VehicleInfo"] = eventPayload.VehicleInfo,
        ["RouteInfo"] = eventPayload.RouteInfo
    };

    // Get template and render it
    var (title, body) = await RenderTemplateAsync("DriverAssignment", values);

    // Create notification with rendered content
    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
    {
        UserId = eventPayload.DriverId,
        TargetRole = "Driver",
        Title = title,
        Message = body,
        Type = NotificationType.TripUpdate
    });

    // Schedule reminder based on driver preferences
    var preference = await _preferenceService.GetPreferencesAsync(eventPayload.DriverId, "Driver");
    if (!preference.ReminderEnabled)
    {
        return;
    }

    var reminderAtUtc = eventPayload.DepartureTimeUtc.AddMinutes(-preference.ReminderMinutesBeforeDeparture);
    if (reminderAtUtc < DateTime.UtcNow)
    {
        reminderAtUtc = DateTime.UtcNow;
    }

    // Create scheduled reminder...
}
```

---

## 6. NOTIFICATION CHANNELS

### 6.1 Channel Interface
**Location**: [backend/NotificationService/NotificationService.Application/Interfaces/INotificationChannel.cs](backend/NotificationService/NotificationService.Application/Interfaces/INotificationChannel.cs)

```csharp
public interface INotificationChannel
{
    string Name { get; }
    Task SendAsync(Notification notification);
}
```

### 6.2 Implemented Channels
**Location**: [backend/NotificationService/NotificationService.Api/Channels/](backend/NotificationService/NotificationService.Api/Channels/)

Available channels:
1. **InAppNotificationChannel** - Uses SignalR to send real-time notifications
2. **FcmNotificationSender** - Firebase Cloud Messaging for push notifications
3. **ExpoNotificationSender** - Expo's push notification service

### 6.3 InApp Channel Implementation
**Location**: [backend/NotificationService/NotificationService.Api/Channels/InAppNotificationChannel.cs](backend/NotificationService/NotificationService.Api/Channels/InAppNotificationChannel.cs)

```csharp
public class InAppNotificationChannel : INotificationChannel
{
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;

    public InAppNotificationChannel(IHubContext<NotificationHub, INotificationClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public string Name => "InApp";

    public async Task SendAsync(Notification notification)
    {
        if (notification.UserId == Guid.Empty)
        {
            return;
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
}
```

---

## 7. INTEGRATION EVENT FLOW

### 7.1 Event Publishing Flow

```
TripService / PaymentService / etc.
    ↓
Publishes Integration Event (via RabbitMQ)
    ↓
NotificationService (Event Consumer)
    ↓
NotificationIntegrationEventHandler.HandleAsync()
    ↓
Specific Handler (e.g., HandleDriverAssignedAsync)
    ↓
Template Rendering with Token Replacement
    ↓
CreateNotificationAsync()
    ↓
Save to Database
    ↓
Send through Notification Channels
```

### 7.2 Supported Integration Events
**Location**: [backend/NotificationService/NotificationService.Application/IntegrationEvents/](backend/NotificationService/NotificationService.Application/IntegrationEvents/)

| Event | Source | Triggers |
|-------|--------|----------|
| `TripBookedEvent` | BookingService | Citizen books a trip → Schedules reminder |
| `DriverAssignedEvent` | TripService | Driver is assigned to trip → Driver notified with template |
| `ComplaintResponseEvent` | ComplaintService | Complaint is responded to → Person notified |
| `FavoriteRouteMatchedEvent` | RouteService/BookingService | New trip on favorite route → Citizen notified |
| `PaymentSuccessfulEvent` | PaymentService | Payment confirmed → Receipt notification with amount |

---

## 8. DIRECT HTTP NOTIFICATION CALLS

Some services bypass the event system and call NotificationService directly via HTTP:

### 8.1 Trip Status Updates
**File**: [backend/TripService/TripService.Application/Services/TripManagementService.cs](backend/TripService/TripService.Application/Services/TripManagementService.cs)

Direct HTTP POST to: `{notificationServiceUrl}/api/notification`

Payload format:
```json
{
    "UserId": "00000000-0000-0000-0000-000000000000",
    "TargetRole": "Admin",
    "Title": "Trip Update: BUS123",
    "Message": "Trip BUS123 (id) status changed to Delayed...",
    "Type": 1
}
```

### 8.2 Emergency Notifications
**File**: [backend/TripService/TripService.Application/Services/EmergencyService.cs](backend/TripService/TripService.Application/Services/EmergencyService.cs)

Direct HTTP POST to: `{notificationServiceUrl}/api/notification`

Payload format:
```json
{
    "UserId": "00000000-0000-0000-0000-000000000000",
    "TargetRole": "Admin",
    "Title": "Emergency Reported: Medical",
    "Message": "Trip BUS123 (id) - Medical - Priority: High. Reporter: Citizen userId.",
    "Type": "AdminAnnouncement"
}
```

---

## 9. LANGUAGE & LOCALE HANDLING - CURRENT STATE

### Current Implementation:
✅ **Templates support token replacement** - Allows for different message content based on trip/payment details
✅ **Notification preferences** - Drivers can enable/disable reminders and set reminder time
✅ **Role-based notifications** - Different messages for different user roles

### Missing/Not Implemented:
❌ **No language preference field in DriverProfile or NotificationPreference**
❌ **No locale-specific templates** - All templates are in English
❌ **No language detection** - No way to determine user's language preference
❌ **No translation system** - No i18n/localization implementation

### To Implement Multi-Language Support:
1. Add `PreferredLanguage` field to `NotificationPreference`
2. Create language-specific notification templates (e.g., DriverAssignment_AR, DriverAssignment_EN)
3. Modify template key lookup to include language code: `GetTemplateByKeyAsync($"{key}_{language}")`
4. Update token replacement to handle language-specific date/time formatting

---

## 10. SUMMARY TABLE - FILES & LOCATIONS

| Purpose | File | Key Methods/Classes |
|---------|------|------------------|
| Notification Entity | `NotificationService.Domain/Entities/Notification.cs` | `Notification` class |
| Trip Status Changes | `TripService.Application/Services/TripManagementService.cs` | `NotifyAdminsAsync()` |
| Emergency Updates | `TripService.Application/Services/EmergencyService.cs` | `UpdateStatusAsync()` |
| Payment Notifications | `PaymentService.Application/Features/Payments/Handlers/ConfirmPaymentCommandHandler.cs` | `Handle()` with `PaymentSuccessfulEvent` |
| Payment Event | `PaymentService.Application/IntegrationEvents/PaymentSuccessfulEvent.cs` | Event data structure |
| Event Handling | `NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs` | `HandleAsync()`, template rendering |
| Template System | `NotificationService.Domain/Entities/NotificationTemplate.cs` | Template entity |
| Seeded Templates | `NotificationService.Infrastructure/Data/DbSeeder.cs` | Default template values |
| Driver Preferences | `TripService.Domain/Entities/DriverProfile.cs` | Driver profile (no language field) |
| Reminder Preferences | `NotificationService.Domain/Entities/NotificationPreference.cs` | Preference entity |
| InApp Channel | `NotificationService.Api/Channels/InAppNotificationChannel.cs` | SignalR implementation |
| FCM Channel | `NotificationService.Api/Channels/FcmNotificationSender.cs` | Firebase messaging |
| Expo Channel | `NotificationService.Api/Channels/ExpoNotificationSender.cs` | Expo push notifications |

---

## 11. KEY INSIGHTS

1. **No Direct Language Storage**: Drivers and citizens don't have language preferences stored in the database
2. **Template-Based Formatting**: All notifications use placeholder templates with token replacement
3. **Dual Notification Methods**: Services use both direct HTTP calls and event-driven patterns
4. **Amount Formatting**: Payment amounts are formatted with 2 decimal places
5. **Status as Strings**: Trip and emergency statuses are passed as enum values which convert to strings
6. **Error Handling**: Notification failures don't block business operations (try-catch with swallowing)
7. **Role-Based Routing**: Notifications can target specific user roles rather than individual users
8. **Scheduled Reminders**: Reminders are stored and executed separately based on user preferences
