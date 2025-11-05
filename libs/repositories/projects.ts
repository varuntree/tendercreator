import { SupabaseClient } from '@supabase/supabase-js'

export async function listProjects(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProject(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data
}

export async function createProject(
  supabase: SupabaseClient,
  data: {
    organization_id: string
    name: string
    client_name?: string
    deadline?: string
    instructions?: string
    created_by: string
    status?: 'setup' | 'analysis' | 'in_progress' | 'completed' | 'archived'
  }
) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      organization_id: data.organization_id,
      name: data.name,
      client_name: data.client_name || null,
      deadline: data.deadline || null,
      instructions: data.instructions || null,
      created_by: data.created_by,
      status: data.status || 'setup'
    })
    .select()
    .single()

  if (error) throw error
  return project
}

export async function updateProject(
  supabase: SupabaseClient,
  projectId: string,
  data: {
    name?: string
    client_name?: string
    deadline?: string
    instructions?: string
    status?: 'setup' | 'analysis' | 'in_progress' | 'completed' | 'archived'
  }
) {
  const { data: updated, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return updated
}

export async function deleteProject(supabase: SupabaseClient, projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) throw error
}

export type ProjectStatus = 'setup' | 'analysis' | 'in_progress' | 'completed' | 'archived'

export async function updateProjectStatus(
  supabase: SupabaseClient,
  projectId: string,
  status: ProjectStatus
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) {
    throw new Error(`Failed to update project status: ${error.message}`)
  }
}

export async function getProjectWithDocumentsAndPackages(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      project_documents(*),
      work_packages(*)
    `)
    .eq('id', projectId)
    .single()

  if (projectError) {
    throw new Error(`Failed to get project: ${projectError.message}`)
  }

  return project
}
