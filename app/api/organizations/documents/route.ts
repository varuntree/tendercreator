import { NextRequest } from 'next/server'

import { extractTextFromFile } from '@/libs/ai/extraction'
import { apiError, apiSuccess, AuthContext,withAuth } from '@/libs/api-utils'
import {
  createOrganizationDocument,
  getOrganizationByUserId,
  listOrganizationDocuments,
} from '@/libs/repositories'

async function handleGET(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)
    const documents = await listOrganizationDocuments(supabase, org.id)

    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from('documents')
            .createSignedUrl(doc.file_path, 3600)

        if (signedUrlError) {
          console.error('Failed to create signed URL for org document', doc.id, signedUrlError)
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

async function handlePOST(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const pastedContent = formData.get('content_text') as string | null
    const providedName = (formData.get('name') as string | null)?.trim()
    const category = formData.get('category') as string | null
    const tags = formData.get('tags') as string | null

    if (!file && (!pastedContent || !providedName)) {
      return apiError('No file or content provided', 400)
    }

    // Get user's organization
    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)

    // Upload to Supabase Storage
    const fileId = crypto.randomUUID()

    const resolveFileName = () => {
      if (file) return file.name
      if (!providedName) return `pasted-document-${fileId}.txt`
      return /\.[A-Za-z0-9]+$/.test(providedName) ? providedName : `${providedName}.txt`
    }

    const fileName = resolveFileName()
    const filePath = `${org.id}/org-documents/${fileId}/${fileName}`

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

    const document = await createOrganizationDocument(supabase, {
      organization_id: org.id,
      name: fileName,
      file_path: filePath,
      file_type: contentType || 'application/octet-stream',
      file_size: fileSize,
      uploaded_by: user.id,
      category: category || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
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
