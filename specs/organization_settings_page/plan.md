# Plan: organization_settings_page

## Plan Description
Implement the complete organization/company settings page as shown in org.png reference image. This includes:
1. Organization profile management (name, logo update)
2. Company profile builder for AI context (business details that help AI understand company capabilities)
3. Danger zone actions (leave/delete organization with confirmations)
4. Integration with existing settings navigation structure

The page serves two purposes: basic org settings (name, logo) and rich company profile for AI to use when generating tender documents (company description, services, differentiators, etc.).

## Plan Objectives
- Create `/settings` page matching org.png design exactly
- Implement organization profile update (name, logo)
- Build company profile form capturing business context for AI
- Add leave/delete organization actions (UI functional, simplified for MVP single-user)
- Store all data in org.settings JSONB field (no schema migration needed)
- Integrate logo upload with Supabase Storage
- Follow existing patterns from `/settings/documents` page

## Problem Statement
Currently, the `/settings` route exists as a stub. Users have no way to:
- Update organization name or upload logo
- Build a company profile that AI can use for tender generation context
- Manage organization membership (leave/delete)

The org.png shows the expected UI with two main sections: Company Details (basic settings) and Company Profile (AI context builder).

## Solution Statement
Create a comprehensive settings page at `/settings` that provides:
1. **Company Details Section**: Organization name/logo management, leave/delete actions with confirmations
2. **Company Profile Section**: Rich form for business context (company description, industry, services, key projects, certifications, differentiators) stored in org.settings.profile
3. **Logo upload**: Supabase Storage integration following existing document upload patterns
4. **Confirmation modals**: Type-to-confirm pattern for destructive actions
5. **API endpoints**: Update organization, upload logo, delete organization

All data stored in existing `organizations` table using `settings` JSONB field - no migration required.

## Dependencies

### Previous Plans
None - this is a standalone feature using existing infrastructure.

### External Dependencies
- Supabase Storage (already configured for document uploads)
- Existing auth system (user must belong to organization)
- Existing organizations table and repository functions

## Relevant Files

### Existing Files (Reference & Modify)

**Page Structure Reference:**
- `/app/(dashboard)/settings/documents/page.tsx` - Complete reference implementation showing:
  - Server Component pattern fetching data
  - Card-based layout with CardHeader/CardContent
  - Upload functionality with loading states
  - Table display with actions
  - Error handling patterns

**Navigation:**
- `/components/sidebar.tsx` (lines 23-32) - "Company" nav item already exists, points to `/settings`
  - No changes needed, already configured

**Repository Layer:**
- `/libs/repositories/organizations.ts` - Contains:
  - `getOrganizationByUserId(supabase, userId)` - use to fetch org
  - `updateOrganization(supabase, orgId, updates)` - use for name/settings updates
  - Need to add: `deleteOrganization(supabase, orgId)` function

**API Utilities:**
- `/libs/api-utils/index.ts` - `withAuth` wrapper for API routes
- `/app/api/organizations/route.ts` - Existing org endpoints (GET, PUT)
  - Extend PUT to handle settings.profile updates
  - Add DELETE endpoint for organization deletion

**Storage:**
- `/libs/storage/organization-documents.ts` - Reference for Supabase Storage upload patterns
  - Use same pattern for logo uploads to `organization-logos` bucket

**Auth & Types:**
- `/libs/supabase/server.ts` - Server-side Supabase client
- `/types/database.ts` - Database types (Organization interface)

**UI Components:**
- `/components/ui/card.tsx` - Card, CardHeader, CardTitle, CardContent
- `/components/ui/button.tsx` - Button variants
- `/components/ui/input.tsx` - Form inputs
- `/components/ui/label.tsx` - Form labels
- `/components/ui/textarea.tsx` - Multi-line inputs
- `/components/ui/dialog.tsx` - Modal dialogs
- `/components/ui/select.tsx` - Dropdown selects

### New Files

**Main Page:**
- `/app/(dashboard)/settings/page.tsx` - Organization settings page (Server Component)

