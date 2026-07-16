# Notification System - File Index & Search Reference

## Document Roadmap

📖 **NOTIFICATION_SYSTEM_ANALYSIS.md** - Comprehensive guide with detailed explanations
- Best for: Understanding the full architecture and how everything connects
- Sections: 11 detailed sections covering all aspects
- Use when: You need to understand the "why" and "how" of the system

📋 **NOTIFICATION_QUICK_REFERENCE.md** - Quick lookup table and diagrams  
- Best for: Quick answers and pattern recognition
- Sections: 11 numbered sections with tables and flows
- Use when: You need to find something specific fast

💻 **NOTIFICATION_CODE_SNIPPETS.md** - Exact code sections to search for
- Best for: Finding specific lines of code and understanding implementations
- Sections: 12 detailed code examples with context
- Use when: You're reading/editing the actual code


---

## QUICK LOOKUP BY FEATURE

### Trip Status Notifications
| What | Where | File |
|------|-------|------|
| How status changes trigger notifications | ANALYSIS §2 | TripManagementService.cs |
| Code to update | SNIPPETS §1 | NotifyAdminsAsync() |
| Quick overview | REFERENCE §1 | - |
| Status enum values | ANALYSIS §2.2 | TripStatus.cs |

### Emergency Notifications  
| What | Where | File |
|------|-------|------|
| Full flow explained | ANALYSIS §3 | EmergencyService.cs |
| Code patterns | SNIPPETS §3, §4 | CreateEmergencyAsync(), UpdateStatusAsync() |
| Quick lookup | REFERENCE §2 | - |
| Status changes | ANALYSIS §3.2 | Notifies driver + citizens |

### Payment Notifications
| What | Where | File |
|------|-------|------|
| Event publishing | ANALYSIS §4.2 | ConfirmPaymentCommandHandler.cs |
| Amount formatting | ANALYSIS §4.3 | NotificationIntegrationEventHandler.cs |
| Code snippet | SNIPPETS §5, §6 | PaymentSuccessfulEvent handling |
| Formatting pattern | REFERENCE §3 | {CURRENCY} {amount:F2} |

### Driver Notifications
| What | Where | File |
|------|-------|------|
| Assignment notification | ANALYSIS §2.3 | TripManagementService.cs |
| Template-based flow | ANALYSIS §5.6 | DriverAssignedEvent handling |
| Code examples | SNIPPETS §2, §7 | Direct HTTP + template rendering |
| Profile structure | ANALYSIS §5.1 | DriverProfile entity |
| Preferences | ANALYSIS §5.2 | NotificationPreference entity |

### Language & Locale
| What | Where | File |
|------|-------|------|
| Current state | ANALYSIS §9 | Summary of what's implemented |
| Preferences storage | ANALYSIS §5.2 | NotificationPreference (no language field) |
| Template system | ANALYSIS §5.3-5.5 | How templates handle content variation |
| Future implementation | ANALYSIS §9 | Recommendations for multi-language |

### Template System
| What | Where | File |
|------|-------|------|
| Template entity | ANALYSIS §5.3 | NotificationTemplate.cs |
| All 5 templates | ANALYSIS §5.4 | DbSeeder.cs |
| Token replacement | ANALYSIS §5.5 | ReplaceTemplateTokens() method |
| Template examples | SNIPPETS §9 | All 5 templates with values |
| Rendering flow | REFERENCE §11 | Diagram showing token replacement |

### Notification Channels
| What | Where | File |
|------|-------|------|
| Channel interface | ANALYSIS §6.1 | INotificationChannel.cs |
| InApp (SignalR) | ANALYSIS §6.3 | InAppNotificationChannel.cs |
| All channels | ANALYSIS §6.2 | List of InApp, FCM, Expo |
| Example channel | SNIPPETS §11 | InApp implementation |

---

## SEARCH BY FILE NAME

### TripService Files

| File | Key Content | Ref |
|------|-------------|-----|
| `TripManagementService.cs` | Trip status notifications, driver assignments | ANALYSIS §2, SNIPPETS §1-2 |
| `EmergencyService.cs` | Emergency notifications, status updates | ANALYSIS §3, SNIPPETS §3-4 |
| `DriverProfile.cs` | Driver profile entity (no language field) | ANALYSIS §5.1, REFERENCE §6 |
| `TripStatus.cs` | Status enum values | ANALYSIS §2.2 |
| `DriverProfileRepository.cs` | Repository pattern | ANALYSIS §5.1 |

