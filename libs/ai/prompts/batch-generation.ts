import { WorkPackage } from '@/libs/repositories/work-packages'
import { ProjectContext } from '@/libs/ai/context-assembly'

/**
 * Build batch generation prompt that generates strategy (bid+themes) AND content for multiple work packages
 * in a single request. Reduces API calls significantly for bulk operations.
 */
export function buildBatchGenerationPrompt(
  workPackages: WorkPackage[],
  context: ProjectContext,
  instructions?: string
): string {
  // Build work package descriptions
  const workPackagesDescription = workPackages
    .map((wp, index) => {
      const requirementsText = wp.requirements
        .map(r => `  - [${r.priority.toUpperCase()}] ${r.text}`)
        .join('\n')

      return `${index + 1}. WORK PACKAGE ID: ${wp.id}
   Type: ${wp.document_type}
   Description: ${wp.document_description || 'Not provided'}
   Requirements:
${requirementsText || '  - No specific requirements'}`
    })
    .join('\n\n')

  return `You are a tender response expert generating multiple tender documents in one batch.

PROJECT CONTEXT:
- Project: ${context.project.name}
- Client: ${context.project.client_name || 'Not specified'}
- Deadline: ${context.project.deadline ? new Date(context.project.deadline).toLocaleDateString() : 'Not specified'}

ORGANIZATION CAPABILITIES (shared context for all documents):
${context.organizationDocs}

RFT DOCUMENTS (shared context for all documents):
${context.rftDocs}

WORK PACKAGES TO GENERATE (${workPackages.length} documents):
${workPackagesDescription}

USER INSTRUCTIONS:
${instructions || 'None provided'}

TASK:
For EACH work package above, generate:
1. **Bid/No-Bid Analysis**: 6 criteria scores (Customer Relationship, Strategic Alignment, Competitive Positioning, Solution Capability, Resource Availability, Profitability Potential)
2. **Win Themes**: 3-5 specific themes leveraging org capabilities
3. **Document Content**: Comprehensive tender response in Markdown format

IMPORTANT NOTES:
- Each document is INDEPENDENT - analyze requirements separately for each work package
- Use the SHARED organization and RFT context for all documents
- Bid scores should be based on EVIDENCE from organization docs vs specific work package requirements
- Win themes should be specific to each work package's requirements
- Content should address ALL mandatory requirements for that work package
- Maintain consistent quality across all documents in the batch

OUTPUT FORMAT (JSON array):
[
  {
    "workPackageId": "uuid-1",
    "bidAnalysis": {
      "criteria": [
        {
          "name": "Customer Relationship",
          "description": "Brief assessment",
          "score": 3.5
        }
        // ... all 6 criteria
      ],
      "recommendation": "bid" | "no-bid",
      "reasoning": "1-2 sentence summary",
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "concerns": ["Concern 1", "Concern 2", "Concern 3"]
    },
    "winThemes": [
      "Win theme 1 for this document...",
      "Win theme 2 for this document...",
      "Win theme 3 for this document..."
    ],
    "content": "# Document Title\\n\\n## Section 1\\n\\nContent in Markdown format addressing all requirements...\\n\\n## Section 2\\n\\n..."
  }
  // ... one object per work package
]

QUALITY REQUIREMENTS:
- Each document should be comprehensive (not rushed despite batch processing)
- Address EVERY mandatory requirement for each work package
- Incorporate win themes naturally in content
- Use professional tone appropriate for tender submission
- Include specific examples from organization docs
- Maintain well-structured Markdown with headings, lists, tables where appropriate
- Content length should match typical expectations for each document type

Generate all ${workPackages.length} documents now. Return ONLY the JSON array. No text before or after.`
}
