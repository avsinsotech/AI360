-- SQL Migration Script to fix Loan Scrutiny AppId Collisions

-- 1. Drop the existing unique index that was only on AppId
-- Note: Replace 'IX_reports_AppId' with the actual index name if it's different in your DB
-- If you are using Entity Framework, the name is likely IX_reports_AppId
ALTER TABLE reports DROP INDEX IX_reports_AppId;

-- 2. Add a new unique index that includes ClientCode
-- This allows different tenants/clients to have the same sequential AppId
ALTER TABLE reports ADD UNIQUE INDEX IX_reports_AppId_ClientCode (AppId, ClientCode);
