-- Phase 1: Fix RLS Helper Functions and Policies
-- Addresses bug where auth.user_organization_id() returns NULL for users
-- not in public users table, causing all RLS policies to fail

-- Step 1: Update helper functions with safe defaults and STABLE marking
-- STABLE marking allows PostgreSQL to cache results within a query
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (SELECT organization_id FROM users WHERE id = auth.uid()),
    NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Return writer as safe default instead of throwing error
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT COALESCE(
    (SELECT role FROM users WHERE id = auth.uid()),
    'writer'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 2: Relax organization document deletion policy
-- Allow uploaders to delete their own documents (not just admins)
DROP POLICY IF EXISTS "Admins can delete org documents" ON organization_documents;

CREATE POLICY "Users can delete their own org documents"
  ON organization_documents FOR DELETE
  USING (
    organization_id = auth.user_organization_id() AND
    (uploaded_by = auth.uid() OR auth.user_role() = 'admin')
  );

-- Step 3: Relax project document deletion policy
-- Allow uploaders to delete their own project documents
DROP POLICY IF EXISTS "Admins can delete project documents" ON project_documents;

CREATE POLICY "Users can delete their own project documents"
  ON project_documents FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    (uploaded_by = auth.uid() OR auth.user_role() = 'admin')
  );
