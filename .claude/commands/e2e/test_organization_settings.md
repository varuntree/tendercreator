# E2E Test: Organization Settings

Test organization settings page functionality including profile updates, company profile creation, and logo upload.

## User Story

As a user
I want to manage my organization settings
So that I can update company details and create a profile for AI context

## Test Steps

1. Navigate to `http://localhost:3000/signin`
2. Sign in with test credentials:
   - Email: test@tendercreator.dev
   - Password: TestPass123!
3. Wait for redirect to dashboard
4. Take a screenshot of the dashboard

5. Navigate to `/settings` page
6. Take a screenshot of the settings page initial state
7. **Verify** page header shows "Company" with icon
8. **Verify** "Company Details" section is visible
9. **Verify** "Company Profile" section is visible
10. **Verify** organization name input is visible and populated

11. Update organization name:
    - Clear the organization name input
    - Enter "Test Organization Updated"
    - Click "Update Profile" button
    - Wait for success message
12. Take a screenshot after name update
13. **Verify** success alert appears

14. Create/Edit company profile:
    - Click "Create Company Profile" or "Edit Company Profile" button
    - **Verify** dialog opens with form fields
15. Take a screenshot of the company profile form

16. Fill company profile form:
    - Company Name: "Test Construction Company"
    - Company Description: "We are a leading construction company specializing in commercial and residential projects. With over 20 years of experience, we deliver quality results."
    - Industry: Select "Construction"
    - Services Offered: "Commercial Construction, Residential Building, Project Management"
    - Key Projects: "Built Sydney Opera House Extension, Melbourne CBD Tower"
    - Certifications: "ISO 9001, AS 4801, Green Building Council"
    - Differentiators: "Award-winning safety record and sustainable building practices"
17. Take a screenshot of filled form

18. Click "Save Company Profile" button
19. Wait for dialog to close
20. **Verify** green company profile card is visible
21. **Verify** card shows company name "Test Construction Company"
22. Take a screenshot of the company profile card

23. Refresh the page
24. **Verify** company profile card still displays
25. **Verify** data persists after refresh
26. Take a screenshot after refresh

27. Test delete organization dialog (DO NOT CONFIRM):
    - Click "Delete organization" button
    - **Verify** confirmation dialog opens
    - **Verify** dialog shows warning message
    - **Verify** input field for typing org name is visible
28. Take a screenshot of delete confirmation dialog
29. Click "Cancel" to close dialog

## Success Criteria

- Settings page loads without errors
- Organization name can be updated
- Update success message appears
- Company profile form opens
- All form fields accept input
- Profile saves successfully
- Green profile card displays after save
- Profile data persists after page refresh
- Delete confirmation dialog opens and cancels properly
- At least 8 screenshots are taken

## Notes

- Use test logo fixture: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample-logo.png` (create if needed)
- DO NOT actually delete the test organization
- Verify all data persists in database by refreshing page
