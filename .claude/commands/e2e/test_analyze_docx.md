# E2E Test: DOCX Upload and Analyze RFD Workflow

Test complete workflow: upload DOCX document → analyze RFD → verify work packages created.

## User Story

As a user
I want to upload a DOCX RFT document and analyze it
So that the system identifies all required submission documents

## Test Steps

1. Navigate to http://localhost:3000
2. Take a screenshot of the initial landing page
3. Click "Sign In" or navigate to sign-in page
4. **Verify** sign-in form is present with email and password fields
5. Enter test credentials:
   - Email: test@tendercreator.dev
   - Password: TestPass123!
6. Click "Sign In" button
7. Take a screenshot after sign-in
8. **Verify** redirected to dashboard or projects page

9. Navigate to Projects section
10. Click "Create New Project" or "+ New Project" button
11. **Verify** project creation form appears
12. Fill in project details:
    - Project Name: "Test DOCX Analysis Project"
    - Client Name: "Test Client"
13. Click "Create" or "Save" button
14. Take a screenshot of created project
15. **Verify** project appears in list or opens project detail page

16. Navigate to project documents section
17. **Verify** file upload area or "Upload Document" button present
18. Upload DOCX file: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft.docx`
19. **Verify** upload completes successfully (no errors)
20. **Verify** document appears in documents list
21. Take a screenshot showing uploaded document
22. **Verify** console shows extraction log: `[Extraction] sample_rft.docx ... chars extracted`

23. **Verify** "Analyze RFD" button is present and enabled
24. Click "Analyze RFD" button
25. Take a screenshot of analysis in progress
26. Wait for analysis to complete (up to 30 seconds)
27. **Verify** analysis completes without 400 error
28. **Verify** work packages or document requirements matrix appears
29. **Verify** at least one document type is identified
30. Take a screenshot of identified work packages/documents
31. **Verify** each work package shows document type and requirements

## Success Criteria
- Sign-in successful
- Project created successfully
- DOCX upload returns 200 (not error)
- Extraction log shows characters extracted > 0
- Analyze RFD returns 200 (NOT 400)
- Work packages created in database
- UI shows document requirements matrix
- At least 1 document type identified (e.g., "Technical Specification")
- 5 screenshots captured showing complete workflow
