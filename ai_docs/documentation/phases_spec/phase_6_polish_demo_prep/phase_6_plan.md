# Phase: Polish & Demo Prep

## Phase Description

Phase 6 transforms the functional MVP from Phase 5 into a production-quality demo application that matches TenderCreator's UI exactly. This phase focuses on: (1) fixing layout routing to remove nav/footer from product pages, (2) extracting and applying design tokens from TenderCreator reference screenshots (ui1.png, ui2.png) with isolation to ensure landing page styles remain unaffected, (3) implementing essential loading states and animations for smooth user experience, (4) adding error handling for critical paths (AI generation, file uploads), (5) creating empty states with helpful messaging, (6) setting up minimal demo data for consistent demos, (7) creating a markdown demo script checklist, (8) comprehensive UI validation via E2E tests, and (9) final polish pass ensuring zero crashes and professional appearance. Critical success: application indistinguishable from TenderCreator UI, flawless demo execution, landing page design completely preserved.

## Phase Objectives

- Fix layout routing: Remove marketing nav/footer from product pages (dashboard routes)
- Extract design tokens from TenderCreator screenshots without affecting landing page
- Implement scoped styling strategy (product pages isolated from marketing pages)
- Add essential loading states (spinners, progress indicators) to all async operations
- Implement page transitions and card hover effects (Framer Motion)
- Add error handling for critical paths: AI generation failures, file upload errors, network issues
- Create empty states with helpful messaging and call-to-action buttons
- Set up minimal demo data: 1 sample org doc, 1 pre-analyzed project
- Create markdown demo script checklist (8-10 minute walkthrough)
- Build comprehensive UI validation E2E test (split into two parts if needed)
- Validate zero regressions on landing page after design changes
- Ensure Chrome/Edge compatibility for demo
- Complete final polish pass: fix visual inconsistencies, ensure professional appearance

## Problem Statement

After Phase 5, the platform is functionally complete but lacks the polish required for a professional demo:

- **Layout routing issue:** Marketing nav/footer appearing on product pages (breaks UX, looks unprofessional)
- **Design mismatch:** Product pages use generic shadcn/ui defaults, not TenderCreator's specific design language (colors, spacing, typography don't match reference screenshots)
- **Style leakage risk:** Applying design changes might accidentally affect landing page (which is already finalized)
- **Missing feedback:** Users face blank screens during AI operations with no loading indicators (confusing, seems broken)
- **No error communication:** When operations fail, users see generic errors or silent failures (frustrating UX)
- **Empty states unclear:** New users see empty lists with no guidance on next steps (confusing)
- **Inconsistent demo:** No pre-populated data means every demo starts from scratch (time-consuming, inconsistent)
- **No demo script:** Risk of forgetting key features or getting stuck during presentation
- **Untested polish:** Visual changes might introduce regressions or break existing functionality

Without Phase 6, the demo will appear unfinished, amateur, and fail to impress TenderCreator stakeholders.

## Solution Statement

**1. Layout Routing Fix:**
Investigate current layout structure in `app/` directory. Product pages under `app/(dashboard)/` should use a separate layout (`app/(dashboard)/layout.tsx`) that excludes marketing nav/footer. Marketing pages under `app/(marketing)/` or root should use default layout with nav/footer. Verify route grouping is correctly configured. Test that navigation between landing page and product pages works without layout artifacts.

**2. Scoped Design Token Strategy:**
Create `app/(dashboard)/globals-dashboard.css` (or similar) containing product-specific design tokens extracted from TenderCreator screenshots. Import this CSS file ONLY in `app/(dashboard)/layout.tsx`, not in root layout. This ensures landing page (which imports `app/globals.css`) remains unaffected. Use CSS cascade/specificity to override shadcn/ui defaults within dashboard routes only. Extract design tokens via manual inspection: color picker on ui1.png/ui2.png for exact hex values, browser measurement tools for spacing/typography.

**3. Loading States:**
Add loading spinners to: project creation, RFT upload/analysis, work package generation (win themes, content), individual/bulk export. Use shadcn/ui Spinner component or Lucide-react Loader2 icon with animate-spin. Show progress text: "Analyzing RFT...", "Generating content...", "Exporting documents...". Add skeleton loaders (optional) for list views during data fetching.

**4. Essential Animations:**
Implement with Framer Motion: page transitions (fade-in on route change), card hover effects (subtle scale/shadow on work package cards), button interactions (scale on click). Keep animations subtle and fast (<300ms) to maintain professional feel.

**5. Error Handling:**
Wrap critical operations in try-catch with user-friendly error messages via toast notifications (shadcn/ui toast). Handle: AI generation timeout/failure ("AI generation failed. Please try again."), file upload failures ("Upload failed. Check file size/format."), network errors ("Network error. Check connection."), authentication errors (redirect to login with message). No error boundaries needed for MVP (Option A scope).

**6. Empty States:**
Add to: project list (no projects yet), work package list (analysis pending), document list (no uploads yet), organization documents (no company docs). Each empty state includes: icon, heading ("No projects yet"), description ("Create your first project to start responding to tenders"), CTA button ("Create Project").

**7. Demo Data Setup:**
Create database seed script or manual setup instructions. Includes: 1 sample organization document (capability statement PDF in test_fixtures), 1 pre-analyzed project with 8-10 work packages (some complete, some in-progress), realistic project name ("NSW Government Cloud Infrastructure RFT"). Documented setup process for repeatable demos.

**8. Demo Script:**
Markdown checklist covering: (1) Show org with uploaded docs (30s), (2) Create new project + upload RFT (1min), (3) Analyze RFT → document list appears (2min), (4) Show team assignment UI (30s), (5) Walk through one full document workflow (3-4min), (6) Show dashboard with multiple docs (1min), (7) Bulk export (1min), (8) Closing remarks (30s). Total: 8-10 minutes. Include talking points and screenshot references.

**9. UI Validation E2E Test:**
Create comprehensive E2E test validating: design tokens applied correctly, loading states appear/disappear, error states trigger appropriately, empty states display with correct messaging, animations work smoothly, layout routing correct (no nav/footer in product pages), landing page unaffected by design changes. Split into two test files if >1000 lines: `test_ui_validation_part1.md` (design tokens, loading states) and `test_ui_validation_part2.md` (errors, empty states, animations).

## Dependencies

### Previous Phases

**Phase 1 (Core Schema)** - Required:
- All database tables present and functional
- Supabase Storage configured
- Authentication working

**Phase 2 (AI Analysis)** - Required:
- RFT analysis creates multiple work packages
- Document decomposition functional

**Phase 3 (Dashboard)** - Required:
- Project dashboard exists and displays work packages
- Status tracking working

**Phase 4 (Single Workflow)** - Required:
- Complete document workflow functional
- All workflow screens present (requirements, strategy, generation, editing, export)

**Phase 5 (Multi-Document)** - Required:
- Multi-document orchestration working
- Bulk export functional
- Workflow navigation working
- All core features complete

### External Dependencies

**New npm packages:**
- `framer-motion` - Animation library for page transitions and hover effects

**Already installed:**
- `lucide-react` - Icons (including Loader2 for spinners)
- `react-hot-toast` or shadcn/ui toast - Toast notifications (check which is installed)
- All other dependencies present from previous phases

## Relevant Files

**Read these files to understand E2E test format:**
- `.claude/commands/test_e2e.md` - E2E test runner instructions and credentials
- `.claude/commands/e2e/test_basic_query.md` - Example E2E test format
- `.claude/commands/e2e/test_phase_5_multi_document.md` - Reference for comprehensive E2E testing

**UI Reference:**
- `ai_docs/ui_reference/ui1.png` - TenderCreator Team page (colors, typography, layout, sidebar)
- `ai_docs/ui_reference/ui2.png` - TenderCreator New Tender page (5-step progress, forms, upload zones)
- `ai_docs/ui_reference/README.md` - Design token extraction guidelines

**Existing layout files (to investigate/fix):**
- `app/layout.tsx` - Root layout (likely includes nav/footer)
- `app/(dashboard)/layout.tsx` - Dashboard layout (should NOT include nav/footer)
- `app/(marketing)/layout.tsx` or similar - Marketing layout (should include nav/footer)
- Check for route group configurations

**Existing product page files (to apply design tokens):**
- `app/(dashboard)/projects/page.tsx` - Project list page
- `app/(dashboard)/projects/[id]/page.tsx` - Project dashboard
- `app/(dashboard)/work-packages/[id]/page.tsx` - Work package workflow pages
- `components/workflow/*.tsx` - All workflow components
- `components/ui/*.tsx` - shadcn/ui components (may need theme overrides)

**Global styling files:**
- `app/globals.css` - Current global styles (DO NOT modify - affects landing page)
- `tailwind.config.ts` - Tailwind configuration (may need dashboard-specific extensions)

### New Files

**Styling & Design Tokens:**
- `app/(dashboard)/globals-dashboard.css` - Dashboard-scoped design tokens and styles
  - Extract colors, typography, spacing from TenderCreator screenshots
  - Override shadcn/ui defaults for dashboard routes only
  - Import ONLY in `app/(dashboard)/layout.tsx`

**Components (Loading States):**
- `components/ui/loading-spinner.tsx` - Reusable loading spinner component
  - Props: size ('sm' | 'md' | 'lg'), text (optional loading message)
  - Uses Lucide-react Loader2 icon with animate-spin

**Components (Empty States):**
- `components/empty-state.tsx` - Reusable empty state component
  - Props: icon, heading, description, ctaLabel, ctaAction
  - Consistent styling across all empty state uses

**Demo Setup:**
- `scripts/setup-demo-data.md` - Instructions for demo data setup
  - Manual steps or SQL script to create demo organization, project, work packages
  - References to test fixture files to upload

**Demo Documentation:**
- `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/demo_script.md` - Demo walkthrough checklist
  - Step-by-step demo script with timing
  - Talking points for each section
  - Screenshot references

**E2E Test Files:**
- `.claude/commands/e2e/test_ui_validation_part1.md` - UI validation tests (design tokens, loading states, layout)
- `.claude/commands/e2e/test_ui_validation_part2.md` - UI validation tests (errors, empty states, animations)
  - Note: Split only if combined test exceeds ~800-1000 lines. Otherwise, create single file: `test_ui_validation.md`

**Phase Documentation:**
- `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/phase_6_implementation.log` - Implementation tracking

**Design Token Documentation:**
- `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/design_tokens_extracted.md` - Document extracted design tokens
  - Colors (hex values), typography (font sizes, weights), spacing values
  - Reference screenshots with annotations

## Acceptance Criteria

**Layout & Routing:**
✓ Product pages (under `/projects`, `/work-packages`) do NOT show marketing nav/footer
✓ Landing page (under `/`) DOES show marketing nav/footer
✓ Navigation between landing page and dashboard works correctly
✓ Route grouping correctly configured in `app/` directory structure

**Design Tokens & UI Match:**
✓ Product pages match TenderCreator colors from ui1.png/ui2.png
✓ Typography (font sizes, weights) matches TenderCreator reference
✓ Spacing (padding, margins, gaps) matches TenderCreator reference
✓ Card styles match TenderCreator (rounded corners, shadows, borders)
✓ Button styles match TenderCreator (green primary, outlined secondary)
✓ Form inputs match TenderCreator (borders, focus states, placeholders)
✓ Sidebar navigation matches TenderCreator (icons, labels, active states)
✓ Progress indicators match TenderCreator (5-step design from ui2.png)
✓ Table designs match TenderCreator (headers, rows, spacing from ui1.png)
✓ Landing page styles completely unaffected by dashboard design tokens

**Loading States:**
✓ Project creation shows loading spinner with "Creating project..." message
✓ RFT upload shows loading during file processing
✓ "Analyze RFT" shows loading with "Analyzing RFT..." message (30-60s operation)
✓ Win themes generation shows loading spinner
✓ Content generation shows loading with progress message
✓ Individual export shows loading during Word generation
✓ Bulk export shows progress modal with "Exporting X documents..." message
✓ All loading states dismiss automatically on completion or error

**Animations:**
✓ Page transitions fade in smoothly (<300ms)
✓ Work package cards have hover effect (subtle scale or shadow)
✓ Button clicks have feedback (scale or ripple effect)
✓ Animations don't interfere with functionality or feel sluggish

**Error Handling:**
✓ AI generation failures show user-friendly toast notification with retry option
✓ File upload failures show clear error message with file size/format hints
✓ Network errors show "Connection error" toast with retry guidance
✓ Authentication errors redirect to login with message
✓ All errors logged to console for debugging
✓ No silent failures or blank error screens

**Empty States:**
✓ Project list empty state shows icon, message, "Create Project" button
✓ Work package list empty state (before analysis) shows helpful message
✓ Organization documents empty state shows "Upload documents" guidance
✓ Each empty state has consistent styling and clear call-to-action

