import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmployeeSearch } from '@/components/employees/EmployeeSearch'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import type { Employee, Status, FreezeDetails } from '@/types/employee'

const PAGE_SIZE = 50

interface PaginatedEmployeesResponse {
  items: Employee[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

interface EmployeesPageProps {
  managerName: string
  managerEmail: string
  totalEmployees: number
  onStatusChange: (id: number, status: Status, freezeDetails?: FreezeDetails) => Promise<Employee | null>
}

export function EmployeesPage({ managerName, managerEmail, totalEmployees, onStatusChange }: EmployeesPageProps) {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') ?? '')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)

    return () => clearTimeout(timeout)
  }, [search])

  const fetchEmployeesPage = useCallback(async (nextOffset: number, append: boolean) => {
    const requestId = ++requestIdRef.current
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(nextOffset),
      })
      if (debouncedSearch.trim()) {
        params.set('q', debouncedSearch.trim())
      }

      const res = await fetch(`/api/employees?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch employees')

      const data: PaginatedEmployeesResponse = await res.json()
      if (requestId !== requestIdRef.current) return

      setEmployees((prev) => append ? [...prev, ...data.items] : data.items)
      setFilteredTotal(data.total)
      setHasMore(data.hasMore)
    } catch (err) {
      console.error(err)
      if (!append) {
        setEmployees([])
        setFilteredTotal(0)
        setHasMore(false)
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }, [debouncedSearch])

  useEffect(() => {
    void fetchEmployeesPage(0, false)
  }, [fetchEmployeesPage])

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return
    void fetchEmployeesPage(employees.length, true)
  }, [employees.length, fetchEmployeesPage, hasMore, isLoading, isLoadingMore])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  function handleEmployeeStatusChange(id: number, status: Status, freezeDetails?: FreezeDetails) {
    void (async () => {
      const updated = await onStatusChange(id, status, freezeDetails)
      if (!updated) return

      setEmployees((prev) => prev.map((employee) => (
        employee.id === id ? updated : employee
      )))
    })()
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EmployeeSearch
        value={search}
        total={totalEmployees}
        filtered={filteredTotal}
        visible={employees.length}
        onChange={setSearch}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-[hsl(var(--muted-foreground))]">
          Loading employees...
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          managerName={managerName}
          managerEmail={managerEmail}
          onStatusChange={handleEmployeeStatusChange}
        />
      )}

      <div ref={sentinelRef} className="mt-6 flex justify-center">
        {isLoadingMore ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Loading more employees...
          </p>
        ) : hasMore ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Showing {employees.length} of {filteredTotal} — scroll for more
          </p>
        ) : filteredTotal > 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            All {filteredTotal} employees shown
          </p>
        ) : null}
      </div>
    </main>
  )
}

