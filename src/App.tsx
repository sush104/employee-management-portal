import { useState, useEffect } from 'react'
import { LoginForm } from './components/LoginForm'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import type { Employee, Status } from './types/employee'

function App() {
  const [manager, setManager] = useState<string | null>(null)
  const [page, setPage] = useState('Dashboard')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data: Employee[]) => setEmployees(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (!manager) {
    return <LoginForm onLogin={(email) => setManager(email)} />
  }

  function navigate(p: string, search = '') {
    setEmployeeSearch(search)
    setPage(p)
  }

  async function handleStatusChange(id: number, status: Status) {
    try {
      const res = await fetch(`/api/employees/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated: Employee = await res.json()
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar
        manager={manager}
        onLogout={() => setManager(null)}
        activePage={page}
        onNavigate={(p) => navigate(p)}
      />
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-[hsl(var(--muted-foreground))]">Loading employees…</span>
        </div>
      ) : (
        <>
          {page === 'Dashboard' && (
            <Dashboard
              employees={employees}
              onSearch={(q) => navigate('Employees', q)}
            />
          )}
          {page === 'Employees' && (
            <EmployeesPage
              key={employeeSearch}
              initialSearch={employeeSearch}
              employees={employees}
              onStatusChange={handleStatusChange}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
