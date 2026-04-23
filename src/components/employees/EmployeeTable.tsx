import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmployeeActions } from '@/components/employees/EmployeeActions'
import { EmployeeDetailModal } from '@/components/employees/EmployeeDetailModal'
import type { Employee, Status, FreezeDetails } from '@/types/employee'
import { STATUS_CONFIG } from '@/types/employee'

interface EmployeeTableProps {
  employees: Employee[]
  managerName: string
  managerEmail: string
  onStatusChange: (id: number, status: Status, freezeDetails?: FreezeDetails) => void
}

export function EmployeeTable({ employees, managerName, managerEmail, onStatusChange }: EmployeeTableProps) {
  const [selected, setSelected] = useState<Employee | null>(null)

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Team / Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                    No employees match your search.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => {
                  const { label, variant } = STATUS_CONFIG[emp.status]
                  return (
                    <TableRow key={emp.id} className="cursor-pointer" onClick={() => setSelected(emp)}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{emp.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-[hsl(var(--foreground))] whitespace-nowrap">
                            {emp.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {emp.role}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {emp.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {emp.experience}
                      </TableCell>
                      <TableCell className="text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {emp.team}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>{label}</Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <EmployeeActions
                          employeeName={emp.name}
                          managerName={managerName}
                          managerEmail={managerEmail}
                          lockedByManagerEmail={emp.lockedByManagerEmail}
                          status={emp.status}
                          onFreeze={(details) => onStatusChange(emp.id, 'frozen', details)}
                          onBlock={() => onStatusChange(emp.id, 'blocked')}
                          onRelease={() => onStatusChange(emp.id, 'available')}
                          showBlockOnAvailable={false}
                          showBlockOnFrozen={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeDetailModal
        employee={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
