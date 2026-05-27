# Database Schema (Tables + Fields)


> ⚠️ The schema below is inferred from the C# entity models and EF Core configurations (e.g., `OnModelCreating`). TyThis document summarizes the database tables and fields used by each microservice in the Departure Center System. The project uses **Entity Framework Core** and each service defines its own `DbContext` and entity models.
pes listed are the CLR types used by the models; EF Core maps them to the appropriate SQL types (e.g., `Guid` → `uniqueidentifier`, `string` → `nvarchar`).

---

## 🚪 Auth Service (`AuthService`)

### Table: `Users`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `Id`   | `Guid` | No | Primary Key |
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
| `FullName` | `string` | No | legacy/compatibility, stored as string |
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
| `BusNumber` | `string` | No | max length 50 |
| `DepartureTime` | `DateTime` | No | |
| `ArrivalTime` | `DateTime` | Yes | |
| `TotalSeats` | `int` | No | |
| `AvailableSeats` | `int` | No | |
| `Status` | `enum` | No | Stored as string; values from `TripService.Domain.Enums.TripStatus` |
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
| `Type` | `enum` | No | Stored as string; values from `NotificationService.Domain.Enums.NotificationType` |
| `IsRead` | `bool` | No | |
| `CreatedAt` | `DateTime` | No | |

---

## 📌 Notes

- The schema is currently modeled in code (Code-First EF Core). Changes should be made by updating the domain entities and migration scripts.
- Each service runs its own database context and may use separate databases depending on configuration.
- For quick reference, you can also inspect EF Core migrations under each service’s `Infrastructure/Migrations/` folder.