**Demo Data:**
✓ Demo organization exists with 1 sample capability statement uploaded
✓ Demo project exists: "NSW Government Cloud Infrastructure RFT"
✓ Demo project has 8-10 work packages (from Phase 2 analysis)
✓ 2-3 work packages marked as complete with generated content
✓ 2-3 work packages in "in_progress" status
✓ Remaining work packages "not_started"
✓ Demo data setup documented and repeatable

**Demo Script:**
✓ Demo script covers all key features in 8-10 minutes
✓ Script includes timing estimates per section
✓ Talking points provided for each demo step
✓ Script references what to show on screen
✓ Script includes fallback plans for common issues

**E2E Validation:**
✓ UI validation E2E test passes completely
✓ Test validates design token application
✓ Test validates loading states appear/disappear correctly
✓ Test validates error states trigger appropriately
✓ Test validates empty states display correctly
✓ Test validates layout routing (no nav/footer in product pages)
✓ Test validates landing page unaffected
✓ All screenshots captured (per test specification)

**General Polish:**
✓ No console errors during normal operation
✓ No visual glitches or layout shifts
✓ Consistent styling across all product pages
✓ Professional appearance (looks polished, not rushed)
✓ Build succeeds without warnings
✓ Demo dry run completes without issues (3+ practice runs)
✓ Chrome/Edge compatibility validated

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Investigate and Fix Layout Routing

**Current issue:** Marketing nav/footer appearing on product pages.

**Investigation:**
- Read `app/layout.tsx` - identify if nav/footer components are rendered here
- Read `app/(dashboard)/layout.tsx` - verify it exists and doesn't import nav/footer
- Read `app/(marketing)/layout.tsx` (if exists) - verify nav/footer here
- Check directory structure: ensure route grouping correct

**Expected structure:**
```
app/
├── layout.tsx (root layout - minimal, loads globals.css)
├── (marketing)/
│   ├── layout.tsx (marketing layout with nav/footer)
│   └── page.tsx (landing page)
└── (dashboard)/
    ├── layout.tsx (dashboard layout WITHOUT nav/footer)
    ├── projects/
    └── work-packages/
```

**Fix actions:**
- If nav/footer in root `app/layout.tsx`: Move to `app/(marketing)/layout.tsx`
- If `app/(dashboard)/layout.tsx` missing: Create it with minimal layout (no nav/footer)
- If route groups missing: Create `(marketing)` and `(dashboard)` groups, move pages accordingly
- Update imports: Ensure each layout imports correct components

**Validation:**
- Navigate to `/` - should see nav/footer
- Navigate to `/projects` - should NOT see nav/footer
- Check console for errors

### 2. Extract Design Tokens from TenderCreator Screenshots

**Files to analyze:**
- `ai_docs/ui_reference/ui1.png` (Team page)
- `ai_docs/ui_reference/ui2.png` (New Tender page)

**Manual extraction process:**
1. Open ui1.png and ui2.png in image viewer or browser
2. Use color picker tool (system color picker or browser extension) to extract hex colors:
   - Green primary button color
   - Text colors (dark heading, medium body, light muted)
   - Background colors (white, light gray)
   - Border colors (gray borders, dashed upload zones)
   - Badge colors (green "CREATOR ROLE" badge)

3. Measure spacing visually (use ruler or estimate):
   - Card padding (appears ~24px)
   - Section gaps (appears ~32px)
   - Input padding (appears ~12px horizontal, ~8px vertical)
   - Button padding

4. Identify typography:
   - Font family (appears Inter or similar sans-serif)
   - Heading sizes (large page title, medium section headers, small labels)
   - Font weights (bold headings, regular body)

5. Note component styles:
   - Border radius (appears ~8px for cards/buttons)
   - Shadow styles (subtle shadows on cards)
   - Progress indicator design (green filled circle for active step, gray for inactive)
   - Sidebar active state (green background for active item)

**Document findings:**
Create `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/design_tokens_extracted.md` with:
- Color palette with hex values
- Typography scale
- Spacing scale
- Component styles
- Screenshots annotated with measurements (optional)

### 3. Create Dashboard-Scoped CSS File

**File:** `app/(dashboard)/globals-dashboard.css`

**Content structure:**

```css
/**
 * Dashboard-scoped design tokens
 * Extracted from TenderCreator UI reference (ui1.png, ui2.png)
 *
 * IMPORTANT: This file is imported ONLY in app/(dashboard)/layout.tsx
 * to ensure landing page styles remain unaffected.
 */

/* Color Overrides (extracted from screenshots) */
:root {
  /* Primary brand color (green from screenshots) */
  --dashboard-primary: #10B981; /* Adjust based on extracted value */
  --dashboard-primary-foreground: #FFFFFF;

  /* Text colors */
  --dashboard-text-primary: #1F2937; /* Dark headings */
  --dashboard-text-secondary: #6B7280; /* Medium body text */
  --dashboard-text-muted: #9CA3AF; /* Light gray hints */

  /* Backgrounds */
  --dashboard-bg-white: #FFFFFF;
  --dashboard-bg-gray-50: #F9FAFB;
  --dashboard-bg-sidebar: #FFFFFF; /* Sidebar background */

  /* Borders */
  --dashboard-border: #E5E7EB; /* Standard borders */
  --dashboard-border-dashed: #D1D5DB; /* Dashed upload zones */

  /* Success/Status colors */
  --dashboard-success: #10B981; /* Green badges */
  --dashboard-warning: #F59E0B; /* Yellow in-progress */
  --dashboard-muted: #6B7280; /* Gray not-started */

  /* Shadows */
  --dashboard-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --dashboard-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* Spacing (override if needed) */
  --dashboard-card-padding: 1.5rem; /* 24px */
  --dashboard-section-gap: 2rem; /* 32px */

  /* Typography */
  --dashboard-font-sans: 'Inter', system-ui, sans-serif;
}

/* Apply to all dashboard routes */
.dashboard-layout {
  font-family: var(--dashboard-font-sans);
  color: var(--dashboard-text-primary);
}

/* Override shadcn/ui Button primary variant */
.dashboard-layout .bg-primary {
  background-color: var(--dashboard-primary) !important;
}

.dashboard-layout .text-primary {
  color: var(--dashboard-primary) !important;
}

.dashboard-layout .border-primary {
  border-color: var(--dashboard-primary) !important;
}

/* Card styling to match TenderCreator */
.dashboard-layout .card {
  border-radius: 0.5rem; /* 8px */
  box-shadow: var(--dashboard-shadow-sm);
  border: 1px solid var(--dashboard-border);
}

/* Sidebar active state (green background) */
.dashboard-layout .sidebar-item-active {
  background-color: rgba(16, 185, 129, 0.1); /* Light green */
  color: var(--dashboard-primary);
  border-left: 3px solid var(--dashboard-primary);
}

/* Progress indicator (5-step from ui2.png) */
.dashboard-layout .progress-step-active {
  background-color: var(--dashboard-primary);
  color: white;
}

.dashboard-layout .progress-step-inactive {
  background-color: var(--dashboard-bg-gray-50);
  color: var(--dashboard-text-muted);
}

/* Upload zone dashed border (from ui2.png) */
.dashboard-layout .upload-zone {
  border: 2px dashed var(--dashboard-border-dashed);
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  background-color: var(--dashboard-bg-gray-50);
  transition: border-color 0.2s ease;
}

.dashboard-layout .upload-zone:hover {
  border-color: var(--dashboard-primary);
}

/* Table styling (from ui1.png) */
.dashboard-layout table {
  border: 1px solid var(--dashboard-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.dashboard-layout thead {
  background-color: var(--dashboard-bg-gray-50);
  border-bottom: 1px solid var(--dashboard-border);
}

.dashboard-layout th {
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: left;
  color: var(--dashboard-text-secondary);
}

.dashboard-layout td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--dashboard-border);
}

/* Role badges (from ui1.png) */
.dashboard-layout .badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.dashboard-layout .badge-green {
  background-color: var(--dashboard-primary);
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-layout {
    --dashboard-card-padding: 1rem;
    --dashboard-section-gap: 1.5rem;
  }
}
```

**Notes:**
- Adjust color hex values based on actual extraction from screenshots
- Use CSS custom properties for easy theme switching
- `!important` used sparingly to override shadcn/ui defaults
- `.dashboard-layout` class scopes all styles to dashboard routes only

### 4. Update Dashboard Layout to Import Scoped CSS

**File:** `app/(dashboard)/layout.tsx`

**Changes:**

```typescript
import '@/app/(dashboard)/globals-dashboard.css' // Add this import

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout"> {/* Add this wrapper class */}
      {/* Existing sidebar/header components for dashboard */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r">
          {/* Sidebar navigation */}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Key points:**
- Import dashboard CSS at top
- Wrap layout content in `dashboard-layout` class to scope styles
- Do NOT import globals.css here (already imported in root layout)
- Verify sidebar and main content structure exists

### 5. Validate Landing Page Unaffected

**Manual validation:**
1. Start dev server: `npm run dev`
2. Navigate to landing page: `http://localhost:3000`
3. Inspect styles in browser DevTools:
   - Verify landing page colors unchanged
   - Verify landing page typography unchanged
   - Verify landing page layout unchanged
4. Click any landing page buttons/links - verify styling correct
5. Navigate to dashboard (`/projects`) - verify new styles applied
6. Navigate back to landing page - verify no style pollution

**If landing page affected:**
- Check for CSS specificity issues
- Ensure `.dashboard-layout` class wrapping all dashboard overrides
- Verify `globals-dashboard.css` NOT imported in root layout
- Use browser DevTools to identify conflicting styles

---
✅ CHECKPOINT: Steps 1-5 complete (Layout & Design Tokens). Continue to step 6.
---

### 6. Install Framer Motion for Animations

**Command:**
```bash
npm install framer-motion
```

**Verify:**
- Check package.json for framer-motion
- Run `npm run build` to ensure no conflicts

### 7. Create Reusable Loading Spinner Component

**File:** `components/ui/loading-spinner.tsx`

```typescript
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function LoadingSpinner({
  size = 'md',
  text,
  className
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

// Full-page loading overlay variant
export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <LoadingSpinner size="lg" text={text || 'Loading...'} />
      </div>
    </div>
  )
}
```

**Export in `components/ui/index.ts`** (if exists)

### 8. Add Loading States to Critical Operations

**File:** `app/(dashboard)/projects/page.tsx` - Project Creation

```typescript
'use client'

import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ProjectsPage() {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateProject = async (data: any) => {
    setIsCreating(true)
    try {
      // Existing project creation logic
      await createProject(data)
    } catch (error) {
      // Error handling (see step 11)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div>
      {/* Existing UI */}

      {isCreating && <LoadingSpinner text="Creating project..." />}

      <Button onClick={handleCreateProject} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Project'}
      </Button>
    </div>
  )
}
```

**Similar patterns for:**
- `app/(dashboard)/projects/[id]/page.tsx` - "Analyze RFT" button
  - Add `isAnalyzing` state
  - Show `LoadingSpinner` with "Analyzing RFT..." during analysis (30-60s operation)

- `components/workflow/strategy-screen.tsx` - Win themes generation
  - Add `isGenerating` state
  - Show spinner with "Generating win themes..."

- `components/workflow/generation-screen.tsx` - Content generation
  - Add `isGenerating` state
  - Show spinner with "Generating content... This may take 1-2 minutes."

- `components/workflow/export-screen.tsx` - Individual export
  - Add `isExporting` state
  - Show spinner with "Exporting document..."

- `components/bulk-export-button.tsx` - Already has progress modal (verify message clear)

**Key principles:**
- Always pair loading state with disabled button/form
- Show descriptive text explaining what's happening
- Auto-dismiss loading state on completion or error
- Use `LoadingOverlay` for full-page blocking operations (like RFT analysis)

### 9. Create Reusable Empty State Component

**File:** `components/empty-state.tsx`

```typescript
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  description: string
  ctaLabel?: string
  ctaAction?: () => void
}

export function EmptyState({
  icon: Icon,
  heading,
  description,
  ctaLabel,
  ctaAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{heading}</h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {ctaLabel && ctaAction && (
        <Button onClick={ctaAction}>
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
```

### 10. Add Empty States to Key Pages

**File:** `app/(dashboard)/projects/page.tsx` - No projects

```typescript
import { FolderOpen } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

export default async function ProjectsPage() {
  const projects = await getProjects()

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        heading="No projects yet"
        description="Create your first project to start responding to tenders. Upload RFT documents and let AI analyze submission requirements."
        ctaLabel="Create Project"
        ctaAction={() => router.push('/projects/new')}
      />
    )
  }

  return <div>{/* Existing project list */}</div>
}
```

