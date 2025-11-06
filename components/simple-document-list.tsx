'use client'

import { FileText } from 'lucide-react'

interface Document {
  id: string
  name: string
}

interface SimpleDocumentListProps {
  documents: Document[]
}

export default function SimpleDocumentList({ documents }: SimpleDocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No documents uploaded yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-2 rounded-md border bg-card p-3 text-sm transition-colors hover:bg-muted/50"
        >
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{doc.name}</span>
        </div>
      ))}
    </div>
  )
}
