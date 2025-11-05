import { WorkPackage, Requirement } from '@/libs/repositories/work-packages'

export function buildWinThemesPrompt(
  workPackage: WorkPackage,
  orgDocs: string,
  rftDocs: string
): string {
  const requirementsText = workPackage.requirements
    .map(r => `- [${r.priority.toUpperCase()}] ${r.text} (Source: ${r.source})`)
    .join('\n')

  return `You are creating win themes for a tender response document.

Project Context:
- Document Type: ${workPackage.document_type}
- Description: ${workPackage.document_description || 'Not provided'}

Requirements to Address:
${requirementsText}

Organization Knowledge (demonstrate our capabilities):
${orgDocs}

RFT Documents (understand client needs):
${rftDocs}

Task: Generate 3-5 win themes that:
1. Directly address the mandatory requirements
2. Leverage our organizational strengths from company documents
3. Differentiate us from competitors
4. Are specific and actionable (not generic)
5. Align with client needs evident in RFT

Output as valid JSON only (no markdown):
{
  "win_themes": [
    "Win theme 1: Specific differentiator...",
    "Win theme 2: Another key strength...",
    "Win theme 3: Competitive advantage..."
  ]
}

Return only valid JSON. No text before or after.`
}