**Client Components:**
- `/components/organization-profile-form.tsx` - Organization name/logo update form (Client Component)
- `/components/company-profile-form.tsx` - Company profile builder form (Client Component)
- `/components/delete-organization-dialog.tsx` - Confirmation dialog for delete (Client Component)

**API Routes:**
- `/app/api/organizations/logo/route.ts` - Logo upload endpoint (POST)
- Update `/app/api/organizations/route.ts` - Add DELETE method

**Types:**
- `/types/organization.ts` - CompanyProfile interface definition

**E2E Test:**
- `.claude/commands/e2e/test_organization_settings.md` - E2E test workflow for this feature

## Acceptance Criteria

All items REQUIRED:

1. **Page loads correctly**
   - `/settings` route renders without errors
   - Displays current organization name and logo (if exists)
   - Shows company profile data (if exists) or empty state

2. **Organization Profile Update**
   - Can update organization name via inline form
   - Can upload logo image (PNG, JPG, max 2MB)
   - Logo displays as icon/avatar in profile section
   - Changes persist to database (org.settings.logo_url)

3. **Company Profile Builder**
   - Form includes fields: company description, industry, services offered, key projects, certifications, differentiators
   - "Edit Company Profile" button opens form (dialog or dedicated section)
   - Form saves to org.settings.profile
   - Green card displays company name from profile with icon
   - Info banner explains profile helps AI understand business context

4. **Leave Organization Action**
   - "Leave organization" button visible (red text)
   - For MVP: Shows tooltip "Team features coming soon" and disabled
   - (Future: confirmation modal, removes user from org)

5. **Delete Organization Action**
   - "Delete organization" button visible (red text)
   - Clicking opens confirmation dialog
   - Must type organization name exactly to confirm
   - Deletes organization and all related data
   - Redirects to sign-in after deletion