**File:** `app/(dashboard)/projects/[id]/page.tsx` - No work packages (before analysis)

```typescript
import { FileQuestion } from 'lucide-react'

// In project dashboard, if no work packages yet:
{workPackages.length === 0 && (
  <EmptyState
    icon={FileQuestion}
    heading="Analysis pending"
    description="Click 'Analyze RFT' to identify all required submission documents. AI will extract requirements for each document type."
    ctaLabel="Analyze RFT"
    ctaAction={handleAnalyzeRFT}
  />
)}
```

**File:** `app/(dashboard)/organization/documents/page.tsx` (or similar) - No org docs

```typescript
import { Upload } from 'lucide-react'

{documents.length === 0 && (
  <EmptyState
    icon={Upload}
    heading="No company documents"
    description="Upload your organization's capability statements, case studies, certifications, and project examples. These will be used as knowledge base for tender responses."
    ctaLabel="Upload Documents"
    ctaAction={() => setShowUploadDialog(true)}
  />
)}
```

**Identify other empty states:**
- Review all list views in product pages
- Add EmptyState component where data might be empty initially
- Ensure consistent messaging and CTAs

### 11. Add Error Handling with Toast Notifications

**Check if toast library installed:**
- Look for `react-hot-toast` or `sonner` in package.json
- OR check if shadcn/ui toast component exists: `components/ui/toast.tsx`, `components/ui/use-toast.ts`

**If shadcn/ui toast exists** (preferred):
Use existing implementation.

**If not installed:**
```bash
npx shadcn@latest add toast
```

**Create error handling utility:**

**File:** `lib/error-handler.ts`

```typescript
import { toast } from '@/components/ui/use-toast'

export function handleError(error: unknown, context?: string) {
  console.error(`[Error${context ? ` in ${context}` : ''}]:`, error)

  const message = error instanceof Error ? error.message : 'An unexpected error occurred'

  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  })
}

export function showSuccessToast(message: string) {
  toast({
    title: 'Success',
    description: message,
  })
}
```

**Apply error handling to critical operations:**

**File:** `app/(dashboard)/projects/[id]/page.tsx` - Analyze RFT

```typescript
import { handleError, showSuccessToast } from '@/lib/error-handler'

const handleAnalyzeRFT = async () => {
  setIsAnalyzing(true)
  try {
    const response = await fetch(`/api/projects/${projectId}/analyze`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error('Analysis failed. Please try again.')
    }

    showSuccessToast('RFT analysis complete')
    router.refresh()
  } catch (error) {
    handleError(error, 'RFT Analysis')
  } finally {
    setIsAnalyzing(false)
  }
}
```

**File:** `components/workflow/generation-screen.tsx` - Content generation

```typescript
const handleGenerate = async () => {
  setIsGenerating(true)
  try {
    const response = await fetch(`/api/work-packages/${workPackageId}/generate-content`, {
      method: 'POST'
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Content generation failed')
    }

    showSuccessToast('Content generated successfully')
    // Update state with generated content
  } catch (error) {
    handleError(error, 'Content Generation')
    // Allow user to retry (button stays enabled)
  } finally {
    setIsGenerating(false)
  }
}
```

**File:** File upload components - Upload errors

```typescript
const handleFileUpload = async (file: File) => {
  // Validate file size
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    toast({
      title: 'File too large',
      description: 'Please upload a file smaller than 10MB.',
      variant: 'destructive',
    })
    return
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    toast({
      title: 'Invalid file type',
      description: 'Please upload a PDF or Word document.',
      variant: 'destructive',
    })
    return
  }

  setIsUploading(true)
  try {
    // Upload logic
    const response = await uploadFile(file)

    if (!response.ok) {
      throw new Error('Upload failed. Please check your connection and try again.')
    }

    showSuccessToast('File uploaded successfully')
  } catch (error) {
    handleError(error, 'File Upload')
  } finally {
    setIsUploading(false)
  }
}
```

**Network error handling:**
Add global error boundary or fetch wrapper to catch network errors and show user-friendly messages.

---
✅ CHECKPOINT: Steps 6-11 complete (Loading States, Empty States, Error Handling). Continue to step 12.
---

### 12. Implement Essential Animations

**File:** Create animation utilities - `lib/animations.ts`

```typescript
import { Variants } from 'framer-motion'

// Page transition (fade in)
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
}

// Card hover effect
export const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: { duration: 0.2 }
  },
}

// Button press effect
export const buttonPress = {
  whileTap: { scale: 0.97 },
}

// Stagger children (for lists)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
}
```

**Apply page transitions:**

**File:** `app/(dashboard)/projects/page.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import { pageTransition } from '@/lib/animations'

export default function ProjectsPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      {/* Existing page content */}
    </motion.div>
  )
}
```

**Apply to other key pages:**
- `app/(dashboard)/projects/[id]/page.tsx`
- `app/(dashboard)/work-packages/[id]/page.tsx`
- All workflow screens

**Apply card hover effects:**

**File:** Component rendering work package cards

```typescript
import { motion } from 'framer-motion'
import { cardHover } from '@/lib/animations'

// In work package card component:
<motion.div
  initial="rest"
  whileHover="hover"
  variants={cardHover}
  className="card p-6 cursor-pointer"
  onClick={handleOpenWorkPackage}
>
  {/* Card content */}
</motion.div>
```

**Apply button press effects:**

```typescript
import { motion } from 'framer-motion'
import { buttonPress } from '@/lib/animations'

// Wrap buttons with motion (or create animated Button component):
<motion.button
  {...buttonPress}
  className="btn"
>
  Click Me
</motion.button>
```

**Optional: List stagger animation**

If time permits, apply to project list or work package list:

```typescript
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'

<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {projects.map(project => (
    <motion.div key={project.id} variants={staggerItem}>
      <ProjectCard project={project} />
    </motion.div>
  ))}
</motion.div>
```

**Performance note:**
- Keep animations under 300ms to feel snappy
- Avoid animating expensive properties (width, height)
- Use `transform` and `opacity` for best performance
- Test on slower devices if possible

### 13. Set Up Demo Data

**Approach:** Manual database setup OR SQL script (depending on preference)

**Option A: Manual Setup (Recommended for MVP)**

Create documentation file:

**File:** `scripts/setup-demo-data.md`

````markdown
# Demo Data Setup Guide

Follow these steps to set up demo data for consistent presentations.

## Prerequisites
- Application running locally (`npm run dev`)
- Access to Supabase dashboard (or direct database access)
- Test fixtures available: `test_fixtures/sample_company_doc.pdf`, `test_fixtures/sample_rft_multi_document.txt`

## Setup Steps

### 1. Create Demo Organization (if not exists)
Organization already exists from E2E tests:
- Org ID: `887e21fd-d6ea-4770-803d-c5dcdad8bcf2`
- Name: "Test Organization"
- Skip this step if using existing test org.

### 2. Upload Sample Organization Document

1. Sign in to application: test@tendercreator.dev / TestPass123!
2. Navigate to "Company" or "Organization Documents" page
3. Upload file: `test_fixtures/sample_company_doc.pdf`
   - Name: "Company Capability Statement"
   - Category: "Capability Statement" (if applicable)
4. Wait for text extraction to complete
5. Verify document appears in list

### 3. Create Demo Project

1. Click "Create Project" or "Create new tender"
2. Fill form:
   - Name: "NSW Government Cloud Infrastructure RFT"
   - Client: "NSW Department of Customer Service"
   - Deadline: [Date 2 weeks from now]
3. Save project
4. Navigate to project details page

### 4. Upload RFT Documents

1. In project details, upload RFT:
   - File: `test_fixtures/sample_rft_multi_document.txt` (or sample_rft.pdf)
   - Mark as "Primary RFT"
2. Wait for text extraction
3. Verify file appears in project documents list

### 5. Analyze RFT

1. Click "Analyze RFT" button
2. Wait 30-60 seconds for AI analysis
3. Verify 8-10 work packages created with names like:
   - Technical Specification
   - Bill of Quantities
   - Project Methodology
   - Risk Register
   - Work Health & Safety Plan
   - Quality Management Plan
   - Environmental Management Plan
   - Subcontractor Management Plan
   - Company Profile
   - Insurance Certificates

### 6. Complete 2-3 Work Packages

**Work Package 1: Technical Specification**
1. Click "Open" on "Technical Specification" work package
2. Navigate through workflow:
   - Strategy tab: Click "Generate Win Themes" (wait 10-15s)
   - Generation tab: Click "Generate Content" (wait 30-90s)
   - Editing tab: Make minor edit (add a sentence)
   - Export tab: Click "Export as Word"
3. Verify status changes to "Completed" (green badge)

**Work Package 2: Bill of Quantities**
1. Open "Bill of Quantities" work package
2. Complete same workflow (strategy → generation → export)
3. Verify status "Completed"

**Work Package 3 (optional): Risk Register**
1. Open "Risk Register"
2. Complete workflow through export
3. Verify status "Completed"

### 7. Set 1-2 Work Packages to "In Progress"

**Work Package: Project Methodology**
1. Open "Project Methodology"
2. Complete strategy and generation tabs
3. Save content in editing tab
4. DO NOT export (leave status as "in_progress")

**Optional: Quality Management Plan**
1. Open work package
2. Complete strategy tab only
3. Leave status "in_progress"

### 8. Verify Demo Data Ready

Return to project dashboard and verify:
- 2-3 work packages: Status "Completed" (green badges)
- 1-2 work packages: Status "In Progress" (yellow/orange badges)
- Remaining work packages: Status "Not Started" (gray badges)

**Expected state for demo:**
```
Technical Specification: ✅ Completed
Bill of Quantities: ✅ Completed
Risk Register: ✅ Completed (optional)
Project Methodology: ⏳ In Progress
Quality Management Plan: ⏳ In Progress (optional)
WHS Plan: ⭕ Not Started
Environmental Plan: ⭕ Not Started
Subcontractor Plan: ⭕ Not Started
Company Profile: ⭕ Not Started
Insurance Certificates: ⭕ Not Started
```

## Verification Checklist

- [ ] Organization has 1 uploaded document (capability statement)
- [ ] Demo project exists: "NSW Government Cloud Infrastructure RFT"
- [ ] Project has RFT document uploaded
- [ ] Project has 8-10 work packages
- [ ] 2-3 work packages are completed (green)
- [ ] 1-2 work packages are in-progress (yellow)
- [ ] Dashboard shows aggregate progress (e.g., "3 of 10 completed")
- [ ] "Export All Completed" button visible with correct count

## Demo Reset (Between Presentations)

If you need to reset demo data:
1. DO NOT delete organization or project (keep structure)
2. Reset work package statuses to "not_started" via database (if needed)
3. Delete generated content from work_package_content table
4. Re-run steps 6-7 to recreate completed/in-progress states

## Troubleshooting

**Issue:** RFT analysis creates fewer than 8 work packages
- **Solution:** Check `sample_rft_multi_document.txt` has detailed requirements for each document type
- **Solution:** Regenerate analysis or manually add work packages

**Issue:** Content generation fails
- **Solution:** Check Gemini API key configured
- **Solution:** Check network connection
- **Solution:** Retry generation

**Issue:** Export fails
- **Solution:** Check Supabase Storage configured
- **Solution:** Check docx library installed
- **Solution:** Check browser console for errors
````

### 14. Create Demo Script

**File:** `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/demo_script.md`

````markdown
# Demo Script: Multi-Document Tender Response Platform

**Duration:** 8-10 minutes
**Audience:** TenderCreator stakeholders
**Goal:** Demonstrate multi-document capability as competitive differentiator

## Pre-Demo Checklist

- [ ] Demo data set up (see `scripts/setup-demo-data.md`)
- [ ] Application running at http://localhost:3000
- [ ] Signed in as test@tendercreator.dev
- [ ] Browser window maximized (1920x1080 or larger)
- [ ] Browser DevTools closed
- [ ] Project dashboard open and ready
- [ ] Presentation mode ready (if sharing screen)

## Demo Flow

### Act 1: Introduction & Context (30 seconds)

**Talking Points:**
- "Current tender tools like TenderCreator and AutogenAI generate ONE document per tender"
- "But real-world tenders require 5-15+ different documents: Technical Specs, Bill of Quantities, Risk Registers, Methodology, WHS Plans, etc."
- "This forces teams to manually split work or create everything in one bloated document"
- "Our platform solves this with true multi-document orchestration"

**Action:** None yet (just talking)

---

### Act 2: Show Organization Setup (30 seconds)

**Screen:** Organization Documents page (or Company page)

**Talking Points:**
- "We start by building our organization's knowledge base"
- "Upload capability statements, case studies, certifications, past projects"
- "AI will use these as evidence when responding to tenders"

