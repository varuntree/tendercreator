'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileDown, Check, Home } from 'lucide-react'
import { toast } from 'sonner'
import { WorkPackage } from '@/libs/repositories/work-packages'
import Link from 'next/link'

interface ExportScreenProps {
  workPackageId: string
  workPackage: WorkPackage
  projectId: string
  wordCount?: number
  lastUpdated?: string
}

export function ExportScreen({
  workPackageId,
  workPackage,
  projectId,
  wordCount,
  lastUpdated,
}: ExportScreenProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/work-packages/${workPackageId}/export`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setIsComplete(true)
        setDownloadUrl(data.download_url)
        toast.success('Document exported successfully')

        // Trigger download
        if (data.download_url) {
          window.location.href = data.download_url
        }
      } else {
        toast.error(data.error || 'Failed to export document')
      }
    } catch (error) {
      toast.error('Failed to export document')
    } finally {
      setIsExporting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center space-y-6">
            <div className="mx-auto size-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Check className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Document Exported Successfully!</h3>
              <p className="text-muted-foreground">
                Your tender document has been exported as a Word document.
              </p>
            </div>
            {downloadUrl && (
              <Button asChild>
                <a href={downloadUrl} download>
                  <FileDown className="mr-2 size-4" />
                  Download Again
                </a>
              </Button>
            )}
            <Button variant="outline" asChild className="w-full">
              <Link href={`/projects/${projectId}`}>
                <Home className="mr-2 size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export Document</h2>
        <p className="text-muted-foreground">Download your completed tender document</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="font-medium mb-1">Document Type</p>
            <p className="text-sm text-muted-foreground">{workPackage.document_type}</p>
          </div>

          {wordCount && (
            <div>
              <p className="font-medium mb-1">Word Count</p>
              <Badge variant="outline">{wordCount.toLocaleString()} words</Badge>
            </div>
          )}

          {lastUpdated && (
            <div>
              <p className="font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
          )}

          <div>
            <p className="font-medium mb-1">Export Format</p>
            <div className="flex items-center gap-2">
              <FileDown className="size-4 text-muted-foreground" />
              <span className="text-sm">Microsoft Word (.docx)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleExport} disabled={isExporting} size="lg" className="w-full">
        {isExporting ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FileDown className="mr-2 size-5" />
            Export as Word Document
          </>
        )}
      </Button>
    </div>
  )
}
