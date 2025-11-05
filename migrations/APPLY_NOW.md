# 🚨 CRITICAL: Apply RLS Fixes Immediately

## Current Status
- ✅ Code changes completed
- ✅ Migration files created
- ✅ Test user verified in database
- ⏳ **SQL migrations need manual application**

## Apply These Migrations NOW

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/umchacglmyaljtzrisgh/sql

### Step 2: Run Migration 004 (Critical)

Copy and paste this entire SQL block:

```sql
-- Phase 1: Fix RLS Helper Functions and Policies
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (SELECT organization_id FROM users WHERE id = auth.uid()),
    NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT COALESCE(
    (SELECT role FROM users WHERE id = auth.uid()),
    'writer'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Admins can delete org documents" ON organization_documents;

CREATE POLICY "Users can delete their own org documents"
  ON organization_documents FOR DELETE
  USING (
    organization_id = auth.user_organization_id() AND
    (uploaded_by = auth.uid() OR auth.user_role() = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete project documents" ON project_documents;

CREATE POLICY "Users can delete their own project documents"
  ON project_documents FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    (uploaded_by = auth.uid() OR auth.user_role() = 'admin')
  );
```

Click "Run" - should see "Success" message.

### Step 3: Verify Test User (Optional - Already Exists)

Run this query to confirm:
```sql
SELECT * FROM users WHERE email = 'test@tendercreator.dev';
```

Should return 1 row with:
- email: test@tendercreator.dev
- organization_id: 887e21fd-d6ea-4770-803d-c5dcdad8bcf2
- role: admin

## After Applying Migrations

1. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test project detail page:**
   - Navigate to: http://localhost:3000/projects/f133332a-398a-4a89-98a6-f88c57cccd15
   - Should load without 500 error
   - Should show project details

3. **Test document deletion:**
   - Go to: http://localhost:3000/settings/documents
   - Upload a test document
   - Click delete button
   - Should delete successfully (no 500 error)

4. **Run E2E tests:**
   ```bash
   # Run the full test suite
   # Should now pass without 500 errors
   ```

## What These Fixes Do

1. **Helper Functions:** Add STABLE marking and safe defaults so RLS policies don't fail when user lookup returns NULL
2. **Deletion Policies:** Allow users to delete their own uploads (not just admins)
3. **Error Logging:** Already applied in code - will show detailed errors in console

## Files Changed Summary

### Database Migrations
- `migrations/phase_1/004_fix_rls_policies.sql` - RLS fixes
- `migrations/phase_1/005_seed_test_user.sql` - Test user (already exists)

### Code Changes (Already Applied)
- `libs/api-utils/index.ts` - Enhanced error logging

### Documentation
- `migrations/phase_1/README_APPLY_FIXES.md` - Detailed instructions
- `scripts/apply-migrations.mjs` - Helper script
- `scripts/exec-sql.mjs` - SQL executor script

## Expected Results After Fix

✅ Project detail API returns 200 (was 500)
✅ Project documents API returns 200 (was 500)
✅ Document deletion returns 200 (was 500)
✅ E2E tests pass completely
✅ Detailed errors logged to console

## Rollback (If Needed)

If something breaks, revert by running the original migration:
```bash
# Re-run original RLS policies
psql $DATABASE_URL -f migrations/phase_1/002_rls_policies.sql
```
