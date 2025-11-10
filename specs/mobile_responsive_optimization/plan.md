# Plan: Mobile Responsive Optimization

## Plan Description
Optimize existing UI/UX for mobile screens without changing desktop layout or functionality. Application is fully functional with complete features and polished UI/UX for desktop. Goal: make all pages, components, and interactions work seamlessly on mobile (320px-767px) while keeping desktop experience identical. Use mobile-first CSS approach with Tailwind breakpoints, hide/show patterns, and minimal new components (Sheet for sidebar). No new features, no logic changes - only display/layout optimizations.

## User Story
As a mobile user
I want to access all TenderCreator features on my phone
So that I can view projects, create work packages, edit content, and download documents on any device

## Problem Statement
Dashboard is completely unusable on mobile:
- Sidebar fixed at 72px/20px with no mobile drawer
- Project detail page has 300px fixed sidebar + 3-column Kanban that don't adapt
- Work package strategy screen has multi-column tables (4+ columns) and floating panels positioned for desktop
- Editor has 520px bubble menu and desktop-sized toolbars
- Forms/dialogs are 600px modals that overflow small screens
- Touch targets below 44px minimum (Apple guidelines)
- No responsive breakpoints on critical dashboard layouts

Marketing pages work reasonably well but dashboard makes product inaccessible on mobile.

## Solution Statement
Apply mobile-first optimization using Tailwind breakpoints and hide/show patterns:

**Core Patterns:**
1. **Sidebar → Sheet**: Wrap Sidebar in Radix Sheet, add hamburger trigger (mobile only), desktop unchanged
2. **Kanban → Hide**: `hidden md:block` wrapper, show table only on mobile (desktop shows both)
3. **Tables → Selective columns**: Hide non-essential columns with `hidden md:table-cell`, show name + action only
4. **Fixed sidebars → Stack/drawer**: Project detail 300px sidebar becomes drawer or stacks below on mobile
5. **Floating panels → Sticky bottom**: Full-width sticky bar on mobile, floating bottom-right on desktop
6. **Wide modals → Full-screen**: `max-md:w-full max-md:h-full` for forms/dialogs
7. **Touch targets → 44px**: Ensure interactive elements meet Apple 44px minimum

All changes scoped to `max-md:` or base styles where safe. Zero desktop regressions.

## Pattern Analysis

### Existing Patterns to Follow:
1. **Team table (settings/team/page.tsx:237-312)** already implements mobile cards:
   - Desktop: 5-column table
   - Mobile: Card layout with `md:hidden` + bottom sheet drawer
   - **Reuse this pattern** for other tables

2. **Work package table (work-package-table.tsx:359-429)** has mobile fallback:
   - Desktop: 4-column table with selects
   - Mobile: Card layout
   - **Apply same approach** to strategy tables

3. **Marketing navbar (components/navbar.tsx)** demonstrates:
   - `use-media-query` hook for breakpoint detection
   - Hamburger menu < lg, desktop menu ≥ lg
   - **Extend this pattern** to dashboard sidebar

4. **Editor bubble menu (workflow-steps/content-editor.tsx:643)** already uses:
   - `max-w-[min(520px,calc(100vw-64px))]` for responsive width
   - **No changes needed** - already mobile-safe

### Existing Resources:
- `use-media-query` hook (hooks/use-media-query.ts) - ready to use, currently only in marketing navbar
- Radix Sheet component (in dependencies) - for sidebar drawer
- Tailwind 4 with standard breakpoints (sm:640px, md:768px, lg:1024px)
- Design system already supports responsive containers

### Anti-patterns to Avoid:
- DO NOT create new components unless absolutely necessary
- DO NOT change any JavaScript logic or event handlers
- DO NOT modify desktop styles (all changes must be scoped)
- DO NOT hardcode pixel values (use Tailwind utilities)
- DO NOT duplicate markup (use hide/show patterns)

## Dependencies

### Previous Plans
- None. Standalone optimization task.

