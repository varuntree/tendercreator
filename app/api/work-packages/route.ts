import { NextRequest } from 'next/server'

import { createWorkPackage } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { project_id, document_type, description, requirements } = body

    if (!project_id || !document_type) {
      return Response.json(
        { error: 'Missing required fields: project_id, document_type' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get next order number
    const { data: existingPackages } = await supabase
      .from('work_packages')
      .select('order')
      .eq('project_id', project_id)
      .order('order', { ascending: false })
      .limit(1)

    const nextOrder = existingPackages?.[0]?.order ? existingPackages[0].order + 1 : 0

    const workPackage = await createWorkPackage(supabase, {
      project_id,
      document_type,
      document_description: description || null,
      requirements: requirements || [],
      order: nextOrder,
    })

    return Response.json(workPackage, { status: 201 })
  } catch (error) {
    console.error('[work-packages POST] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
