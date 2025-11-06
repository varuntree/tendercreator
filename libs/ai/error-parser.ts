/**
 * Gemini API Error Types
 * Based on actual error structure from Google Generative AI
 */

export interface GeminiRetryInfo {
  '@type': 'type.googleapis.com/google.rpc.RetryInfo'
  retryDelay: string // Format: "42s"
}

export interface GeminiQuotaFailure {
  '@type': 'type.googleapis.com/google.rpc.QuotaFailure'
  violations: Array<{
    quotaMetric: string
    quotaId: string
    quotaDimensions: Record<string, string>
    quotaValue: string
  }>
}

export interface GeminiErrorDetail {
  '@type': string
  [key: string]: unknown
}

export interface GeminiErrorResponse {
  status?: number
  statusText?: string
  errorDetails?: GeminiErrorDetail[]
}

export interface ParsedGeminiError {
  isRateLimitError: boolean
  retryDelaySeconds: number | null
  originalError: unknown
  message: string
}

/**
 * Parse retry delay from Gemini error response
 * @param retryDelay - String like "42s" or "1.5s"
 * @returns Number of seconds
 */
function parseRetryDelay(retryDelay: string): number {
  const match = retryDelay.match(/^(\d+(?:\.\d+)?)s$/)
  if (match) {
    return parseFloat(match[1])
  }
  return 60 // Default 60s if can't parse
}

/**
 * Extract RetryInfo from Gemini error details
 */
function extractRetryInfo(errorDetails: GeminiErrorDetail[]): GeminiRetryInfo | null {
  const retryInfo = errorDetails.find(
    (detail) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
  ) as GeminiRetryInfo | undefined

  return retryInfo || null
}

/**
 * Check if error is a quota/rate limit error
 */
function isQuotaError(errorDetails: GeminiErrorDetail[]): boolean {
  return errorDetails.some(
    (detail) => detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
  )
}

/**
 * Parse Gemini API error to extract rate limit information
 *
 * @param error - Error from Gemini API call
 * @returns Parsed error information including rate limit status
 */
export function parseGeminiError(error: unknown): ParsedGeminiError {
  // Default parsed error
  const result: ParsedGeminiError = {
    isRateLimitError: false,
    retryDelaySeconds: null,
    originalError: error,
    message: error instanceof Error ? error.message : 'Unknown error',
  }

  // Try to extract structured error info
  if (error && typeof error === 'object') {
    const err = error as any

    // Check for 429 status code
    if (err.status === 429 || err.statusText === 'Too Many Requests') {
      result.isRateLimitError = true
    }

    // Extract errorDetails array
    const errorDetails = err.errorDetails as GeminiErrorDetail[] | undefined

    if (errorDetails && Array.isArray(errorDetails)) {
      // Confirm it's a quota error
      if (isQuotaError(errorDetails)) {
        result.isRateLimitError = true
      }

      // Extract retry delay
      const retryInfo = extractRetryInfo(errorDetails)
      if (retryInfo && retryInfo.retryDelay) {
        result.retryDelaySeconds = parseRetryDelay(retryInfo.retryDelay)
      }
    }

    // Fallback: Check if error message mentions quota
    if (result.message.includes('quota') || result.message.includes('rate limit')) {
      result.isRateLimitError = true
    }
  }

  // If rate limit detected but no delay found, use default
  if (result.isRateLimitError && result.retryDelaySeconds === null) {
    result.retryDelaySeconds = 60 // Default 60s
  }

  return result
}

/**
 * Sleep for specified duration
 * @param seconds - Number of seconds to sleep
 */
export async function waitForRateLimit(seconds: number): Promise<void> {
  console.log(`[Rate Limit] Waiting ${seconds}s before retry...`)
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  console.log(`[Rate Limit] Wait complete, retrying now`)
}
