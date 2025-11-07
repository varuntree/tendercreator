import { SupabaseClient } from '@supabase/supabase-js'
import { listOrganizationDocuments } from '@/libs/repositories/organization-documents'
import { listProjectDocuments } from '@/libs/repositories/project-documents'
import { countTokens } from './token-counter'

export interface ProjectContext {
  project: any
  organizationDocs: string
  rftDocs: string
  totalTokensEstimate: number
  fromCache?: boolean
}

// In-memory cache for project contexts
interface CachedContext {
  context: ProjectContext
  timestamp: number
}

const contextCache = new Map<string, CachedContext>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Assemble full project context for AI generation
 * Includes project details, organization docs, and RFT docs
 * Uses caching to avoid repeated fetches (5 min TTL)
 */
export async function assembleProjectContext(
  supabase: SupabaseClient,
  projectId: string,
  options: { skipCache?: boolean } = {}
): Promise<ProjectContext> {
  // Check cache first (unless explicitly skipped)
  if (!options.skipCache) {
    const cached = contextCache.get(projectId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[Context] Using cached context for project:', projectId)
      return { ...cached.context, fromCache: true }
    }
  }

  console.log('[Context] Assembling fresh context for project:', projectId)

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projectError) {
    throw new Error(`Failed to fetch project: ${projectError.message}`)
  }

  // Fetch organization documents
  const orgDocs = await listOrganizationDocuments(supabase, project.organization_id)

  // Fetch project documents (RFT)
  const projectDocs = await listProjectDocuments(supabase, projectId)

  // Concatenate organization docs
  const organizationDocsText = orgDocs
    .filter(doc => doc.content_extracted && doc.content_text)
    .map(doc => {
      return `### ${doc.name}\n${doc.category ? `Category: ${doc.category}\n` : ''}${doc.content_text}`
    })
    .join('\n\n---\n\n')

  // Concatenate RFT docs
  const rftDocsText = projectDocs
    .filter(doc => doc.content_extracted && doc.content_text)
    .map(doc => {
      return `### ${doc.name}${doc.is_primary_rft ? ' (Primary RFT)' : ''}\n${doc.content_text}`
    })
    .join('\n\n---\n\n')

  // Calculate token estimate using accurate token counter
  const totalText = organizationDocsText + '\n\n' + rftDocsText + '\n\n' + JSON.stringify(project)
  const totalTokensEstimate = countTokens(totalText)

  console.log('[Context] Organization docs:', orgDocs.length, 'files')
  console.log('[Context] RFT docs:', projectDocs.length, 'files')
  console.log('[Context] Total tokens estimate:', totalTokensEstimate)

  const context: ProjectContext = {
    project,
    organizationDocs: organizationDocsText,
    rftDocs: rftDocsText,
    totalTokensEstimate,
    fromCache: false,
  }

  // Cache the context
  contextCache.set(projectId, {
    context,
    timestamp: Date.now(),
  })

  return context
}

/**
 * Validate context size is within limits
 * Updated for correct 64K token limit (Gemini 2.0 Flash)
 */
export function validateContextSize(context: ProjectContext): { valid: boolean; tokenEstimate: number; warning?: string } {
  const MAX_TOKENS = 64000 // 64K token limit for Gemini 2.0 Flash
  const WARNING_THRESHOLD = 51200 // 80% of limit (51.2K tokens)

  if (context.totalTokensEstimate > MAX_TOKENS) {
    console.error('[Context] Token limit exceeded:', context.totalTokensEstimate)
    return {
      valid: false,
      tokenEstimate: context.totalTokensEstimate,
      warning: `Context exceeds ${MAX_TOKENS} token limit (${context.totalTokensEstimate} tokens). Reduce organization or RFT documents.`
    }
  }

  if (context.totalTokensEstimate > WARNING_THRESHOLD) {
    const percentage = Math.round((context.totalTokensEstimate / MAX_TOKENS) * 100)
    console.warn('[Context] Approaching token limit:', context.totalTokensEstimate, `(${percentage}%)`)
    return {
      valid: true,
      tokenEstimate: context.totalTokensEstimate,
      warning: `Context is ${percentage}% of token limit. Consider reducing documents if generation fails.`
    }
  }

  return { valid: true, tokenEstimate: context.totalTokensEstimate }
}

/**
 * Clear context cache for a specific project or all projects
 */
export function clearContextCache(projectId?: string) {
  if (projectId) {
    contextCache.delete(projectId)
    console.log('[Context] Cleared cache for project:', projectId)
  } else {
    contextCache.clear()
    console.log('[Context] Cleared all cached contexts')
  }
}
