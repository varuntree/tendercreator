import { NextRequest } from 'next/server'

import {
  deleteWorkPackage,
  getWorkPackage,
  updateWorkPackage,
} from '@/libs/repositories/work-packages'
import { createClient } from '@/libs/supabase/server'

export async function GET(
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

    const workPackage = await getWorkPackage(supabase, id)
    return Response.json(workPackage)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PUT(
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

    const body = await request.json()
    const { document_type, requirements, status, document_description } = body

    const workPackage = await updateWorkPackage(supabase, id, {
      document_type,
      document_description,
      requirements,
      status,
    })

    return Response.json(workPackage)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
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

    await deleteWorkPackage(supabase, id)
    return Response.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
