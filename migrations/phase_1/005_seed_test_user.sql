-- Phase 1: Seed Test User
-- Ensures test user exists in public users table for E2E testing
-- This fixes the root cause where auth user exists but public user record missing

-- Ensure test user exists in public users table
INSERT INTO users (id, email, name, organization_id, role)
SELECT
  '7856a8ca-f238-4696-bbf4-ecf5540055f1'::uuid,
  'test@tendercreator.dev',
  'Test User',
  '887e21fd-d6ea-4770-803d-c5dcdad8bcf2'::uuid,
  'admin'::user_role
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE id = '7856a8ca-f238-4696-bbf4-ecf5540055f1'::uuid
);
