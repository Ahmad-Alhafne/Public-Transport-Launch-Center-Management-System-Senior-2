# Entity Relationship Diagram (ERD)

This file documents the main entities, attributes, and relationships for the Departure Center Management System. It is updated to reflect the current backend services and database schemas.

---

## Entities and Key Attributes

### AuthService: Users
- Users
  - Id (PK)
  - Email
  - PasswordHash
  - Role
  - AccountCreationDate
  - LastProfileUpdate
  - AccountStatus
  - LanguagePreference
  - PhoneNumber
  - NationalIdNumber
  - FirstName
  - LastName
  - Gender
  - DateOfBirth
  - City
  - Region
  - DisabilityStatus
  - AdminLevel
  - FatherName
  - MotherName
  - BirthPlace
  - CurrentAddress
  - CardNumber
  - CardIssueDate
  - FaceColor
  - EyeColor
  - FullName
  - CreatedAt

### RouteService: Routes
- Routes
  - Id (PK)
  - Name (unique)
  - StartLocation
  - EndLocation
  - DistanceKm
  - EstimatedDurationMins
  - IsActive
  - CreatedAt

### TripService: Trips and driver profiles
- Trips
  - Id (PK)
  - RouteId (FK -> Routes.Id)
  - DriverId (FK -> Users.Id)
  - VehicleId (FK -> Vehicles.Id)
  - BusNumber
  - DepartureTime
  - ArrivalTime
  - TotalSeats
  - AvailableSeats
  - Status
  - DelayMinutes
  - DelayReason
  - AdminContact
  - CreatedAt

- DriverProfiles
  - Id (PK)
  - DriverId (FK -> Users.Id) (unique)
  - LicenseNumber
  - LicenseExpiryDate
  - LicenseCategory
  - IssuingAuthority
  - VehiclePlateNumber
  - VehicleModel
  - VehicleColor
  - RegistrationExpiryDate
  - CreatedAt
  - UpdatedAt

- EmergencyReports
  - Id (PK)
  - TripId (FK -> Trips.Id)
  - ReporterId (FK -> Users.Id)
  - ReporterRole
  - Type
  - Priority
  - Status
  - Description
  - CreatedAt
  - UpdatedAt

- DriverChangeRequests
  - Id (PK)
  - DriverId (FK -> Users.Id)
  - Type
  - Status
  - CurrentValue
  - RequestedValue
  - Reason
  - AdminNotes
  - CreatedAt
  - ResolvedAt

### BookingService: Bookings
- Bookings
  - Id (PK)
  - TripId (FK -> Trips.Id)
  - PassengerId (FK -> Users.Id)
  - PassengerName
  - SeatCount
  - CancellationCode (unique)
  - Status
  - TripDepartureTimeUtc
  - BookedAt
  - QrToken
  - QrGeneratedAt

### PaymentService: Payments
- Payments
  - Id (PK)
  - BookingId (FK -> Bookings.Id)
  - UserId (FK -> Users.Id)
  - Amount
  - Currency
  - PaymentIntentId (unique)
  - Status
  - PaymentMethod
  - CreatedAt
  - UpdatedAt

### VehicleService: Vehicles
- Vehicles
  - Id (PK)
  - Name
  - Type
  - Capacity
  - PlateNumber (unique)
  - Status
  - CreatedAt

### ComplaintService: Complaints
- Complaints
  - Id (PK)
  - UserId (FK -> Users.Id)
  - Subject
  - Description
  - Status
  - AdminResponse
  - CreatedAt

### NotificationService: Notifications and reminders
- Notifications
  - Id (PK)
  - UserId (FK -> Users.Id)
  - TargetRole
  - Title
  - Message
  - Type
  - IsRead
  - CreatedAt

- NotificationPreferences
  - Id (PK)
  - UserId (FK -> Users.Id)
  - Role
  - ReminderEnabled
  - ReminderMinutesBeforeDeparture
  - CreatedAt
  - UpdatedAt
  - Unique(UserId, Role)