6. **UI Matches Reference**
   - Layout matches org.png exactly
   - Two sections: "Company Details" and "Company Profile"
   - Green primary color (#1EB472) for buttons/cards
   - Proper spacing, card styling, danger action styling (red text)

7. **Error Handling**
   - File upload errors show clear messages (size limit, format)
   - Network errors display toast notifications
   - Invalid form data shows validation messages

8. **E2E Test Passes**
   - Complete workflow tested: load page → update name → upload logo → edit profile → verify persistence

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Create Type Definitions

- Create `/types/organization.ts` file
- Define `CompanyProfile` interface with fields:
  - company_name: string
  - company_description: string
  - industry: string
  - services_offered: string[]
  - key_projects: string (markdown/text describing notable projects)
  - certifications: string[]
  - differentiators: string (what makes company unique)
- Define `OrganizationSettings` interface extending existing with:
  - logo_url?: string
  - profile?: CompanyProfile
- Export all types

### 2. Extend Repository Functions

- Open `/libs/repositories/organizations.ts`
- Add `deleteOrganization(supabase, orgId)` function:
  - Delete all related data (check foreign keys)
  - Delete organization record
  - Return success/error
- Verify `updateOrganization` handles nested settings updates (settings.profile, settings.logo_url)

### 3. Create Logo Upload API Route

- Create `/app/api/organizations/logo/route.ts`
- Implement POST handler:
  - Use `withAuth` wrapper
  - Accept multipart/form-data with image file
  - Validate file type (PNG, JPG, JPEG only)
  - Validate file size (max 2MB)
  - Upload to Supabase Storage bucket `organization-logos`
  - File path: `{orgId}/logo.{ext}`
  - Get public URL
  - Update organization record: `settings.logo_url = publicUrl`
  - Return `{ success: true, data: { logo_url: publicUrl } }`
- Follow pattern from `/libs/storage/organization-documents.ts`

### 4. Extend Organizations API Route

- Open `/app/api/organizations/route.ts`
- Add DELETE method handler:
  - Use `withAuth` wrapper
  - Get organization ID from request body
  - Verify user belongs to organization (check user.organization_id matches)
  - Call `deleteOrganization(supabase, orgId)`
  - Return `{ success: true, message: "Organization deleted" }`
- Ensure PUT handler supports nested updates to `settings.profile`

### 5. Create Organization Profile Form Component

- Create `/components/organization-profile-form.tsx` as Client Component
- Props: `{ organization: Organization, onUpdate: (data) => void }`
- Form fields:
  - Organization name (input)
  - Logo upload (file input with preview)
  - "Update Profile" button
- On logo change:
  - Show preview immediately
  - On submit, upload to `/api/organizations/logo`
- On name change:
  - Update via `/api/organizations` PUT
- Use React Hook Form + validation
- Show loading states during upload/update
- Display success/error toasts

---
✅ CHECKPOINT: Steps 1-5 complete (Backend + Basic Form). Continue to step 6.
---

### 6. Create Company Profile Form Component

- Create `/components/company-profile-form.tsx` as Client Component
- Props: `{ organization: Organization, onSave: (profile) => void }`
- Render as Dialog (modal) or expandable section
- Form fields (all from CompanyProfile interface):
  - Company name (input)
  - Company description (textarea, 3-5 sentences)
  - Industry (select: Construction, IT, Healthcare, Government, Other)
  - Services offered (multi-input or textarea with comma separation)
  - Key projects (textarea, markdown supported)
  - Certifications (multi-input or textarea)
  - Differentiators (textarea, what makes company unique)
- "Save Company Profile" button
- On submit:
  - Call `/api/organizations` PUT with `{ settings: { profile: formData } }`
  - Trigger onSave callback to refresh parent
- Validation: required fields (name, description, industry)
- Show loading state during save

### 7. Create Delete Organization Dialog Component

- Create `/components/delete-organization-dialog.tsx` as Client Component
- Props: `{ organization: Organization, open: boolean, onClose: () => void }`
- Dialog content:
  - Warning message: "This action cannot be undone. All projects, documents, and data will be permanently deleted."
  - Input field: "Type '{organization.name}' to confirm"
  - Validation: input must exactly match organization name
  - "Delete Organization" button (red, destructive variant)
  - "Cancel" button
- On confirm:
  - Call `/api/organizations` DELETE
  - On success: redirect to `/signin`
  - On error: show error toast, keep dialog open
- Use shadcn/ui Dialog component

### 8. Create Main Settings Page

- Create `/app/(dashboard)/settings/page.tsx` as Server Component
- Fetch current user and organization:
  ```typescript
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const org = await getOrganizationByUserId(supabase, user.id)
  ```
- Page structure matching org.png:
  - Page header: "COMPANY" breadcrumb, large "Company" title with icon
  - Subtitle: "Manage your company details like name and logo and then build a company profile that Tender Creator can use as context when generating tenders"
  - Section 1: "Company Details" (CardHeader)
    - OrganizationProfileForm component
    - "Leave organization" button (disabled with tooltip for MVP)
    - "Delete organization" button (opens DeleteOrganizationDialog)
  - Section 2: "Company Profile" (CardHeader)
    - Info banner: "A Company Profile helps the AI understand your business context. You need to create one before you can make tenders."
    - If profile exists: Green card showing company name with folder icon + "Edit Company Profile" button
    - If no profile: "Create Company Profile" button
    - Edit/Create opens CompanyProfileForm dialog
- Use Card components for layout
- Handle client-side state for dialogs

---
✅ CHECKPOINT: Steps 6-8 complete (Frontend UI). Continue to step 9.
---

### 9. Add Supabase Storage Bucket

- Create storage bucket `organization-logos` via Supabase dashboard or CLI
- Set public access policy (logos should be publicly viewable)
- Configure RLS policies:
  - INSERT: authenticated users can upload to their org folder
  - SELECT: public can view
  - DELETE: only org members can delete their org's logos
- Document bucket creation in implementation log

### 10. Test Organization Profile Update Flow

- Navigate to `/settings`
- Verify organization name displays correctly
- Update organization name, verify save works
- Upload logo image (test PNG and JPG)
- Verify logo appears in profile section after upload
- Check database: org.settings.logo_url populated
- Check Supabase Storage: file exists in organization-logos bucket
- Test file validation: try uploading >2MB file (should error)
- Test file type validation: try uploading PDF (should error)

### 11. Test Company Profile Builder Flow

- Click "Edit Company Profile" or "Create Company Profile" button
- Verify form dialog opens with all fields
- Fill in all fields with test data
- Submit form
- Verify success message appears
- Verify green card shows company name
- Refresh page, verify data persists
- Check database: org.settings.profile contains saved data
- Edit profile again, verify form pre-fills with existing data

### 12. Test Delete Organization Flow

- Click "Delete organization" button
- Verify confirmation dialog appears
- Try submitting without typing org name (should be disabled/error)
- Type incorrect name (should show validation error)
- Type correct organization name
- Click "Delete Organization"
- Verify organization deleted from database
- Verify redirect to `/signin`
- Sign in again, verify new organization created (or user has no org)

### 13. Create E2E Test File

- Read `.claude/commands/test_e2e.md` to understand test format
- Read `.claude/commands/e2e/test_basic_query.md` as example
- Create `.claude/commands/e2e/test_organization_settings.md`
- Test workflow should cover:
  1. Sign in with test@tendercreator.dev / TestPass123!
  2. Navigate to /settings
  3. Verify organization details section visible
  4. Update organization name
  5. Upload logo (use test_fixtures/sample-logo.png)
  6. Verify logo displays
  7. Open company profile form
  8. Fill all fields with test data
  9. Save profile
  10. Verify green card shows company name
  11. Refresh page, verify persistence
  12. (Optional) Test delete flow with caution
- Follow exact format from test_e2e.md

### 14. Run Validation Commands

Execute all validation commands below to ensure feature works correctly.

## Validation Commands

Execute every command to validate the task works correctly.

**Type Check:**
```bash
npm run type-check
```

**Build Test:**
```bash
npm run build
```

**Lint:**
```bash
npm run lint
```

**Manual Testing Checklist:**
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/settings`
3. Verify page renders without console errors
4. Test organization name update
5. Test logo upload (valid file)
6. Test logo upload (invalid file - verify error)
7. Test company profile create/edit
8. Test delete organization confirmation (don't actually delete unless using test data)
9. Verify all data persists after page refresh

**E2E Testing:**
Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_organization_settings.md` test file to validate this functionality works.

**Database Verification:**
```bash
# Check organization settings structure
npx supabase db inspect
# Verify org.settings contains logo_url and profile fields
```

**Supabase Storage Check:**
- Open Supabase dashboard
- Navigate to Storage > organization-logos
- Verify uploaded logos appear
- Verify public access works (open logo URL in browser)

# Implementation log created at:
# specs/organization_settings_page/organization_settings_page_implementation.log

## Notes

**MVP Simplifications:**
- "Leave organization" button is disabled with tooltip (team features not functional in MVP)
- Delete organization: simplified logic, no ownership transfer checks (single-user scenario)
- Logo storage uses Supabase Storage (matches existing document upload pattern)
- All data stored in org.settings JSONB field (no schema migration required)

**Future Enhancements (post-MVP):**
- Multi-user: proper leave organization flow with last-admin checks
- Transfer ownership before delete
- Logo cropping/resizing UI
- Company profile: additional fields (team size, locations, website)
- Company profile: rich text editor for key projects section
- Version history for company profile changes

**Design Reference:**
- All UI must match org.png reference image exactly
- Green primary color: #1EB472
- Card-based layout with proper spacing
- Danger actions styled with red text
- Info banner for company profile section (cyan/blue background)

**Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md
- Test logo fixture: create `test_fixtures/sample-logo.png` (small test image)
- Don't delete real organization during testing (use test org or verify carefully)

**Key Files Created:**
1. `/app/(dashboard)/settings/page.tsx` - Main page
2. `/components/organization-profile-form.tsx` - Name/logo form
3. `/components/company-profile-form.tsx` - AI context form
4. `/components/delete-organization-dialog.tsx` - Delete confirmation
5. `/app/api/organizations/logo/route.ts` - Logo upload API
6. `/types/organization.ts` - Type definitions
7. `.claude/commands/e2e/test_organization_settings.md` - E2E test

## Research Documentation
No research sub-agents required. Implementation uses existing patterns from `/settings/documents` page and standard form/upload patterns already in codebase.
