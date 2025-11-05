'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, ChevronLeft, Check } from 'lucide-react'
import { toast } from 'sonner'
import { WorkPackage } from '@/libs/repositories/work-packages'

interface GenerationScreenProps {
  workPackageId: string
  workPackage: WorkPackage
  winThemesCount: number
  onContinue: () => void
  onBack: () => void
}

export function GenerationScreen({
  workPackageId,
  workPackage,
  winThemesCount,
  onContinue,
  onBack,
}: GenerationScreenProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/work-packages/${workPackageId}/generate-content`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setIsComplete(true)
        toast.success('Content generated successfully')
        setTimeout(() => {
          onContinue()
        }, 2000)
      } else {
        toast.error(data.error || 'Failed to generate content')
        setIsGenerating(false)
      }
    } catch (error) {
      toast.error('Failed to generate content')
      setIsGenerating(false)
    }
  }

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto size-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <Check className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Content Generated!</h3>
            <p className="text-muted-foreground">Redirecting to editor...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Generation</h2>
        <p className="text-muted-foreground">Generate your tender document using AI</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Document Type</p>
              <p className="text-sm text-muted-foreground">{workPackage.document_type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Requirements</p>
              <Badge variant="outline">{workPackage.requirements.length} total</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Win Themes</p>
              <Badge variant="outline">{winThemesCount} themes</Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Estimated generation time: 2-3 minutes
            </p>
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">Generating {workPackage.document_type}...</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing requirements and assembling context
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          <ChevronLeft className="mr-2 size-4" />
          Back to Strategy
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Content'
          )}
        </Button>
      </div>
    </div>
  )
}
