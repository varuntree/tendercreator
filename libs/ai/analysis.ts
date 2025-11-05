import { model } from './client'
import { buildAnalysisPrompt } from './prompts/analyze-rft'
import { buildExtractionPrompt } from './prompts/extract-requirements'
import { Requirement } from '../repositories/work-packages'
import { v4 as uuidv4 } from 'uuid'

interface AnalysisDocument {
  document_type: string
  description: string
  requirements: Requirement[]
}

interface AnalysisResult {
  success: boolean
  documents?: AnalysisDocument[]
  error?: string
}

/**
 * Parse AI response and validate structure
 */
export function parseAnalysisResponse(responseText: string): AnalysisResult {
  try {
    // Strip markdown code fences if present
    let cleanText = responseText.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanText)

    // Validate structure
    if (!parsed.documents || !Array.isArray(parsed.documents)) {
      return {
        success: false,
        error: 'Invalid response structure: missing documents array',
      }
    }

    // Validate each document
    for (const doc of parsed.documents) {
      if (!doc.document_type || typeof doc.document_type !== 'string') {
        return {
          success: false,
          error: 'Invalid document: missing or invalid document_type',
        }
      }

      if (!doc.requirements || !Array.isArray(doc.requirements)) {
        return {
          success: false,
          error: `Invalid document ${doc.document_type}: missing requirements array`,
        }
      }

      // Add unique IDs to requirements if missing
      for (const req of doc.requirements) {
        if (!req.id) {
          req.id = uuidv4()
        }
        if (!req.text || !req.priority || !req.source) {
          return {
            success: false,
            error: `Invalid requirement in ${doc.document_type}: missing required fields`,
          }
        }
      }
    }

    return {
      success: true,
      documents: parsed.documents,
    }
  } catch (error) {
    return {
      success: false,
      error: `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Analyze RFT documents to identify required submission documents
 */
export async function analyzeRFTDocuments(
  projectId: string,
  rftTexts: string[],
  projectName: string,
  instructions?: string
): Promise<AnalysisResult> {
  try {
    const prompt = buildAnalysisPrompt(rftTexts, projectName, instructions)
    console.log('[Analysis] Sending prompt to Gemini for project:', projectId)

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log('[Analysis] Gemini response length:', text.length)
    console.log('[Analysis] Gemini response preview:', text.substring(0, 500))

    const parsed = parseAnalysisResponse(text)
    console.log('[Analysis] Parse result:', { success: parsed.success, error: parsed.error, docCount: parsed.documents?.length })

    return parsed
  } catch (error) {
    console.error('[Analysis] AI analysis error:', error)
    return {
      success: false,
      error: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Extract requirements for a manually added document type
 */
export async function extractRequirementsForDocument(
  rftTexts: string[],
  documentType: string
): Promise<Requirement[]> {
  try {
    const prompt = buildExtractionPrompt(rftTexts, documentType)
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse response
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanText)

    if (!parsed.requirements || !Array.isArray(parsed.requirements)) {
      return []
    }

    // Add unique IDs to requirements
    return parsed.requirements.map((req: any) => ({
      id: req.id || uuidv4(),
      text: req.text,
      priority: req.priority,
      source: req.source,
    }))
  } catch (error) {
    console.error('Failed to extract requirements:', error)
    return []
  }
}
