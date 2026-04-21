import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EmployeeActions } from '@/components/employees/EmployeeActions'
import type { Employee, Status } from '@/types/employee'
import { STATUS_CONFIG } from '@/types/employee'

interface EmployeeDetailModalProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
  onStatusChange: (id: number, status: Status) => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[hsl(var(--foreground))]">{value}</span>
    </div>
  )
}

export function EmployeeDetailModal({ employee, open, onClose, onStatusChange }: EmployeeDetailModalProps) {
  if (!employee) return null

  const { label, variant } = STATUS_CONFIG[employee.status]

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

        <Separator className='mt-4 mb-4' />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Actions</span>
          <EmployeeActions
            status={employee.status}
            onFreeze={() => { onStatusChange(employee.id, 'frozen'); onClose() }}
            onBlock={() => { onStatusChange(employee.id, 'blocked'); onClose() }}
            onRelease={() => { onStatusChange(employee.id, 'available'); onClose() }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
