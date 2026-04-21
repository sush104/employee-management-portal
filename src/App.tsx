import { useState } from 'react'
import { LoginForm } from './components/LoginForm'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { INITIAL_EMPLOYEES } from './types/employee'
import type { Status } from './types/employee'

function App() {
  const [manager, setManager] = useState<string | null>(null)
  const [page, setPage] = useState('Dashboard')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES)

  if (!manager) {
    return <LoginForm onLogin={(email) => setManager(email)} />
  }

  function navigate(p: string, search = '') {
    setEmployeeSearch(search)
    setPage(p)
  }

  function handleStatusChange(id: number, status: Status) {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar
        manager={manager}
        onLogout={() => setManager(null)}
        activePage={page}
        onNavigate={(p) => navigate(p)}
      />
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
    </div>
  )
}

export default App
