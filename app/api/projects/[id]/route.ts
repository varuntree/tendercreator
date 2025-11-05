import { NextRequest } from 'next/server'

import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  deleteProject,
  getProject,
  updateProject,
} from '@/libs/repositories'

async function handleGET(
  request: NextRequest,
  { supabase }: AuthContext,
  routeContext: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await routeContext.params
    const project = await getProject(supabase, projectId)
    return apiSuccess(project)
  } catch (error) {
    return apiError(error as Error)
  }
}

async function handlePUT(
  request: NextRequest,
  { supabase }: AuthContext,
  routeContext: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await routeContext.params
    const body = await request.json()

    const project = await updateProject(supabase, projectId, body)
    return apiSuccess(project)
  } catch (error) {
    return apiError(error as Error)
  }
}

async function handleDELETE(
  request: NextRequest,
  { supabase }: AuthContext,
  routeContext: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await routeContext.params
    await deleteProject(supabase, projectId)
    return apiSuccess({ message: 'Project deleted' })
  } catch (error) {
    return apiError(error as Error)
  }
}

export const GET = withAuth(handleGET)
export const PUT = withAuth(handlePUT)
export const DELETE = withAuth(handleDELETE)