### External Dependencies
- Radix UI Sheet (already installed: @radix-ui/react-dialog)
- Tailwind CSS 4 (already configured)
- lucide-react icons (for hamburger menu icon)

### Internal Dependencies
- `use-media-query` hook must work correctly
- Existing Radix components (Dialog, Sheet) must be imported from `@/components/ui`

## Relevant Files

### Critical Priority (Must Fix):

1. **`components/sidebar.tsx`** (entire file, ~150 lines)
   - Current: Fixed 72px expanded / 20px collapsed, always visible
   - Issue: Takes screen space on mobile, no drawer variant
   - Fix: Wrap in Sheet, add hamburger trigger visible only on mobile
   - Pattern: Similar to marketing navbar mobile menu

2. **`app/(dashboard)/projects/[id]/page.tsx`** (lines 292-549)
   - Current: Flex layout with 300px fixed sidebar + main content area
   - Issue: Sidebar + 3-column Kanban (lines 474-530) don't fit mobile
   - Fix:
     - Sidebar: `hidden lg:block` or drawer pattern
     - Kanban: Wrap in `hidden md:block` (table below already works)
   - Pattern: Project detail sidebar contains essential metadata - consider top card on mobile

3. **`components/workflow-steps/strategy-generation-screen.tsx`** (lines 151-376)
   - Current: Multi-column tables, fixed floating panel
   - Issues:
     - Requirements table (lines 162-190): 4 columns, small text
     - Bid guidance grid (lines 198-284): 2-column grid with nested tables
     - Floating panel (lines 347-376): Fixed bottom-right positioning
   - Fix:
     - Tables: Hide columns with `hidden md:table-cell` (show priority + requirement only)
     - Grid: Stack with `grid-cols-1 md:grid-cols-2`
     - Panel: `fixed bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto md:w-auto w-full`
   - Pattern: Follow team table mobile cards pattern if needed

4. **`components/navbar.tsx`** (dashboard navbar, lines 1-100+)
   - Current: Flex row with breadcrumbs, stats, user menu
   - Issue: May overflow or wrap awkwardly on mobile
   - Fix: Better wrapping, stack vertically if needed with `flex-col md:flex-row`
   - Pattern: Already uses responsive patterns, refine as needed

5. **`components/company-profile-form.tsx`** (entire component)
   - Current: 600px modal with multi-field form
   - Issue: Fixed width too wide for mobile
   - Fix: Dialog content wrapper: `md:max-w-[600px] max-md:w-screen max-md:h-screen max-md:max-w-none`
   - Pattern: Full-screen modals on mobile (standard mobile UX)

6. **`app/(dashboard)/layout.tsx`** (lines 1-50+)
   - Current: Sidebar + main content wrapper
   - Issue: No responsive breakpoints for main layout
   - Fix: Adjust padding/margins for mobile, ensure sidebar toggle state
   - Pattern: Must coordinate with sidebar.tsx changes

### Medium Priority (Enhance):

7. **`components/company-settings-tabs.tsx`**
   - Current: Horizontal tabs
   - Issue: May overflow on mobile
   - Fix: Consider scroll container or stacked tabs on mobile

8. **`components/breadcrumbs.tsx`**
   - Current: Horizontal breadcrumb trail
   - Issue: Long breadcrumbs may overflow
   - Fix: Truncate middle items on mobile, show first + last only

9. **`app/(dashboard)/settings/team/page.tsx`** (lines 237-312)
   - Current: Already has mobile cards implementation
   - Issue: Stats grid (sm:grid-cols-3) may be tight
   - Fix: Verify stats cards work on smallest screens, adjust if needed

10. **`components/work-package-table.tsx`** (lines 359-429)
    - Current: Already has mobile card fallback
    - Issue: Verify card layout works well
    - Fix: Minor tweaks if needed, mostly done

### Low Priority (Verify):

11. **Marketing pages** (`app/(marketing)/**`)
    - Current: Reasonably responsive
    - Issue: Minor refinements possible
    - Fix: Quick audit, adjust if obvious issues

