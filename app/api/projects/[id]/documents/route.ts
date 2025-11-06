import { NextRequest } from 'next/server'

import { extractTextFromFile } from '@/libs/ai/extraction'
import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  createProjectDocument,
  getProject,
  listProjectDocuments,
} from '@/libs/repositories'

async function handleGET(
  request: NextRequest,
  { supabase }: AuthContext,
  routeContext: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await routeContext.params
    const documents = await listProjectDocuments(supabase, projectId)

    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from('documents')
            .createSignedUrl(doc.file_path, 3600)

        if (signedUrlError) {
          console.error('Failed to create signed URL for document', doc.id, signedUrlError)
        }

        return {
          ...doc,
          download_url: signedUrlData?.signedUrl ?? null,
        }
      })
    )

    return apiSuccess(documentsWithUrls)
  } catch (error) {
    return apiError(error as Error)
  }
}

async function handlePOST(
  request: NextRequest,
  { user, supabase }: AuthContext,
  routeContext: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await routeContext.params
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const pastedContent = formData.get('content_text') as string | null
    const providedName = (formData.get('name') as string | null)?.trim()
    const isPrimary = formData.get('is_primary_rft') === 'true'

    if (!file && (!pastedContent || !providedName)) {
      return apiError('No file or content provided', 400)
    }

    // Get project to verify access
    const project = await getProject(supabase, projectId)

    // Upload to Supabase Storage
    const fileId = crypto.randomUUID()

    const resolveFileName = () => {
      if (file) return file.name
      if (!providedName) return `pasted-document-${fileId}.txt`
      return /\.[A-Za-z0-9]+$/.test(providedName) ? providedName : `${providedName}.txt`
    }

    const fileName = resolveFileName()
    const filePath = `${project.organization_id}/projects/${projectId}/${fileId}/${fileName}`

    const fileBuffer = file ? Buffer.from(await file.arrayBuffer()) : Buffer.from(pastedContent ?? '', 'utf-8')
    const contentType = file ? file.type : 'text/plain'
    const fileSize = file ? file.size : Buffer.byteLength(pastedContent ?? '', 'utf-8')

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      })

    if (uploadError) throw uploadError

    const contentText = file
      ? await extractTextFromFile(fileBuffer, file.name, file.type)
      : pastedContent ?? ''

    const document = await createProjectDocument(supabase, {
      project_id: projectId,
      name: fileName,
      file_path: filePath,
      file_type: contentType || 'application/octet-stream',
      file_size: fileSize,
      uploaded_by: user.id,
      is_primary_rft: isPrimary,
      content_text: contentText,
      content_extracted: !!contentText,
    })

    return apiSuccess(document)
  } catch (error) {
    return apiError(error as Error)
  }
}

export const GET = withAuth(handleGET)
export const POST = withAuth(handlePOST)
