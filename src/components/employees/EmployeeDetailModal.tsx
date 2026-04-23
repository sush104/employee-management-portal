import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Employee } from '@/types/employee'
import { STATUS_CONFIG } from '@/types/employee'

interface EmployeeDetailModalProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[hsl(var(--foreground))]">{value}</span>
    </div>
  )
}

function formatTimeRemaining(expiryDate: string): string {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Expired'
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  }
  return `${minutes}m remaining`
}

export function EmployeeDetailModal({ employee, open, onClose }: EmployeeDetailModalProps) {
  const [, setRefresh] = useState(0)

  // Update countdown every second
  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => setRefresh(r => r + 1), 1000)
    return () => clearInterval(interval)
  }, [open])

  if (!employee) return null

  const { label, variant } = STATUS_CONFIG[employee.status]
  const fd = employee.freezeDetails

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent>
        {/* Header */}
        <SheetHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">{employee.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle>{employee.name}</SheetTitle>
              <SheetDescription className="mt-0.5">{employee.role} · {employee.department}</SheetDescription>
              <div className="mt-2">
                <Badge variant={variant}>{label}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Bio */}
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{employee.bio}</p>

        <Separator className='mt-4 mb-4' />

        {/* Contact & Meta */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailRow label="Email"      value={employee.email} />
          <DetailRow label="Phone"      value={employee.phone} />
          <DetailRow label="Location"   value={employee.location} />
          <DetailRow label="Joined"     value={employee.joinedDate} />
          <DetailRow label="Experience" value={employee.experience} />
          <DetailRow label="Team"       value={employee.team} />
        </div>

        <Separator className='mt-4 mb-4' />

        {/* Skills */}
        <div>
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Skills</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {employee.skills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>

        {/* Freeze details — visible for frozen and blocked employees */}
        {(employee.status === 'frozen' || employee.status === 'blocked') && fd && (
          <>
            <Separator className='mt-4 mb-4' />
            <div>
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Freeze Details</span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-3">
                <DetailRow label="Project"  value={fd.projectName} />
                <DetailRow label="Manager"  value={fd.managerName} />
                <DetailRow label="From"     value={fd.startDate} />
                {employee.status === 'frozen' && fd.expiryDate ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Auto-Expires In</span>
                    <span className="text-sm font-semibold text-amber-700">{formatTimeRemaining(fd.expiryDate)}</span>
                    <span className="text-xs text-amber-600">{new Date(fd.expiryDate).toLocaleString()}</span>
                  </div>
                ) : null}
                {fd.endDate && <DetailRow label="Until" value={fd.endDate} />}
                {fd.notes && (
                  <div className="col-span-2 flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Notes</span>
                    <span className="text-sm text-[hsl(var(--foreground))]">{fd.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </SheetContent>
    </Sheet>
  )
}