**Action:**
- Show organization documents list (1 sample doc uploaded)
- Highlight document name: "Company Capability Statement"
- "This is available across all tenders"

---

### Act 3: Create New Project (1 minute)

**Screen:** Projects list page

**Talking Points:**
- "Now let's respond to a new tender"
- "Creating a project is simple"

**Actions:**
1. Click "Create Project" or "Create new tender" button
2. Fill form:
   - Name: "Brisbane City Council IT Services RFT" (or any new name)
   - Client: "Brisbane City Council"
   - Deadline: [Pick date 2 weeks out]
3. Click "Create"
4. Navigate to project details page

**Talking Points:**
- "Once created, we upload the RFT documents"

**Actions:**
5. Click "Upload RFT" or drag-drop RFT file
6. Select `sample_rft_multi_document.txt` or sample PDF
7. Wait for upload (should be quick, ~2 seconds)
8. "File uploaded and text extracted automatically"

---

### Act 4: The Magic - Document Decomposition (2 minutes)

**Screen:** Project details page with "Analyze RFT" button

**Talking Points:**
- "Here's where our platform differentiates"
- "Instead of generating one document, we analyze the RFT to identify ALL required submissions"

**Actions:**
1. Click "Analyze RFT" button
2. Show loading state: "Analyzing RFT..." (30-60 seconds)
3. Wait for analysis to complete

**Talking Points (while waiting):**
- "Our AI is reading through the RFT"
- "Identifying every document type required for submission"
- "Extracting specific requirements for each document"
- "This takes about 30-60 seconds"

**KEY MOMENT - Document List Appears:**

**Screen:** Document Requirements Matrix showing 8-10 work packages

**Talking Points (enthusiastically):**
- "And there we have it - 10 different documents identified:"
- Read a few: "Technical Specification, Bill of Quantities, Methodology, Risk Register, WHS Plan..."
- "Each with its own specific requirements extracted from the RFT"
- "Current tools would make you create ONE document. We identified TEN."

**Actions:**
4. Expand one work package row to show requirements list
5. Highlight requirements: "8 mandatory requirements for Technical Specification"
6. "AI extracted these from specific sections of the RFT"

---

### Act 5: Team Assignment (30 seconds)

**Screen:** Same document list with assignment dropdowns

**Talking Points:**
- "Now we can assign documents to different team members"
- "Everyone works in parallel, not sequentially"

**Actions:**
1. Show assignment dropdown (even if UI-only for MVP)
2. "John handles Technical Spec, Sarah does Bill of Quantities, I'll take Methodology"
3. Click "Continue to Dashboard" or navigate to project dashboard

**Screen:** Project dashboard showing work packages as cards

**Talking Points:**
- "Dashboard shows all documents and their status"
- "Some are complete, some in progress, some not started"

---

### Act 6: Document Workflow Deep-Dive (3-4 minutes)

**Screen:** Project dashboard

**Talking Points:**
- "Let's walk through completing one document end-to-end"
- "We'll use the same proven workflow TenderCreator has, just for each document separately"

**Actions:**
1. Click "Open" on a "Not Started" work package (e.g., "WHS Plan")

**Screen:** Work package workflow - Requirements tab

**Talking Points:**
- "Phase 1: Review requirements"
- "These are the specific requirements for THIS document, extracted from the RFT"

**Actions:**
2. Scroll through requirements list briefly
3. Click "Continue to Strategy" or navigate to Strategy tab

**Screen:** Strategy tab

**Talking Points:**
- "Phase 2: Generate win themes"
- "AI analyzes requirements + our company docs to identify competitive advantages"

**Actions:**
4. Click "Generate Win Themes"
5. Wait 10-15 seconds (show loading spinner)
6. Win themes appear (3-5 themes)
7. Read one aloud: "Proven track record in government cloud migrations"
8. "These will be woven into our response"

**Actions:**
9. Click "Continue to Generation" or navigate to Generation tab

**Screen:** Generation tab

**Talking Points:**
- "Phase 3: AI generates the full document"
- "Uses: requirements from RFT, win themes, our company knowledge base"
- "This is the time-saving magic"

**Actions:**
10. Click "Generate Content"
11. Show loading state: "Generating content... This may take 1-2 minutes."
12. Wait 30-90 seconds (KEEP TALKING during this)

**Talking Points (while waiting):**
- "AI is writing comprehensive WHS Plan content"
- "Pulling evidence from our capability statement"
- "Addressing each mandatory requirement"
- "Incorporating our win themes naturally"
- "In production, this might take 1-2 minutes for complex documents"

**Content appears**

**Talking Points:**
- "And there's our first draft - fully formatted, comprehensive WHS Plan"
- Scroll through content briefly
- "Addresses all requirements, demonstrates our capabilities"

**Actions:**
13. Navigate to Editing tab (or show editor if same screen)

**Screen:** Content editor with AI assistance

**Talking Points:**
- "Phase 4: Intelligent editing - this is really cool"
- "Not just a text editor - AI-powered refinement"

**Actions:**
14. Select a paragraph of text
15. Show AI actions menu: "Expand, Shorten, Add Evidence, Check Compliance, Rephrase"
16. Click "Add Evidence"
17. Wait 5-10 seconds
18. AI inserts relevant case study from company docs

**Talking Points:**
- "AI pulled a relevant case study from our knowledge base"
- "Strengthens our response with concrete evidence"
- "Team can do this for any section - expand, add evidence, check compliance"

**Actions:**
19. Navigate to Export tab

**Screen:** Export screen

**Talking Points:**
- "Phase 5: Export finished document"

**Actions:**
20. Click "Export as Word"
21. Wait for download (should be quick, ~5 seconds)
22. Word file downloads

**Talking Points:**
- "Professional Word document, ready for submission"
- "Document marked as complete"

---

### Act 7: Scale - Multi-Document Dashboard (1 minute)

**Screen:** Return to project dashboard

**Talking Points:**
- "Now imagine doing that for ALL 10 documents"
- "Each follows the same workflow: requirements, strategy, generate, edit, export"
- "Team works in parallel on different documents"

**Actions:**
1. Show dashboard with multiple documents in various states
2. Point out: "3 completed (green), 2 in progress (yellow), 5 not started (gray)"
3. Highlight progress: "3 of 10 documents completed"

**Talking Points:**
- "When all documents are done, bulk export"

**Actions:**
4. Scroll to "Export All Completed" button
5. Show count: "Export All Completed (3)"
6. Click button
7. Show progress modal: "Exporting 3 documents..."
8. Wait for ZIP download (~5-10 seconds)
9. ZIP file downloads

**Talking Points:**
- "One ZIP file with all completed documents"
- "Ready for tender submission"
- "Each file properly named: TechnicalSpecification_ProjectName.docx"

---

### Act 8: Closing (30 seconds)

**Screen:** Dashboard or landing page

**Talking Points:**
- "This is how tenders actually work - multiple documents, not one"
- "Current tools force workarounds. We built for the real workflow."
- "Built on modern stack: Next.js, Gemini AI, Supabase"
- "Matches TenderCreator's design language - we can integrate seamlessly"
- "Ready to enhance TenderCreator with this capability"

**Call to Action:**
- "Questions?"
- "Happy to show specific features in detail"
- "Or dive into the technical architecture"

---

## Fallback Plans

### If RFT Analysis Fails
- **Fallback:** Use pre-analyzed demo project (already has 10 work packages)
- **Explain:** "In our demo environment, let me show you a project we analyzed earlier"
- Continue from Act 5

### If Content Generation Fails
- **Fallback:** Use pre-completed work package (with content already generated)
- **Explain:** "For time, let me show you one we generated earlier"
- Show editing and export only

### If Export Fails
- **Fallback:** Skip export, show completed work package content
- **Explain:** "In production, this exports to Word. Let me show you the dashboard instead"

### If Network/API Issues
- **Fallback:** Show screenshots from `test_results/` directory
- **Explain:** "Experiencing network issues - here are screenshots from our testing"

## Post-Demo Q&A Preparation

**Anticipated Questions:**

**Q: How accurate is the document identification?**
- A: "Very accurate for standard tenders. Gemini 2.5 Flash identifies 90%+ of required documents. Users can manually add/remove if needed. We have a validation step."

**Q: How long does content generation really take?**
- A: "30 seconds to 2 minutes per document, depending on complexity. Total time for 10 documents: 10-20 minutes with AI, vs days manually."

**Q: Can multiple users actually work in parallel?**
- A: "UI shows the concept. Full multi-user with real-time collaboration is Phase 7. For MVP, single user can complete all documents sequentially."

**Q: What about compliance checking?**
- A: "Built-in: AI checks each section against extracted requirements. Editor has 'Check Compliance' action. Ensures nothing missed."

**Q: How do you handle different tender formats?**
- A: "Works with any RFT format: PDF, Word, text. AI reads content, identifies structure. Tested with government, corporate, and construction tenders."

**Q: Integration with existing TenderCreator?**
- A: "Built to match your design language. We can integrate as a feature module. Separate microservice or monolithic integration - flexible."

## Technical Setup Notes

- **Browser:** Chrome or Edge (tested)
- **Screen Resolution:** 1920x1080 or higher
- **Internet:** Required for Gemini API calls
- **Timing:** Practice 3x to get under 10 minutes
- **Screenshots:** Capture during practice run for backup slides
````

### 15. Document Extracted Design Tokens

**File:** `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/design_tokens_extracted.md`

```markdown
# Extracted Design Tokens from TenderCreator

Design tokens extracted from UI reference screenshots (ui1.png, ui2.png) for dashboard styling.

## Color Palette

**Primary Brand Color:**
- Green (primary buttons, badges, active states): `#10B981` (estimated)
- Green hover: `#059669` (darker)
- Green light (backgrounds): `rgba(16, 185, 129, 0.1)`

**Text Colors:**
- Primary text (headings, labels): `#1F2937`
- Secondary text (body, descriptions): `#6B7280`
- Muted text (hints, placeholders): `#9CA3AF`

**Background Colors:**
- White (cards, main background): `#FFFFFF`
- Light gray (table headers, hover): `#F9FAFB`
- Off-white (page background): `#FAFAFA`

**Border Colors:**
- Standard borders: `#E5E7EB`
- Dashed borders (upload zones): `#D1D5DB`

**Status Colors:**
- Success/Complete (green): `#10B981`
- Warning/In-Progress (yellow): `#F59E0B`
- Muted/Not-Started (gray): `#6B7280`
- Error/Destructive (red): `#EF4444`

## Typography

**Font Family:**
- Sans-serif (appears to be Inter or similar): `'Inter', system-ui, sans-serif`
- Fallback: `system-ui, -apple-system, sans-serif`

**Font Sizes:**
- Extra large (page titles): `2.25rem` (36px)
- Large (section headers): `1.5rem` (24px)
- Medium (card titles): `1.125rem` (18px)
- Base (body text): `1rem` (16px) or `0.875rem` (14px)
- Small (labels, hints): `0.875rem` (14px)
- Extra small (badges): `0.75rem` (12px)

**Font Weights:**
- Bold (headings): `700`
- Semibold (labels, card titles): `600`
- Medium (button text): `500`
- Regular (body text): `400`

## Spacing Scale

**Card Padding:**
- Default card padding: `1.5rem` (24px)
- Dense card padding: `1rem` (16px)

**Section Spacing:**
- Between major sections: `2rem` (32px)
- Between subsections: `1.5rem` (24px)

**Form Elements:**
- Input padding horizontal: `0.75rem` (12px)
- Input padding vertical: `0.5rem` (8px)
- Input gap (label to input): `0.5rem` (8px)

**Grid/List Spacing:**
- Gap between cards: `1.5rem` (24px)
- Gap between list items: `1rem` (16px)
- Gap in flex layouts: `0.5rem` (8px)

## Component Styles

**Border Radius:**
- Cards, buttons, inputs: `0.5rem` (8px)
- Small elements (badges): `0.375rem` (6px)
- Large cards: `0.75rem` (12px)

**Shadows:**
- Card shadow (subtle): `0 1px 3px rgba(0, 0, 0, 0.1)`
- Card hover shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Modal shadow: `0 10px 25px rgba(0, 0, 0, 0.2)`

**Borders:**
- Standard border width: `1px`
- Active/Focus border width: `2px`
- Dashed border (upload zones): `2px dashed`

## Specific Component Patterns

**Progress Indicator (5-step from ui2.png):**
- Active step: Green circle with white number, green underline
- Inactive step: Gray circle with gray number, gray underline
- Step size: `2.5rem` (40px) circle
- Number font size: `1rem` (16px) bold

**Sidebar Navigation (from ui1.png):**
- Item height: `2.5rem` (40px)
- Item padding: `0.75rem` (12px) horizontal
- Active state: Light green background, green text, green left border (3px)
- Hover state: Light gray background
- Icon size: `1.25rem` (20px)

