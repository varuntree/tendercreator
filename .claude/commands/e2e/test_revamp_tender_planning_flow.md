# E2E Test: Revamped Tender Planning Flow

## User Story
As a tender writer preparing a document
I want to manually trigger tender planning before generating content
So that I understand when AI runs and only progress once strategy assets exist.

## Preconditions
- Next.js dev server running locally at http://localhost:3000
- Test credentials from `.claude/commands/test_e2e.md`
- Fixture files available in `test_fixtures/`

## Test Steps
1. Navigate to the Application URL and sign in with the provided credentials.
2. On the dashboard, click "New Project", name it "Planning Flow Test", set any deadline, and create the project.
3. Upload the sample RFT fixture (`test_fixtures/sample_rft.pdf`) as the primary document.
4. Click "Analyze RFT" and wait for the streaming progress overlay to finish. Once work packages appear, take a screenshot of the Work Packages table (`test_results/revamp_tender_planning_flow/01_packages.png`).
5. Open the first work package in the list.
6. **Verify** the Tender Planning hero shows the status badge "Planning not started" and the primary CTA reads "Start Tender Planning" (no "Generate Content" button yet).
7. Take a screenshot of this pre-planning state (`.../02_pre_planning.png`).
8. Click "Start Tender Planning" and wait for the success toast / status change.
9. **Verify** the status badge switches to "Strategy ready", and the CTA row now shows an enabled "Generate Content" button (plus Continue in Editor if content exists).
10. Inspect the Requirements, Bid/No-Bid, and Win Themes cards to ensure data populated (no placeholders). Take a screenshot (`.../03_post_planning.png`).
11. Click "Generate Content" to confirm the editor tab opens and streaming begins (no screenshot required).
12. Return to dashboard or stay; ensure no errors are present.

## Success Criteria
- Start Tender Planning button is the only CTA before planning runs.
- After planning completes, Generate Content button becomes visible and enabled.
- Requirements, Bid/No-Bid, and Win Themes cards render the refreshed UI with populated data post-planning.
- Screenshots saved at each named path.

## Output Format
```json
{
  "test_name": "revamp_tender_planning_flow",
  "status": "passed|failed",
  "screenshots": [
    "test_results/revamp_tender_planning_flow/01_packages.png",
    "test_results/revamp_tender_planning_flow/02_pre_planning.png",
    "test_results/revamp_tender_planning_flow/03_post_planning.png"
  ],
  "error": null
}
```
