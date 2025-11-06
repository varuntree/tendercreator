'use client'

import { Download, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ProjectDocument {
  id: string
  name: string
  file_type: string
  file_size: number
  uploaded_at: string
  is_primary_rft?: boolean
  download_url?: string | null
}

interface ProjectDocumentsTableProps {
  documents: ProjectDocument[]
  onDelete?: (id: string) => Promise<void> | void
  onSetPrimary?: (id: string) => Promise<void> | void
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return '-'
  }
}

export function ProjectDocumentsTable({ documents, onDelete, onSetPrimary }: ProjectDocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-muted px-6 py-10 text-sm text-muted-foreground">
        No documents uploaded yet.
      </div>
    )
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map(doc => (
            <TableRow key={doc.id} className="align-top">
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">{doc.name}</span>
                  {doc.is_primary_rft ? (
                    <Badge variant="secondary" className="w-max">Primary RFT</Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{doc.file_type || '-'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatFileSize(doc.file_size)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDateTime(doc.uploaded_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {doc.download_url ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(doc.download_url!)}
                      aria-label={`Download ${doc.name}`}
                    >
                      <Download className="size-4" />
                    </Button>
                  ) : null}

                  {onSetPrimary && !doc.is_primary_rft ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onSetPrimary(doc.id)}
                    >
                      Make Primary
                    </Button>
                  ) : null}

                  {onDelete ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(doc.id)}
                      aria-label={`Delete ${doc.name}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
