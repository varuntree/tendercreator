import { WorkPackage } from '@/libs/repositories/work-packages'
import { ProjectContext } from '@/libs/ai/context-assembly'

export function buildContentPrompt(
  workPackage: WorkPackage,
  context: ProjectContext,
  winThemes: string[],
  instructions?: string
): string {
  const requirementsText = workPackage.requirements
    .map(r => `- [${r.priority.toUpperCase()}] ${r.text} (Source: ${r.source})`)
    .join('\n')

  const winThemesText = winThemes
    .map((theme, i) => `${i + 1}. ${theme}`)
    .join('\n')

  return `You are writing a ${workPackage.document_type} for a tender response.

Project: ${context.project.name}
Client: ${context.project.client_name}
Deadline: ${context.project.deadline ? new Date(context.project.deadline).toLocaleDateString() : 'Not specified'}

Document Type: ${workPackage.document_type}
Description: ${workPackage.document_description || 'Not provided'}

Requirements to Address (MUST address all mandatory):
${requirementsText}

Win Themes (incorporate naturally):
${winThemesText}

Organization Knowledge (use to demonstrate capabilities):
${context.organizationDocs}

RFT Documents (understand requirements from):
${context.rftDocs}

User Instructions:
${instructions || 'None provided'}

Task:
Write a comprehensive, professional ${workPackage.document_type} that:
1. Addresses EVERY mandatory requirement explicitly
2. Incorporates the win themes naturally throughout
3. Demonstrates our capabilities using evidence from organization documents
4. Maintains professional tone appropriate for tender submission
5. Is well-structured with clear headings and logical flow
6. Uses specific examples and data where available
7. Meets typical length expectations for ${workPackage.document_type} (comprehensive but concise)

Output as well-formatted Markdown with:
- # Main heading
- ## Section headings
- ### Subsection headings
- **Bold** for emphasis
- - Bullet lists where appropriate
- 1. Numbered lists for sequences

Return only the document content in Markdown format. No preamble or explanation.`
}
