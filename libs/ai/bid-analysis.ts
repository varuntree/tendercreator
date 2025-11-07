import { executeRequest, parseJsonResponse } from './gemini-service'
import { WorkPackage } from '@/libs/repositories/work-packages'

export interface AssessmentCriterion {
  id: string
  name: string
  description: string
  score: number // 0-5
  weight: number // as decimal (0.167 = 16.7%)
  weightedScore: number
}

export interface BidAnalysis {
  criteria: AssessmentCriterion[]
  totalScore: number
  recommendation: 'bid' | 'no-bid'
  reasoning: string
  strengths: string[]
  concerns: string[]
}

/**
 * Generate bid/no-bid analysis for a work package (legacy - kept for backwards compatibility)
 * Consider using generateStrategy() from content-generation.ts for combined bid+themes
 */
export async function generateBidAnalysis(
  workPackage: WorkPackage,
  projectContext: {
    name: string
    clientName?: string
    organizationDocs: string
    rftDocs: string
  }
): Promise<BidAnalysis> {
  const prompt = buildBidAnalysisPrompt(workPackage, projectContext)
  console.log('[Bid Analysis] Generating for:', workPackage.document_type)

  const response = await executeRequest({
    prompt,
    requestType: 'bid-analysis',
    temperature: 0.7,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Bid analysis generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const parsed = parseJsonResponse<{
    criteria: Array<{ name: string; description: string; score: number }>
    recommendation: 'bid' | 'no-bid'
    reasoning: string
    strengths: string[]
    concerns: string[]
  }>(response)

  // Validate structure
  if (!parsed || !parsed.criteria || !Array.isArray(parsed.criteria)) {
    throw new Error('Invalid response: missing criteria array')
  }
  if (!parsed.recommendation || !['bid', 'no-bid'].includes(parsed.recommendation)) {
    throw new Error('Invalid response: missing or invalid recommendation')
  }

  // Calculate weighted scores and total
  const totalCriteria = parsed.criteria.length || 1

  const criteria = parsed.criteria.map((c, index) => {
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
    criteria.reduce((sum: number, c: AssessmentCriterion) => sum + c.weightedScore, 0) * 100
  )

  const analysis: BidAnalysis = {
    criteria,
    totalScore,
    recommendation: parsed.recommendation,
    reasoning: parsed.reasoning || '',
    strengths: parsed.strengths || [],
    concerns: parsed.concerns || [],
  }

  console.log('[Bid Analysis] Generated with score:', totalScore, '| Recommendation:', analysis.recommendation)
  return analysis
}

/**
 * Build bid analysis prompt
 */
function buildBidAnalysisPrompt(
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

  return `You are a tender bid decision analyst. Analyze whether our organization should bid on this tender opportunity.

PROJECT CONTEXT:
- Project: ${projectContext.name}
- Client: ${projectContext.clientName || 'Not specified'}
- Document Type: ${workPackage.document_type}

REQUIREMENTS FOR THIS DOCUMENT:
${requirementsText || 'No specific requirements provided'}

ORGANIZATION CAPABILITIES:
${projectContext.organizationDocs || 'No organization documents available'}

RFT DOCUMENTS:
${projectContext.rftDocs}

TASK:
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

OUTPUT FORMAT (JSON):
{
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
}

IMPORTANT:
- Base scores on EVIDENCE from organization docs and requirements
- Recommendation should be "bid" if total weighted score >= 50%, otherwise "no-bid"
- Strengths should cite specific capabilities from organization docs
- Concerns should identify specific gaps or risks from requirements vs capabilities
- Be realistic and evidence-based, not optimistic

Generate the bid analysis now in JSON format.`
}
