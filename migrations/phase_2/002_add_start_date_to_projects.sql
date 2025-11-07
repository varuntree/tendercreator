-- Add start_date column to projects table
-- This field is used in project creation and updates to track project start date

ALTER TABLE projects
ADD COLUMN start_date TIMESTAMPTZ DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN projects.start_date IS 'Project start date, tracks when project work begins';
