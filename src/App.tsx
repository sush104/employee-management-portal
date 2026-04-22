import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { ReportsPage } from './pages/ReportsPage'
import { DepartmentsPage } from './pages/DepartmentsPage'
import type { Employee, Status, FreezeDetails } from './types/employee'

function App() {
  const [manager, setManager] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [releaseError, setReleaseError] = useState<string | null>(null)

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

  async function handleStatusChange(id: number, status: Status, freezeDetails?: FreezeDetails) {
    try {
      let res: Response

      if (status === 'frozen' && freezeDetails) {
        // Dedicated freeze endpoint
        res = await fetch(`/api/employees/${id}/freeze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            managerEmail: manager,
            projectName:  freezeDetails.projectName,
            managerName:  freezeDetails.managerName,
            startDate:    freezeDetails.startDate,
            endDate:      freezeDetails.endDate  || undefined,
            notes:        freezeDetails.notes    || undefined,
          }),
        })
      } else {
        // Block or release
        res = await fetch(`/api/employees/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, managerEmail: manager }),
        })
      }

      if (res.status === 403) {
        const data = await res.json()
        setReleaseError(data.error ?? 'You are not authorised to release this employee.')
        return
      }
      if (!res.ok) throw new Error('Failed to update status')
      const updated: Employee = await res.json()
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? updated : e))
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar
        manager={manager}
        onLogout={() => setManager(null)}
      />

      {/* Release-denied error banner */}
      {releaseError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{releaseError}</span>
            <button
              onClick={() => setReleaseError(null)}
              className="shrink-0 font-semibold hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-[hsl(var(--muted-foreground))]">Loading employees…</span>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard employees={employees} />} />
          <Route
            path="/employees"
            element={
              <EmployeesPage
                managerName={manager.split('@')[0].replace(/^./, (c) => c.toUpperCase())}
                managerEmail={manager}
                employees={employees}
                onStatusChange={handleStatusChange}
              />
            }
          />
          <Route path="/reports" element={<ReportsPage employees={employees} />} />
          <Route path="/departments" element={<DepartmentsPage employees={employees} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  )
}

export default App
