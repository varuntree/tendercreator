# Plan: bug-analyze-rfd-400-error

## Plan Description
Fix 400 error occurring when clicking "Analyze RFD" button after uploading DOCX document. Error indicates analyze endpoint failing. Previous work fixed DOCX text extraction (mammoth library) but analyze endpoint still returns 400. Need to diagnose root cause, fix bug, and validate complete upload → extract → analyze → work packages workflow using E2E test with sample DOCX.

## Plan Objectives
- Diagnose root cause of 400 error on `/api/projects/[id]/analyze`
- Fix extraction or analyze logic preventing successful analysis
- Validate DOCX upload + text extraction working correctly
- Create E2E test validating complete workflow
- Ensure work packages created successfully from DOCX RFT

## Problem Statement
After uploading Technical_Specification_Phase_2_RFT_Analysis_Test.docx (MIME: application/vnd.openxmlformats-officedocument.wordprocessingml.document), clicking "Analyze RFD" returns 400 error. Previous DOCX extraction fix implemented (mammoth library) but analyze still failing. Likely causes:
- pdf-parse import incorrect (imports PDFParse class instead of default export)
- Extraction failing silently for DOCX
- content_text empty in database
- Analyze endpoint validation rejecting valid data

## Solution Statement
1. Fix pdf-parse import (use default export, not named PDFParse class)
2. Verify mammoth extraction working
3. Debug analyze endpoint with real uploaded DOCX
4. Add logging to track text extraction success
5. Create E2E test: sign in → create project → upload DOCX → analyze → verify work packages

## Dependencies

### Previous Plans
- `specs/bug-docx-file-upload-unsupported-mime-type.md` - DOCX extraction with mammoth implemented
- `specs/bug-docx-file-upload-IMPLEMENTATION.md` - Libraries installed, extraction.ts rewritten

### External Dependencies
- pdf-parse (already installed)
- mammoth (already installed)
- Playwright MCP for E2E testing
- Test fixtures: sample DOCX in test_fixtures/

## Relevant Files

### `libs/ai/extraction.ts` (PRIMARY FIX)
- Line 2: Incorrect pdf-parse import - imports PDFParse class instead of default function
- Should be: `import pdfParse from 'pdf-parse'`
- Lines 40-44: Fix PDF extraction to use imported function correctly
- Verify mammoth extraction (lines 46-49) working

### `app/api/projects/[id]/analyze/route.ts` (VALIDATION)
- Lines 49-61: Validates documents have content_text
- Returns 400 if no extracted text found
- Add logging to confirm extracted text exists

### `app/api/projects/[id]/documents/route.ts` (VERIFY EXTRACTION CALL)
- Verify extractTextFromFile called correctly during upload
- Check error handling doesn't swallow extraction failures

### `.claude/commands/e2e/test_basic_query.md` (REFERENCE)
- Example E2E test structure
- Use as template for new test

### `.claude/commands/test_e2e.md` (REFERENCE)
- E2E test runner command structure
- Test credentials and fixtures
- Screenshot guidelines

### New Files

### `.claude/commands/e2e/test_analyze_docx.md`
- E2E test for upload DOCX → analyze → work packages workflow
- Uses test credentials from test_e2e.md
- References sample DOCX from test_fixtures/

### `test_fixtures/Technical_Specification_Phase_2_RFT_Analysis_Test.docx`
- Sample DOCX file for testing (if not exists, create simple one)
- Contains RFT-like content for analysis

## Acceptance Criteria
- ✅ pdf-parse imported correctly as default export
- ✅ DOCX extraction working (mammoth returns text)
- ✅ Uploaded DOCX has content_text populated in database
- ✅ Analyze endpoint returns 200 with work packages
- ✅ E2E test passes: sign in → upload DOCX → analyze → verify work packages created
- ✅ Screenshots captured showing successful flow
- ✅ No 400 errors in analyze endpoint

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Diagnose Current State

- Check pdf-parse import in `libs/ai/extraction.ts` (likely wrong)
- Verify mammoth import correct
- Read analyze route error handling
- Check what 400 error message says (if available in logs)

### 2. Fix pdf-parse Import

- Change line 2: `import { PDFParse } from 'pdf-parse'` → `import pdfParse from 'pdf-parse'`
- Update lines 40-44 to use `pdfParse(fileBuffer)` function directly
- Remove PDFParse class instantiation
- Correct usage: `const data = await pdfParse(fileBuffer); return data.text`

### 3. Add Extraction Logging

- In `libs/ai/extraction.ts`, add console.log after each successful extraction
- Log: file name, MIME type, extracted text length
- Helps diagnose if extraction actually working

### 4. Test Extraction Locally

