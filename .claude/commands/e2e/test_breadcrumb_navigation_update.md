# E2E Test: Breadcrumb Navigation Update

## User Story
As a tender coordinator using the dashboard
I want breadcrumbs to reflect the exact project and document I'm viewing
So that I can always retrace my steps and confirm context at a glance.

## Preconditions
- Dev server running at http://localhost:3000
- Use credentials in `.claude/commands/test_e2e.md`
- Fixtures available under `test_fixtures/`

## Test Steps
1. Navigate to the Application URL and sign in with the provided credentials.
2. Confirm you land on the Projects list. **Verify** the breadcrumb shows a single segment labeled "Projects" (non-clickable since it is active). Take screenshot `test_results/breadcrumb_navigation_update/01_projects.png`.
3. Open any existing project from the grid. Wait for the dashboard to load. **Verify** the breadcrumb now reads `Projects / <Project Name>` with "Projects" clickable (navigates back) and the project name reflecting the actual entity. Capture screenshot `.../02_project.png`.
4. Click any work package within the project to open its workflow. **Verify** the breadcrumb updates to `Projects / <Project Name> / <Document Type>` where:
   - "Projects" links back to the list
   - `<Project Name>` links back to the project dashboard
   - `<Document Type>` is the current page (non-clickable)
   Take screenshot `.../03_work_package.png`.
5. Click the "Projects" crumb to ensure you return to the projects list, then use browser Back to return to the work package (breadcrumbs should restore automatically).

## Success Criteria
- Breadcrumb segments update immediately when navigating Projects → Project → Work Package.
- Intermediate segments are clickable and route correctly.
- Actual project/document names render (no placeholders) once data loads.
- Screenshots saved at the specified paths.

## Output Format
```json
{
  "test_name": "breadcrumb_navigation_update",
  "status": "passed|failed",
  "screenshots": [
    "test_results/breadcrumb_navigation_update/01_projects.png",
    "test_results/breadcrumb_navigation_update/02_project.png",
    "test_results/breadcrumb_navigation_update/03_work_package.png"
  ],
  "error": null
}
```
