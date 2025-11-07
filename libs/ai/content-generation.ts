import { executeRequest, executeStreamingRequest, parseJsonResponse } from './gemini-service'
import { buildWinThemesPrompt } from './prompts/generate-win-themes'
import { buildContentPrompt } from './prompts/generate-content'
import { buildCombinedStrategyPrompt } from './prompts/combined-strategy'
import { buildBatchGenerationPrompt } from './prompts/batch-generation'
import {
  buildExpandPrompt,
  buildShortenPrompt,
  buildAddEvidencePrompt,
  buildRephrasePrompt,
  buildCompliancePrompt,
  buildCustomPrompt,
  buildSelectionEditPrompt,
  selectionEditSystemInstruction,
} from './prompts/editor-actions'
import { WorkPackage, Requirement } from '@/libs/repositories/work-packages'
import { ProjectContext } from './context-assembly'
import { BidAnalysis } from './bid-analysis'

/**
 * Generate win themes for a work package (legacy - kept for backwards compatibility)
 * Consider using generateStrategy() instead for combined bid+themes generation
 */
export async function generateWinThemes(
  workPackage: WorkPackage,
  organizationDocs: string,
  rftDocs: string
): Promise<string[]> {
  const prompt = buildWinThemesPrompt(workPackage, organizationDocs, rftDocs)
  console.log('[Win Themes] Generating for:', workPackage.document_type)

  const response = await executeRequest({
    prompt,
    requestType: 'win-themes',
    temperature: 0.7,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Win themes generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const parsed = parseJsonResponse<{ win_themes: string[] }>(response)
  if (!parsed || !parsed.win_themes || !Array.isArray(parsed.win_themes)) {
    throw new Error('Invalid response structure: missing win_themes array')
  }

  console.log('[Win Themes] Generated', parsed.win_themes.length, 'themes')
  return parsed.win_themes
}

/**
 * Generate document content
 */
export async function generateDocumentContent(
  workPackage: WorkPackage,
  context: ProjectContext,
  winThemes: string[],
  instructions?: string
): Promise<string> {
  const prompt = buildContentPrompt(workPackage, context, winThemes, instructions)
  console.log('[Content] Generating document:', workPackage.document_type)
  console.log('[Content] Context size estimate:', context.totalTokensEstimate, 'tokens')

  const response = await executeRequest({
    prompt,
    requestType: 'content-generation',
    temperature: 0.7,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Content generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const content = response.data as string
  console.log('[Content] Generated length:', content.length, 'characters')
  return content
}

/**
 * Generate document content with streaming support
 * Yields chunks as they're generated for real-time display
 */
export async function* generateDocumentContentStream(
  workPackage: WorkPackage,
  context: ProjectContext,
  winThemes: string[],
  instructions?: string
): AsyncGenerator<string, void, unknown> {
  const prompt = buildContentPrompt(workPackage, context, winThemes, instructions)
  console.log('[Content Stream] Generating document:', workPackage.document_type)
  console.log('[Content Stream] Context size estimate:', context.totalTokensEstimate, 'tokens')

  for await (const chunk of executeStreamingRequest({
    prompt,
    requestType: 'content-generation-stream',
    temperature: 0.7,
  })) {
    yield chunk
  }
}

/**
 * Execute editor action
 */
export async function executeEditorAction(
  action: 'expand' | 'shorten' | 'add_evidence' | 'rephrase' | 'check_compliance' | 'custom',
  selectedText: string,
  fullDocument: string,
  context: {
    orgDocs?: string
    requirements?: Requirement[]
    customInstruction?: string
  }
): Promise<string> {
  let prompt: string

  switch (action) {
    case 'expand':
      prompt = buildExpandPrompt(selectedText, fullDocument, context.orgDocs || '')
      break
    case 'shorten':
      prompt = buildShortenPrompt(selectedText)
      break
    case 'add_evidence':
      prompt = buildAddEvidencePrompt(selectedText, context.orgDocs || '')
      break
    case 'rephrase':
      prompt = buildRephrasePrompt(selectedText)
      break
    case 'check_compliance':
      prompt = buildCompliancePrompt(selectedText, context.requirements || [])
      break
    case 'custom':
      prompt = buildCustomPrompt(selectedText, context.customInstruction || '', fullDocument)
      break
    default:
      throw new Error(`Unknown action: ${action}`)
  }

  console.log('[Editor Action]', action, 'for', selectedText.length, 'chars')

  const response = await executeRequest({
    prompt,
    requestType: `editor-action-${action}`,
    temperature: 0.7,
  })

  if (!response.success) {
    throw new Error(response.error || 'Editor action failed')
  }

  return response.data as string
}

interface SelectionEditArgs {
  instruction: string
  selectedText: string
  fullDocument: string
  documentType: string
  projectName: string
}

export async function runSelectionEdit({
  instruction,
  selectedText,
  fullDocument,
  documentType,
  projectName,
}: SelectionEditArgs): Promise<string> {
  const prompt = buildSelectionEditPrompt({
    instruction,
    selectedText,
    fullDocument,
    documentType,
    projectName,
  })

  const response = await executeRequest({
    prompt,
    systemInstruction: selectionEditSystemInstruction,
    requestType: 'selection-edit',
    temperature: 0.3,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Selection edit failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const responseText = (response.data as string).trim()
  if (!responseText) {
    throw new Error('AI returned an empty response.')
  }

  return responseText
}

/**
 * Generate combined strategy (bid analysis + win themes) in one request
 * Reduces API calls from 2 → 1
 */
export async function generateStrategy(
  workPackage: WorkPackage,
  projectContext: {
    name: string
    clientName?: string
    organizationDocs: string
    rftDocs: string
  }
): Promise<{ bidAnalysis: BidAnalysis; winThemes: string[] }> {
  const prompt = buildCombinedStrategyPrompt(workPackage, projectContext)
  console.log('[Strategy] Generating combined bid analysis + win themes for:', workPackage.document_type)

  const response = await executeRequest({
    prompt,
    requestType: 'combined-strategy',
    temperature: 0.7,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Strategy generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const parsed = parseJsonResponse<{
    bidAnalysis: {
      criteria: Array<{ name: string; description: string; score: number }>
      recommendation: 'bid' | 'no-bid'
      reasoning: string
      strengths: string[]
      concerns: string[]
    }
    winThemes: string[]
  }>(response)

  if (!parsed || !parsed.bidAnalysis || !parsed.winThemes) {
    throw new Error('Invalid response structure: missing bidAnalysis or winThemes')
  }

  // Process bid analysis (same as bid-analysis.ts)
  const totalCriteria = parsed.bidAnalysis.criteria.length || 1
  const criteria = parsed.bidAnalysis.criteria.map((c, index) => {
    const parsedScore = typeof c.score === 'number' ? c.score : parseFloat(c.score as any) || 0
    const clampedScore = Math.max(0, Math.min(5, parsedScore))
    const weight = 1 / totalCriteria
    const weightedScore = (clampedScore / 5) * weight

    return {
      id: String(index + 1),
      name: c.name,
      description: c.description,
      score: clampedScore,
      weight,
      weightedScore,
    }
  })

  const totalScore = Math.round(
    criteria.reduce((sum, c) => sum + c.weightedScore, 0) * 100
  )

  const bidAnalysis: BidAnalysis = {
    criteria,
    totalScore,
    recommendation: parsed.bidAnalysis.recommendation,
    reasoning: parsed.bidAnalysis.reasoning || '',
    strengths: parsed.bidAnalysis.strengths || [],
    concerns: parsed.bidAnalysis.concerns || [],
  }

  console.log('[Strategy] Generated bid analysis:', bidAnalysis.recommendation, totalScore)
  console.log('[Strategy] Generated', parsed.winThemes.length, 'win themes')

  return {
    bidAnalysis,
    winThemes: parsed.winThemes,
  }
}

/**
 * Generate multiple work packages in one batch request
 * Used for bulk generation with client-orchestrated batching
 */
export async function generateBatch(
  workPackages: WorkPackage[],
  context: ProjectContext,
  instructions?: string
): Promise<Array<{
  workPackageId: string
  bidAnalysis: BidAnalysis
  winThemes: string[]
  content: string
}>> {
  const prompt = buildBatchGenerationPrompt(workPackages, context, instructions)
  console.log('[Batch] Generating', workPackages.length, 'documents in batch')
  console.log('[Batch] Context size estimate:', context.totalTokensEstimate, 'tokens')

  const response = await executeRequest({
    prompt,
    requestType: 'batch-generation',
    temperature: 0.7,
    maxRetries: 6, // More retries for batch operations
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Batch generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const parsed = parseJsonResponse<
    Array<{
      workPackageId: string
      bidAnalysis: any
      winThemes: string[]
      content: string
    }>
  >(response)

  if (!parsed || !Array.isArray(parsed)) {
    throw new Error('Invalid response structure: expected array of work package results')
  }

  // Process each bid analysis in the batch
  const results = parsed.map((result) => {
    const totalCriteria = result.bidAnalysis.criteria?.length || 1
    const criteria = result.bidAnalysis.criteria.map((c: any, index: number) => {
      const parsedScore = typeof c.score === 'number' ? c.score : parseFloat(c.score) || 0
      const clampedScore = Math.max(0, Math.min(5, parsedScore))
      const weight = 1 / totalCriteria
      const weightedScore = (clampedScore / 5) * weight

      return {
        id: String(index + 1),
        name: c.name,
        description: c.description,
        score: clampedScore,
        weight,
        weightedScore,
      }
    })

    const totalScore = Math.round(
      criteria.reduce((sum: number, c: { weightedScore: number }) => sum + c.weightedScore, 0) * 100
    )

    const bidAnalysis: BidAnalysis = {
      criteria,
      totalScore,
      recommendation: result.bidAnalysis.recommendation,
      reasoning: result.bidAnalysis.reasoning || '',
      strengths: result.bidAnalysis.strengths || [],
      concerns: result.bidAnalysis.concerns || [],
    }

    return {
      workPackageId: result.workPackageId,
      bidAnalysis,
      winThemes: result.winThemes,
      content: result.content,
    }
  })

  console.log('[Batch] Successfully generated', results.length, 'documents')
  return results
}
