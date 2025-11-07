import { WorkPackage } from '@/libs/repositories/work-packages'

/**
 * Build combined strategy prompt that generates both bid analysis AND win themes in one request
 * Reduces API calls from 2 → 1 for strategy generation
 */
export function buildCombinedStrategyPrompt(
  workPackage: WorkPackage,
  projectContext: {
    name: string
    clientName?: string
    organizationDocs: string
    rftDocs: string
  }
): string {
  const requirementsText = workPackage.requirements
    .map((req, index) => `${index + 1}. [${req.priority.toUpperCase()}] ${req.text}${req.source ? ` (Source: ${req.source})` : ''}`)
    .join('\n')

  return `You are a tender strategy expert. Generate a comprehensive bid strategy that includes BOTH bid/no-bid analysis AND win themes.

PROJECT CONTEXT:
- Project: ${projectContext.name}
- Client: ${projectContext.clientName || 'Not specified'}
- Document Type: ${workPackage.document_type}
- Description: ${workPackage.document_description || 'Not provided'}

REQUIREMENTS FOR THIS DOCUMENT:
${requirementsText || 'No specific requirements provided'}

ORGANIZATION CAPABILITIES:
${projectContext.organizationDocs || 'No organization documents available'}

RFT DOCUMENTS:
${projectContext.rftDocs}

TASK 1: BID/NO-BID ANALYSIS
Analyze this opportunity across 6 key criteria and provide a bid/no-bid recommendation.

CRITERIA TO ASSESS (Score each 0-5):
1. **Customer Relationship** (0-5): Existing relationship, past performance, access to decision makers
2. **Strategic Alignment** (0-5): Alignment with business strategy, market priorities, growth objectives
3. **Competitive Positioning** (0-5): Competitive landscape, differentiating strengths, prime vs sub positioning
4. **Solution Capability** (0-5): Requirements coverage, expertise availability, similar experience
5. **Resource Availability** (0-5): Staff availability, project size fit, external resource needs
6. **Profitability Potential** (0-5): Profit margin expectations, payment terms, future opportunities

SCORING GUIDE:
- 0: Critical gap or dealbreaker
- 1-2: Significant weakness
- 2.5-3.5: Moderate capability
- 4-5: Strong capability or advantage

TASK 2: WIN THEMES
Generate 3-5 win themes that:
1. Directly address the mandatory requirements
2. Leverage our organizational strengths from company documents
3. Differentiate us from competitors
4. Are specific and actionable (not generic)
5. Align with client needs evident in RFT

OUTPUT FORMAT (JSON):
{
  "bidAnalysis": {
    "criteria": [
      {
        "name": "Customer Relationship",
        "description": "Brief assessment summary",
        "score": 2.5
      },
      {
        "name": "Strategic Alignment",
        "description": "Brief assessment summary",
        "score": 4.0
      }
      // ... all 6 criteria
    ],
    "recommendation": "bid" | "no-bid",
    "reasoning": "1-2 sentence summary of why bid or no-bid",
    "strengths": [
      "Key strength 1 (2-3 sentences max)",
      "Key strength 2 (2-3 sentences max)",
      "Key strength 3 (2-3 sentences max)"
    ],
    "concerns": [
      "Key concern 1 (2-3 sentences max)",
      "Key concern 2 (2-3 sentences max)",
      "Key concern 3 (2-3 sentences max)"
    ]
  },
  "winThemes": [
    "Win theme 1: Specific differentiator based on org capabilities...",
    "Win theme 2: Another key strength addressing requirements...",
    "Win theme 3: Competitive advantage aligned with client needs..."
  ]
}

IMPORTANT:
- Base bid scores on EVIDENCE from organization docs and requirements
- Recommendation should be "bid" if total weighted score >= 50%, otherwise "no-bid"
- Win themes should reference specific capabilities from organization docs
- Strengths and concerns should identify specific evidence from requirements vs capabilities
- Be realistic and evidence-based, not optimistic
- Return ONLY valid JSON with both bidAnalysis and winThemes fields. No text before or after.

Generate the complete strategy now in JSON format.`
}
