# E2E Test: UI Exploration Version Switching

Test version switcher dropdown and navigation between design explorations.

## User Story
As a designer
I want to switch between UI/UX versions
So that I can compare different design approaches

## Test Steps

1. Navigate to `/projects/[test-project-id]` (use existing test project)
2. Take screenshot of initial state (should be v1 or default)
3. **Verify** VersionSwitcher dropdown is visible in top-right
4. **Verify** dropdown shows options "Version 1" through "Version 10"
5. Select "Version 3" from dropdown
6. **Verify** URL updates to include `?v=3`
7. Take screenshot of Version 3
8. **Verify** layout changed (tab navigation visible, different from v1)
9. Select "Version 7" from dropdown
10. **Verify** URL updates to `?v=7`
11. Take screenshot of Version 7
12. **Verify** layout changed again (accordion visible, different from v3)
13. Return to Version 1 via dropdown
14. **Verify** URL updates to `?v=1`
15. **Verify** back to original baseline layout

## Success Criteria
- Dropdown renders with 10 options
- Selecting version updates URL with `?v=` param
- Page re-renders with different layout per version
- 3 screenshots captured (v1, v3, v7)
- All versions visually distinct
- No JavaScript errors in console
- Version persists on page reload

## Expected Layouts

**Version 1 (Baseline)**:
- Full-width header card
- Stat boxes in 5-column grid
- Documents section in header
- Work packages below

**Version 3 (Tabs)**:
- Compact single-row header
- Horizontal tab navigation (Overview, Work Packages, Documents)
- Tab indicators visible
- Active tab highlighted

**Version 7 (Accordion)**:
- Compact sticky header
- Single-column accordion list
- Work packages as expandable items
- Chevron icons visible

## Test Data Requirements
- Existing test project with ≥3 work packages
- Test credentials: test@tendercreator.dev / TestPass123!
- Project must have documents and work packages for full UI testing
