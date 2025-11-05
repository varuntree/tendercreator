import { NextRequest } from 'next/server'

import { extractRequirementsForDocument } from '@/libs/ai/analysis'
import { getWorkPackage } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get work package
    const workPackage = await getWorkPackage(supabase, id)
    if (!workPackage) {
      return Response.json({ error: 'Work package not found' }, { status: 404 })
    }

    // Get project documents
    const { data: documents, error: docsError } = await supabase
      .from('project_documents')
      .select('content_text')
      .eq('project_id', workPackage.project_id)

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`)
    }

    const rftTexts = documents
      ?.filter((doc) => doc.content_text && doc.content_text.trim().length > 0)
      .map((doc) => doc.content_text as string) || []

    if (rftTexts.length === 0) {
      return Response.json(
        { error: 'No RFT documents with text found' },
        { status: 400 }
      )
    }

    // Extract requirements
    const requirements = await extractRequirementsForDocument(
      rftTexts,
      workPackage.document_type
    )

    return Response.json({ requirements })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