### PaymentService Files

| File | Key Content | Ref |
|------|-------------|-----|
| `ConfirmPaymentCommandHandler.cs` | Event publishing with amount/currency | ANALYSIS §4.2, SNIPPETS §5 |
| `PaymentSuccessfulEvent.cs` | Event structure with Amount, Currency | ANALYSIS §4.1, SNIPPETS §5 |
| `Payment.cs` | Payment entity with decimal Amount | - |
| `StripePaymentGateway.cs` | Amount conversion (multiply by 100) | - |

### NotificationService Files

| File | Key Content | Ref |
|------|-------------|-----|
| `Notification.cs` | Core notification entity | ANALYSIS §1.1 |
| `NotificationManagementService.cs` | Create, fetch, mark read | ANALYSIS §1.2, SNIPPETS §12 |
| `NotificationIntegrationEventHandler.cs` | Event handling, template rendering | ANALYSIS §5.6, SNIPPETS §8-10 |
| `InAppNotificationChannel.cs` | SignalR-based channel | ANALYSIS §6.3, SNIPPETS §11 |
| `FcmNotificationSender.cs` | Firebase messaging | ANALYSIS §6.2 |
| `ExpoNotificationSender.cs` | Expo push notifications | ANALYSIS §6.2 |
| `NotificationTemplate.cs` | Template entity with placeholders | ANALYSIS §5.3, SNIPPETS §9 |
| `NotificationPreference.cs` | Reminder preferences | ANALYSIS §5.2, SNIPPETS §10 |
| `DbSeeder.cs` | All 5 template definitions | ANALYSIS §5.4, SNIPPETS §9 |
| `INotificationChannel.cs` | Channel interface | ANALYSIS §6.1 |

---

## SEARCH BY CONCEPT

### "Create Notification"
- Go to: ANALYSIS §1 or SNIPPETS §12
- Summary: `NotificationManagementService.CreateNotificationAsync()`
- Flow: Validate → Save → Send through channels → Publish event

### "Format Message with Amount"
- Go to: ANALYSIS §4.3 or SNIPPETS §6
- Pattern: `$"Your payment of {currency.ToUpperInvariant()} {amount:F2}..."`
- File: NotificationIntegrationEventHandler.cs, HandlePaymentSuccessfulAsync()

### "Template Token Replacement"
- Go to: ANALYSIS §5.5 or SNIPPETS §8
- Pattern: `ReplaceTemplateTokens(template, values)`
- Method: Case-insensitive `{Token}` replacement using String.Replace

### "Send Notification by Role"
- Go to: ANALYSIS §1.1 or REFERENCE §2
- Pattern: `UserId = Guid.Empty` + `TargetRole = "Admin"/"Driver"/"Citizen"`
- Used in: Trip status, emergency updates

### "Send Notification to Specific User"
- Go to: ANALYSIS §4.3 or REFERENCE §3
- Pattern: `UserId = userId` + `TargetRole = "Citizen"` (or null)
- Used in: Payment notifications, individual user messages

### "Handle Integration Event"
- Go to: ANALYSIS §7 or REFERENCE §11
- Pattern: `PublishAsync()` → Event → Handler → CreateNotificationAsync()
- Example: PaymentSuccessfulEvent → HandlePaymentSuccessfulAsync()

### "Check Driver Preferences"
- Go to: ANALYSIS §5.2 or SNIPPETS §10
- Pattern: `GetPreferencesAsync(userId, role)`
- Returns: Reminder enabled flag, reminder minutes before departure

### "Direct HTTP Notification Call"
- Go to: ANALYSIS §8 or REFERENCE §8
- Pattern: `POST /api/notification` with JSON payload
- Used by: TripService, EmergencyService

---

## SEARCH BY ACTION

### "I need to add a new field to notifications"
1. Read: ANALYSIS §1.1 (Notification entity)
2. Find: `backend/NotificationService/NotificationService.Domain/Entities/Notification.cs`
3. Update: Entity class + CreateNotificationDto + NotificationDto
4. Also: NotificationDbContext.cs migration + UI updates

### "I need to modify trip status message"
1. Read: ANALYSIS §2.1 (Trip status handler)
2. Find: `backend/TripService/TripService.Application/Services/TripManagementService.cs`
3. Edit: `NotifyAdminsAsync()` method (lines 368-415)
4. Test: Status transitions (Started, Delayed, Finished)

