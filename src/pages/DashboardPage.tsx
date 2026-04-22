import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Building2, UserCheck, UserX, type LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Employee } from '@/types/employee'

interface DashboardProps {
  employees: Employee[]
}

interface Stat {
  label: string
  value: number
  icon: LucideIcon
  change: string
  variant: 'success' | 'secondary' | 'warning'
  iconColor: string
}

export function Dashboard({ employees }: DashboardProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const total       = employees.length
  const departments = new Set(employees.map((e) => e.department)).size
  const available   = employees.filter((e) => e.status === 'available').length
  const blocked     = employees.filter((e) => e.status === 'blocked').length
  const frozen      = employees.filter((e) => e.status === 'frozen').length

  const STATS: Stat[] = [
    { label: 'Total Employees', value: total,       icon: Users,       change: `${available} available`,  variant: 'success',   iconColor: 'text-violet-500' },
    { label: 'Departments',     value: departments, icon: Building2,   change: `${departments} teams`,    variant: 'secondary', iconColor: 'text-blue-500'   },
    { label: 'Available',       value: available,   icon: UserCheck,   change: `of ${total} employees`,   variant: 'success',   iconColor: 'text-emerald-500'},
    { label: 'Blocked',         value: blocked,     icon: UserX,       change: `${frozen} frozen too`,    variant: 'warning',   iconColor: 'text-red-500'    },
  ]

  function handleSearch() {
    if (query.trim()) navigate(`/employees?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search hero */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-3">
          Find Employees
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8 text-base">
          Search by name, role, skill, or team to get started.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. React TypeScript, Frontend Engineer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="h-12 text-base"
          />
          <Button onClick={handleSearch} className="h-12 px-6 shrink-0">
            Search
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-[hsl(var(--muted))] ${stat.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
              <Badge variant={stat.variant} className="mt-2">{stat.change}</Badge>
            </CardContent>
          </Card>
          )
        })}
      </div>
    </main>
  )
}