**Table (from ui1.png):**
- Header background: Light gray (`#F9FAFB`)
- Header padding: `0.75rem 1rem` (12px 16px)
- Cell padding: `0.75rem 1rem` (12px 16px)
- Border: 1px solid light gray
- Border radius: `0.5rem` (8px) on table container

**Upload Zone (dashed border from ui2.png):**
- Border: `2px dashed #D1D5DB`
- Border radius: `0.5rem` (8px)
- Padding: `2rem` (32px)
- Background: Light gray (`#F9FAFB`)
- Hover border color: Green (`#10B981`)

**Badges (from ui1.png "CREATOR ROLE"):**
- Padding: `0.25rem 0.75rem` (4px 12px)
- Border radius: `0.375rem` (6px)
- Font size: `0.75rem` (12px)
- Font weight: `600` (semibold)
- Text transform: Uppercase
- Green badge: Background `#10B981`, text white

## Applying Design Tokens

**In globals-dashboard.css:**
- Define all colors as CSS custom properties
- Use consistent spacing scale
- Match component styles exactly

**Verification:**
- Compare dashboard side-by-side with ui1.png/ui2.png
- Use browser color picker to validate colors
- Measure elements to validate spacing
- Test hover/active states
```

---
✅ CHECKPOINT: Steps 12-15 complete (Animations, Demo Data, Demo Script, Design Tokens). Continue to step 16.
---

### 16. Create UI Validation E2E Test (Part 1)

**File:** `.claude/commands/e2e/test_ui_validation_part1.md`

```markdown
# E2E Test: UI Validation Part 1 - Design Tokens & Loading States

Test that Phase 6 design token application matches TenderCreator UI and loading states work correctly.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## Test Objectives

- Validate design tokens applied to product pages
- Verify landing page unaffected by dashboard styling
- Test layout routing (no nav/footer in product pages)
- Validate loading states appear/disappear correctly
- Ensure all async operations provide user feedback

## Pre-configured Test User

Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Test Steps

### 1. Validate Landing Page Unaffected

**Steps:**
- Navigate to landing page: `http://localhost:3000`
- Take screenshot: `01_landing_page.png`
- Inspect styles in browser DevTools:
  - Check primary color (should NOT be TenderCreator green if different)
  - Check typography (should be landing page fonts)
  - Check button styles (should be landing page buttons)
- Click any landing page link/button
- **Verify** navigation works
- **Verify** no visual glitches
- Take screenshot: `02_landing_page_interaction.png`

**Expected:**
- Landing page looks unchanged from Phase 5
- No TenderCreator design tokens applied here
- Styling consistent with marketing pages

### 2. Validate Layout Routing (No Nav/Footer in Dashboard)

**Steps:**
- From landing page, sign in: test@tendercreator.dev / TestPass123!
- After sign in, navigate to `/projects`
- Take screenshot: `03_projects_page_layout.png`
- **Verify** marketing nav bar NOT visible
- **Verify** marketing footer NOT visible
- **Verify** dashboard sidebar IS visible (if implemented)
- **Verify** dashboard header IS visible (if implemented)
- Navigate to landing page (click logo or `/`)
- **Verify** marketing nav bar reappears
- Take screenshot: `04_back_to_landing_layout.png`

**Expected:**
- Product pages use dashboard layout (no marketing nav/footer)
- Landing page uses marketing layout (with nav/footer)
- Clean separation between marketing and product layouts

### 3. Validate Dashboard Design Tokens (Colors)

**Steps:**
- Navigate to `/projects` (project list page)
- Take screenshot: `05_projects_page_colors.png`
- Inspect primary button or active element:
  - Use browser color picker on primary button
  - **Verify** green color matches TenderCreator (`#10B981` or close)
- Inspect text colors:
  - Heading text should be dark gray (`#1F2937` or close)
  - Body text should be medium gray (`#6B7280` or close)
  - Muted text should be light gray (`#9CA3AF` or close)
- Inspect card backgrounds:
  - Should be white or light gray
  - Borders should be light gray (`#E5E7EB` or close)
- Take screenshot: `06_color_validation_devtools.png` (with DevTools open showing colors)

**Expected:**
- Primary green matches TenderCreator reference
- Text colors match reference
- Background/border colors consistent with TenderCreator

### 4. Validate Dashboard Design Tokens (Typography)

**Steps:**
- On `/projects` page, inspect typography:
  - Page title font size (should be large, ~24-36px)
  - Card title font size (should be medium, ~18px)
  - Body text font size (should be ~14-16px)
  - Font family (should be Inter or similar sans-serif)
- **Verify** font weights:
  - Headings bold (700) or semibold (600)
  - Body text regular (400)
- Take screenshot: `07_typography_validation.png`

**Expected:**
- Font sizes match TenderCreator reference
- Font weights appropriate for hierarchy
- Consistent font family across dashboard

### 5. Validate Dashboard Design Tokens (Spacing & Components)

**Steps:**
- Inspect card padding (should be ~24px)
- Inspect section spacing (should be ~32px between sections)
- Inspect border radius (should be ~8px on cards/buttons)
- **Verify** card hover effects work (if implemented):
  - Hover over project card or work package card
  - **Verify** subtle scale or shadow effect
- Take screenshot: `08_spacing_and_hover.png`

**Expected:**
- Spacing matches TenderCreator reference
- Border radius consistent (~8px)
- Hover effects smooth and subtle

### 6. Test Loading State - Project Creation

**Steps:**
- Navigate to `/projects` (or create project page)
- Open browser console (watch for errors)
- Click "Create Project" button
- Fill minimal required fields: "Test Project UI Validation"
- Click "Create" or "Save"
- **Verify** loading spinner appears immediately
- **Verify** loading text displayed: "Creating project..." (or similar)
- **Verify** button disabled during loading
- Wait for project creation to complete
- **Verify** loading spinner disappears
- **Verify** success message or navigation to project page
- Take screenshot: `09_project_creation_loading.png` (capture while loading if possible)

**Expected:**
- Loading state clear and immediate
- Button disabled to prevent double-click
- Loading dismisses on success

### 7. Test Loading State - RFT Upload

**Steps:**
- Navigate to newly created project
- Locate file upload area for RFT documents
- Upload file: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft.pdf`
- **Verify** loading state during upload (spinner or progress indicator)
- Wait for upload to complete
- **Verify** file appears in list
- **Verify** success toast or message
- Take screenshot: `10_file_upload_loading.png`

**Expected:**
- Upload provides feedback (loading state)
- Success confirmation clear
- File appears in list after upload

### 8. Test Loading State - RFT Analysis (Long Operation)

**Steps:**
- On project details page with uploaded RFT
- Click "Analyze RFT" button
- **Verify** loading state appears immediately
- **Verify** loading message: "Analyzing RFT..." or similar
- **Verify** button disabled during analysis
- **Verify** loading overlay or prominent spinner (this is 30-60s operation)
- Wait for analysis to complete (30-60 seconds)
- Take screenshot during loading: `11_rft_analysis_loading.png`
- **Verify** loading dismisses when complete
- **Verify** work packages appear
- Take screenshot after completion: `12_rft_analysis_complete.png`

**Expected:**
- Loading state prominent (this is a long operation)
- User understands something is happening
- No timeout or blank screens
- Clear transition to results

### 9. Test Loading State - Win Themes Generation

**Steps:**
- Open any work package (navigate to `/work-packages/[id]`)
- Navigate to Strategy tab
- Click "Generate Win Themes" button
- **Verify** loading spinner appears
- **Verify** button disabled
- Wait for generation (~10-15 seconds)
- Take screenshot: `13_win_themes_loading.png`
- **Verify** themes appear when complete
- **Verify** loading state dismisses

**Expected:**
- Loading feedback immediate
- Themes appear smoothly
- No errors in console

### 10. Test Loading State - Content Generation (Long Operation)

**Steps:**
- In same work package, navigate to Generation tab
- Click "Generate Content" button
- **Verify** loading state appears
- **Verify** loading message: "Generating content... This may take 1-2 minutes." or similar
- **Verify** button disabled
- Wait for generation (30-90 seconds)
- Take screenshot during loading: `14_content_generation_loading.png`
- **Verify** content appears in editor
- **Verify** loading dismisses
- Take screenshot: `15_content_generation_complete.png`

**Expected:**
- Loading state clear (long operation)
- User not confused or thinks app frozen
- Content appears when ready

### 11. Test Loading State - Export Operations

**Steps:**
- In work package, navigate to Export tab
- Click "Export as Word" button
- **Verify** loading spinner appears
- **Verify** button disabled
- Wait for export (~5 seconds)
- **Verify** file downloads
- **Verify** loading dismisses
- **Verify** success message
- Take screenshot: `16_export_loading.png`

**Steps (Bulk Export):**
- Return to project dashboard
- If multiple work packages completed, click "Export All Completed" button
- **Verify** progress modal appears: "Exporting X documents..."
- Wait for bulk export
- **Verify** ZIP downloads
- **Verify** modal dismisses
- Take screenshot: `17_bulk_export_loading.png`

**Expected:**
- Both individual and bulk export provide loading feedback
- Downloads trigger automatically
- Clear success confirmation

## Success Criteria

✓ Landing page unaffected by dashboard styling
✓ Dashboard pages use TenderCreator design tokens
✓ Color palette matches reference screenshots
✓ Typography matches reference screenshots
✓ Spacing and component styles match reference
✓ Layout routing correct (no nav/footer in dashboard)
✓ All loading states appear immediately on action trigger
✓ All loading states show descriptive messages
✓ All buttons disabled during loading
✓ All loading states dismiss on completion
✓ No console errors during testing
✓ All screenshots captured (17 total)
✓ Smooth transitions between states

## Performance Validation

- Page load: <2s initial, <500ms navigation
- Loading state appears: <100ms after button click
- Animations smooth (no jank)
- No layout shifts during loading/completion

## Output Format

```json
{
  "test_name": "UI Validation Part 1",
  "status": "passed|failed",
  "screenshots": [
    "test_results/ui_validation_part1/01_landing_page.png",
    "...17 screenshots..."
  ],
  "error": null
}
```
```

### 17. Create UI Validation E2E Test (Part 2)

**File:** `.claude/commands/e2e/test_ui_validation_part2.md`

