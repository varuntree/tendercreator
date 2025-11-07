# E2E Test: AI Generation Flows

**Test Suite:** AI Pipeline Refactor - End-to-End Validation
**Prerequisites:** Project with uploaded RFT docs and 5+ work packages
**Duration:** ~15-20 minutes

## Setup Requirements

Before running these tests:
1. **Project Setup:**
   - Create a test project via UI
   - Upload at least 2 RFT documents (PDFs)
   - Ensure RFT analysis has been run
   - Verify 5+ work packages exist with requirements

2. **Environment:**
   - Valid `GEMINI_API_KEY` in `.env.local`
   - Next.js dev server running (`npm run dev`)
   - Supabase connection configured

3. **Browser:**
   - Chrome/Edge with DevTools open (Network tab)
   - Console for monitoring logs

---

## Test 1: Single Document Strategy Auto-Generation

**Objective:** Verify combined strategy (bid + themes) generates automatically on mount

### Steps:
1. Navigate to a work package (e.g., `/work-packages/[id]`)
2. Observe strategy generation screen loads
3. Wait for auto-trigger

### Expected Results:
- ✅ Loading indicator shows "Generating bid analysis and win themes..."
- ✅ Single API call to `/api/work-packages/[id]/generate-strategy` (check Network tab)
- ✅ Response contains both `bidAnalysis` and `winThemes` fields
- ✅ Bid analysis displays with 6 scored criteria
- ✅ Win themes display (3-5 themes)
- ✅ No console errors
- ✅ Status codes: 200 (success) or 429 (rate limit with retry delay)

### Screenshots to Capture:
- Strategy screen during loading
- Network tab showing single request
- Completed strategy display

### What to Verify in Network Tab:
```json
// Response structure
{
  "success": true,
  "bidAnalysis": {
    "criteria": [...], // 6 items
    "totalScore": 75,
    "recommendation": "bid",
    "reasoning": "...",
    "strengths": [...],
    "concerns": [...]
  },
  "winThemes": [
    "Win theme 1...",
    "Win theme 2...",
    "Win theme 3..."
  ]
}
```

### Error Scenarios to Test:
- **Rate Limit:** If hit, verify error message shows retry delay
- **Token Limit:** If context too large, verify clear error with token count

---

## Test 2: Streaming Content Generation

**Objective:** Verify real-time content streaming when user clicks "Generate Content"

### Steps:
1. From strategy screen (after Test 1 completes)
2. Click "Generate Content" button
3. Observe immediate navigation to editor
4. Watch content stream in real-time

### Expected Results:
- ✅ **Immediate navigation** to `/work-packages/[id]/edit`
- ✅ "Generating content..." indicator appears at top of editor
- ✅ Content streams in paragraph by paragraph
- ✅ Network tab shows `text/event-stream` connection
- ✅ Console shows SSE events: `chunk`, `done`
- ✅ Indicator disappears when complete
- ✅ Full content loaded in editor

### Screenshots to Capture:
- Editor with "Generating..." indicator
- Partial content mid-stream
- Complete content with indicator removed
- Network tab showing SSE connection

### What to Verify in Network Tab:
```
Request Headers:
  Accept: text/event-stream

Response (SSE format):
  event: chunk
  data: {"text":"# Technical Approach\n\n"}

  event: chunk
  data: {"text":"Our solution leverages..."}

  event: done
  data: {"fullContent":"# Technical Approach\n\nOur solution..."}
```

### What to Verify in Console:
- No errors during streaming
- Content appended incrementally
- Editor remains interactive

---

## Test 3: Bulk Batch Generation

**Objective:** Verify client-orchestrated batching for multiple documents

### Steps:
1. Navigate to project dashboard
2. Select 5-6 work packages (use checkboxes or "Select All")
3. Click "Generate All Documents" button
4. Observe progress updates

### Expected Results:
- ✅ Progress shows "Generating batch 1 of 2..." (or 3 for 6 docs)
- ✅ Progress bar updates in real-time
- ✅ Message updates: "2 of 6 documents complete" after first batch
- ✅ Network tab shows multiple requests to `/api/projects/[id]/generate-batch`
- ✅ 5 second delay between batches visible in timeline
- ✅ Final message: "Successfully generated 6/6 documents"
- ✅ All work packages show content when opened

### Screenshots to Capture:
- Progress UI during batch 1
- Network tab showing batch requests with 5s gaps
- Final success message
- Completed work packages in table

### What to Verify in Network Tab:
```json
// Request body
{
  "workPackageIds": ["uuid-1", "uuid-2", "uuid-3"],
  "instructions": "..."
}

// Response
{
  "success": true,
  "results": [
    { "workPackageId": "uuid-1", "success": true },
    { "workPackageId": "uuid-2", "success": true },
    { "workPackageId": "uuid-3", "success": true }
  ],
  "totalGenerated": 3,
  "totalSaved": 3
}
```

### Timing to Verify:
- Each batch: ~15-30 seconds
- Delay between batches: ~5 seconds
- Total for 6 docs: ~60-90 seconds (vs 180+ before)

---

## Test 4: Batch Error Handling & Recovery

**Objective:** Verify graceful error handling and retry logic

### Test 4a: Rate Limit Handling

**Steps to Trigger:**
- Run bulk generation multiple times in succession
- OR generate with large batch size

