import { NextRequest } from 'next/server'

import { apiError, apiSuccess, AuthContext, withAuth } from '@/libs/api-utils'
import {
  getOrganizationByUserId,
  updateOrganization,
} from '@/libs/repositories'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

async function handlePOST(request: NextRequest, { user, supabase }: AuthContext) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return apiError('No file provided', 400)
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError('Invalid file type. Only PNG and JPG images are allowed.', 400)
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError('File size exceeds 2MB limit', 400)
    }

    // Get user's organization
    const org = await getOrganizationByUserId(supabase, user.id)
    if (!org) return apiError('Organization not found', 404)

    // Upload to Supabase Storage
    const fileExtension = file.name.split('.').pop() || 'png'
    const filePath = `${org.id}/logo.${fileExtension}`

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Allow replacing existing logo
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(filePath)

    // Update organization settings with logo URL
    const currentSettings = (org as { settings?: Record<string, unknown> }).settings || {}
    await updateOrganization(supabase, org.id, {
      settings: {
        ...currentSettings,
        logo_url: publicUrl,
      },
    })

    return apiSuccess({ logo_url: publicUrl })
  } catch (error) {
    return apiError(error as Error)
  }
}

export const POST = withAuth(handlePOST)