12. **Auth pages** (`app/signin`, `app/signup`, `app/forgot-password`)
    - Current: Simple forms, likely work
    - Issue: Verify on mobile
    - Fix: Adjust if needed

## Acceptance Criteria

- [ ] Sidebar becomes hamburger menu + slide-out sheet on mobile (< md), unchanged on desktop (≥ md)
- [ ] Project detail sidebar stacks or becomes drawer on mobile, fixed 300px on desktop
- [ ] Kanban board hidden on mobile (table shown instead), visible on desktop
- [ ] All tables show essential columns only on mobile (name + action), full columns on desktop
- [ ] Strategy screen tables show 2 columns max on mobile (priority + requirement)
- [ ] Bid guidance grid stacks vertically on mobile, 2 columns on desktop
- [ ] Floating action panel full-width sticky bottom on mobile, floating bottom-right on desktop
- [ ] All modals/dialogs full-screen on mobile (< md), sized modals on desktop (≥ md)
- [ ] All interactive elements (buttons, links, icons) minimum 44px tap target on mobile
- [ ] No horizontal scrolling required (except intentional table scroll where needed)
- [ ] Desktop experience 100% unchanged - visual regression test must pass
- [ ] All functionality works on mobile: create projects, upload docs, edit content, download exports
- [ ] Build succeeds with no TypeScript errors
- [ ] Lint passes with no new warnings

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps in exact order
- Check Acceptance Criteria - all items REQUIRED
- Do NOT skip any steps
- Desktop must remain unchanged - test after each major change
- If blocked, document and ask before proceeding

---

### Phase 1: Foundation & Sidebar (Mobile Navigation)

#### 1. Audit sidebar usage and current state
- Read `components/sidebar.tsx` to understand collapse state logic (LocalStorage persistence)
- Read `app/(dashboard)/layout.tsx` to see how sidebar integrates with main content
- Check `hooks/use-media-query.ts` to confirm it works for detecting mobile breakpoints
- Document current sidebar behavior (72px expanded, 20px collapsed, toggle button)

---
✅ CHECKPOINT: Phase 1 Step 1 complete (Sidebar audit). Continue to step 2.
---

#### 2. Create sidebar mobile sheet wrapper
- File: `components/sidebar.tsx`
- Change:
  1. Import Sheet components from `@/components/ui/sheet` (Sheet, SheetTrigger, SheetContent)
  2. Import Menu icon from `lucide-react`
  3. Import `use-media-query` hook
  4. Add `isMobile = use-media-query("(max-width: 767px)")` at component top
  5. Wrap existing sidebar JSX in Sheet component:
     - Desktop (≥ md): Render sidebar directly (current behavior)
     - Mobile (< md): Render Sheet with trigger button + sidebar in SheetContent
  6. Trigger button: Hamburger icon, fixed top-left, z-50, visible only `md:hidden`
  7. SheetContent: `side="left"`, contains full sidebar markup
- Why: Sidebar must be accessible on mobile without taking permanent screen space
- Dependencies: Sheet component must exist in `@/components/ui/sheet.tsx` (verify or create from Radix)

---
✅ CHECKPOINT: Phase 1 Step 2 complete (Sidebar sheet created). Continue to step 3.
---

#### 3. Update dashboard layout for responsive sidebar
- File: `app/(dashboard)/layout.tsx`
- Change:
  1. Add responsive padding: `px-4 sm:px-6 lg:px-8` to main content wrapper
  2. Ensure sidebar is `hidden md:block` when rendered directly
  3. Adjust margin-left calculation to account for mobile (no sidebar margin on < md)
  4. Current: `ml-[72px]` or `ml-[20px]` based on collapse state
  5. New: `md:ml-[72px] md:ml-[20px]` (no margin on mobile, sheet overlays)
- Why: Main content needs full width on mobile since sidebar is in sheet
- Dependencies: Step 2 must be complete

