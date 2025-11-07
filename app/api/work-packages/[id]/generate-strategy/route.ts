import { NextRequest, NextResponse } from 'next/server'

import { generateStrategy } from '@/libs/ai/content-generation'
import { assembleProjectContext, validateContextSize } from '@/libs/ai/context-assembly'
import { saveCombinedGeneration } from '@/libs/repositories/work-package-content'
import { getWorkPackage } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

/**
 * Generate combined strategy (bid analysis + win themes) in one request
 * POST /api/work-packages/[id]/generate-strategy
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const workPackageId = id

    // Fetch work package
    const workPackage = await getWorkPackage(supabase, workPackageId)
    if (!workPackage) {
      return NextResponse.json(
        { error: 'Work package not found' },
        { status: 404 }
      )
    }

    // Assemble project context
    const context = await assembleProjectContext(supabase, workPackage.project_id)

    // Validate context size (64K token limit)
    const validation = validateContextSize(context)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.warning || 'Context exceeds token limit',
          tokenCount: validation.tokenEstimate,
        },
        { status: 400 }
      )
    }

    // Generate combined strategy
    console.log('[API] Generating combined strategy for:', workPackageId)
    const { bidAnalysis, winThemes } = await generateStrategy(workPackage, {
      name: context.project.name,
      clientName: context.project.client_name,
      organizationDocs: context.organizationDocs,
      rftDocs: context.rftDocs,
    })

    // Save both bid analysis and win themes atomically to avoid race conditions
    await saveCombinedGeneration(supabase, workPackageId, {
      bid_analysis: bidAnalysis,
      win_themes: winThemes,
    })

    console.log('[API] Strategy generation complete')

    return NextResponse.json({
      success: true,
      bidAnalysis,
      winThemes,
    })
  } catch (error) {
    console.error('[API] Strategy generation failed:', error)
    const err = error as { isRateLimitError?: boolean; retryDelaySeconds?: number; message?: string }

    // Handle rate limit errors
    if (err.isRateLimitError) {
      return NextResponse.json(
        {
          error: err.message,
          isRateLimitError: true,
          retryDelaySeconds: err.retryDelaySeconds || 60,
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: err.message || 'Strategy generation failed' },
      { status: 500 }
    )
  }
}
