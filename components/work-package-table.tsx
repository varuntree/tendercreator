'use client'

import { Circle, CircleCheck, CircleDot } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface WorkPackage {
  id: string
  document_type: string
  document_description: string | null
  requirements: Array<{
    id: string
    text: string
    priority: 'mandatory' | 'optional'
    source: string
  }>
  assigned_to: string | null
  status: 'pending' | 'in_progress' | 'completed'
}

interface WorkPackageTableProps {
  workPackages: WorkPackage[]
  onAssignmentChange: (workPackageId: string, mockUserId: string) => void
  onStatusChange: (workPackageId: string, status: string) => void
  onOpen: (workPackageId: string) => void
}

const mockUsers = [
  { id: 'admin', name: 'Admin' },
  { id: 'writer_a', name: 'Writer A' },
  { id: 'writer_b', name: 'Writer B' },
]

export function WorkPackageTable({
  workPackages,
  onAssignmentChange,
  onStatusChange,
  onOpen,
}: WorkPackageTableProps) {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CircleCheck,
          label: 'Completed',
          className: 'text-green-600',
        }
      case 'in_progress':
        return {
          icon: CircleDot,
          label: 'In Progress',
          className: 'text-amber-600',
        }
      default:
        return {
          icon: Circle,
          label: 'Not Started',
          className: 'text-blue-600',
        }
    }
  }

  const getUserName = (userId: string | null) => {
    if (!userId || userId === 'unassigned') return 'Unassigned'
    const user = mockUsers.find((u) => u.id === userId)
    return user?.name || 'Unassigned'
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Type</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workPackages.map((wp) => {
            const statusDisplay = getStatusDisplay(wp.status)
            const StatusIcon = statusDisplay.icon

            return (
              <TableRow key={wp.id} className="bg-muted/20 hover:bg-muted/40 transition-colors">
                <TableCell className="font-medium">{wp.document_type}</TableCell>
                <TableCell>
                  <Select
                    value={wp.assigned_to || 'unassigned'}
                    onValueChange={(value) => onAssignmentChange(wp.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>
                        {getUserName(wp.assigned_to)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className={`flex items-center gap-2 ${statusDisplay.className}`}>
                    <StatusIcon className="h-5 w-5" />
                    <span className="font-medium">{statusDisplay.label}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onOpen(wp.id)}
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