```markdown
# E2E Test: UI Validation Part 2 - Error Handling & Empty States

Test error handling, empty states, and animations work correctly.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue, then restart from step 1. Iterate until ALL steps pass.

## Test Objectives

- Validate error handling shows user-friendly messages
- Test error recovery flows
- Verify empty states display with correct messaging
- Validate animations work smoothly
- Test overall polish and professional appearance

## Pre-configured Test User

Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Test Steps

### 1. Test Empty State - No Projects

**Steps:**
- Sign in as test user
- Navigate to `/projects`
- If projects exist, note them (we'll test with fresh user in step 1b)
- Take screenshot: `01_projects_list.png`

**Step 1b: Test with Fresh State (Optional)**
If test user has projects, manually verify empty state exists in code:
- Read `app/(dashboard)/projects/page.tsx`
- **Verify** empty state component exists for zero projects
- **Verify** empty state includes:
  - Icon (FolderOpen or similar)
  - Heading: "No projects yet" or similar
  - Description explaining next steps
  - CTA button: "Create Project"
- Take screenshot of code: `02_empty_state_code_verification.png`

**Expected:**
- Empty state component implemented
- Clear guidance for new users
- CTA button present

### 2. Test Empty State - No Work Packages (Before Analysis)

**Steps:**
- Create new project: "Empty State Test Project"
- Do NOT upload RFT or analyze
- Navigate to project details page
- **Verify** empty state displays for work packages
- **Verify** empty state includes:
  - Icon
  - Message: "Analysis pending" or "No work packages yet"
  - Description explaining what to do
  - CTA: "Analyze RFT" or "Upload RFT" guidance
- Take screenshot: `03_empty_work_packages.png`

**Expected:**
- Empty state guides user to next step
- Not confusing or blank

### 3. Test Empty State - No Organization Documents

**Steps:**
- Navigate to organization/company documents page
- If documents exist, note them
- **Verify** empty state exists in code (read component file)
- **Verify** empty state includes:
  - Upload icon
  - Message: "No company documents" or similar
  - Description explaining purpose of org documents
  - CTA: "Upload Documents"
- Take screenshot: `04_empty_org_documents.png` (or code screenshot)

**Expected:**
- Empty state implemented
- Helpful guidance for new organizations

### 4. Test Error Handling - File Upload (Invalid File)

**Steps:**
- Navigate to project document upload
- Attempt to upload invalid file:
  - Create temporary text file: `echo "invalid" > /tmp/test_invalid.txt`
  - Upload `/tmp/test_invalid.txt` as RFT (if .txt not allowed)
  - OR upload very large file (>10MB) if size validation exists
- **Verify** error toast/message appears
- **Verify** error message user-friendly:
  - "Invalid file type. Please upload PDF or Word document."
  - OR "File too large. Maximum size 10MB."
- **Verify** error dismisses (auto or manual close)
- Take screenshot: `05_file_upload_error.png`

**Expected:**
- Clear error message
- Helpful guidance (what's wrong, what to do)
- User can retry

### 5. Test Error Handling - Network Error Simulation (Optional)

**Note:** Difficult to simulate without breaking app. Verify error handling exists in code.

**Steps:**
- Read error handling utility: `lib/error-handler.ts`
- **Verify** handleError function exists
- **Verify** error messages are user-friendly
- Read API call sites (e.g., content generation, RFT analysis)
- **Verify** try-catch blocks with error handling
- Take screenshot of code: `06_error_handling_code.png`

**Expected:**
- Comprehensive error handling in critical paths
- User-friendly error messages (no technical jargon)
- Toast notifications implemented

### 6. Test Error Handling - AI Generation Failure (Optional)

**Note:** Hard to trigger without breaking Gemini API. Verify error handling in code.

**Steps:**
- Read content generation component
- **Verify** error handling on API failure
- **Verify** user sees error toast
- **Verify** user can retry generation
- Take screenshot of code: `07_ai_error_handling_code.png`

**Expected:**
- AI failures handled gracefully
- Retry option available
- No silent failures

### 7. Test Animations - Page Transitions

**Steps:**
- Navigate between pages:
  - `/projects` → click project → project details page
  - Project details → click work package → work package page
  - Use browser back button
- **Verify** page transitions smooth (fade in effect)
- **Verify** no jarring jumps or layout shifts
- **Verify** animations fast (<300ms)
- Take video or GIF if possible: `08_page_transitions.mp4`
- Take screenshot: `08_page_transition.png`

**Expected:**
- Smooth fade-in transitions
- Professional feel
- Not sluggish

### 8. Test Animations - Card Hover Effects

**Steps:**
- Navigate to project dashboard with multiple work packages
- Hover mouse over work package cards
- **Verify** hover effect triggers (scale or shadow)
- **Verify** animation smooth
- **Verify** hover state reverts when mouse leaves
- Hover over project cards (if on project list)
- **Verify** consistent hover behavior
- Take screenshot with hover active: `09_card_hover_effect.png`

**Expected:**
- Subtle scale or shadow on hover
- Consistent across all cards
- Not distracting or overdone

### 9. Test Animations - Button Interactions

**Steps:**
- Click various buttons:
  - Primary action buttons (Create Project, Generate Content)
  - Secondary buttons (Cancel, Back)
- **Verify** button press effect (scale down on click)
- **Verify** animation feedback immediate
- Take screenshot: `10_button_interactions.png`

**Expected:**
- Tactile button feedback
- Immediate response to click
- Professional interaction feel

### 10. Visual Polish Check - Overall Consistency

**Steps:**
- Navigate through entire application:
  - Projects list
  - Project details
  - Work package workflow (all tabs)
  - Organization settings (if accessible)
- **Verify** consistent styling across all pages:
  - Same green primary color everywhere
  - Same typography hierarchy
  - Same card styles
  - Same button styles
  - Same spacing rhythm
- Look for visual inconsistencies:
  - Misaligned elements
  - Inconsistent spacing
  - Color variations
  - Font size mismatches
- Take screenshots of key pages: `11_projects_consistency.png`, `12_workflow_consistency.png`, `13_dashboard_consistency.png`

**Expected:**
- Visual consistency across app
- Professional polish
- No obvious design flaws

### 11. Test Responsive Behavior (Desktop Focus)

**Steps:**
- Resize browser window to common desktop sizes:
  - 1920x1080 (full HD)
  - 1366x768 (common laptop)
  - 1440x900 (MacBook)
- **Verify** layout adapts gracefully
- **Verify** no horizontal scrollbars (unless intentional)
- **Verify** content readable at all sizes
- Take screenshots at different sizes: `14_responsive_1920.png`, `15_responsive_1366.png`

**Expected:**
- Responsive at desktop sizes (1280px+)
- No broken layouts
- Content accessible

**Note:** Mobile responsive NOT required for MVP (desktop demo only)

### 12. Console Error Check

**Steps:**
- Open browser DevTools console
- Navigate through entire app flow:
  - Sign in
  - Create project
  - Upload RFT
  - Analyze RFT
  - Open work package
  - Generate win themes
  - Generate content
  - Edit content
  - Export
  - Return to dashboard
  - Bulk export
- **Verify** zero console errors (red messages)
- Warnings acceptable if minor
- Take screenshot of clean console: `16_console_clean.png`

**Expected:**
- No errors during normal operation
- Clean console output
- Any warnings documented

### 13. Performance Check

**Steps:**
- Open browser DevTools Performance tab
- Record performance during:
  - Page navigation (projects → project details)
  - Card hover interactions
  - Button clicks
- Stop recording
- **Verify** no long tasks (>50ms)
- **Verify** smooth 60fps animations
- **Verify** no layout thrashing
- Take screenshot: `17_performance_metrics.png`

**Expected:**
- Smooth performance
- No jank during animations
- Fast page transitions

### 14. Cross-Browser Check (Chrome/Edge)

**Steps:**
- Open app in Chrome (if not already testing in Chrome)
- Complete basic flow:
  - Sign in
  - Navigate to project
  - Click through work package
  - Generate content
- **Verify** all features work
- Take screenshot: `18_chrome_compatibility.png`

**Steps (Edge):**
- Open app in Microsoft Edge
- Complete same basic flow
- **Verify** all features work
- **Verify** styling consistent
- Take screenshot: `19_edge_compatibility.png`

**Expected:**
- Works in Chrome
- Works in Edge
- No browser-specific issues

## Success Criteria

✓ Empty states implemented for key pages (projects, work packages, org docs)
✓ Empty states have helpful messaging and CTAs
✓ Error handling implemented for critical paths
✓ File upload errors show clear messages
✓ Error toasts display and dismiss correctly
✓ AI generation errors handled gracefully (verified in code)
✓ Page transitions smooth with fade-in effect
✓ Card hover effects work consistently
✓ Button press animations provide feedback
✓ Visual consistency across all pages
✓ Styling matches TenderCreator reference
✓ Responsive at desktop sizes (1280px+)
✓ Zero console errors during normal operation
✓ Performance smooth (60fps animations)
✓ Chrome and Edge compatibility validated
✓ All screenshots captured (19 total)
✓ Overall polish: professional, not rushed

## Output Format

```json
{
  "test_name": "UI Validation Part 2",
  "status": "passed|failed",
  "screenshots": [
    "test_results/ui_validation_part2/01_projects_list.png",
    "...19 screenshots..."
  ],
  "error": null
}
```
```

---
✅ CHECKPOINT: Steps 16-17 complete (E2E Tests Created). Continue to step 18.
---

### 18. Run Build and Fix Any Issues

**Command:**
```bash
npm run build
```

**Verify:**
- Build completes without TypeScript errors
- No warnings about missing dependencies
- Check bundle size reasonable
- Verify Framer Motion bundled correctly

**If build fails:**
- Read error messages carefully
- Fix TypeScript errors (missing types, incorrect imports)
- Verify all new files exported correctly
- Check CSS import paths correct
- Re-run build until successful

### 19. Manual Testing - Full Polish Pass

**Complete manual walkthrough:**

1. **Landing page check:**
   - Visit landing page
   - Verify styles unchanged
   - Click CTA buttons
   - Navigate to product pages

2. **Layout routing:**
   - Verify no marketing nav/footer in product pages
   - Verify marketing nav/footer on landing page
   - Test navigation back and forth

3. **Design token visual check:**
   - Compare dashboard side-by-side with ui1.png/ui2.png
   - Verify colors match (use color picker)
   - Verify spacing looks similar
   - Verify typography hierarchy correct

4. **Loading states:**
   - Create project (verify spinner)
   - Upload RFT (verify loading)
   - Analyze RFT (verify prominent loading for 30-60s)
   - Generate win themes (verify spinner)
   - Generate content (verify loading with message)
   - Export document (verify loading)
   - Bulk export (verify progress modal)

5. **Empty states:**
   - Visit pages with no data
   - Verify empty state components display
   - Verify CTAs work

6. **Error handling:**
   - Try uploading invalid file (verify error toast)
   - Note any other errors encountered
   - Verify error messages helpful

7. **Animations:**
   - Navigate between pages (verify transitions)
   - Hover over cards (verify hover effects)
   - Click buttons (verify press effects)

8. **Overall polish:**
   - Look for visual inconsistencies
   - Check for misaligned elements
   - Verify consistent spacing
   - Test at different window sizes

**Document issues found:**
- List any visual bugs
- Note missing features
- Identify performance issues
- Fix critical issues before proceeding

### 20. Demo Dry Run (Practice Run 1)

**Follow demo script exactly:**
- Open `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/demo_script.md`
- Complete entire demo flow as if presenting to stakeholders
- Time yourself (should be 8-10 minutes)
- Note any issues:
  - Demo data missing or incorrect
  - Features don't work as expected
  - Timing too long or too short
  - Transitions awkward
  - Explanations unclear

**Fix issues and repeat:**
- Address any problems found
- Practice demo 2-3 more times
- Get comfortable with flow
- Memorize talking points
- Test fallback plans

### 21. Run E2E UI Validation Tests

**Execute Part 1:**
```bash
# Read E2E runner
Read .claude/commands/test_e2e.md

# Execute Part 1
Execute .claude/commands/e2e/test_ui_validation_part1.md
```

**Expected:**
- All 11 steps pass
- 17 screenshots captured
- No errors

**If test fails:**
- Note which step failed
- Review error details
- Fix issue in code
- Re-run test from step 1

**Execute Part 2:**
```bash
# Execute Part 2
Execute .claude/commands/e2e/test_ui_validation_part2.md
```

**Expected:**
- All 14 steps pass
- 19 screenshots captured
- No errors

**If test fails:**
- Fix issues
- Re-run until all pass

### 22. Create Implementation Log

**File:** `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/phase_6_implementation.log`

