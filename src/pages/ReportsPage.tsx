import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmployeeActions } from '@/components/employees/EmployeeActions'
import type { Employee, Status, FreezeDetails } from '@/types/employee'
import { STATUS_CONFIG } from '@/types/employee'

interface ReportsPageProps {
  managerName: string
  managerEmail: string
  employees: Employee[]
  onStatusChange: (id: number, status: Status, freezeDetails?: FreezeDetails) => void
}

const STATUS_COLORS: Record<string, string> = {
  available: '#10b981',
  frozen:    '#f59e0b',
  blocked:   '#ef4444',
}

export function ReportsPage({ managerName, managerEmail, employees, onStatusChange }: ReportsPageProps) {
  const total     = employees.length
  const available = employees.filter((e) => e.status === 'available').length
  const frozen    = employees.filter((e) => e.status === 'frozen').length
  const blocked   = employees.filter((e) => e.status === 'blocked').length

  // Status pie data
  const statusData = [
    { name: 'Available', value: available, key: 'available' },
    { name: 'Frozen',    value: frozen,    key: 'frozen'    },
    { name: 'Blocked',   value: blocked,   key: 'blocked'   },
  ].filter((d) => d.value > 0)

  // Department bar data
  const deptMap: Record<string, { available: number; frozen: number; blocked: number }> = {}
  for (const e of employees) {
    if (!deptMap[e.department]) deptMap[e.department] = { available: 0, frozen: 0, blocked: 0 }
    deptMap[e.department][e.status]++
  }
  const deptData = Object.entries(deptMap).map(([dept, counts]) => ({
    department: dept,
    ...counts,
  }))

  // Skills frequency
  const skillMap: Record<string, number> = {}
  for (const e of employees) {
    for (const s of e.skills) {
      skillMap[s] = (skillMap[s] ?? 0) + 1
    }
  }
  const topSkills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }))

  // Frozen/blocked employees managed by the logged-in manager
  const managedLockedEmployees = employees.filter(
    (e) => (e.status === 'frozen' || e.status === 'blocked') && e.lockedByManagerEmail === managerEmail,
  )

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Reports</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Workforce overview across {total} employees
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: total,     color: 'text-violet-600',  bg: 'bg-violet-50'  },
          { label: 'Available', value: available, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Frozen',    value: frozen,    color: 'text-amber-600',   bg: 'bg-amber-50'   },
          { label: 'Blocked',   value: blocked,   color: 'text-red-600',     bg: 'bg-red-50'     },
        ].map(({ label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className={`flex flex-col items-center justify-center py-6 ${bg} rounded-xl`}>
              <span className={`text-4xl font-bold ${color}`}>{value}</span>
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status distribution pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Employees']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((d) => (
                <div key={d.key} className="flex items-center gap-1.5 text-sm">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: STATUS_COLORS[d.key] }}
                  />
                  {d.name}: <strong>{d.value}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employees by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="available" name="Available" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="frozen"    name="Frozen"    fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="blocked"   name="Blocked"   fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topSkills}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => [v, 'Employees']} />
                <Bar dataKey="count" name="Employees" fill="#8b5cf6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Frozen/blocked employees table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frozen/Blocked by You</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {managedLockedEmployees.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] px-6 py-8 text-center">
                No employees are currently frozen or blocked by you.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managedLockedEmployees.map((emp) => {
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
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{emp.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>{label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {emp.freezeDetails?.projectName
                          ? <Badge variant="secondary">{emp.freezeDetails.projectName}</Badge>
                          : <span className="text-[hsl(var(--muted-foreground))]">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {emp.freezeDetails?.managerName ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {emp.freezeDetails?.startDate ?? '—'}
                      </TableCell>
                      <TableCell>
                        <EmployeeActions
                          employeeName={emp.name}
                          managerName={managerName}
                          managerEmail={managerEmail}
                          lockedByManagerEmail={emp.lockedByManagerEmail}
                          status={emp.status}
                          onFreeze={(details) => onStatusChange(emp.id, 'frozen', details)}
                          onBlock={() => onStatusChange(emp.id, 'blocked')}
                          onRelease={() => onStatusChange(emp.id, 'available')}
                          showFreezeOnAvailable={false}
                          showBlockOnAvailable={false}
                          showBlockOnFrozen={true}
                        />
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
