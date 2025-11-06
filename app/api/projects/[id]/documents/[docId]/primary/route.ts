import { NextRequest } from 'next/server'

import { apiError, apiSuccess, AuthContext, withAuth } from '@/libs/api-utils'
import { updatePrimaryRFT } from '@/libs/repositories'

async function handlePOST(
  _request: NextRequest,
  { supabase }: AuthContext,
  params: { id: string; docId: string }
) {
  try {
    const { id: projectId, docId } = params
    const updated = await updatePrimaryRFT(supabase, projectId, docId)
    return apiSuccess(updated)
  } catch (error) {
    return apiError(error as Error)
  }
}

export const POST = withAuth(handlePOST)
