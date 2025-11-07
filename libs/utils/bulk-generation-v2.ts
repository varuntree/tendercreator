/**
 * Bulk Generation Utility V2 - Client-Orchestrated Batching
 * Uses new batch API endpoint for efficient multi-document generation
 */

/**
 * Progress tracking for bulk document generation
 */
export type BatchProgress = {
  phase: 'batching' | 'generating' | 'complete' | 'error'
  batchNumber: number
  totalBatches: number
  completedDocs: number
  totalDocs: number
  message: string
  currentBatch?: string[] // Current work package IDs being processed
}

/**
 * Result of bulk generation operation
 */
export type BulkGenerationResult = {
  succeeded: Array<{ workPackageId: string }>
  failed: Array<{ workPackageId: string; error: string }>
  totalGenerated: number
  totalFailed: number
}

/**
 * Create smart batches from work package IDs
 * Batches are sized to optimize for token limits and API efficiency
 */
export function createSmartBatches(
  workPackageIds: string[],
  options: {
    maxBatchSize?: number
    maxTokensPerBatch?: number
  } = {}
): string[][] {
  const { maxBatchSize = 3 } = options

  const batches: string[][] = []
  let currentBatch: string[] = []

  for (const wpId of workPackageIds) {
    currentBatch.push(wpId)

    // Create new batch when reaching max size
    if (currentBatch.length >= maxBatchSize) {
      batches.push([...currentBatch])
      currentBatch = []
    }
  }

  // Add remaining items as final batch
  if (currentBatch.length > 0) {
    batches.push(currentBatch)
  }

  return batches
}

/**
 * Delay utility for rate limit safety
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a batch with split strategy if it fails due to token limits
 */
