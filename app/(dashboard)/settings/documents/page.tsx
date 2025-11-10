'use client'

import { Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

import { CompanySettingsTabs } from '@/components/company-settings-tabs'
import DocumentList from '@/components/document-list'
import { EmptyState } from '@/components/empty-state'
import FileUpload from '@/components/file-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { Organization } from '@/types/organization'

export default function OrganizationDocumentsPage() {
  const [documents, setDocuments] = useState<{id: string; name: string; file_type: string; file_size: number; uploaded_at: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [instructions, setInstructions] = useState('')
  const [savingInstructions, setSavingInstructions] = useState(false)
  const [instructionsStatus, setInstructionsStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    loadOrganization()
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/organizations/documents')
      const result = await response.json()

      if (result.success) {
        setDocuments(result.data)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrganization = async () => {
    try {
      const response = await fetch('/api/organizations')
      const result = await response.json()

      if (result.success) {
        setOrganization(result.data)
        setInstructions(result.data.settings?.customInstructions ?? '')
      }
    } catch (error) {
      console.error('Error loading organization:', error)
    }
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/organizations/documents', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    if (result.success) {
      await loadDocuments()
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return

    await fetch(`/api/organizations/documents/${docId}`, {
      method: 'DELETE',
    })

    await loadDocuments()
  }

  const handleSaveInstructions = async () => {
    if (!organization) return

    setSavingInstructions(true)
    setInstructionsStatus('idle')

    try {
      const trimmed = instructions.trim()
      const updatedSettings = { ...(organization.settings ?? {}) } as Record<string, unknown>

      if (trimmed.length > 0) {
        updatedSettings.customInstructions = trimmed
      } else {
        delete updatedSettings.customInstructions
      }

      const response = await fetch('/api/organizations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updatedSettings }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to save instructions')
      }

      setOrganization(result.data)
      setInstructions(result.data.settings?.customInstructions ?? '')
      setInstructionsStatus('success')
    } catch (error) {
      console.error('Error saving custom instructions:', error)
      setInstructionsStatus('error')
    } finally {
      setSavingInstructions(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Organization Documents</h1>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">COMPANY</p>
        </div>
        <CompanySettingsTabs />
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Company Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onUpload={handleUpload} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Custom AI Instructions</CardTitle>
              <CardDescription>
                Share the prompts or guidance AI should follow when generating tender documents for your company.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom_instructions">Instructions</Label>
              <Textarea
                id="custom_instructions"
                value={instructions}
                onChange={(event) => {
                  setInstructions(event.target.value)
                  setInstructionsStatus('idle')
                }}
                placeholder="Mention tone, structure, company priorities, or mandatory callouts for AI-generated content."
                rows={6}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSaveInstructions}
                disabled={savingInstructions || !organization}
              >
                {savingInstructions ? 'Saving...' : 'Save Instructions'}
              </Button>
              {instructionsStatus === 'success' && (
                <p className="text-sm text-emerald-600">Saved.</p>
              )}
              {instructionsStatus === 'error' && (
                <p className="text-sm text-red-600">Unable to save. Try again.</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              These instructions are appended to every document generation request so the AI keeps your preferred style, structure, or required evidence sources in mind.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <LoadingSpinner text="Loading documents..." />
              </div>
            ) : documents.length === 0 ? (
              <EmptyState
                icon={Upload}
                heading="No company documents"
                description="Upload capability statements, case studies, and certifications."
              />
            ) : (
              <DocumentList documents={documents} onDelete={handleDelete} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