```
Phase 6: Polish & Demo Prep - Implementation Log

Start Date: [DATE]
End Date: [DATE]
Status: [Complete / In Progress]

## Summary

Phase 6 successfully polishes the MVP with TenderCreator-matched UI design, comprehensive loading states, error handling, empty states, essential animations, demo data setup, and demo script preparation. Application is production-quality demo-ready.

## Key Decisions

1. **Layout Routing Fix:**
   - Issue: Marketing nav/footer appearing on product pages
   - Solution: [Describe fix - route grouping, separate layouts]
   - Files modified: app/(dashboard)/layout.tsx, app/(marketing)/layout.tsx

2. **Design Token Scoping:**
   - Approach: Separate CSS file (globals-dashboard.css) imported only in dashboard layout
   - Ensures landing page styles completely isolated
   - CSS custom properties for easy theming
   - `.dashboard-layout` wrapper class for scoping

3. **Design Token Extraction:**
   - Manual extraction from ui1.png/ui2.png screenshots
   - Primary green: [#XXXXXX] (extracted value)
   - Text colors: [list values]
   - Typography: Inter-like sans-serif, sizes [list]
   - Spacing: 24px card padding, 32px section gaps
   - Documented in design_tokens_extracted.md

4. **Loading States:**
   - Reusable LoadingSpinner component created
   - Applied to all async operations (8+ locations)
   - Descriptive messages for long operations (RFT analysis, content generation)
   - LoadingOverlay variant for blocking operations

5. **Empty States:**
   - Reusable EmptyState component created
   - Applied to: projects list, work packages list, org documents
   - Consistent pattern: icon + heading + description + CTA

6. **Error Handling:**
   - Toast notifications for all errors (shadcn/ui toast)
   - Error handler utility (lib/error-handler.ts)
   - Applied to: AI generation, file uploads, network errors
   - User-friendly messages, no technical jargon

7. **Animations:**
   - Framer Motion for all animations
   - Page transitions: fade-in (<300ms)
   - Card hover: subtle scale/shadow
   - Button press: scale down feedback
   - Animation utilities in lib/animations.ts

8. **Demo Data:**
   - Manual setup documented in scripts/setup-demo-data.md
   - 1 org document, 1 project with 10 work packages
   - 3 complete, 2 in-progress, 5 not-started (ideal demo state)
   - Repeatable setup process

9. **Demo Script:**
   - 8-10 minute walkthrough documented
   - Talking points and actions per section
   - Fallback plans for common issues
   - Q&A preparation included

## Implementation Highlights

**Layout Routing:**
- [Describe specific changes made to fix nav/footer issue]
- Route groups: (marketing) and (dashboard)
- Layouts: app/(marketing)/layout.tsx includes nav/footer, app/(dashboard)/layout.tsx does not

**Design Tokens Applied:**
- Colors: [List key color changes]
- Typography: [List font changes]
- Spacing: [List spacing adjustments]
- Components: Cards, buttons, tables, progress indicators, sidebar

**Loading States Added:**
- Project creation: [file]:[line]
- RFT upload: [file]:[line]
- RFT analysis: [file]:[line]
- Win themes: [file]:[line]
- Content generation: [file]:[line]
- Export: [file]:[line]
- Bulk export: [file]:[line] (already existed, verified)

**Empty States Added:**
- Projects list: [file]:[line]
- Work packages: [file]:[line]
- Org documents: [file]:[line]

**Error Handling Added:**
- Error handler utility: lib/error-handler.ts
- File upload validation: [file]:[line]
- AI generation errors: [file]:[line]
- Network errors: [file]:[line]

**Animations Applied:**
- Page transitions: [list files]
- Card hover: [list components]
- Button press: [list locations]

## Testing Results

**E2E Test: UI Validation Part 1**
- Status: [Passed / Failed]
- Steps passed: [X/11]
- Screenshots: [17/17]
- Issues found: [List or "None"]

**E2E Test: UI Validation Part 2**
- Status: [Passed / Failed]
- Steps passed: [X/14]
- Screenshots: [19/19]
- Issues found: [List or "None"]

**Manual Testing:**
- Layout routing: [Working / Issues]
- Design tokens: [Match TenderCreator / Deviations noted]
- Landing page unaffected: [Verified / Issues]
- Loading states: [All working / Issues]
- Empty states: [All working / Issues]
- Error handling: [Working / Issues]
- Animations: [Smooth / Issues]
- Overall polish: [Professional / Needs work]

**Demo Dry Runs:**
- Practice runs completed: [X]
- Timing: [X minutes]
- Issues encountered: [List or "None"]
- Fallbacks tested: [Yes / No]

**Cross-Browser:**
- Chrome: [Working / Issues]
- Edge: [Working / Issues]

**Performance:**
- Page transitions: [<300ms / Slower]
- Animations: [60fps / Jank noted]
- Build size: [X MB]
- Console errors: [0 / X errors]

## Issues Encountered

### Issue 1: [Description]
**Problem:** [What went wrong]
**Solution:** [How it was fixed]
**Files affected:** [List files]

### Issue 2: [If any]
...

## Landing Page Verification

**Critical requirement: Landing page must be unaffected**

**Verification performed:**
- Visual comparison before/after Phase 6 changes: [Same / Differences noted]
- DevTools inspection of styles: [No conflicts / Issues found]
- Color palette check: [Unchanged / Changes noted]
- Typography check: [Unchanged / Changes noted]
- Layout check: [Unchanged / Changes noted]
- Functionality test (buttons, links): [All working / Issues]

**Conclusion:** Landing page [completely unaffected / affected - details below]

[If affected, describe issues and fixes]

## Design Token Documentation

**Extracted design tokens documented in:**
`ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/design_tokens_extracted.md`

**Key values:**
- Primary green: [#XXXXXX]
- Text colors: [#XXXXXX, #XXXXXX, #XXXXXX]
- Font sizes: [XXpx, XXpx, XXpx]
- Spacing: [XXpx, XXpx]
- Border radius: [XXpx]
- Shadows: [values]

## Demo Preparation

**Demo data setup:**
- Status: [Complete / Incomplete]
- Documentation: scripts/setup-demo-data.md
- Data created: [Org docs, projects, work packages]
- Verification: [All criteria met / Issues]

**Demo script:**
- Status: [Complete / Needs revision]
- Documentation: demo_script.md
- Sections: [8 acts]
- Duration estimate: [8-10 minutes]
- Practice runs: [X completed]

**Demo readiness:**
- [ ] Demo data set up
- [ ] Demo script memorized
- [ ] Fallback plans tested
- [ ] Q&A preparation reviewed
- [ ] Application running smoothly
- [ ] No known critical bugs

## Integration with Previous Phases

**Phase 5 Compatibility:**
- All Phase 5 features working: [Yes / Issues noted]
- Multi-document workflow: [Working / Issues]
- Bulk export: [Working / Issues]
- Workflow navigation: [Working / Issues]

**No Breaking Changes:**
- Confirmed: [Yes / No - details below]

## Known Limitations

**Phase 6 Scope:**
- Mobile responsive NOT implemented (desktop demo only)
- Advanced animations skipped (focus on essential)
- Error boundaries not implemented (toast notifications only)
- Production-grade error handling deferred (critical paths covered)

**Demo Constraints:**
- Single user demo (multi-user UI only)
- Local development environment (not deployed to production)
- Test data only (no real tender documents)

## Next Steps

Phase 6 completes MVP. Application is demo-ready.

**For deployment:**
- Review Phase 5 Vercel deployment research
- Configure environment variables
- Deploy to Vercel
- Test in production environment

**For production hardening (post-MVP):**
- Add error boundaries
- Implement retry logic
- Add detailed error logging
- Mobile responsive design
- Advanced animations
- Multi-user collaboration (real implementation)

Completed by: [NAME/AI]
Date: [DATE]
```

### 23. Final Validation

**Execute all validation commands below.**

**Checklist:**
- [ ] Build succeeds (npm run build)
- [ ] Dev server runs (npm run dev)
- [ ] Landing page unaffected (manual check)
- [ ] Dashboard design tokens applied (manual check)
- [ ] Layout routing correct (no nav/footer in product)
- [ ] All loading states work (manual test)
- [ ] Empty states display correctly (manual test)
- [ ] Error handling works (manual test)
- [ ] Animations smooth (manual test)
- [ ] E2E Part 1 passes
- [ ] E2E Part 2 passes
- [ ] Demo dry run successful (3+ times)
- [ ] No console errors (manual check)
- [ ] Chrome/Edge compatibility (manual check)
- [ ] Professional polish (visual inspection)

---
✅ CHECKPOINT: Steps 18-23 complete (Final Testing & Validation). Phase 6 complete.
---

## Validation Commands

Execute every command to validate the phase works correctly.

```bash
# 1. Install dependencies
npm install

# 2. Check package.json for new dependencies
# Verify framer-motion installed
grep "framer-motion" package.json

# 3. Build check (no TypeScript errors)
npm run build

# 4. Verify build output size
du -sh .next

# 5. Start dev server
npm run dev

# 6. Manual validation checklist (in browser)
# Navigate to http://localhost:3000
# Complete the following manual tests:

## 6a. Landing Page Unaffected
# - Visit landing page /
# - Inspect styles (should be unchanged)
# - Click buttons/links (should work)
# - Take screenshot for comparison

## 6b. Layout Routing
# - Sign in → navigate to /projects
# - Verify NO marketing nav/footer visible
# - Navigate back to /
# - Verify marketing nav/footer visible again

## 6c. Design Tokens Applied
# - On /projects page, inspect with DevTools:
#   - Check primary button color (should match TenderCreator green)
#   - Check text colors (dark headings, medium body, light muted)
#   - Check card styling (border-radius ~8px, subtle shadow)
#   - Check spacing (card padding ~24px, section gaps ~32px)
# - Compare visually with ui1.png/ui2.png side-by-side

## 6d. Loading States
# - Create project → verify loading spinner with message
# - Upload RFT → verify loading state
# - Click "Analyze RFT" → verify prominent loading (30-60s operation)
# - Generate win themes → verify loading spinner
# - Generate content → verify loading with "This may take 1-2 minutes" message
# - Export document → verify loading spinner
# - Bulk export → verify progress modal "Exporting X documents..."

## 6e. Empty States
# - Visit /projects with no projects → verify empty state
#   (If projects exist, create new user or verify empty state in code)
# - Visit project with no work packages → verify empty state
# - Visit org documents with no docs → verify empty state
#   (Check each empty state has: icon, heading, description, CTA)

## 6f. Error Handling
# - Try uploading invalid file → verify error toast
# - Try uploading oversized file (>10MB) → verify error toast
# - Check error messages are user-friendly (not technical)

## 6g. Animations
# - Navigate between pages → verify fade-in transition (<300ms)
# - Hover over work package cards → verify hover effect (scale or shadow)
# - Click buttons → verify press feedback (scale down)
# - Verify animations smooth, not janky

## 6h. Overall Polish
# - Navigate through entire app
# - Look for visual inconsistencies
# - Check for misaligned elements
# - Verify consistent spacing throughout
# - Verify professional appearance

# 7. Browser console check
# Open DevTools Console
# Navigate through app (sign in → create project → analyze → workflow)
# Verify ZERO console errors (red messages)
# Warnings acceptable if minor

# 8. Cross-browser check
# Test in Chrome (if not already)
# Test in Microsoft Edge
# Verify all features work in both browsers

# 9. Demo data setup
# Follow instructions in scripts/setup-demo-data.md
# Verify demo data created:
# - 1 org document uploaded
# - 1 project: "NSW Government Cloud Infrastructure RFT"
# - 8-10 work packages
# - 2-3 completed work packages
# - 1-2 in-progress work packages
# - Dashboard shows aggregate progress

# 10. Demo dry run
# Follow demo script in demo_script.md
# Complete entire 8-10 minute demo flow
# Time yourself
# Note any issues
# Practice 3+ times until smooth

# 11. Run E2E UI Validation Part 1
# Read .claude/commands/test_e2e.md
# Execute .claude/commands/e2e/test_ui_validation_part1.md
# Verify all 11 steps pass
# Verify 17 screenshots captured
# Fix any failures and re-run

# 12. Run E2E UI Validation Part 2
# Execute .claude/commands/e2e/test_ui_validation_part2.md
# Verify all 14 steps pass
# Verify 19 screenshots captured
# Fix any failures and re-run

# 13. Verify no regressions on Phase 5 features
# Run Phase 5 E2E test to ensure no breaking changes
# Execute .claude/commands/e2e/test_phase_5_multi_document.md
# Verify test still passes
# If failures, identify and fix regressions

# 14. Performance check
# Open DevTools Performance tab
# Record during:
#   - Page navigation (projects → project details)
#   - Card hover interactions
#   - Button clicks
# Verify smooth 60fps animations
# Verify no long tasks (>50ms)

# 15. Responsive check (desktop sizes)
# Resize browser to:
#   - 1920x1080 (full HD)
#   - 1366x768 (common laptop)
#   - 1440x900 (MacBook)
# Verify layout adapts gracefully
# Verify no horizontal scrollbars
# Verify content readable at all sizes

# 16. Final acceptance criteria review
# Review Acceptance Criteria section above
# Verify every ✓ item is met
# Document any items not met with justification

# 17. Create implementation log
# Fill out: ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/phase_6_implementation.log
# Document all changes, decisions, test results

# 18. Update project README (optional)
# Add Phase 6 completion status
# Update implementation progress

# 19. Commit Phase 6 changes (if requested by user)
# git status (review all changed files)
# git add .
# git commit -m "feat: Phase 6 complete - Polish & demo prep
#
# - Fix layout routing (no nav/footer in product pages)
# - Extract and apply TenderCreator design tokens (dashboard only)
# - Add loading states to all async operations
# - Implement empty states with helpful messaging
# - Add error handling with toast notifications
# - Implement essential animations (page transitions, hover effects)
# - Create demo data setup guide
# - Create demo script (8-10 min walkthrough)
# - Build comprehensive UI validation E2E tests
# - Landing page styles completely preserved
# - Application demo-ready
#
# 🤖 Generated with Claude Code
# Co-Authored-By: Claude <noreply@anthropic.com>"
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Detailed workflow tests in `.claude/commands/e2e/test_ui_validation_part1.md` and `test_ui_validation_part2.md`

# Implementation log created at:
# ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/phase_6_implementation.log

## Notes

### Critical Implementation Details

**Layout Routing Issue Resolution:**

Investigate directory structure first:
```bash
ls -la app/
ls -la app/(dashboard)/
ls -la app/(marketing)/
```

Expected structure (Next.js route groups):
- `app/(marketing)/` - Contains landing page with nav/footer
- `app/(dashboard)/` - Contains product pages WITHOUT nav/footer
- Each route group has own `layout.tsx`

If structure incorrect:
1. Create route groups: `(marketing)` and `(dashboard)`
2. Move landing page to `app/(marketing)/page.tsx`
3. Move product pages to `app/(dashboard)/`
4. Create separate layouts for each group
5. Import nav/footer ONLY in marketing layout

**Design Token Scoping Strategy:**

Critical: Landing page must remain unaffected.

Approach:
1. Create `app/(dashboard)/globals-dashboard.css` with dashboard-specific design tokens
2. Import dashboard CSS ONLY in `app/(dashboard)/layout.tsx`
3. Wrap dashboard layout content in `<div className="dashboard-layout">`
4. All design token overrides scoped to `.dashboard-layout` class
5. Use `!important` sparingly to override shadcn/ui defaults
6. Test landing page after every design change to verify no pollution

Verification:
- Landing page should NOT import `globals-dashboard.css`
- Landing page should NOT have `.dashboard-layout` class
- DevTools inspection: landing page elements should NOT inherit dashboard styles

**Loading State Best Practices:**

Pattern:
```typescript
const [isLoading, setIsLoading] = useState(false)

