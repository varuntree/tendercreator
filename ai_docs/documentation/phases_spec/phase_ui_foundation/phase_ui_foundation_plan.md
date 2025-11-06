# Phase: UI Foundation (Navbar & Sidebar)

## Phase Description

Create production-ready navbar and sidebar navigation components matching the exact UI from reference image (`specs/ui_polishes/image.png`). Implement layout shell ready for all future product pages with proper active states, icons, spacing, and brand elements. This phase focuses ONLY on navigation infrastructure - no individual page content implementation. Includes comprehensive E2E tests for visual validation and iteration to perfection.

## Phase Objectives

- Build pixel-perfect navbar matching reference (logo, branding, "Create new tender" button, user avatar)
- Build pixel-perfect sidebar matching reference (nav items with icons, active states, collapse functionality)
- Apply TenderCreator design tokens exactly (green primary #10B981, spacing, typography, shadows)
- Implement responsive active state management for navigation
- Create collapsible sidebar with state persistence
- Write comprehensive E2E tests for visual validation
- Zero functionality gaps - all nav items present with proper routing

## Problem Statement

Current nav/header components are basic placeholders that don't match TenderCreator brand:
- **Nav.tsx** - Simple text links, no icons, wrong styling, missing items from reference
- **Header.tsx** - Basic title + avatar, missing home icon, no "Create new tender" button
- **Layout** - Doesn't match reference structure (logo placement, sidebar width, spacing)
- **No visual testing** - No E2E validation to catch regressions
- **Missing navigation items** - Reference shows Home, Company, Tenders, Team, Billing, Settings, Useful Resources, Documentation

## Solution Statement

Replace existing nav.tsx and header.tsx with complete implementations matching reference image. Extract exact design tokens from `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/design_tokens_extracted.md` and apply consistently. Add all navigation items with proper icons (using lucide-react). Implement sidebar collapse with localStorage state persistence. Create comprehensive E2E test file following format from `.claude/commands/e2e/test_basic_query.md` to validate visual accuracy through iterative screenshots. Update dashboard layout to use new components. Result: production-ready navigation shell indistinguishable from TenderCreator reference.

## Dependencies

### Previous Phases
- Phase 1 (Core Schema) - auth, routing, protected layouts exist
- Phase 6 (Polish) - design tokens extracted, reference screenshots available

### External Dependencies
- `lucide-react` - icon library (likely already installed)
- `next/link`, `next/navigation` - routing (already available)
- Playwright MCP - E2E testing (already configured)
- Design tokens from `design_tokens_extracted.md`

## Relevant Files

**Reference materials:**
- `specs/ui_polishes/image.png` - PRIMARY reference for exact UI match
- `ai_docs/documentation/phases_spec/phase_6_polish_demo_prep/design_tokens_extracted.md` - Extracted colors, spacing, typography
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_basic_query.md` - Example E2E test format

**Existing components to update:**
- `components/nav.tsx` - Replace with full sidebar implementation
- `components/header.tsx` - Replace with navbar implementation
- `app/(dashboard)/layout.tsx` - Update to use new components properly

**Existing shadcn/ui components to use:**
- `components/ui/button.tsx` - For "Create new tender" button
- `components/ui/avatar.tsx` - For user avatar
- `components/ui/dropdown-menu.tsx` - For user menu
- `components/ui/badge.tsx` - If role badges needed

**Style files:**
- `app/(dashboard)/globals-dashboard.css` - May need updates for nav styles
- `tailwind.config.ts` - Verify design token colors configured

### New Files

**Components:**
- `components/sidebar.tsx` - Complete sidebar with all nav items, icons, collapse
- `components/navbar.tsx` - Top navbar with logo area, home icon, user controls
- `components/logo.tsx` - Reusable logo component (green icon + "Tender Creator" text)

**E2E Test:**
- `.claude/commands/e2e/test_ui_foundation.md` - Comprehensive visual validation test for navbar/sidebar

**Test Results:**
- `test_results/ui_foundation/` - Screenshots directory for E2E validation

## Acceptance Criteria

- ✅ Navbar matches reference image pixel-perfect (logo, button, avatar placement)
- ✅ Sidebar matches reference image (all nav items, icons, spacing, active states)
- ✅ "Create new tender" button styled correctly (green, rounded, icon + text)
- ✅ All navigation items present: Home, Company, Tenders, Team, Billing, Settings, Useful Resources, Documentation
- ✅ Active nav item shows green highlight + left border (matches design tokens)
- ✅ Sidebar collapse/expand functionality works
- ✅ User avatar dropdown functional (Sign out option)
- ✅ Proper routing for all nav items (existing routes work, placeholders for future)
- ✅ Icons match reference style (lucide-react or equivalent)
- ✅ Responsive layout (sidebar fixed width 256px, collapses to icon-only)
- ✅ E2E test passes with screenshot validation
- ✅ Zero console errors or warnings
- ✅ Smooth animations (200-300ms transitions on hover/active)

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Review Reference Materials

- Read `specs/ui_polishes/image.png` carefully - note every detail
- Read `design_tokens_extracted.md` - extract exact colors, spacing, typography for nav/sidebar
- Read existing `nav.tsx` and `header.tsx` - understand current structure
- List all differences between current and reference (create mental checklist)

### 2. Plan Component Structure

- Identify nav items needed: Home, Company, Tenders (Projects), Team, Billing, Settings, Useful Resources, Documentation
- Map nav items to routes:
  - Home → `/projects` (dashboard home)
  - Company → `/settings` (org settings)
  - Tenders → `/projects` (primary)
  - Team → `/settings/team` (placeholder)
  - Billing → `/settings/billing` (placeholder)
  - Settings → `/settings`
  - Useful Resources → `/resources` (placeholder)
  - Documentation → `/docs` (placeholder)
- Identify icons needed per item (from lucide-react: Home, Building2, FileText, Users, CreditCard, Settings, BookOpen, FileQuestion)

### 3. Create Logo Component

- Create `components/logo.tsx`
- Implement green leaf icon (from reference) or similar from lucide-react (Leaf, Sprout, TreeDeciduous)
- Add "Tender Creator" text with correct typography (font-bold, text-lg)
- Make clickable → navigates to `/projects`
- Style to match reference spacing and color

### 4. Build New Sidebar Component

- Create `components/sidebar.tsx`
- Implement collapsible state with useState + localStorage persistence
- Full width: 256px (w-64), collapsed: 80px (w-20)
- Background: white (bg-white)
- Border: right border (border-r border-gray-200)
- Top section: Logo + "Create new tender" button
- Middle section: Navigation items with icons
- Bottom section: Collapse toggle button (ChevronLeft icon)

**"Create new tender" button styling:**
- Green background (#10B981)
- White text
- Rounded (rounded-lg)
- Full width when expanded, icon-only when collapsed
- Plus icon (from lucide-react)
- Padding: py-2.5 px-4
- Font: medium weight
- Shadow: subtle (shadow-sm)
- Hover: darker green (#059669)

**Navigation items structure:**
- Map over nav items array
- Each item: icon (20px) + label
- Padding: px-4 py-3
- Border radius: rounded-lg
- Spacing between items: space-y-1
- Default state: text-gray-600
- Hover state: bg-gray-50
- Active state:
  - bg-emerald-50 (light green tint)
  - text-emerald-600
  - border-l-4 border-emerald-600 (left accent border)
  - font-medium

**Collapse functionality:**
- When collapsed: show icons only, hide text labels
- Tooltip on hover showing label (use title attribute)
- Toggle button rotates icon 180deg
- Smooth transition: transition-all duration-300

### 5. Build New Navbar Component

- Create `components/navbar.tsx`
- Height: 64px (h-16)
- Background: white (bg-white)
- Border bottom: border-b border-gray-200
- Layout: flex justify-between items-center
- Padding: px-8

**Left section:**
- Home icon button (from lucide-react: Home icon)
- Icon size: 20px
- Color: text-gray-600
- Hover: text-emerald-600
- Rounded: rounded-lg p-2
- Links to `/projects`

**Right section:**
- User avatar with dropdown
- Reuse existing Avatar component
- Show first letter of email
- Dropdown menu: "Sign out" option
- Keep existing dropdown functionality from current header.tsx

### 6. Update Dashboard Layout

- Update `app/(dashboard)/layout.tsx`
- Import new Sidebar and Navbar components
- Structure:
  ```tsx
  <div className="flex h-screen flex-col">
    <Navbar />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  </div>
  ```
- Verify auth check still works
- Test all protected routes render correctly

### 7. Update Active State Logic

- In Sidebar component, use `usePathname()` from `next/navigation`
- Determine active item based on current path
- Apply active styles conditionally with cn() utility
- Handle nested routes (e.g., `/settings/documents` shows Settings active)
- Test: navigate between pages, verify correct item highlighted

### 8. Verify Icon Installation

- Check if lucide-react installed: `npm list lucide-react`
- If not installed: `npm install lucide-react`
- Import needed icons in sidebar.tsx:
  - Home, Building2, FileText, Users, CreditCard, Settings, BookOpen, FileQuestion, Plus, ChevronLeft

### 9. Test Collapse Functionality

- Click collapse button, verify sidebar width changes
- Verify localStorage saves state (`localStorage.getItem('sidebarCollapsed')`)
- Refresh page, verify state persists
- Test navigation with collapsed sidebar
- Verify tooltips appear on hover when collapsed

### 10. Apply Design Tokens Precisely

- Review `design_tokens_extracted.md` one more time
- Verify all colors match:
  - Primary green: #10B981 (emerald-600 in Tailwind)
  - Active background: rgba(16, 185, 129, 0.1) (emerald-50)
  - Borders: #E5E7EB (gray-200)
  - Text colors: #1F2937 (gray-900), #6B7280 (gray-600)
- Verify spacing: px-4 py-3 for nav items, px-8 for navbar
- Verify typography: font-medium for active, font-normal for default
- Verify border radius: rounded-lg (8px)
- Verify transitions: transition-all duration-200

### 11. Test Routing

- Click each nav item, verify navigation works
- Test "Create new tender" button → navigates to `/projects/new`
- Test logo → navigates to `/projects`
- Test home icon → navigates to `/projects`
- For placeholder routes (/settings/team, /resources, /docs), create basic placeholder pages or redirect to /projects

---
✅ CHECKPOINT: Steps 1-11 complete (Component implementation). Continue to step 12.
---

### 12. Create E2E Test File

- Read `.claude/commands/e2e/test_basic_query.md` to understand format
- Create `.claude/commands/e2e/test_ui_foundation.md`
- Structure:
  - User Story: validate navbar/sidebar match reference
  - Test Steps: detailed visual checks (20+ steps)
  - Success Criteria: all visual elements match reference

**Test Steps to include:**
- Navigate to /projects (authenticated)
- Take screenshot: initial state
- Verify navbar present: height, border, home icon, avatar
- Verify sidebar present: width, logo, "Create new tender" button, all nav items
- Verify active state on Home/Tenders item (green highlight, left border)
- Click each nav item, verify navigation + active state change
- Take screenshots: each nav item active
- Click collapse button, verify sidebar collapses to icon-only
- Take screenshot: collapsed state
- Click expand button, verify sidebar expands
- Take screenshot: expanded state
- Hover over nav items, verify hover effect (bg-gray-50)
- Click "Create new tender" button, verify navigation to /projects/new
- Take screenshot: new project page
- Verify user avatar dropdown works
- Take screenshot: dropdown open

**Success Criteria:**
- All nav items visible with correct icons
- Active state styling matches design tokens
- Collapse/expand works smoothly
- No layout shifts or broken styling
- 8+ screenshots captured

### 13. Run E2E Test (First Iteration)

- Run: Read `.claude/commands/test_e2e.md` then execute `.claude/commands/e2e/test_ui_foundation.md`
- Review all screenshots in `test_results/ui_foundation/`
- Compare screenshots against reference image `specs/ui_polishes/image.png`
- Create list of discrepancies (colors off, spacing wrong, icons different, etc.)

### 14. Fix Discrepancies (Iteration 1)

- Go through discrepancy list one by one
- Update components to match reference exactly
- Common issues to check:
  - Icon sizes (should be 20px)
  - Active state left border thickness (should be 3-4px)
  - Button shadow (should be subtle)
  - Spacing inconsistencies
  - Wrong green shade (ensure #10B981)
  - Font weights incorrect

### 15. Run E2E Test (Second Iteration)

- Re-run E2E test
- Compare new screenshots against reference
- Verify fixes applied correctly
- Create new list of remaining discrepancies (if any)

### 16. Fix Discrepancies (Iteration 2)

- Address remaining issues
- Focus on pixel-perfect details:
  - Border colors exact match
  - Padding/margin precise
  - Icon alignment vertical centering
  - Text truncation for long labels
  - Hover state transitions smooth

### 17. Run E2E Test (Final Iteration)

- Re-run E2E test
- Verify ALL acceptance criteria met
- Screenshot comparison should show near-perfect match
- Document any intentional differences (if any)

### 18. Test Responsive Behavior

- Manually resize browser to different widths
- Verify sidebar collapse at smaller screens (if responsive design needed)
- Verify no horizontal scroll
- Verify navbar elements don't overlap
- Take screenshots at: 1920px, 1440px, 1280px, 1024px widths

### 19. Cross-Browser Testing

- Test in Chrome (primary)
- Test in Firefox (secondary)
- Test in Safari (if on Mac)
- Verify no browser-specific styling issues
- Verify icons render correctly in all browsers

### 20. Performance Check

- Open DevTools → Performance tab
- Record navigation between pages
- Verify no layout thrashing
- Verify smooth transitions (<16ms frame time)
- Check for excessive re-renders (use React DevTools Profiler)

### 21. Accessibility Review

- Test keyboard navigation: Tab through all nav items
- Verify focus states visible (outline or ring)
- Test screen reader: aria-labels on icon-only buttons when collapsed
- Verify color contrast ratios meet WCAG AA (4.5:1 for text)
- Add aria-current="page" to active nav item

### 22. Validation Commands Execution

- Run all commands listed in "Validation Commands" section below
- Verify zero errors
- Verify zero warnings
- Fix any issues found

## Validation Commands

Execute every command to validate the phase works correctly.

```bash
# 1. Verify dev server running
curl -I http://localhost:3000

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Check for linting errors
npm run lint

# 4. Verify lucide-react installed
npm list lucide-react

# 5. Check component files exist
ls -la components/sidebar.tsx
ls -la components/navbar.tsx
ls -la components/logo.tsx

# 6. Check E2E test file exists
ls -la .claude/commands/e2e/test_ui_foundation.md

# 7. Check test results directory exists
ls -la test_results/ui_foundation/
```

**E2E Testing:**
- Read `.claude/commands/test_e2e.md`
- Execute `.claude/commands/e2e/test_ui_foundation.md`
- Verify all success criteria pass
- Review all screenshots match reference

**Manual Validation:**
1. Navigate to http://localhost:3000/projects (sign in first)
2. Verify navbar and sidebar render correctly
3. Click each nav item, verify routing works
4. Click "Create new tender" button, verify navigation
5. Click collapse button, verify sidebar collapses
6. Click expand button, verify sidebar expands
7. Refresh page, verify collapse state persists
8. Hover over nav items, verify hover effects
9. Verify active state highlights current page
10. Open user dropdown, verify "Sign out" option present

**Visual Comparison:**
- Open reference image `specs/ui_polishes/image.png` side-by-side with app
- Compare navbar: logo placement, home icon position, avatar size
- Compare sidebar: button styling, nav item spacing, icon sizes, active state colors
- Verify typography matches (font sizes, weights)
- Verify colors match exactly (use browser DevTools color picker)

# Implementation log created at:
# ai_docs/documentation/phases_spec/phase_ui_foundation/phase_ui_foundation_implementation.log

## Notes

**Design Token Reference:**
- Primary Green: #10B981 (emerald-600 in Tailwind)
- Active Background: rgba(16, 185, 129, 0.1) (emerald-50 or bg-emerald-50)
- Text Default: #6B7280 (gray-600)
- Text Active: #10B981 (emerald-600)
- Border: #E5E7EB (gray-200)
- Background: #FFFFFF (white)

**Icon Mapping:**
- Home → Home icon
- Company → Building2 icon
- Tenders → FileText icon
- Team → Users icon
- Billing → CreditCard icon
- Settings → Settings icon
- Useful Resources → BookOpen icon
- Documentation → FileQuestion icon
- Create button → Plus icon
- Collapse → ChevronLeft icon

**Navigation Routing:**
- Active routes: /projects, /settings, /settings/documents
- Placeholder routes: /settings/team, /settings/billing, /resources, /docs
- "Create new tender" → /projects/new

**Future Considerations:**
- If Company profile page built, update Company route
- If Team management built, update Team route
- If Billing built, update Billing route
- Add badge indicators (e.g., notification count) to nav items
- Add search functionality to navbar
- Add breadcrumbs below navbar

**Known Intentional Differences:**
- If using different icons than reference (due to availability), document here
- If adjusting colors for accessibility (contrast ratios), document here

## Research Documentation

No research sub-agents deployed. All design tokens and reference materials already documented in Phase 6 specifications.