- Run existing test: `node tests/test-extraction-simple.mjs`
- Verify all tests pass with corrected pdf-parse
- If fails, debug until passes

### 5. Build Application

- Run `npm run build`
- Ensure TypeScript compiles without errors
- Fix any type errors from pdf-parse change

---
✅ CHECKPOINT: Steps 1-5 complete (Fix extraction library). Continue to step 6.
---

### 6. Manual Test: Upload DOCX

- Start dev server: `npm run dev`
- Sign in with test@tendercreator.dev / TestPass123!
- Navigate to existing project or create new one
- Upload Technical_Specification_Phase_2_RFT_Analysis_Test.docx
- Check Network tab: POST /api/projects/[id]/documents returns 200
- Verify console shows extraction log with text length > 0
- Check database: content_extracted = true, content_text populated

### 7. Manual Test: Analyze RFD

- Click "Analyze RFD" button on project page
- Check Network tab: POST /api/projects/[id]/analyze
- Expected: 200 response (not 400)
- Verify work packages created in database
- Check UI shows document requirements matrix

### 8. Debug If Still Fails

- If analyze still returns 400:
  - Check response body for error message
  - Add logging in analyze route at line 54-60
  - Verify rftTexts.length > 0
  - Check content_text actually has data
  - Investigate validation logic

### 9. Create Sample DOCX Fixture

- If Technical_Specification_Phase_2_RFT_Analysis_Test.docx not in test_fixtures/:
  - Create simple DOCX with RFT-like content
  - Content: "Technical Specification required. Bill of Quantities required. Methodology document required."
  - Save to: `test_fixtures/sample_rft.docx`

### 10. Create E2E Test File

- Read `.claude/commands/e2e/test_basic_query.md` and `.claude/commands/test_e2e.md`
- Create `.claude/commands/e2e/test_analyze_docx.md`
- Structure:
  - User Story: Validate DOCX upload and analysis workflow
  - Test Steps:
    1. Navigate to http://localhost:3000
    2. Sign in (test@tendercreator.dev / TestPass123!)
    3. Create new project or navigate to existing
    4. Upload sample_rft.docx
    5. Verify document appears in list
    6. Click "Analyze RFD" button
    7. Verify work packages appear
    8. Take screenshots at each step
  - Success Criteria: No 400 errors, work packages created

---
✅ CHECKPOINT: Steps 6-10 complete (Manual validation + E2E test created). Continue to step 11.
---

### 11. Validation Commands

- Execute validation commands (see Validation Commands section)
- All must pass

## Validation Commands

Execute every command to validate the bug is fixed.

### Build Validation
```bash
# 1. Install dependencies (if needed)
npm install

# 2. Run extraction tests
node tests/test-extraction-simple.mjs

# Expected: All tests pass (pdf-parse fix)

# 3. Build application
npm run build

# Expected: TypeScript compiles successfully
```

### Manual Testing
```bash
# 4. Start dev server
npm run dev

# 5. Manual workflow:
#    - Navigate to http://localhost:3000
#    - Sign in: test@tendercreator.dev / TestPass123!
#    - Create/open project
#    - Upload Technical_Specification_Phase_2_RFT_Analysis_Test.docx
#    - Verify upload returns 200, extraction logs show text length > 0
#    - Click "Analyze RFD"
#    - Expected: 200 response, work packages created
#    - Verify: Document requirements matrix appears
```

### E2E Testing
Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_analyze_docx.md` to validate DOCX upload + analysis workflow end-to-end using Playwright.

**E2E Testing Strategy:**
- Use pre-configured test credentials: test@tendercreator.dev / TestPass123!
- Reference sample DOCX: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft.docx`
- Sign in via email/password
- Execute workflow: create project → upload DOCX → analyze → verify work packages
- Capture screenshots: initial, uploaded, analyzed, work packages
- Validate no 400 errors in network requests

# Implementation log created at:
# specs/bug-analyze-rfd-400-error/bug_analyze_rfd_400_error_implementation.log

## Notes

### Root Cause Hypothesis
pdf-parse import incorrect - importing PDFParse class instead of default pdfParse function. Library exports default function, not named class.

### Correct pdf-parse Usage
```typescript
import pdfParse from 'pdf-parse'

const data = await pdfParse(fileBuffer)
return data.text
```

### Why E2E Test Critical
Manual testing prone to human error. E2E test ensures:
- Complete workflow validated
- Regression prevention
- CI/CD ready
- Repeatable validation

### DOCX Extraction Previously Fixed
- mammoth library working correctly
- MIME type validation added
- Issue likely pdf-parse import, not mammoth

### Future Improvements
- Add E2E tests for all file types (PDF, TXT)
- Automated extraction validation
- Better error messages from analyze endpoint
- Progress indicators during analysis
