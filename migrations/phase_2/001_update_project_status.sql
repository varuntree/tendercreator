-- Phase 2: Update project_status enum to support new workflow states
-- Changes: draft -> setup, active -> analysis/in_progress

-- Step 1: Add new enum values to project_status
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'setup';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'analysis';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'in_progress';

-- Step 2: Update existing projects to use new status values
-- Map: draft -> setup, active -> in_progress
UPDATE projects
SET status = 'setup'::project_status
WHERE status = 'draft'::project_status;

UPDATE projects
SET status = 'in_progress'::project_status
WHERE status = 'active'::project_status;

-- Note: PostgreSQL enums cannot have values removed if they're in use,
-- so 'draft' and 'active' will remain in the enum type but won't be used going forward.
-- New projects should use: setup -> analysis -> in_progress -> completed -> archived