### "I need to change payment notification format"
1. Read: ANALYSIS §4.3 (Payment notification creation)
2. Find: `backend/NotificationService/NotificationService.Api/Handlers/NotificationIntegrationEventHandler.cs`
3. Edit: `HandlePaymentSuccessfulAsync()` method (lines 258-268)
4. Key: Message formatting with `{amount:F2}` and `Currency.ToUpperInvariant()`

### "I need to add a new notification template"
1. Read: ANALYSIS §5.4 (Template seeding)
2. Create: Migration file to add NotificationTemplate row
3. Add: New template in DbSeeder.cs with Key, TitleTemplate, BodyTemplate
4. Update: Handler to call RenderTemplateAsync() with new key
5. Test: With actual values via token replacement

### "I need to translate notifications to another language"
1. Current state: ANALYSIS §9 (not implemented)
2. Step 1: Add `PreferredLanguage` field to NotificationPreference
3. Step 2: Create language-specific templates (DriverAssignment_AR, etc.)
4. Step 3: Modify template lookup to include language code
5. Step 4: Handle date/time/number formatting per locale

### "I need to debug why a notification isn't sending"
1. Check: REFERENCE §11 (debugging tips)
2. Verify: NotificationService URL is correct
3. Check: Required fields (UserId or TargetRole) are present
4. Look for: Try-catch blocks swallowing errors
5. Test: Template exists if using template-based approach

### "I need to find where emergency status is passed"
1. Read: ANALYSIS §3.2 (Emergency status updates)
2. Find: `backend/TripService/TripService.Application/Services/EmergencyService.cs`
3. Look: `UpdateStatusAsync()` method
4. Search: `r.Status` in notification messages

### "I need to understand the full notification flow"
1. Simple flow: REFERENCE §11 (diagrams)
2. Detailed flow: ANALYSIS §7 (integration event flow)
3. Code example: SNIPPETS §12 (full flow in code)

---

## BY NOTIFICATION TYPE

### Trip Update Notifications
| Detail | Location |
|--------|----------|
| Type Enum Value | `NotificationType.TripUpdate` |
| Status Values | Started, Delayed, Finished |
| Message Pattern | "Trip {BusNumber} status changed to {Status}" |
| Targets | Admin (role-based) |
| File | TripManagementService.cs |
| Section | ANALYSIS §2, SNIPPETS §1 |

### Payment Update Notifications
| Detail | Location |
|--------|----------|
| Type Enum Value | `NotificationType.PaymentUpdate` |
| Message Pattern | "Your payment of {Currency} {Amount:F2}..." |
| Targets | Citizen (specific user) |
| Amount Format | Decimal with 2 places |
| File | NotificationIntegrationEventHandler.cs |
| Section | ANALYSIS §4, SNIPPETS §6 |

### Complaint Update Notifications
| Detail | Location |
|--------|----------|
| Type Enum Value | `NotificationType.ComplaintUpdate` |
| Message Pattern | "Your complaint '{Title}' has a response: {Summary}" |
| Template Key | "ComplaintResponse" |
| Targets | Complaint owner |
| File | NotificationIntegrationEventHandler.cs |
| Section | ANALYSIS §5.4, SNIPPETS §9 |

### Booking Update Notifications
| Detail | Location |
|--------|----------|
| Type Enum Value | `NotificationType.BookingUpdate` |
| Message Pattern | "New trip on {StartLocation} → {Destination}" |
| Template Key | "FavoriteRouteMatched" |
| Targets | Citizen (specific user) |
| File | NotificationIntegrationEventHandler.cs |
| Section | ANALYSIS §5.4, SNIPPETS §9 |

---

## BY USER ROLE

### Notifications Received by Drivers
| Notification | Source | Message Detail |
|--------------|--------|---------|
| Trip Assignment | TripService | "You have been assigned to trip {BusNumber}" |
| Trip Status Update | TripService | "Trip {BusNumber} status changed to {Status}" |
| Departure Reminder | NotificationService | "Trip {TripNumber} departs soon. Vehicle: {VehicleInfo}" |
| Emergency Update | TripService | "Trip emergency status changed to {Status}" |

