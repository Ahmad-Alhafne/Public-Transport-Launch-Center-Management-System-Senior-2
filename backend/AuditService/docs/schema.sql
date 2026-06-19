/* AuditService schema (SQL Server) */

-- TripAudit: one audit session per trip (history allowed)
CREATE TABLE TripAudits (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    TripId UNIQUEIDENTIFIER NOT NULL,
    AuditorId UNIQUEIDENTIFIER NOT NULL,
    AssignedAt DATETIME2 NOT NULL,
    Status INT NOT NULL,
    CompletedAt DATETIME2 NULL
);

-- Prevent more than one active audit (Assigned/InProgress) per Trip using a filtered unique index.
-- Status mapping: Available=0, Assigned=1, InProgress=2, Completed=3, Cancelled=4
CREATE UNIQUE INDEX IX_TripAudits_TripId_Active
ON TripAudits(TripId)
WHERE Status = 1 OR Status = 2;

-- AuditRecord: log of each scan attempt
CREATE TABLE AuditRecords (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    TripId UNIQUEIDENTIFIER NOT NULL,
    BookingId UNIQUEIDENTIFIER NOT NULL,
    CitizenId UNIQUEIDENTIFIER NOT NULL,
    AuditorId UNIQUEIDENTIFIER NOT NULL,
    ScanTime DATETIME2 NOT NULL,
    Result INT NOT NULL,
    Notes NVARCHAR(MAX) NULL
);

-- Prevent more than one Approved scan per Booking+Trip.
-- AuditResult mapping: Approved=0, Rejected=1, Duplicate=2, WrongTrip=3, InvalidQRCode=4
CREATE UNIQUE INDEX IX_AuditRecords_Booking_Approved
ON AuditRecords(BookingId, TripId)
WHERE Result = 0;

-- Helpful indexes
CREATE INDEX IX_AuditRecords_TripId ON AuditRecords(TripId);
CREATE INDEX IX_AuditRecords_AuditorId ON AuditRecords(AuditorId);
CREATE INDEX IX_TripAudits_AuditorId ON TripAudits(AuditorId);

/* Notes:
 - TripId, BookingId, CitizenId, AuditorId are stored as GUIDs; cross-service referential integrity is handled via service APIs.
 - Filtered indexes above require SQL Server. If using a DB without filtered indexes, implement assignment locking via a dedicated lock table or transactional checks.
*/