async function retryBatchWithSplit(
  projectId: string,
  batch: string[],
  instructions?: string
): Promise<any> {
  // If batch is already size 1, can't split further
  if (batch.length === 1) {
    throw new Error('Single document batch failed - cannot split further')
  }

  // Split batch in half
  const mid = Math.floor(batch.length / 2)
  const firstHalf = batch.slice(0, mid)
  const secondHalf = batch.slice(mid)

  console.log(
    `[Bulk Gen] Splitting failed batch into ${firstHalf.length} + ${secondHalf.length} docs`
  )

  // Try each half separately
  const results = []

  for (const subBatch of [firstHalf, secondHalf]) {
    const response = await fetch(`/api/projects/${projectId}/generate-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workPackageIds: subBatch,
        instructions,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Batch generation failed')
    }

    const data = await response.json()
    results.push(...data.results)
  }

  return { results }
}

/**
 * Generate multiple work packages using client-orchestrated batching
 *
 * @param projectId - Project ID
 * @param workPackageIds - Array of work package IDs to generate
 * @param onProgress - Callback for progress updates
 * @param instructions - Optional generation instructions
 * @returns Result containing succeeded and failed documents
 */
export async function bulkGenerateDocuments(
  projectId: string,
  workPackageIds: string[],
  onProgress?: (progress: BatchProgress) => void,
  instructions?: string
): Promise<BulkGenerationResult> {
  console.log('[Bulk Gen V2] Starting bulk generation for', workPackageIds.length, 'documents')

  // Create smart batches (2-3 docs per batch)
  const batches = createSmartBatches(workPackageIds, { maxBatchSize: 3 })
  console.log(`[Bulk Gen V2] Created ${batches.length} batches`)

  // Notify batching complete
  onProgress?.({
    phase: 'batching',
    batchNumber: 0,
    totalBatches: batches.length,
    completedDocs: 0,
    totalDocs: workPackageIds.length,
    message: `Created ${batches.length} batches for ${workPackageIds.length} documents`,
  })

  const succeeded: Array<{ workPackageId: string }> = []
  const failed: Array<{ workPackageId: string; error: string }> = []

  // Process batches sequentially
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const batchNumber = i + 1

    console.log(`[Bulk Gen V2] Processing batch ${batchNumber}/${batches.length}:`, batch)

    // Update progress
    onProgress?.({
      phase: 'generating',
      batchNumber,
      totalBatches: batches.length,
      completedDocs: succeeded.length,
      totalDocs: workPackageIds.length,
      message: `Generating batch ${batchNumber} of ${batches.length}... (${batch.length} documents)`,
      currentBatch: batch,
    })

    try {
      // Call batch generation API
      const response = await fetch(`/api/projects/${projectId}/generate-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workPackageIds: batch,
          instructions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // If token limit error, try splitting batch
        if (
          errorData.error &&
          (errorData.error.includes('token limit') || errorData.error.includes('too large'))
        ) {
          console.log('[Bulk Gen V2] Token limit hit, splitting batch...')

          try {
            const splitResults = await retryBatchWithSplit(projectId, batch, instructions)
            // Process split results
            for (const result of splitResults.results) {
              if (result.success) {
                succeeded.push({ workPackageId: result.workPackageId })
              } else {
                failed.push({
                  workPackageId: result.workPackageId,
                  error: result.error || 'Failed after split',
                })
              }
            }
            continue
          } catch (splitError) {
            console.error('[Bulk Gen V2] Split retry failed:', splitError)
            // Mark all in batch as failed
            for (const wpId of batch) {
              failed.push({
                workPackageId: wpId,
                error: `Batch failed: ${splitError instanceof Error ? splitError.message : 'Unknown error'}`,
              })
            }
            continue
          }
        }

        // Handle rate limit errors
        if (errorData.isRateLimitError) {
          const retryDelay = errorData.retryDelaySeconds || 60
          console.log(`[Bulk Gen V2] Rate limited, waiting ${retryDelay}s...`)

          onProgress?.({
            phase: 'generating',
            batchNumber,
            totalBatches: batches.length,
            completedDocs: succeeded.length,
            totalDocs: workPackageIds.length,
            message: `Rate limited. Waiting ${retryDelay} seconds before retry...`,
          })

          await delay(retryDelay * 1000)

          // Retry this batch
          i--
          continue
        }

        // Other errors - mark batch as failed
        console.error('[Bulk Gen V2] Batch failed:', errorData.error)
        for (const wpId of batch) {
          failed.push({
            workPackageId: wpId,
            error: errorData.error || 'Batch generation failed',
          })
        }
        continue
      }

      // Success - process results
      const data = await response.json()
      console.log(`[Bulk Gen V2] Batch ${batchNumber} completed:`, data)

      // Track results
      for (const result of data.results) {
        if (result.success) {
          succeeded.push({ workPackageId: result.workPackageId })
        } else {
          failed.push({
            workPackageId: result.workPackageId,
            error: result.error || 'Unknown error',
          })
        }
      }

      // Update progress
      onProgress?.({
        phase: 'generating',
        batchNumber,
        totalBatches: batches.length,
        completedDocs: succeeded.length,
        totalDocs: workPackageIds.length,
        message: `Batch ${batchNumber} complete. ${succeeded.length}/${workPackageIds.length} documents generated.`,
      })

      // Wait 5 seconds between batches (rate limit safety)
      if (i < batches.length - 1) {
        console.log('[Bulk Gen V2] Waiting 5s before next batch...')
        await delay(5000)
      }
    } catch (error) {
      console.error(`[Bulk Gen V2] Batch ${batchNumber} error:`, error)

      // Mark all in batch as failed
      for (const wpId of batch) {
        failed.push({
          workPackageId: wpId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  // Final progress update
  onProgress?.({
    phase: 'complete',
    batchNumber: batches.length,
    totalBatches: batches.length,
    completedDocs: succeeded.length,
    totalDocs: workPackageIds.length,
    message: `Generation complete. ${succeeded.length} succeeded, ${failed.length} failed.`,
  })

  console.log('[Bulk Gen V2] Bulk generation complete:', {
    succeeded: succeeded.length,
    failed: failed.length,
  })

  return {
    succeeded,
    failed,
    totalGenerated: succeeded.length,
    totalFailed: failed.length,
  }
}
