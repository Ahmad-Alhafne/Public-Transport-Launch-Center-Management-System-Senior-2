# Database Schema (Tables + Fields)

> ⚠️ The schema below is inferred from the C# entity models and EF Core configurations (e.g., `OnModelCreating`). This document summarizes the database tables and fields used by each microservice in the Departure Center System. The project uses **Entity Framework Core** and each service defines its own `DbContext` and entity models.

The listed types are the CLR types used by the models; EF Core maps them to the appropriate SQL types (e.g., `Guid` → `uniqueidentifier`, `string` → `nvarchar`).

---

## 🚪 Auth Service (`AuthService`)

### Table: `Users`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id` | `Guid` | No | Primary Key |
| `Email` | `string` | No | Unique; max length 150 |
| `PasswordHash` | `string` | No | |
| `Role` | `enum` | No | Stored as string; values from `AuthService.Domain.Enums.Role` |
| `AccountCreationDate` | `DateTime` | No | |
| `LastProfileUpdate` | `DateTime` | No | |
| `AccountStatus` | `enum` | No | Stored as string; values from `AuthService.Domain.Enums.AccountStatus` |
| `PhoneNumber` | `string` | Yes | max length 50 |
| `NationalIdNumber` | `string` | Yes | max length 20 |
| `FirstName` | `string` | Yes | max length 100 |
| `LastName` | `string` | Yes | max length 100 |
| `Gender` | `enum` | Yes | Stored as string; values from `AuthService.Domain.Enums.Gender` |
| `DateOfBirth` | `DateTime` | Yes | |
| `City` | `string` | Yes | max length 100 |
| `Region` | `string` | Yes | max length 100 |
| `DisabilityStatus` | `enum` | Yes | Stored as string; values from `AuthService.Domain.Enums.DisabilityStatus` |
| `AdminLevel` | `enum` | Yes | Stored as string; values from `AuthService.Domain.Enums.AdminLevel` |
| `FatherName` | `string` | Yes | max length 100 |
| `MotherName` | `string` | Yes | max length 100 |
| `BirthPlace` | `string` | Yes | max length 150 |
| `CurrentAddress` | `string` | Yes | max length 250 |
| `CardNumber` | `string` | Yes | max length 50 |
| `CardIssueDate` | `DateTime` | Yes | |
| `FaceColor` | `string` | Yes | max length 50 |
| `EyeColor` | `string` | Yes | max length 50 |
| `FullName` | `string` | No | Required; max length 150 |
| `CreatedAt` | `DateTime` | No | |

### Indexes/Constraints

- Unique index on `Email`

---

## 🛣️ Route Service (`RouteService`)

### Table: `Routes`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id` | `Guid` | No | Primary Key |
| `Name` | `string` | No | Unique; max length 150 |
| `StartLocation` | `string` | No | Indexed; max length 150 |
| `EndLocation` | `string` | No | Indexed; max length 150 |
| `DistanceKm` | `double` | No | |
| `EstimatedDurationMins` | `int` | No | |
| `IsActive` | `bool` | No | |
| `CreatedAt` | `DateTime` | No | |

### Indexes/Constraints

- Unique index on `Name`
- Unique composite index on (`StartLocation`, `EndLocation`)

---

## 🚍 Trip Service (`TripService`)

### Table: `Trips`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id` | `Guid` | No | Primary Key |
| `RouteId` | `Guid` | No | Indexed |
| `DriverId` | `Guid` | No | Indexed |
| `VehicleId` | `Guid` | No | Indexed; logical reference to `VehicleService.Vehicles.Id` |
| `BusNumber` | `string` | No | max length 50 |
| `DepartureTime` | `DateTime` | No | |
| `ArrivalTime` | `DateTime` | Yes | |
| `AvailableSeats` | `int` | No | |
| `TotalSeats` | `int` | No | |
| `Status` | `enum` | No | Stored as string; values from `TripService.Domain.Enums.TripStatus` |
| `AdminContact` | `string` | Yes | Optional admin contact details |
| `DelayMinutes` | `int` | Yes | Optional delay duration |
| `DelayReason` | `string` | Yes | Optional delay reason |
| `CreatedAt` | `DateTime` | No | |

