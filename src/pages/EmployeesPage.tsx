import { useState } from 'react'
import { EmployeeSearch } from '@/components/employees/EmployeeSearch'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import type { Employee, Status, FreezeDetails } from '@/types/employee'

interface EmployeesPageProps {
  initialSearch?: string
  managerName: string
  managerEmail: string
  employees: Employee[]
  onStatusChange: (id: number, status: Status, freezeDetails?: FreezeDetails) => void
}

export function EmployeesPage({ initialSearch = '', managerName, managerEmail, employees, onStatusChange }: EmployeesPageProps) {
  const [search, setSearch] = useState(initialSearch)

  const terms = search
    .split(/[\s,]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  const filtered = employees.filter((e) => {
    const haystack = [e.name, e.role, e.team, ...e.skills].map((v) => v.toLowerCase())
    // Any term must match at least one field (OR logic)
    return terms.length === 0 || terms.some((term) => haystack.some((v) => v.includes(term)))
  })

  function handleStatusChange(id: number, status: Status, freezeDetails?: FreezeDetails) {
    onStatusChange(id, status, freezeDetails)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EmployeeSearch
        value={search}
        total={employees.length}
        filtered={filtered.length}
        onChange={setSearch}
      />
      <EmployeeTable
        employees={filtered}
        managerName={managerName}
        managerEmail={managerEmail}
        onStatusChange={handleStatusChange}
      />
    </main>
  )
}

