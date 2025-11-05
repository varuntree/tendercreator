import { SupabaseClient } from '@supabase/supabase-js'

// TypeScript interfaces
export interface Requirement {
  id: string
  text: string
  priority: 'mandatory' | 'optional'
  source: string
}

export interface WorkPackage {
  id: string
  project_id: string
  document_type: string
  document_description: string | null
  requirements: Requirement[]
  assigned_to: string | null
  status: 'pending' | 'in_progress' | 'review' | 'completed'
  order: number
  created_at: string
  updated_at: string
}

export interface CreateWorkPackageData {
  project_id: string
  document_type: string
  document_description?: string | null
  requirements?: Requirement[]
  order?: number
  status?: 'pending' | 'in_progress' | 'review' | 'completed'
}

export interface UpdateWorkPackageData {
  document_type?: string
  document_description?: string | null
  requirements?: Requirement[]
  status?: 'pending' | 'in_progress' | 'review' | 'completed'
  assigned_to?: string | null
}

/**
 * Create a work package with requirements
 */
export async function createWorkPackage(
  supabase: SupabaseClient,
  data: CreateWorkPackageData
): Promise<WorkPackage> {
  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .insert({
      project_id: data.project_id,
      document_type: data.document_type,
      document_description: data.document_description || null,
      requirements: data.requirements || [],
      order: data.order || 0,
      status: data.status || 'pending',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create work package: ${error.message}`)
  }

  return workPackage
}

/**
 * List all work packages for a project
 */
export async function listWorkPackages(
  supabase: SupabaseClient,
  projectId: string
): Promise<WorkPackage[]> {
  const { data: workPackages, error } = await supabase
    .from('work_packages')
    .select(`
      *,
      assigned_user:users!work_packages_assigned_to_fkey(id, email, name)
    `)
    .eq('project_id', projectId)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to list work packages: ${error.message}`)
  }

  return workPackages || []
}

/**
 * Get a single work package by id
 */
export async function getWorkPackage(
  supabase: SupabaseClient,
  id: string
): Promise<WorkPackage> {
  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get work package: ${error.message}`)
  }

  return workPackage
}

/**
 * Update a work package
 */
export async function updateWorkPackage(
  supabase: SupabaseClient,
  id: string,
  data: UpdateWorkPackageData
): Promise<WorkPackage> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (data.document_type !== undefined) updateData.document_type = data.document_type
  if (data.document_description !== undefined) updateData.document_description = data.document_description
  if (data.requirements !== undefined) updateData.requirements = data.requirements
  if (data.status !== undefined) updateData.status = data.status
  if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to

  const { data: workPackage, error } = await supabase
    .from('work_packages')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update work package: ${error.message}`)
  }

  return workPackage
}

/**
 * Delete a work package
 */
export async function deleteWorkPackage(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('work_packages')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete work package: ${error.message}`)
  }
}