### Table: `DriverProfiles`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id` | `Guid` | No | Primary Key |
| `DriverId` | `Guid` | No | Unique index; references `AuthService` `Users.Id` |
| `LicenseNumber` | `string` | No | max length 100 |
| `LicenseExpiryDate` | `DateTime` | No | |
| `LicenseCategory` | `enum` | No | Stored as string; values from `TripService.Domain.Enums.LicenseCategory` |
| `IssuingAuthority` | `string` | No | max length 150 |
| `VehiclePlateNumber` | `string` | No | max length 50 |
| `VehicleModel` | `string` | No | max length 100 |
| `VehicleColor` | `string` | No | max length 50 |
| `RegistrationExpiryDate` | `DateTime` | No | |
| `CreatedAt` | `DateTime` | No | |
| `UpdatedAt` | `DateTime` | No | |

### Indexes/Constraints

- Unique index on `DriverId`

---

## 🎟️ Booking Service (`BookingService`)

### Table: `Bookings`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id` | `Guid` | No | Primary Key |
| `TripId` | `Guid` | No | Indexed |
| `PassengerId` | `Guid` | No | Indexed |
| `PassengerName` | `string` | No | max length 150 |
| `SeatCount` | `int` | No | |
| `CancellationCode` | `string` | No | Unique; max length 20 |
| `Status` | `enum` | No | Stored as string; values from `BookingService.Domain.Enums.BookingStatus` |
| `TripDepartureTimeUtc` | `DateTime` | No | |
| `BookedAt` | `DateTime` | No | |

### Indexes/Constraints

- Unique index on `CancellationCode`
- Indexes on `PassengerId` and `TripId`

---

## 📝 Complaint Service (`ComplaintService`)

### Table: `Complaints`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id` | `Guid` | No | Primary Key |
| `UserId` | `Guid` | No | Indexed |
| `UserName` | `string` | No | max length 150 |
| `UserRole` | `string` | No | max length 50 |
| `Subject` | `string` | No | max length 200 |
| `Description` | `string` | No | max length 2000 |
| `Status` | `enum` | No | Stored as string; values from `ComplaintService.Domain.Enums.ComplaintStatus` |
| `AdminResponse` | `string` | No | (empty string by default) |
| `CreatedAt` | `DateTime` | No | |

### Indexes/Constraints

- Index on `UserId`

---

## 🔔 Notification Service (`NotificationService`)

### Table: `Notifications`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id` | `Guid` | No | Primary Key |
| `UserId` | `Guid` | No | Indexed |
| `Title` | `string` | No | |
| `Message` | `string` | No | |
| `Type` | `enum` | No | Stored as int; values from `NotificationService.Domain.Enums.NotificationType` |
| `TargetRole` | `string` | Yes | Optional target role for role-based notifications |
| `IsRead` | `bool` | No | |
| `CreatedAt` | `DateTime` | No | |

---

## 🚘 Vehicle Service (`VehicleService`)

### Table: `Vehicles`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id` | `Guid` | No | Primary Key |
| `Name` | `string` | No | max length 150 |
| `PlateNumber` | `string` | No | Unique; max length 50 |
| `Type` | `string` | No | max length 100 |
| `Capacity` | `int` | No | |
| `Status` | `string` | No | |
| `CreatedAt` | `DateTime` | No | |

### Indexes/Constraints

- Unique index on `PlateNumber`

---

## 📌 Notes

- The schema is modeled with code-first EF Core. Changes are defined in each service’s `DbContext`/entity classes and migration scripts.
- Each service runs its own database context and may use separate databases depending on configuration.
- EF Core maps CLR types to SQL types (e.g., `Guid` → `uniqueidentifier`, `string` → `nvarchar`).