---
✅ CHECKPOINT: Phase 1 complete (Sidebar mobile navigation working). Test on mobile and desktop before continuing.
---

### Phase 2: Project Detail Page

#### 4. Optimize project detail sidebar layout
- File: `app/(dashboard)/projects/[id]/page.tsx`
- Line: 292 (layout container)
- Current: `<div className="flex gap-6">` with fixed 300px sidebar
- Change:
  1. Sidebar wrapper: Add `hidden lg:block` to sidebar `<aside>` element (around line 310)
  2. Mobile alternative: Create condensed project info card at top (visible only `lg:hidden`)
     - Card contains: Project avatar, name, client, deadline (essential info)
     - Positioned above main content area
  3. Main content wrapper: Remove fixed widths, use `flex-1` for fluid layout
  4. Responsive flex direction: `flex-col lg:flex-row` on container
- Why: 300px sidebar doesn't fit mobile, essential info needed at top
- Dependencies: None
- Testing: Verify project metadata accessible on mobile, sidebar unchanged on desktop

---
✅ CHECKPOINT: Phase 2 Step 4 complete (Project sidebar responsive). Continue to step 5.
---

#### 5. Hide Kanban board on mobile
- File: `app/(dashboard)/projects/[id]/page.tsx`
- Line: 474 (Kanban grid container)
- Current: Kanban with 3-column grid `grid-cols-1 lg:grid-cols-3`
- Change:
  1. Wrap entire Kanban section (lines 474-530) in `<div className="hidden md:block">`
  2. Work package table below (already exists) remains visible on all screens
  3. Add comment: `{/* Kanban hidden on mobile - table provides mobile-friendly view */}`
- Why: Kanban too complex for mobile, table more suitable and already implemented
- Dependencies: Verify work package table exists and works on mobile
- Testing: Mobile shows table only, desktop shows Kanban + table

---
✅ CHECKPOINT: Phase 2 complete (Project detail mobile-optimized). Continue to Phase 3.
---

### Phase 3: Work Package Strategy Screen

