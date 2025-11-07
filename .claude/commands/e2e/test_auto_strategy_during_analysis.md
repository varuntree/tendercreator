# E2E Test: Auto Strategy During Analysis

## User Story
As a user analyzing a new project
I want bid/no-bid guidance and win themes to exist right after analysis
So that opening any work package lets me generate content immediately.

## Test Steps
1. Navigate to the Application URL and sign in with the provided credentials from `test_e2e.md`.
2. Create a new project named "Auto Strategy Test" (set any deadline) and upload the sample RFT fixture.
3. Click **Analyze RFT** and wait for the streaming overlay to finish. **Verify** the analysis completes without manual intervention.
4. Open any generated work package.
5. **Verify** the strategy hero shows "Strategy ready" (no Start Planning button) and the Generate Content button is enabled immediately.
6. **Verify** the Bid / No-Bid card already displays recommendation, strengths, and concerns.
7. **Verify** the Win Themes card lists themes (>=3). Take screenshot `test_results/auto_strategy_during_analysis/01_strategy_ready.png`.
8. Click **Generate Content** to confirm navigation into the editor works.

## Success Criteria
- No manual “Start Tender Planning” action is required.
- Bid decision + win themes are populated instantly when opening the work package.
- Generate Content button is available right away.
- Screenshot saved at the specified path.

## Output Format
```json
{
  "test_name": "auto_strategy_during_analysis",
  "status": "passed|failed",
  "screenshots": [
    "test_results/auto_strategy_during_analysis/01_strategy_ready.png"
  ],
  "error": null
}
```
