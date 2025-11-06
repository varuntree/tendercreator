import { NextRequest } from 'next/server'

import { getWorkPackageContent, updateWorkPackageContent } from '@/libs/repositories/work-package-content'
import { createClient } from '@/libs/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const content = await getWorkPackageContent(supabase, id)

    if (!content) {
      return Response.json({ error: 'Content not found' }, { status: 404 })
    }

    return Response.json(content)
  } catch (error) {
    console.error('Get content error:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get content',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    const existing = await getWorkPackageContent(supabase, id)
    if (!existing) {
      return Response.json({ error: 'Content not found' }, { status: 404 })
    }

    const updated = await updateWorkPackageContent(supabase, existing.id, { content })

    return Response.json(updated)
  } catch (error) {
    console.error('Update content error:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update content',
      },
      { status: 500 }
    )
  }
}
