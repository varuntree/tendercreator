'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { ContentEditor } from './content-editor'

interface EditorScreenProps {
  workPackageId: string
  initialContent: string
  onContinue: () => void
  onBack: () => void
}

export function EditorScreen({
  workPackageId,
  initialContent,
  onContinue,
  onBack,
}: EditorScreenProps) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="flex flex-shrink-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <h2 className="text-xl font-bold">Edit Document</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} size="sm" className="h-8">
            <ChevronLeft className="mr-2 size-3.5" />
            Back to Planning
          </Button>
          <Button onClick={onContinue} size="sm" className="h-8">
            Continue to Export
            <ChevronRight className="ml-2 size-3.5" />
          </Button>
        </div>
      </div>

      <ContentEditor
        workPackageId={workPackageId}
        initialContent={initialContent}
      />
    </div>
  )
}