- NotificationTemplates
  - Id (PK)
  - Key (unique)
  - Type
  - TitleTemplate
  - BodyTemplate
  - IsActive
  - CreatedAt


- ScheduledReminders
  - Id (PK)
  - TripId (FK -> Trips.Id)
  - UserId (FK -> Users.Id)
  - Role
  - TargetRole
  - TripNumber
  - StartLocation
  - Destination
  - VehicleInfo
  - RouteInfo
  - DepartureTimeUtc
  - ReminderAtUtc
  - Processed
  - CreatedAt
  - ProcessedAt
  - CorrelationId

### OrganizerService: Organizers and queue packages

- OrganizerActionLogs
  - Id (PK)
  - OrganizerId (FK -> Organizers.Id)
  - Action
  - Timestamp
  - RelatedEntityId

- QueuePackages
  - Id (PK)
  - RouteId (FK -> Routes.Id)
  - DepartureDate
  - QueueOrder
  - CreatedAt
  - UpdatedAt

- QueuePackageTrips
  - Id (PK)
  - QueuePackageId (FK -> QueuePackages.Id)
  - TripId (FK -> Trips.Id)
  - QueuePosition

### LiveTrackingService: Trip location history
- LiveTripTrackings
  - Id (PK)
  - TripId (FK -> Trips.Id)
  - DriverId (FK -> Users.Id)
  - VehicleId (FK -> Vehicles.Id)
  - CurrentLatitude
  - CurrentLongitude
  - CurrentSpeed
  - TrackingStatus
  - LastUpdatedAt

- TrackingHistories
  - Id (PK)
  - TripId (FK -> Trips.Id)
  - Latitude
  - Longitude
  - Speed
  - Timestamp

### AuditService: Audit records
- AuditRecords
  - Id (PK)
  - TripId (FK -> Trips.Id)
  - BookingId (FK -> Bookings.Id)
  - CitizenId (FK -> Users.Id)
  - AuditorId (FK -> Users.Id)
  - ScanTime
  - Result
  - Notes

- TripAudits
  - Id (PK)
  - TripId (FK -> Trips.Id)
  - AuditorId (FK -> Users.Id)
  - AssignedAt
  - Status
  - CompletedAt

---

## Key Relationships (narrative)

- Users 1—* Trips: drivers are users and can be assigned to many trips.
- Users 1—1 DriverProfiles: each driver may have one driver profile record.
- Users 1—* Bookings: passengers are users who may create many bookings.
- Users 1—* Payments: users can make many payments for bookings.
- Users 1—* Complaints: users may file many complaints.
- Users 1—* Notifications: users receive notifications.
- Users 1—* NotificationPreferences: each user can configure notification settings per role.
- Users 1—* ScheduledReminders: reminders are targeted to users for trips.
- Users 1—* AuditRecords: citizens and auditors are both users in audit records.
- Routes 1—* Trips: a route can have many trips.
- Routes 1—* QueuePackages: route queue packages are created for specific routes.
- Vehicles 1—* Trips: vehicles can be used on many trips.
- Trips 1—* Bookings: each trip can have many bookings.
- Trips 1—* EmergencyReports: trips can generate many emergency reports.
- Trips 1—* ScheduledReminders: each trip can have many user reminders.
- Trips 1—* LiveTripTrackings: a trip can have current tracking data.
- Trips 1—* TrackingHistories: a trip can have many historical GPS points.
- Trips 1—* QueuePackageTrips: a trip may belong to many queue package positions.
- Trips 1—* AuditRecords: audit scans are linked to trips.
- Trips 1—* TripAudits: audits are assigned for trips.
- Bookings 1—* Payments: each booking can produce payment records.
- QueuePackages 1—* QueuePackageTrips: queue packages contain many trip positions.
- Organizers 1—* OrganizerActionLogs: organizer actions are logged.

