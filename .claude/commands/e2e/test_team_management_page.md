# E2E Test: Team Management Page UI

Validate that the Team management screen surfaces the correct TenderCreator-style UI elements and interactions.

## User Story

As an org admin demoing TenderCreator
I want to view and filter the Team page
So I can showcase multi-user collaboration capabilities during the MVP walkthrough

## Test Steps

1. Ensure the dev server is running locally (`npm run dev`) and log in with the test credentials (email `test@tendercreator.dev`, password `TestPass123!`).
2. Navigate to `http://localhost:3000/settings/team` after authentication.
3. **Verify** the hero section is visible with:
   - Team icon tile
   - Title text “Manage your workspace”
   - Description paragraph
   - Buttons “Export roster” and “Invite team member”
   - Take screenshot `01_team_hero.png`.
4. Scroll to the Team members card.
5. **Verify** the search input contains the placeholder “Search by name or email” and a magnifying-glass icon.
6. **Verify** the role filter select defaults to “All roles”.
7. Type “Oliver” into the search box and confirm only Oliver Grant remains in the table. Take screenshot `02_filtered_member.png`.
8. Clear the search input.
9. Change the role filter to “Company Admin” and confirm only Marcus Hall remains. Take screenshot `03_role_filter.png`.
10. Clear filters by selecting “All roles”.
11. Type a nonsense string (e.g., “zzz”) into the search input.
12. **Verify** the empty-state text “No team members match that search. Clear filters to see everyone in your workspace.” appears. Take screenshot `04_empty_state.png`.
13. Clear the search input to repopulate the table.
14. For the first member row, open the overflow (three dots) menu and confirm the options “Resend invite”, “Update permissions”, and “Remove from team” are present. Take screenshot `05_row_actions.png`.
15. Scroll to the Organisation roles section.
16. **Verify** the three cards (Admin, Company Admin, Company User) display their titles, badge/label, description, and at least three bullet highlights each. Take screenshot `06_role_cards.png`.

## Success Criteria
- Hero section content and CTAs render exactly as specified.
- Search + role filters correctly reduce the mocked member list.
- Empty-state messaging appears when filters yield zero results.
- Row action menu shows all three quick actions.
- Organisation role cards list accurate permissions/benefits.
- Six screenshots saved in `test_results/team_management_page_ui/` with filenames:
  - `01_team_hero.png`
  - `02_filtered_member.png`
  - `03_role_filter.png`
  - `04_empty_state.png`
  - `05_row_actions.png`
  - `06_role_cards.png`