**Expected Results:**
- ✅ Clear error message: "Rate limited. Retry in X seconds."
- ✅ Progress shows waiting state
- ✅ Automatic retry after delay
- ✅ Successful completion after retry

### Test 4b: Token Limit Handling

**Steps to Trigger:**
- Try to generate work packages with very long requirements
- OR context with many large org docs

**Expected Results:**
- ✅ Error message: "Batch would exceed token limit"
- ✅ Suggestion: "Reduce batch size or organization docs"
- ✅ Token count displayed: "Estimated: 65,000 tokens"
- ✅ Batch automatically splits if possible

### Test 4c: Partial Failure

**Steps to Simulate:**
- (Difficult to trigger naturally - may require manual API manipulation)

**Expected Results:**
- ✅ Progress continues even if one batch fails
- ✅ Failed documents listed with error messages
- ✅ Summary: "Successfully generated 4/6 documents. 2 failed."
- ✅ Option to retry failed documents individually

---

## Test 5: RFT Analysis (Existing Flow Validation)

**Objective:** Ensure refactored AI service doesn't break existing features

### Steps:
1. Create new project
2. Upload RFT document (PDF)
3. Click "Analyze" button
4. Wait for analysis

### Expected Results:
- ✅ Documents identified correctly
- ✅ Requirements extracted for each document
- ✅ Work packages created automatically
- ✅ No console errors
- ✅ Analysis completes in reasonable time

### Screenshots to Capture:
- Analysis results showing identified documents
- Generated work packages with requirements

---

## Test 6: Editor Selection Edit

**Objective:** Verify refactored editor actions still work

### Steps:
1. Open work package editor with content
2. Select a paragraph of text
3. Use "Make it more detailed" action
4. Observe replacement

### Expected Results:
- ✅ Selection edit completes successfully
- ✅ Text replaced in editor
- ✅ Quality of edit is maintained
- ✅ No console errors

---

## Validation Checklist

After completing all tests, verify:

### Performance Metrics:
- [ ] Single doc generation: 2 API calls (was 3)
- [ ] Bulk 6 docs: 2-3 batch calls (was 12-18)
- [ ] No "too many requests" errors for reasonable workloads
- [ ] Streaming provides immediate feedback

### Code Quality:
- [ ] All AI routes use `geminiService.executeRequest()`
- [ ] Token validation on all generation endpoints
- [ ] Consistent error format across routes
- [ ] Context caching reduces repeated fetches

### User Experience:
- [ ] Clear progress indicators
- [ ] Helpful error messages with actionable suggestions
- [ ] Automatic retry on rate limits
- [ ] Streaming content feels responsive

### Error Handling:
- [ ] Rate limits show retry delay
- [ ] Token limits show clear guidance
- [ ] Partial failures don't block entire batch
- [ ] Network errors show user-friendly messages

---

## Common Issues & Troubleshooting

### Issue: "Rate limit exceeded" on first request
**Cause:** API key might be over quota or invalid
**Fix:** Check `GEMINI_API_KEY` in `.env.local`, try again in 60s

### Issue: "Context exceeds token limit"
**Cause:** Too many/large organization documents
**Fix:** Remove some org docs temporarily, or split work packages

### Issue: Streaming not working
**Cause:** Browser doesn't support EventSource or wrong Accept header
**Fix:** Use Chrome/Edge, check Network tab for `Accept: text/event-stream`

### Issue: Batch generation timeout
**Cause:** Edge runtime timeout (5 min max)
**Fix:** Reduce batch size to 2 docs per batch, check maxDuration config

---

## Success Criteria

**Test Suite Passes If:**
1. ✅ All 6 tests complete without critical errors
2. ✅ Request reduction confirmed (3→2 single, 20→4 bulk for 10 docs)
3. ✅ Streaming works for real-time feedback
4. ✅ Bulk generation shows per-batch progress
5. ✅ Error handling provides clear guidance
6. ✅ No regressions in existing features

**Known Limitations (Expected):**
- Rate limits may occur during heavy testing (this is expected behavior)
- Very large contexts (>60K tokens) will trigger warnings (correct)
- Edge runtime may timeout for batches >3 docs (by design)

---

## Test Report Template

After completing tests, document:

```markdown
## Test Execution Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging]

### Test Results:
- Test 1 (Strategy Auto-Gen): ✅ PASS / ❌ FAIL
- Test 2 (Streaming Content): ✅ PASS / ❌ FAIL
- Test 3 (Bulk Batching): ✅ PASS / ❌ FAIL
- Test 4 (Error Handling): ✅ PASS / ❌ FAIL
- Test 5 (RFT Analysis): ✅ PASS / ❌ FAIL
- Test 6 (Selection Edit): ✅ PASS / ❌ FAIL

### Performance Metrics:
- Single doc: [X] requests, [Y] seconds
- Bulk 6 docs: [X] batches, [Y] seconds
- Rate limit hits: [X] times (auto-recovered: [Y])

### Issues Found:
[List any bugs or unexpected behavior]

### Screenshots:
[Attach screenshots from each test]

### Overall Result: ✅ PASS / ❌ FAIL
```

---

## Next Steps After Testing

If tests pass:
1. Update frontend components to use new endpoints
2. Deploy to staging
3. Run tests again in staging environment

If tests fail:
1. Document failing scenarios
2. Check implementation log for missing steps
3. Review error messages and fix root cause
4. Re-run failed tests