---

## Mermaid ER Diagram

Render this block with a Mermaid-compatible renderer (GitHub, VS Code Mermaid Preview, or other tools).

`mermaid
erDiagram
    USERS {
        GUID Id PK
        string Email
        string PasswordHash
        string Role
        string AccountCreationDate
        string LastProfileUpdate
        string AccountStatus
        string LanguagePreference
        string PhoneNumber
        string NationalIdNumber
        string FirstName
        string LastName
        string Gender
        datetime DateOfBirth
        string City
        string Region
        string DisabilityStatus
        string AdminLevel
        string FatherName
        string MotherName
        string BirthPlace
        string CurrentAddress
        string CardNumber
        datetime CardIssueDate
        string FaceColor
        string EyeColor
        string FullName
        datetime CreatedAt
    }

    ROUTES {
        GUID Id PK
        string Name
        string StartLocation
        string EndLocation
        double DistanceKm
        int EstimatedDurationMins
        bool IsActive
        datetime CreatedAt
    }

    VEHICLES {
        GUID Id PK
        string Name
        string Type
        int Capacity
        string PlateNumber
        string Status
        datetime CreatedAt
    }

    TRIPS {
        GUID Id PK
        GUID RouteId FK
        GUID DriverId FK
        GUID VehicleId FK
        string BusNumber
        datetime DepartureTime
        datetime ArrivalTime
        int TotalSeats
        int AvailableSeats
        string Status
        int DelayMinutes
        string DelayReason
        string AdminContact
        datetime CreatedAt
    }

    DRIVERPROFILES {
        GUID Id PK
        GUID DriverId FK
        string LicenseNumber
        datetime LicenseExpiryDate
        string LicenseCategory
        string IssuingAuthority
        string VehiclePlateNumber
        string VehicleModel
        string VehicleColor
        datetime RegistrationExpiryDate
        datetime CreatedAt
        datetime UpdatedAt
    }

    EMERGENCYREPORTS {
        GUID Id PK
        GUID TripId FK
        GUID ReporterId FK
        string ReporterRole
        string Type
        string Priority
        string Status
        string Description
        datetime CreatedAt
        datetime UpdatedAt
    }

    DRIVERCHANGEREQUESTS {
      GUID Id PK
      GUID DriverId FK
      string Type
      string Status
      string CurrentValue
      string RequestedValue
      string Reason
      string AdminNotes
      datetime CreatedAt
      datetime ResolvedAt
    }

    BOOKINGS {
        GUID Id PK
        GUID TripId FK
        GUID PassengerId FK
        string PassengerName
        int SeatCount
        string CancellationCode
        string Status
        datetime TripDepartureTimeUtc
        datetime BookedAt
        string QrToken
        datetime QrGeneratedAt
    }

    PAYMENTS {
        GUID Id PK
        GUID BookingId FK
        GUID UserId FK
        decimal Amount
        string Currency
        string PaymentIntentId
        string Status
        string PaymentMethod
        datetime CreatedAt
        datetime UpdatedAt
    }

    COMPLAINTS {
        GUID Id PK
        GUID UserId FK
        string Subject
        string Description
        string Status
        string AdminResponse
        datetime CreatedAt
    }

    NOTIFICATIONS {
        GUID Id PK
        GUID UserId FK
        string TargetRole
        string Title
        string Message
        string Type
        bool IsRead
        datetime CreatedAt
    }

    NOTIFICATIONPREFERENCES {
        GUID Id PK
        GUID UserId FK
        string Role
        bool ReminderEnabled
        int ReminderMinutesBeforeDeparture
        datetime CreatedAt
        datetime UpdatedAt
    }

    NOTIFICATIONTEMPLATES {
        GUID Id PK
        string Key
        string Type
        string TitleTemplate
        string BodyTemplate
        bool IsActive
        datetime CreatedAt
    }




    SCHEDULEDREMINDERS {
        GUID Id PK
        GUID TripId FK
        GUID UserId FK
        string Role
        string TargetRole
        string TripNumber
        string StartLocation
        string Destination
        string VehicleInfo
        string RouteInfo
        datetime DepartureTimeUtc
        datetime ReminderAtUtc
        bool Processed
        datetime CreatedAt
        datetime ProcessedAt
        string CorrelationId
    }

    ORGANIZERS {
        GUID Id PK
        string FullName
        string Email
        string Password
        string PhoneNumber
        string Gender
        datetime DateOfBirth
        string City
        string Region
        string NationalIdNumber
        bool IsActive
        datetime CreatedAt
        datetime UpdatedAt
    }

    ORGANIZERACTIONLOGS {
        GUID Id PK
        GUID OrganizerId FK
        string Action
        datetime Timestamp
        GUID RelatedEntityId
    }

    QUEUEPACKAGES {
        GUID Id PK
        GUID RouteId FK
        datetime DepartureDate
        int QueueOrder
        datetime CreatedAt
        datetime UpdatedAt
    }

    QUEUEPACKAGETRIPS {
        GUID Id PK
        GUID QueuePackageId FK
        GUID TripId FK
        int QueuePosition
    }

    LIVETRIPTRACKINGS {
        GUID Id PK
        GUID TripId FK
        GUID DriverId FK
        GUID VehicleId FK
        double CurrentLatitude
        double CurrentLongitude
        double CurrentSpeed
        string TrackingStatus
        datetime LastUpdatedAt
    }

    TRACKINGHISTORIES {
        GUID Id PK
        GUID TripId FK
        double Latitude
        double Longitude
        double Speed
        datetime Timestamp
    }

    AUDITRECORDS {
        GUID Id PK
        GUID TripId FK
        GUID BookingId FK
        GUID CitizenId FK
        GUID AuditorId FK
        datetime ScanTime
        string Result
        string Notes
    }

    TRIPAUDITS {
        GUID Id PK
        GUID TripId FK
        GUID AuditorId FK
        datetime AssignedAt
        string Status
        datetime CompletedAt
    }

    USERS ||--o{ TRIPS : "assigned to"
    ROUTES ||--o{ TRIPS : "contains"
    VEHICLES ||--o{ TRIPS : "used by"
    USERS ||--o{ DRIVERPROFILES : "owns"
    TRIPS ||--o{ EMERGENCYREPORTS : "reports"
    USERS ||--o{ EMERGENCYREPORTS : "reports"
    TRIPS ||--o{ BOOKINGS : "bookings"
    USERS ||--o{ BOOKINGS : "passengers"
    BOOKINGS ||--o{ PAYMENTS : "payments"
    USERS ||--o{ PAYMENTS : "pays"
    USERS ||--o{ COMPLAINTS : "files"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ NOTIFICATIONPREFERENCES : "configures"
    TRIPS ||--o{ SCHEDULEDREMINDERS : "reminds"
    USERS ||--o{ SCHEDULEDREMINDERS : "receives"
    USERS ||--o{ AUDITRECORDS : "citizen/auditor"
    TRIPS ||--o{ AUDITRECORDS : "audited"
    TRIPS ||--o{ TRIPAUDITS : "assigned"
    USERS ||--o{ TRIPAUDITS : "audits"
    ROUTES ||--o{ QUEUEPACKAGES : "queue"
    QUEUEPACKAGES ||--o{ QUEUEPACKAGETRIPS : "contains"
    TRIPS ||--o{ QUEUEPACKAGETRIPS : "queued"
    ORGANIZERS ||--o{ ORGANIZERACTIONLOGS : "logs"
    TRIPS ||--o{ LIVETRIPTRACKINGS : "current tracking"
    TRIPS ||--o{ TRACKINGHISTORIES : "history"
    USERS ||--o{ DRIVERCHANGEREQUESTS : "requests"
  `
