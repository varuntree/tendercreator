# Bug: Gemini Rate Limit Failures During Bulk Document Generation

## Bug Description
When users trigger bulk document generation (multiple work packages simultaneously), the system makes parallel API calls to Gemini API. Gemini Free Tier has a rate limit of 10 requests per minute per project per model (`generativelanguage.googleapis.com/generate_content_free_tier_requests`).

**Symptoms:**
- Multiple `429 Too Many Requests` errors
- Some documents generate successfully (first 10 requests)
- Remaining documents fail with quota exceeded errors
- Error shows: `Please retry in 40-42s` but no automatic retry happens
- System returns 500 errors for failed generations

**Expected:** All documents should eventually generate, even if rate limited
**Actual:** Documents beyond rate limit fail permanently with 500 errors

## Problem Statement
Parallel bulk generation triggers 10+ simultaneous API calls to Gemini, exceeding free tier rate limits (10 RPM). Current implementation has retry logic but it doesn't handle rate limit errors with exponential backoff and doesn't respect the `retryDelay` value returned by Gemini API.

## Solution Statement
Implement sequential processing with rate-aware retry logic:
1. Process work packages sequentially (one at a time) instead of in parallel
2. Add rate limit detection from Gemini error responses
3. Extract `retryDelay` from error response and wait that duration
4. Implement exponential backoff for non-rate-limit errors
5. Keep user informed with progress updates

## Steps to Reproduce
1. Create project with RFT that generates 10+ work packages
2. Click "Generate All Documents" button
3. Watch console logs show parallel API calls
4. First ~10 documents succeed
5. Remaining documents fail with 429 rate limit errors
6. Failed work packages show error state, no retry

## Root Cause Analysis
**File:** `libs/utils/bulk-generation.ts:203`

The `bulkGenerateDocuments` function uses `Promise.allSettled` to process all work packages in parallel:

```typescript
const results = await Promise.allSettled(
  pendingWorkPackages.map(async (wp) => {
    // Triggers ALL requests simultaneously
    await generateSingleDocument(wp.id)
  })
)
```

**Issue 1:** Parallel execution
- All work packages start generation simultaneously
- Each work package makes 2 API calls (win themes + content)
- 10 work packages = 20 API calls at once
- Exceeds Gemini's 10 RPM limit instantly

**Issue 2:** Insufficient rate limit handling
- `apiCallWithRetry` (line 67) has retry logic but doesn't detect rate limits
- Doesn't extract `retryDelay` from Gemini error response
- Uses fixed exponential backoff instead of API-provided delay
- Gemini returns structured error with `RetryInfo.retryDelay` but code ignores it

**Issue 3:** Error propagation
- Rate limit failures bubble up as generic 500 errors
- User sees "Generation failed" without rate limit context
- No automatic retry after rate limit period expires

## Relevant Files

### libs/utils/bulk-generation.ts
- Main bulk generation logic with parallel execution (line 203)
- Contains retry infrastructure but needs rate limit awareness
- **Why relevant:** Core bug location, needs sequential processing + rate limit handling

### libs/ai/content-generation.ts
- Calls Gemini API via `model.generateContent()` (line 66)
- Error handling doesn't extract structured error data from Gemini
- **Why relevant:** Where Gemini errors originate, needs structured error parsing

### libs/ai/client.ts
- Exports Gemini model instance
- No rate limiting or request queuing
- **Why relevant:** Potential location for request queue/throttling layer

### app/api/work-packages/[id]/generate-content/route.ts
- API endpoint that calls content generation
- Returns generic 500 errors on failure
- **Why relevant:** Error responses need rate limit details for client

## Step by Step Tasks

### Extract and parse Gemini rate limit errors
- Read Gemini error response structure from logs
- Create type definitions for Gemini error format (`errorDetails`, `RetryInfo`, `QuotaFailure`)
- Add function `parseGeminiError` to extract rate limit info (is429, retryDelaySeconds)
- Update `libs/ai/content-generation.ts` error handling to use parser
- Return structured error from API routes with `isRateLimitError` flag

### Add rate-aware delay utility
- Create `waitForRateLimit` function that sleeps for specified duration
- Add progress logging ("Rate limit hit, waiting 42s...")
- Handle both Gemini-provided delays and fallback delays

### Modify bulk generation to sequential processing
- Replace `Promise.allSettled` with sequential for-loop in `bulkGenerateDocuments`
- Process one work package at a time
- Call `updateProgress` after each work package completes
- Add inter-request delay (1s) to avoid bursting rate limits

### Add rate limit retry logic to generation functions
- Update `generateSingleDocument` to catch rate limit errors
- Extract retry delay from error response
- Wait for specified delay then retry
- Limit retries to prevent infinite loops (max 3 rate limit retries)
- Log retry attempts with timestamps

### Update error handling and user feedback
- Modify API routes to return rate limit details in error responses
- Update client-side error display to show rate limit messages
- Change generic "Generation failed" to "Rate limited, retrying in Xs..."
- Preserve existing retry logic for non-rate-limit errors

### Run validation commands
- Test with 10+ work packages
- Verify sequential processing (one at a time in logs)
- Confirm rate limit errors trigger retry with correct delay
- Verify all documents eventually succeed
- Check progress updates show rate limit status

## Validation Commands
Execute every command to validate the bug is fixed.

```bash
# Start dev server
npm run dev

# In browser console, trigger bulk generation with 15 work packages
# Monitor console logs for:
# - Sequential processing (one work package at a time)
# - Rate limit detection messages
# - Retry with delay messages
# - All work packages eventually completing

# Check logs should show:
# [Bulk Generation] Processing 1/15: <id>
# [Bulk Generation] Processing 2/15: <id>
# [Bulk Generation] Rate limit detected, waiting 42s...
# [Bulk Generation] Retrying after rate limit delay...
# [Bulk Generation] Completed: 15 succeeded, 0 failed

# Verify in UI:
# - Progress bar advances sequentially
# - Rate limit status shows in UI
# - All documents eventually complete
# - No 500 errors in network tab
```

## Notes
- Gemini Free Tier: 10 requests/min/project/model (hard limit)
- Sequential processing reduces throughput but ensures reliability
- Consider adding request queue for future optimization
- Rate limit applies per API key, not per user
- `retryDelay` from Gemini is authoritative (use instead of guessing)
- Keep exponential backoff for non-rate-limit errors (network issues, etc.)
