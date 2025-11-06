# Demo Data Setup Guide

This guide provides instructions for setting up demo data to support consistent demonstrations of the TenderCreator multi-document platform.

## Overview

Demo data includes:
- 1 organization with uploaded capability statement
- 1 demo project: "NSW Government Cloud Infrastructure RFT"
- 8-10 work packages from RFT analysis
- 2-3 completed work packages with generated content
- 2-3 in-progress work packages
- Remaining work packages in pending status

## Prerequisites

- Application running locally (`npm run dev`)
- Access to Supabase dashboard or psql
- Test RFT document available in `test_fixtures/` directory

## Setup Steps

### 1. Create Demo Organization (if not exists)

1. Sign up/sign in to the application as: `demo@tendercreator.dev`
2. Organization should be auto-created on first sign-in
3. Navigate to Settings > Organization Documents

### 2. Upload Organization Document

**Via UI:**
1. Go to Settings > Organization Documents
2. Click "Upload Document"
3. Upload: `test_fixtures/sample_capability_statement.pdf`
   - If no test fixture exists, use any PDF with company information
4. Verify upload success

**Via Database (Alternative):**
```sql
-- Insert organization document record
INSERT INTO organization_documents (
  organization_id,
  name,
  file_type,
  file_size,
  storage_path,
  uploaded_at
) VALUES (
  '<your-org-id>',
  'Company Capability Statement',
  'application/pdf',
  1024000,
  'org-docs/<filename>.pdf',
  NOW()
);
```

### 3. Create Demo Project

**Via UI:**
1. Navigate to Projects page
2. Click "Create Project"
3. Fill in details:
   - **Name**: NSW Government Cloud Infrastructure RFT
   - **Client**: NSW Government
   - **Deadline**: [2 weeks from today]
4. Click "Create"
5. Note the project ID from the URL

**Via Database:**
```sql
INSERT INTO projects (
  organization_id,
  name,
  client_name,
  deadline,
  status,
  created_at
) VALUES (
  '<your-org-id>',
  'NSW Government Cloud Infrastructure RFT',
  'NSW Government',
  CURRENT_DATE + INTERVAL '14 days',
  'in_progress',
  NOW()
) RETURNING id;
```

### 4. Upload RFT Document

**Via UI:**
1. Open the demo project
2. Click "Upload RFT" or drag-drop file
3. Upload: `test_fixtures/sample_rft.pdf` or `test_fixtures/sample_rft_multi_document.txt`
4. Wait for upload to complete

### 5. Analyze RFT

1. Click "Analyze RFT" button on project page
2. Wait 30-60 seconds for analysis to complete
3. Verify 8-10 work packages appear
4. Note work package IDs for next steps

**Expected Work Packages:**
- Technical Specification
- Bill of Quantities
- Methodology
- Risk Register
- WHS Plan
- Quality Assurance Plan
- Project Management Plan
- Team Experience Matrix
- (and 2-3 more depending on RFT)

### 6. Generate Content for Demo Work Packages

To have realistic demo data, complete 2-3 work packages:

**Work Package 1 - Technical Specification:**
1. Open work package
2. Navigate to Strategy tab
3. Click "Generate Win Themes" → wait for completion
4. Navigate to Generate tab
5. Click "Generate Content" → wait 1-2 minutes
6. Navigate to Edit tab (content should appear)
7. Navigate to Export tab
8. Click "Export as Word" → verify download
9. Mark as completed (status should auto-update)

**Work Package 2 - WHS Plan:**
1. Repeat steps above for WHS Plan work package

**Work Package 3 - Methodology:**
1. Generate win themes only
2. Leave at "in_progress" status (don't generate content yet)

**Work Packages 4-5:**
1. Open each
2. Generate win themes only
3. Leave at "in_progress" status

**Remaining Work Packages:**
- Leave in "pending" status (no actions taken)

### 7. Verify Demo Data

**Checklist:**
- [ ] Organization has 1 uploaded document visible
- [ ] Demo project exists with correct name
- [ ] Project has 8-10 work packages listed
- [ ] 2-3 work packages show "Completed" status (green)
- [ ] 2-3 work packages show "In Progress" status (yellow)
- [ ] Remaining show "Pending" status (gray)
- [ ] Can open completed work packages and see generated content
- [ ] Export works for completed documents

### 8. Database Verification (Optional)

```sql
-- Check organization documents
SELECT name, file_type, uploaded_at
FROM organization_documents
WHERE organization_id = '<your-org-id>';

-- Check demo project
SELECT id, name, client_name, status
FROM projects
WHERE name LIKE '%NSW Government%';

-- Check work packages
SELECT document_type, status, created_at
FROM work_packages
WHERE project_id = '<demo-project-id>'
ORDER BY "order";

-- Check content for completed packages
SELECT wp.document_type, wpc.win_themes, LENGTH(wpc.content) as content_length
FROM work_packages wp
LEFT JOIN work_package_content wpc ON wp.id = wpc.work_package_id
WHERE wp.project_id = '<demo-project-id>'
  AND wp.status = 'completed';
```

## Demo Data Maintenance

**Before Each Demo:**
1. Verify demo project still exists
2. Check that completed work packages still have content
3. Test export functionality on 1 completed document
4. Ensure organization document is still accessible

**Reset Demo Data (if needed):**
```sql
-- Delete all work package content
DELETE FROM work_package_content WHERE work_package_id IN (
  SELECT id FROM work_packages WHERE project_id = '<demo-project-id>'
);

-- Reset work package statuses
UPDATE work_packages
SET status = 'pending'
WHERE project_id = '<demo-project-id>';

-- Then re-run steps 6-7 above
```

## Troubleshooting

**Issue: RFT Analysis produces no work packages**
- Solution: Check RFT document has sufficient content. Try uploading a different sample RFT.

**Issue: Content generation fails**
- Solution: Check Gemini API key is configured. Verify API quota not exceeded.

**Issue: Export downloads empty file**
- Solution: Verify work package has generated content. Check browser download permissions.

**Issue: Organization document upload fails**
- Solution: Check Supabase Storage is configured. Verify file size < 10MB. Check file type is PDF/DOCX.

## Alternative: SQL Seed Script

For faster setup, you can create a SQL seed script:

```sql
-- Save as: scripts/seed-demo-data.sql
-- Run with: psql <database-url> -f scripts/seed-demo-data.sql

-- TODO: Add full SQL script with:
-- 1. Organization creation
-- 2. Organization document insert
-- 3. Project creation
-- 4. Work packages creation
-- 5. Sample content for 2-3 packages
```

## Notes

- Demo data persists across development sessions
- Use separate test account (`demo@tendercreator.dev`) to avoid mixing with development data
- Consider creating multiple demo projects for different scenarios
- Keep demo RFT documents in `test_fixtures/` for repeatability
