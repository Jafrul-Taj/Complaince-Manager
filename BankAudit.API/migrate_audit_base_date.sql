-- ============================================================
-- Migration: Move AuditBaseDate from AuditFindings → ComplianceAuditReports
-- Strategy : MIN(AuditBaseDate) per report group
-- Database : SQLite
-- Run with : sqlite3 your_database.db < migrate_audit_base_date.sql
-- ============================================================

-- ── 0. Safety: Wrap everything in a transaction ───────────────
BEGIN;

-- ── 1. Backup current data (verify before applying) ──────────
-- Uncomment and run these SELECTs to verify state before migrating:
-- SELECT COUNT(*) AS total_findings FROM AuditFindings;
-- SELECT COUNT(*) AS findings_with_date FROM AuditFindings WHERE AuditBaseDate IS NOT NULL;
-- SELECT COUNT(*) AS total_reports FROM ComplianceAuditReports;

-- ── 2. Add AuditBaseDate column to ComplianceAuditReports ─────
ALTER TABLE ComplianceAuditReports ADD COLUMN AuditBaseDate TEXT;

-- ── 3. Back-fill: set each report's AuditBaseDate to the MIN
--       across all its findings (handles NULLs gracefully) ────
UPDATE ComplianceAuditReports
SET AuditBaseDate = (
    SELECT MIN(f.AuditBaseDate)
    FROM AuditFindings f
    WHERE f.ComplianceAuditReportId = ComplianceAuditReports.Id
      AND f.AuditBaseDate IS NOT NULL
)
WHERE EXISTS (
    SELECT 1 FROM AuditFindings f
    WHERE f.ComplianceAuditReportId = ComplianceAuditReports.Id
      AND f.AuditBaseDate IS NOT NULL
);

-- ── 4. Verify back-fill before dropping ──────────────────────
-- SELECT Id, BranchId, Year, AuditBaseDate FROM ComplianceAuditReports LIMIT 20;
-- SELECT COUNT(*) AS reports_with_date FROM ComplianceAuditReports WHERE AuditBaseDate IS NOT NULL;

-- ── 5. Drop AuditBaseDate from AuditFindings
--       SQLite ≥ 3.35.0 supports DROP COLUMN directly.
--       Check version: SELECT sqlite_version();
ALTER TABLE AuditFindings DROP COLUMN AuditBaseDate;

-- ── 6. Verify final state ────────────────────────────────────
-- SELECT 'AuditFindings columns' AS tbl, * FROM pragma_table_info('AuditFindings');
-- SELECT 'ComplianceAuditReports columns' AS tbl, * FROM pragma_table_info('ComplianceAuditReports');

COMMIT;


-- ============================================================
-- ROLLBACK SCRIPT (run if you need to revert)
-- ============================================================
-- BEGIN;
--
-- -- Re-add column to findings (values recovered from report)
-- ALTER TABLE AuditFindings ADD COLUMN AuditBaseDate TEXT;
--
-- UPDATE AuditFindings
-- SET AuditBaseDate = (
--     SELECT r.AuditBaseDate
--     FROM ComplianceAuditReports r
--     WHERE r.Id = AuditFindings.ComplianceAuditReportId
-- )
-- WHERE ComplianceAuditReportId IS NOT NULL;
--
-- -- Drop from reports
-- ALTER TABLE ComplianceAuditReports DROP COLUMN AuditBaseDate;
--
-- COMMIT;


-- ============================================================
-- LEGACY SQLite (< 3.35.0): table-rebuild method for DROP COLUMN
-- Use this block instead of step 5 if your SQLite is older.
-- ============================================================
-- BEGIN;
--
-- CREATE TABLE AuditFindings_new (
--     Id                      INTEGER PRIMARY KEY,
--     ComplianceAuditReportId INTEGER,
--     BranchId                INTEGER NOT NULL,
--     AssignedOfficerId       INTEGER NOT NULL,
--     FindingArea             TEXT    NOT NULL,
--     SlNo                    TEXT    NOT NULL,
--     NameOfCustomers         TEXT    NOT NULL,
--     FindingDetails          TEXT    NOT NULL,
--     LapsesOriginated        TEXT    NOT NULL,
--     Category                TEXT    NOT NULL,
--     RiskRating              TEXT    NOT NULL,
--     ComplianceStatus        TEXT    NOT NULL,
--     LapsesType              TEXT    NOT NULL,
--     NoOfInstances           TEXT    NOT NULL,
--     RectificationRemarks    TEXT,
--     RectifiedAt             TEXT,
--     Year                    INTEGER NOT NULL,
--     CreatedAt               TEXT    NOT NULL,
--     UpdatedAt               TEXT    NOT NULL,
--     FOREIGN KEY (ComplianceAuditReportId) REFERENCES ComplianceAuditReports(Id),
--     FOREIGN KEY (BranchId)               REFERENCES Branches(Id),
--     FOREIGN KEY (AssignedOfficerId)       REFERENCES Users(Id)
-- );
--
-- INSERT INTO AuditFindings_new
--     SELECT Id, ComplianceAuditReportId, BranchId, AssignedOfficerId,
--            FindingArea, SlNo, NameOfCustomers, FindingDetails,
--            LapsesOriginated, Category, RiskRating, ComplianceStatus,
--            LapsesType, NoOfInstances, RectificationRemarks,
--            RectifiedAt, Year, CreatedAt, UpdatedAt
--     FROM AuditFindings;
--
-- DROP TABLE AuditFindings;
-- ALTER TABLE AuditFindings_new RENAME TO AuditFindings;
--
-- -- Recreate indexes
-- CREATE INDEX IF NOT EXISTS IX_AuditFindings_AssignedOfficerId ON AuditFindings(AssignedOfficerId);
-- CREATE INDEX IF NOT EXISTS IX_AuditFindings_BranchId          ON AuditFindings(BranchId);
-- CREATE INDEX IF NOT EXISTS IX_AuditFindings_ComplianceAuditReportId ON AuditFindings(ComplianceAuditReportId);
--
-- COMMIT;
