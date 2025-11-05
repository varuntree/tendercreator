'use client'

import { Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Document {
  id: string
  document_type: string
  requirements: unknown[]
}

interface StreamingProgressProps {
  isAnalyzing: boolean
  documents: Document[]
}

export function StreamingProgress({
  isAnalyzing,
  documents,
}: StreamingProgressProps) {
  if (!isAnalyzing && documents.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <CardTitle>Analyzing RFT Documents</CardTitle>
        </div>
        <CardDescription>
          Identifying required submission documents...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg animate-in fade-in slide-in-from-left-5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-1">
                <p className="font-medium">{doc.document_type}</p>
              </div>
              <Badge variant="secondary">
                {doc.requirements.length} requirements
              </Badge>
            </div>
          ))}
          {documents.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Found {documents.length} document{documents.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
