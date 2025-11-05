# Apply RLS Fix Migrations

## Prerequisites
These migrations fix critical 500 errors in API endpoints. Apply them in order.

## Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Copy and paste the contents of `004_fix_rls_policies.sql` into the SQL editor
3. Click "Run" and verify no errors
4. Copy and paste the contents of `005_seed_test_user.sql`
5. Click "Run" and verify test user inserted

## Option 2: Via Supabase CLI

```bash
# Navigate to project root
cd /Users/varunprasad/code/prjs/tendercreator/tendercreator

# Apply migration 004
supabase db execute -f migrations/phase_1/004_fix_rls_policies.sql

# Apply migration 005
supabase db execute -f migrations/phase_1/005_seed_test_user.sql
```

## Option 3: Via psql (Direct Database Connection)

```bash
# Get your connection string from Supabase dashboard
# Database Settings → Connection String → URI

psql "YOUR_CONNECTION_STRING" -f migrations/phase_1/004_fix_rls_policies.sql
psql "YOUR_CONNECTION_STRING" -f migrations/phase_1/005_seed_test_user.sql
```

## Verification

After applying migrations, verify with these queries:

```sql
-- Check helper functions updated
SELECT auth.user_organization_id();
-- Should return UUID or NULL (not error)

-- Check test user exists
SELECT * FROM users WHERE email = 'test@tendercreator.dev';
-- Should return 1 row with organization_id set

-- Check policies updated
SELECT policyname FROM pg_policies
WHERE tablename = 'organization_documents'
AND policyname LIKE '%delete%';
-- Should show "Users can delete their own org documents"
```

## Expected Results

After applying these migrations:
- ✅ Project detail page loads without 500 errors
- ✅ Project documents API returns data
- ✅ Organization document deletion works
- ✅ Test user can access their projects
- ✅ Detailed error logging in API routes

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Rollback 005 (remove test user)
DELETE FROM users WHERE id = '7856a8ca-f238-4696-bbf4-ecf5540055f1'::uuid;

-- Rollback 004 (revert policies)
-- Run migrations/phase_1/002_rls_policies.sql again
```
