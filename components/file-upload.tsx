'use client'

import { type ChangeEvent, type DragEvent, FormEvent, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  onPasteText?: (payload: { name: string; content: string }) => Promise<void>
  accept?: string
  inputId?: string
}

type UploadTab = 'upload' | 'paste'

export default function FileUpload({ onUpload, onPasteText, accept = '.pdf,.docx,.txt', inputId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState<UploadTab>('upload')
  const [pasteName, setPasteName] = useState('')
  const [pasteContent, setPasteContent] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const uploadInputId = inputId ?? 'file-upload'

  const availableTabs: Array<{ key: UploadTab; label: string }> = onPasteText
    ? [
        { key: 'upload', label: 'File Upload' },
        { key: 'paste', label: 'Paste Text' },
      ]
    : [{ key: 'upload', label: 'File Upload' }]

  useEffect(() => {
    if (!onPasteText && activeTab === 'paste') {
      setActiveTab('upload')
    }
  }, [onPasteText, activeTab])

  useEffect(() => {
    setErrorMessage(null)
  }, [activeTab])

  const handleFile = async (file: File) => {
    try {
      setErrorMessage(null)
      setUploading(true)
      await onUpload(file)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to upload file'
      setErrorMessage(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (activeTab !== 'upload') return

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true)
    } else if (event.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (activeTab !== 'upload') return
    setDragActive(false)

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      await handleFile(event.dataTransfer.files[0])
    }
  }

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      await handleFile(event.target.files[0])
      event.target.value = ''
    }
  }

  const openFileDialog = () => {
    if (!uploading) {
      inputRef.current?.click()
    }
  }

  const handlePasteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!onPasteText) return
    if (uploading) return

    const trimmedName = pasteName.trim()
    const trimmedContent = pasteContent.trim()

    if (!trimmedName) {
      setErrorMessage('Document name is required')
      return
    }

    if (!trimmedContent) {
      setErrorMessage('Please paste some content before saving')
      return
    }

    try {
      setErrorMessage(null)
      setUploading(true)
      await onPasteText({ name: trimmedName, content: pasteContent })
      setPasteName('')
      setPasteContent('')
      setActiveTab('upload')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save pasted text'
      setErrorMessage(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="rounded-3xl border bg-card shadow-sm">
      <div className="flex gap-2 border-b px-6 pt-4">
        {availableTabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'relative -mb-px rounded-t-2xl px-4 py-2 text-sm font-semibold transition',
              tab.key === activeTab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6 px-6 py-8">
        <input
          type="file"
          id={uploadInputId}
          ref={inputRef}
          className="hidden"
          onChange={handleChange}
          accept={accept}
          disabled={uploading}
        />

        {activeTab === 'upload' ? (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openFileDialog()
              }
            }}
            className={cn(
              'relative w-full rounded-2xl border-2 border-dashed px-6 py-10 text-left transition',
              dragActive ? 'border-emerald-400 bg-emerald-50' : 'border-muted'
            )}
            onClick={openFileDialog}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="md" text="Uploading file..." />
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-medium text-foreground">Drag and drop your files here</p>
                  <p className="text-xs text-muted-foreground">
                    Limit 512 MB per file. We accept pdf, doc, docx, txt, msg, odt, odp, csv, ppt and xls files.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    openFileDialog()
                  }}
                  className="shrink-0"
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handlePasteSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${uploadInputId}-paste-name`}>Document Name *</Label>
              <Input
                id={`${uploadInputId}-paste-name`}
                value={pasteName}
                onChange={event => setPasteName(event.target.value)}
                placeholder="e.g. Scope_of_Work"
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${uploadInputId}-paste-content`}>Document Text *</Label>
              <Textarea
                id={`${uploadInputId}-paste-content`}
                rows={8}
                value={pasteContent}
                onChange={event => setPasteContent(event.target.value)}
                placeholder="Paste the tender requirements or supporting notes here..."
                disabled={uploading}
              />
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Pasted text will be saved as a .txt document and included in the project analysis.
              </p>
              <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
                {uploading ? 'Saving...' : 'Save Document'}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'upload' && errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        <div className="rounded-2xl border border-dashed border-muted px-4 py-3 text-xs text-muted-foreground">
          Uploaded references are processed to extract requirements and populate your work packages.
        </div>
      </div>
    </section>
  )
}