#### 6. Optimize requirements table for mobile
- File: `components/workflow-steps/strategy-generation-screen.tsx`
- Lines: 162-190 (requirements table)
- Current: 4 columns (#, Priority, Requirement, Source), all visible
- Change:
  1. Column headers:
     - "#" column: Add `className="hidden md:table-cell"` to `<th>` and all `<td>` in this column
     - "Source" column: Add `className="hidden md:table-cell"` to `<th>` and all `<td>`
     - Keep: "Priority" and "Requirement" visible on all screens
  2. Adjust remaining columns width: "Priority" `w-24`, "Requirement" `flex-1`
  3. Add horizontal scroll fallback: Wrap table in `<div className="overflow-x-auto">`
- Why: 4 columns too wide for mobile, priority + requirement are essential
- Dependencies: None
- Testing: Mobile shows 2 columns, desktop shows 4 columns

---
✅ CHECKPOINT: Phase 3 Step 6 complete (Requirements table mobile). Continue to step 7.
---

#### 7. Stack bid guidance grid on mobile
- File: `components/workflow-steps/strategy-generation-screen.tsx`
- Lines: 198-284 (bid guidance section)
- Current: `grid-cols-2` layout with recommendation + criteria
- Change:
  1. Grid container (around line 203): Change to `grid-cols-1 md:grid-cols-2`
  2. Criteria table (lines 260-280): Wrap in `<div className="overflow-x-auto">` if not already
  3. Recommendation card: Ensure full width works on mobile
- Why: Side-by-side doesn't fit mobile, stacking provides better readability
- Dependencies: None
- Testing: Mobile shows stacked cards, desktop shows 2-column grid

---
✅ CHECKPOINT: Phase 3 Step 7 complete (Bid guidance mobile). Continue to step 8.
---

#### 8. Fix floating action panel for mobile
- File: `components/workflow-steps/strategy-generation-screen.tsx`
- Lines: 347-376 (floating action panel)
- Current: `className="fixed bottom-4 right-4"` with desktop sizing
- Change:
  1. Update className:
     - From: `fixed bottom-4 right-4 w-auto`
     - To: `fixed bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto md:w-auto w-full`
  2. Inner content wrapper: Add `p-4` on mobile, existing padding on desktop
  3. Buttons: Stack vertically on mobile with `flex-col md:flex-row gap-2`
- Why: Bottom-right floating doesn't work on mobile, full-width sticky bar better UX
- Dependencies: None
- Testing: Mobile shows full-width sticky bar at bottom, desktop shows floating panel

---
✅ CHECKPOINT: Phase 3 complete (Strategy screen mobile-optimized). Continue to Phase 4.
---

### Phase 4: Forms & Modals

#### 9. Make company profile form full-screen on mobile
- File: `components/company-profile-form.tsx`
- Location: Dialog content wrapper
- Current: `className="sm:max-w-[600px]"` or similar fixed width
- Change:
  1. Find DialogContent component wrapper
  2. Update className:
     - Add: `md:max-w-[600px] max-md:w-screen max-md:h-screen max-md:max-w-none`
     - Keep: Existing center alignment for desktop
  3. Ensure form scrolls within dialog on mobile with `overflow-y-auto`
  4. Form buttons: Stack on mobile with `flex-col md:flex-row gap-3`
- Why: 600px modal too wide for mobile, full-screen standard mobile pattern
- Dependencies: Verify DialogContent supports full-screen styling
- Testing: Mobile shows full-screen form, desktop shows 600px centered modal

---
✅ CHECKPOINT: Phase 4 Step 9 complete (Forms mobile). Continue to step 10.
---

#### 10. Audit all other dialogs/modals
- Files: Search for `<Dialog` or `DialogContent` usage across codebase
- Action:
  1. Use grep to find all Dialog components
  2. Check each for mobile responsiveness
  3. Apply same full-screen pattern where needed:
     - CreateProjectDialog
     - GenerateDocumentsDialog
     - Any settings modals
  4. Document any modals that already work on mobile
- Why: Consistent modal UX across app
- Dependencies: Step 9 pattern established
- Testing: All modals work on mobile without horizontal scroll

---
✅ CHECKPOINT: Phase 4 complete (All modals mobile-friendly). Continue to Phase 5.
---

### Phase 5: Touch Targets & UI Polish

#### 11. Audit and fix touch target sizes
- Files: All interactive components (buttons, links, icon buttons)
- Action:
  1. Search for icon-only buttons (Menu, Close, Edit, Delete icons)
  2. Ensure minimum 44px hit area:
     - Button/Link base: `min-h-[44px] min-w-[44px]` or `p-3`
     - Icon size: Can stay small (e.g., 20px), padding creates hit area
  3. Check common components:
     - Sidebar navigation items
     - Table action buttons
     - Floating action buttons
     - Card clickable areas
  4. Add `md:min-h-auto md:min-w-auto` if desktop needs smaller sizes
- Why: Apple 44px guideline ensures usable touch targets
- Dependencies: None
- Testing: All interactive elements easy to tap on mobile (test with real device if possible)

---
✅ CHECKPOINT: Phase 5 Step 11 complete (Touch targets). Continue to step 12.
---

#### 12. Optimize navbar for mobile
- File: `components/navbar.tsx`
- Current: Flex row with breadcrumbs, stats, user menu
- Change:
  1. Main container: Add `flex-col md:flex-row` for better mobile stacking
  2. Breadcrumbs: May need truncation on mobile (show last 2 items only)
  3. User menu: Ensure dropdown doesn't overflow viewport
  4. Stats/badges: Stack or hide non-essential on mobile
- Why: Navbar overflow common issue on mobile
- Dependencies: None
- Testing: Navbar fits mobile screen, all controls accessible

---
✅ CHECKPOINT: Phase 5 Step 12 complete (Navbar mobile). Continue to step 13.
---

#### 13. Verify settings tabs don't overflow
- File: `components/company-settings-tabs.tsx`
- Current: Horizontal tabs list
- Change:
  1. Wrap tabs in scroll container: `<div className="overflow-x-auto">`
  2. Tabs container: Add `flex-nowrap` to prevent wrapping
  3. Individual tabs: Ensure text doesn't wrap with `whitespace-nowrap`
  4. Consider stacking tabs vertically on mobile if too many
- Why: Horizontal tabs may overflow on narrow screens
- Dependencies: None
- Testing: All tabs accessible on mobile, scrollable if needed

---
✅ CHECKPOINT: Phase 5 complete (UI polish done). Continue to Phase 6.
---

### Phase 6: Testing & Validation

#### 14. Visual regression testing (Desktop)
- Action:
  1. Take screenshots of all major pages on desktop (1920x1080)
  2. Compare before/after:
     - Projects list
     - Project detail (with sidebar)
     - Work package strategy screen
     - Settings pages
     - Marketing landing page
  3. Verify pixel-perfect match (no changes)
- Why: Ensure zero desktop regressions
- Dependencies: All code changes complete
- Testing: Use browser DevTools device emulation or actual screenshots

---
✅ CHECKPOINT: Phase 6 Step 14 complete (Desktop regression). Continue to step 15.
---

#### 15. Mobile functionality testing
- Action:
  1. Test on mobile viewports (375x667 iPhone SE, 360x740 Android)
  2. Verify all user flows:
     - Sign in → Projects list
     - Create new project
     - Upload documents
     - View project detail (sidebar drawer, table)
     - Open work package
     - Edit strategy (tables, floating panel)
     - Edit content (editor toolbar, bubble menu)
     - Export document
     - Settings (company, team, documents)
  3. Document any issues or edge cases
- Why: Ensure full mobile functionality
- Dependencies: All code changes complete
- Testing: Manual testing on actual mobile device or DevTools emulation

---
✅ CHECKPOINT: Phase 6 Step 15 complete (Mobile functionality). Continue to step 16.
---

#### 16. Run validation commands
- Commands:
  1. `npm run build` - Ensure production build succeeds
  2. `npm run lint` - No new lint warnings/errors
  3. `npm run type-check` (if exists) - TypeScript errors resolved
- Why: Catch any build/type issues before deployment
- Dependencies: Code changes complete
- Testing: All commands pass

---
✅ CHECKPOINT: Phase 6 complete (All testing done). Implementation complete.
---

## Testing Strategy

### Manual Testing (Primary)
Mobile viewports to test:
- iPhone SE: 375x667 (small mobile)
- iPhone 12/13: 390x844 (standard mobile)
- Android: 360x740 (standard Android)
- iPad Mini: 768x1024 (tablet - should use desktop layout at ≥ 768px)

Desktop viewports:
- 1920x1080 (standard desktop)
- 1366x768 (small laptop)
- 2560x1440 (large desktop)

Test all user flows:
1. **Authentication**: Sign in, sign up, forgot password
2. **Projects**: List, create, view detail, upload docs, trigger analysis
3. **Work packages**: View Kanban (desktop), table (mobile), open detail
4. **Strategy**: View requirements, bid guidance, win themes, save changes
5. **Editor**: Format text, use AI tools, save, view word count
6. **Export**: Download document
7. **Settings**: Update company profile, manage team, upload org documents

### Automated Testing
- Build validation: `npm run build`
- Linting: `npm run lint`
- Type checking: `npm run type-check` or `tsc --noEmit`

### Visual Regression (Manual)
- Screenshot comparison before/after on desktop (must match)
- Document any intentional mobile-only changes

### Edge Cases
- Very small screens (320px width)
- Very wide screens (3840px 4K)
- Long text in tables/cards (overflow handling)
- Empty states on mobile
- Dialogs with long forms
- Tables with many rows
- Network errors (loading states on mobile)

## Validation Commands

Execute every command to validate task works correctly with zero regressions:

```bash
# Build validation
npm run build
# Expected: Successful build, no errors

# Lint validation
npm run lint
# Expected: Pass with no new warnings

# Type checking (if available)
npm run type-check
# Expected: No TypeScript errors

# Dev server (manual testing)
npm run dev
# Expected: Server starts, visit http://localhost:3000
# Test: All pages work on mobile and desktop
```

### Manual Validation Checklist
- [ ] Desktop screenshots match before/after (no changes)
- [ ] Sidebar sheet works on mobile, sidebar normal on desktop
- [ ] Project detail sidebar hidden on mobile, visible on desktop
- [ ] Kanban hidden on mobile, visible on desktop
- [ ] Strategy tables show 2 columns on mobile, 4+ on desktop
- [ ] Floating panels full-width on mobile, floating on desktop
- [ ] All modals full-screen on mobile, sized on desktop
- [ ] All buttons easy to tap (44px minimum)
- [ ] No horizontal scrolling (except intentional table scroll)
- [ ] All functionality works: create, edit, save, download

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All validation commands pass with expected output
- [ ] No regressions (desktop unchanged, build passes, lint clean)
- [ ] Patterns followed (hide/show, responsive breakpoints, existing patterns reused)
- [ ] Manual testing complete on mobile and desktop viewports
- [ ] Implementation log created with test results and screenshots
- [ ] All step checkpoints completed

## Notes

### Design Decisions
- **Sidebar Sheet vs Bottom Nav**: Sheet chosen because it preserves existing navigation structure and is familiar pattern from marketing navbar
- **Kanban Hidden**: User confirmed table sufficient on mobile, avoids complexity of responsive Kanban
- **Tables Strategy**: Hide columns vs cards - use cards (existing pattern) where available, hide columns for simpler tables
- **Breakpoint**: md (768px) as mobile/desktop split - aligns with Tailwind defaults and iPad boundary
- **Touch Targets**: 44px Apple standard - more conservative than 48px Material but proven guideline

### Implementation Priorities
1. **High Impact**: Sidebar, project detail, strategy screen (biggest usability wins)
2. **Medium Impact**: Forms/modals, touch targets (polish)
3. **Low Impact**: Navbar, tabs, breadcrumbs (minor refinements)

### Future Enhancements (Out of Scope)
- Native mobile app
- Offline support
- Touch gestures (swipe, pinch-zoom)
- Mobile-specific features (camera upload, native share)
- Performance optimization (code splitting by route)

### Resources Used
- Existing `use-media-query` hook (extend usage)
- Radix Sheet component (already in dependencies)
- Team table mobile cards (pattern to replicate)
- Work package table mobile cards (pattern to replicate)
- Tailwind responsive utilities (extensive use)

## Research Documentation

### Radix UI Sheet Component
- Docs: https://www.radix-ui.com/primitives/docs/components/dialog
- Usage: Sheet is Dialog variant with slide-in animation
- Props: `side="left"` for left slide, `open`/`onOpenChange` for state
- Already installed: Part of @radix-ui/react-dialog package

### Tailwind CSS Responsive Design
- Docs: https://tailwindcss.com/docs/responsive-design
- Mobile-first: Base styles = mobile, prefixes = larger screens
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Hide/Show: `hidden md:block`, `md:hidden`, `hidden lg:block`
- Flex Direction: `flex-col md:flex-row`
- Grid Columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Touch Target Guidelines
- Apple HIG: 44x44 pt minimum
- Material Design: 48x48 dp minimum
- WebAIM: 44x44 px minimum for accessibility
- Reference: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

### Mobile UX Patterns
- Sheet Navigation: Common for mobile (Twitter, Facebook apps)
- Full-Screen Modals: Standard on mobile for forms
- Card Layouts: Better than tables for complex data on mobile
- Sticky Bottom Bars: Common pattern for CTAs on mobile (Instagram, shopping apps)

## Implementation Log Path
`specs/mobile_responsive_optimization/mobile_responsive_optimization_implementation.log`
