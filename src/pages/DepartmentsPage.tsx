import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import type { Employee } from '@/types/employee'
import { STATUS_CONFIG } from '@/types/employee'

interface DepartmentsPageProps {
  employees: Employee[]
}

const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Engineering: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  Design:      { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200'   },
  Product:     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'   },
  Platform:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200'},
  Analytics:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'  },
}

const DEFAULT_COLOR = { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }

function getColor(dept: string) {
  return DEPT_COLORS[dept] ?? DEFAULT_COLOR
}

export function DepartmentsPage({ employees }: DepartmentsPageProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const navigate = useNavigate()

  // Group employees by department
  const deptMap = employees.reduce<Record<string, Employee[]>>((acc, emp) => {
    const key = emp.department || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(emp)
    return acc
  }, {})

  const departments = Object.entries(deptMap).sort((a, b) => a[0].localeCompare(b[0]))

  // Collect all unique skills per department
  function topSkills(emps: Employee[]) {
    const map: Record<string, number> = {}
    for (const e of emps) for (const s of e.skills) map[s] = (map[s] ?? 0) + 1
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s]) => s)
  }

  const selectedEmployees = selected ? (deptMap[selected] ?? []) : []

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Departments</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {departments.length} departments · {employees.length} employees total
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department cards */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {departments.map(([dept, emps]) => {
            const available = emps.filter(e => e.status === 'available').length
            const frozen    = emps.filter(e => e.status === 'frozen').length
            const blocked   = emps.filter(e => e.status === 'blocked').length
            const color     = getColor(dept)
            const isActive  = selected === dept

            return (
              <button
                key={dept}
                onClick={() => setSelected(isActive ? null : dept)}
                className={`w-full text-left rounded-xl border p-4 transition-all
                  ${isActive
                    ? `${color.bg} ${color.border} border-2 shadow-sm`
                    : 'bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${color.bg} border-2 ${color.border}`} />
                    <span className={`font-semibold text-sm ${isActive ? color.text : 'text-[hsl(var(--foreground))]'}`}>
                      {dept}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{emps.length}</span>
                </div>

                {/* Status pills */}
                <div className="flex gap-1.5 mb-3">
                  {available > 0 && <Badge variant="success">{available} available</Badge>}
                  {frozen    > 0 && <Badge variant="secondary">{frozen} frozen</Badge>}
                  {blocked   > 0 && <Badge variant="warning">{blocked} blocked</Badge>}
                </div>

                {/* Top skills */}
                <div className="flex flex-wrap gap-1">
                  {topSkills(emps).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                      {s}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selected === null ? (
            <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-sm">
              Select a department to see its members
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-lg ${getColor(selected).text}`}>{selected}</CardTitle>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                      {selectedEmployees.length} member{selectedEmployees.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                      onClick={() => navigate(`/employees?q=${encodeURIComponent(selected)}`)}
                      className="text-xs text-[hsl(var(--primary))] hover:underline"
                    >
                      View in Employees →
                    </button>
                </div>

                {/* Summary badges */}
                <div className="flex gap-2 mt-3">
                  {(['available', 'frozen', 'blocked'] as const).map(s => {
                    const count = selectedEmployees.filter(e => e.status === s).length
                    if (!count) return null
                    return (
                      <Badge key={s} variant={STATUS_CONFIG[s].variant}>
                        {count} {STATUS_CONFIG[s].label}
                      </Badge>
                    )
                  })}
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEmployees.map(emp => {
                      const { label, variant } = STATUS_CONFIG[emp.status]
                      return (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">{emp.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="leading-tight">
                                <p className="text-sm font-medium whitespace-nowrap">{emp.name}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">{emp.experience}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                            {emp.role}
                          </TableCell>
                          <TableCell className="text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                            {emp.team}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {emp.skills.slice(0, 3).map(s => (
                                <Badge key={s} variant="secondary">{s}</Badge>
                              ))}
                              {emp.skills.length > 3 && (
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                  +{emp.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={variant}>{label}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