### Notifications Received by Citizens
| Notification | Source | Message Detail |
|--------------|--------|---------|
| Payment Confirmation | PaymentService | "Your payment of {Currency} {Amount:F2}" |
| Departure Reminder | NotificationService | "Your trip from {StartLocation} to {Destination} departs" |
| Complaint Response | ComplaintService | "Your complaint has a response: {Summary}" |
| Emergency Update | TripService | "Trip emergency status is now {Status}" |
| Favorite Route Match | BookingService | "New trip on your favorite route available" |

### Notifications Received by Admins
| Notification | Source | Message Detail |
|--------------|--------|---------|
| Trip Status Update | TripService | "Trip {BusNumber} status changed to {Status}" |
| Emergency Report | TripService | "Emergency Reported: {Type}. Priority: {Priority}" |

---

## REFERENCE TABLES FOR QUICK ACCESS

### Message Format Patterns Cheat Sheet

```
Pattern: "{Enum} with {Field}"
Example: "Trip BUS123 status changed to Started. Delay: 30 min. Reason: Traffic."
Using: trip.Status.ToString(), trip.DelayMinutes, trip.DelayReason

Pattern: "{UtcDateTime:u}"
Example: "Departure: 2026-06-10T14:30:00Z"

Pattern: "{Currency uppercase} {Amount:F2}"
Example: "AED 125.50"
Using: currency.ToUpperInvariant(), amount:F2

Pattern: "{Template with {Tokens}}"
Example: "Driver assigned to Trip #{TripNumber}"
Using: Template from database with token replacement
```

### Notification DTO Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| UserId | Guid | Yes | Empty means role-based |
| TargetRole | string? | No | "Admin", "Driver", "Citizen", or null |
| Title | string | Yes | Formatted title |
| Message | string | Yes | Formatted message body |
| Type | NotificationType | Yes | TripUpdate, PaymentUpdate, etc. |

### Integration Event Fields (Payment)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| PaymentId | Guid | Yes | Database ID |
| BookingId | Guid | Yes | Related booking |
| UserId | Guid | Yes | Who made payment |
| Amount | decimal | Yes | 2 decimal places |
| Currency | string | Yes | Code like "AED", "USD" |
| PaymentIntentId | string | Yes | Stripe reference |

### Template Token Values Cheat Sheet

| Template | Tokens Used | Source |
|----------|-------------|--------|
| DriverAssignment | TripNumber, DepartureTime, VehicleInfo, RouteInfo | DriverAssignedEvent |
| CitizenDepartureReminder | TripNumber, StartLocation, Destination, DepartureTime | TripBookedEvent |
| DriverDepartureReminder | TripNumber, DepartureTime, VehicleInfo, RouteInfo | TripDepartureReminderEvent |
| ComplaintResponse | ComplaintTitle, ResponseSummary | ComplaintResponseEvent |
| FavoriteRouteMatched | StartLocation, Destination, DepartureTime | FavoriteRouteMatchedEvent |

---

## INDEX BY SEARCH KEYWORDS

**Amount** → ANALYSIS §4, SNIPPETS §6, REFERENCE §3
**Channel** → ANALYSIS §6, RESEARCH §7
**Currency** → ANALYSIS §4.3, SNIPPETS §6
**Database** → ANALYSIS §1.1, §5.2
**Decimal** → ANALYSIS §4, SNIPPETS §5
**Delay** → ANALYSIS §2.1, SNIPPETS §1
**Emergency** → ANALYSIS §3, SNIPPETS §3-4
**Enum** → All status types in various files
**Event** → ANALYSIS §7, REFERENCE §11
**Formatting** → ANALYSIS §5.5, SNIPPETS §8
**Handler** → ANALYSIS §7, SNIPPETS §3-10
**HTTP** → ANALYSIS §8, REFERENCE §8
**Language** → ANALYSIS §9, REFERENCE §5
**Locale** → ANALYSIS §9
**Message** → Throughout all documents
**Notification** → All sections
**Payment** → ANALYSIS §4, SNIPPETS §5-6
**Preference** → ANALYSIS §5.2, SNIPPETS §10
**Role** → ANALYSIS §1.1, §3.2
**SignalR** → ANALYSIS §6.3, SNIPPETS §11
**Status** → ANALYSIS §2, §3
**Template** → ANALYSIS §5, SNIPPETS §9
**Token** → ANALYSIS §5.5, SNIPPETS §8
**Trip** → ANALYSIS §2, SNIPPETS §1-2
**UserId** → All notification sections
