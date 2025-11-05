import { SupabaseClient } from '@supabase/supabase-js'
import { listOrganizationDocuments } from '@/libs/repositories/organization-documents'
import { listProjectDocuments } from '@/libs/repositories/project-documents'

export interface ProjectContext {
  project: any
  organizationDocs: string
  rftDocs: string
  totalTokensEstimate: number
}

/**
 * Assemble full project context for AI generation
 * Includes project details, organization docs, and RFT docs
 */
export async function assembleProjectContext(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectContext> {
  console.log('[Context] Assembling context for project:', projectId)

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

  // Calculate token estimate (rough: 4 chars per token)
  const totalTokensEstimate = Math.ceil(
    (organizationDocsText.length + rftDocsText.length + JSON.stringify(project).length) / 4
  )

  console.log('[Context] Organization docs:', orgDocs.length, 'files')
  console.log('[Context] RFT docs:', projectDocs.length, 'files')
  console.log('[Context] Total tokens estimate:', totalTokensEstimate)

  return {
    project,
    organizationDocs: organizationDocsText,
    rftDocs: rftDocsText,
    totalTokensEstimate,
  }
}

/**
 * Validate context size is within limits
 */
export function validateContextSize(context: ProjectContext): { valid: boolean; tokenEstimate: number } {
  const MAX_TOKENS = 1000000 // 1M token limit
  const WARNING_THRESHOLD = 800000 // 800K tokens

  if (context.totalTokensEstimate > MAX_TOKENS) {
    console.error('[Context] Token limit exceeded:', context.totalTokensEstimate)
    return { valid: false, tokenEstimate: context.totalTokensEstimate }
  }

  if (context.totalTokensEstimate > WARNING_THRESHOLD) {
    console.warn('[Context] Approaching token limit:', context.totalTokensEstimate)
  }

  return { valid: true, tokenEstimate: context.totalTokensEstimate }
}