const handleAction = async () => {
  setIsLoading(true)
  try {
    await performAction()
    showSuccessToast('Action complete')
  } catch (error) {
    handleError(error, 'Action Context')
  } finally {
    setIsLoading(false) // Always runs, even on error
  }
}

return (
  <>
    <Button onClick={handleAction} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Click Me'}
    </Button>

    {isLoading && <LoadingSpinner text="Performing action..." />}
  </>
)
```

For long operations (RFT analysis, content generation):
- Use `LoadingOverlay` component (full-screen with backdrop)
- Include time estimate: "This may take 1-2 minutes"
- Consider progress updates if possible (e.g., "Analyzing page 3 of 10")

**Empty State Design:**

Consistent pattern:
1. Icon (48px, muted color)
2. Heading (large, bold, concise)
3. Description (2-3 sentences, explains why empty and what to do)
4. CTA button (clear action)

Example:
```tsx
<EmptyState
  icon={FolderOpen}
  heading="No projects yet"
  description="Create your first project to start responding to tenders. Upload RFT documents and let AI analyze submission requirements."
  ctaLabel="Create Project"
  ctaAction={handleCreateProject}
/>
```

Where to add:
- Any list view that might be empty initially
- After delete operations that result in empty list
- During data loading (optional skeleton vs empty state)

**Error Handling Philosophy:**

MVP focus: User-friendly messages, no silent failures.

Priorities:
1. **AI generation errors** - Most critical (users blocked if generation fails)
   - Message: "AI generation failed. Please try again."
   - Action: Retry button enabled

2. **File upload errors** - High priority (common user mistake)
   - Message: "Upload failed. [Reason: file type, size, network]"
   - Action: Clear guidance on what to do

3. **Network errors** - Medium priority (transient issues)
   - Message: "Connection error. Check your internet and try again."
   - Action: Retry button or reload page

4. **Authentication errors** - High priority (security)
   - Message: "Session expired. Please sign in again."
   - Action: Redirect to login

NOT in scope for MVP:
- Error boundaries (React error boundaries for catastrophic failures)
- Retry logic with exponential backoff
- Detailed error logging/monitoring
- Error recovery workflows (undo operations)

**Animation Performance:**

Keep animations fast and smooth:

Good performance:
- Animate `transform` and `opacity` only (GPU-accelerated)
- Duration <300ms (feels instant but smooth)
- Use `ease-out` easing (starts fast, ends slow)
- Avoid animating `width`, `height`, `top`, `left` (causes reflow)

Example:
```typescript
// Good
const animation = {
  initial: { opacity: 0, transform: 'translateY(20px)' },
  animate: { opacity: 1, transform: 'translateY(0)' },
  transition: { duration: 0.3, ease: 'easeOut' }
}

// Bad (causes reflow)
const badAnimation = {
  initial: { height: 0 },
  animate: { height: 'auto' },
  transition: { duration: 0.5 }
}
```

Test on slower devices if possible. If animations janky:
- Reduce animation complexity
- Increase duration slightly
- Remove animations from heavy components

**Demo Data Setup Strategy:**

Goal: Consistent, impressive demo every time.

Ideal state:
- 1 org document (capability statement) - shows knowledge base concept
- 1 project with realistic name - shows real-world usage
- 10 work packages - shows scale of multi-document problem
- 3 completed work packages - shows end-to-end workflow
- 2 in-progress work packages - shows parallel work concept
- 5 not-started work packages - shows remaining work

Setup approaches:

**Option A: Manual (recommended for MVP):**
- Follow setup-demo-data.md instructions
- Takes ~10-15 minutes to set up
- Most reliable (no script to maintain)
- Can verify each step visually

**Option B: Database seed script (future):**
- SQL script inserts demo data directly
- Faster setup (1 command)
- Risk: Schema changes break script
- Requires maintenance

For MVP: Manual setup documented clearly is sufficient.

**Demo Script Best Practices:**

Timing breakdown:
- Act 1 (Intro): 30s - Set context
- Act 2 (Org setup): 30s - Show knowledge base
- Act 3 (Project creation): 1min - Basic setup
- Act 4 (Document decomposition): 2min - **Key differentiator moment**
- Act 5 (Team assignment): 30s - Show collaboration concept
- Act 6 (Workflow deep-dive): 3-4min - **Core product demo**
- Act 7 (Multi-document scale): 1min - Reinforce competitive advantage
- Act 8 (Closing): 30s - Call to action

Total: 8-10 minutes (perfect demo length - not too short, not too long)

**Critical moments:**
1. Document list reveal (Act 4) - "Current tools make you create ONE document. We identified TEN."
2. Intelligent editing (Act 6) - "Not just a text editor - AI-powered refinement"
3. Bulk export (Act 7) - "One ZIP file with all completed documents"

Practice these moments until delivery is smooth and enthusiastic.

**Fallback plans are essential:**
- Always have pre-completed data ready
- If live demo breaks, switch to pre-recorded screenshots
- If specific feature fails, skip to next (don't debug during demo)
- Keep energy up even if things go wrong

**E2E Test Design Philosophy:**

Part 1 (Design Tokens & Loading States):
- Focus on visual correctness
- Validate design matches TenderCreator
- Test all loading states functional
- Screenshot heavy (visual proof)

Part 2 (Errors & Empty States):
- Focus on error handling robustness
- Validate empty states helpful
- Test animations smooth
- Console error check
- Cross-browser validation

Split rationale:
- Part 1 ~700-800 lines (design validation detailed)
- Part 2 ~600-700 lines (error/polish validation)
- Combined would be ~1300-1500 lines (too long, hard to debug)

If tests fail repeatedly:
- Fix underlying issue in code first
- Don't try to "work around" test failures
- Tests are validation, not the goal
- Once code solid, tests should pass consistently

**Landing Page Preservation:**

This is CRITICAL. User emphasized: "design tokens should not affect landing page."

Verification checklist:
- [ ] Landing page colors unchanged (inspect with DevTools)
- [ ] Landing page fonts unchanged (inspect typography)
- [ ] Landing page spacing unchanged (measure with ruler)
- [ ] Landing page layout unchanged (compare screenshots)
- [ ] Landing page buttons work (click all CTAs)
- [ ] Landing page nav/footer present (verify visible)
- [ ] No `.dashboard-layout` class on landing page elements
- [ ] No `globals-dashboard.css` imported in landing page route

If landing page affected:
1. Identify conflicting CSS rules (DevTools → Computed styles)
2. Increase specificity of dashboard scoping (e.g., `.dashboard-layout .button`)
3. Use CSS layers if needed (advanced)
4. Test in incognito mode (clear cache)

**Design Token Extraction Tools:**

Manual extraction methods:
1. **Color picker:**
   - Mac: Digital Color Meter (built-in)
   - Windows: PowerToys Color Picker
   - Chrome extension: ColorZilla
   - Open ui1.png/ui2.png, hover over elements, record hex values

2. **Spacing measurement:**
   - Open screenshots in Figma (free account)
   - Use ruler tool to measure spacing
   - OR estimate visually (24px ~= 1.5rem, 32px ~= 2rem)

3. **Typography inspection:**
   - If TenderCreator app accessible: Inspect with DevTools
   - If only screenshots: Estimate sizes based on visual hierarchy
   - Font family likely Inter (common SaaS choice)

Record findings in `design_tokens_extracted.md` for reference.

**Common Issues & Solutions:**

**Issue: Nav/footer still showing in dashboard**
- Check route group structure (are pages in correct folders?)
- Check layout imports (is nav/footer imported in dashboard layout?)
- Check CSS specificity (are marketing styles leaking?)
- Solution: Verify route groups, separate layouts, test navigation

**Issue: Loading states don't appear**
- Check state management (is `setIsLoading(true)` called?)
- Check conditional rendering (is `{isLoading && ...}` correct?)
- Check timing (does loading state dismiss too fast to see?)
- Solution: Add `console.log` to track state changes, slow down operation if needed for testing

**Issue: Animations janky or slow**
- Check animated properties (animating width/height causes reflow)
- Check animation duration (>500ms feels sluggish)
- Check device performance (test on different machines)
- Solution: Animate transform/opacity only, reduce duration, simplify animations

**Issue: Empty states not showing**
- Check conditional logic (is `data.length === 0` condition correct?)
- Check data loading (is empty state shown during loading?)
- Check component placement (is empty state in correct location?)
- Solution: Verify data fetching logic, add loading skeleton if needed

**Issue: Errors not displaying to user**
- Check error handler called (try-catch wrapping operation?)
- Check toast component installed (shadcn/ui toast exists?)
- Check toast component mounted (is Toaster component in layout?)
- Solution: Verify error handler utility, ensure toast provider in app layout

**Issue: Design tokens not applied**
- Check CSS import (is globals-dashboard.css imported in layout?)
- Check CSS specificity (are shadcn/ui defaults overriding?)
- Check class scoping (is `.dashboard-layout` wrapper present?)
- Solution: Add `!important` selectively, increase specificity, verify import path

**Issue: Build fails**
- Check TypeScript errors (read error messages carefully)
- Check missing imports (did you export new components?)
- Check CSS syntax (malformed CSS rules?)
- Solution: Fix errors one by one, start from first error in list

**Issue: Demo data setup fails**
- Check authentication (signed in as correct user?)
- Check file paths (test fixtures exist at specified paths?)
- Check Gemini API (API key configured and valid?)
- Solution: Verify prerequisites, check env variables, test API calls

**Issue: Demo script timing off**
- Practice more (get comfortable with flow)
- Adjust talking points (reduce/expand based on time)
- Pre-complete some steps (skip waiting for long operations)
- Solution: Time each section separately, identify bottlenecks, optimize

**Browser Compatibility Notes:**

**Chrome (primary):**
- Best Framer Motion support
- Best DevTools for debugging
- Use for development and demo

**Edge (secondary):**
- Chromium-based (similar to Chrome)
- Should work identically
- Test for completeness

**Safari (not required for MVP):**
- Can have CSS rendering differences
- May require -webkit- prefixes
- Skip for MVP (desktop demo in Chrome/Edge)

**Firefox (not required for MVP):**
- Good standards support
- May have animation differences
- Skip for MVP

**Mobile browsers (not required for MVP):**
- Not responsive yet
- Desktop demo only
- Post-MVP feature

**Performance Targets:**

**Page Load:**
- Initial: <2s (first visit, cache empty)
- Navigation: <500ms (within app, cache warm)

**Animations:**
- Frame rate: 60fps (16.67ms per frame)
- Transition duration: <300ms (feels instant)
- No dropped frames during animations

**Loading States:**
- Appear within: <100ms of action trigger (feels immediate)
- Dismiss within: <100ms of operation complete (feels responsive)

**API Operations:**
- Win themes: <30s (user tolerates short wait)
- Content generation: <2min (user tolerates with progress message)
- RFT analysis: <90s (user tolerates with prominent loading)

If targets not met:
- Optimize critical paths first (content generation most important)
- Accept slower operations with good loading feedback
- Post-MVP optimization: caching, Edge Runtime, etc.

**Phase 6 Success Metrics:**

**Visual Quality:**
- Dashboard matches TenderCreator reference: ✓
- Landing page unaffected: ✓
- Consistent styling throughout: ✓
- Professional appearance: ✓

**UX Quality:**
- All loading states present: ✓
- Empty states helpful: ✓
- Error messages user-friendly: ✓
- Animations smooth: ✓

**Demo Readiness:**
- Demo data set up: ✓
- Demo script prepared: ✓
- Practice runs completed (3+): ✓
- Fallback plans ready: ✓

**Testing:**
- E2E UI validation passes: ✓
- Manual testing complete: ✓
- Cross-browser validated: ✓
- No console errors: ✓

**Documentation:**
- Implementation log complete: ✓
- Design tokens documented: ✓
- Demo script documented: ✓
- Setup guide documented: ✓

If all metrics met: Phase 6 complete, MVP demo-ready! 🎉

## Research Documentation

No additional research sub-agents required for Phase 6. All implementation based on:
- Existing Phase 5 functionality
- TenderCreator UI reference screenshots (ui1.png, ui2.png)
- Standard UX patterns (loading states, empty states, error handling)
- Framer Motion documentation (for animations)
- Shadcn/ui documentation (for components)
