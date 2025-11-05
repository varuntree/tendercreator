import { NextRequest } from 'next/server'

import { listWorkPackages } from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 })
    }

    const workPackages = await listWorkPackages(supabase, projectId)
    return Response.json({ data: workPackages, success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: errorMessage, success: false }, { status: 500 })
  }
}
