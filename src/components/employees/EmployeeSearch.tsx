import { Input } from '@/components/ui/input'

interface EmployeeSearchProps {
  value: string
  total: number
  filtered: number
  onChange: (value: string) => void
}

export function EmployeeSearch({ value, total, filtered, onChange }: EmployeeSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Employees</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
          {filtered} of {total} employees
        </p>
      </div>
      <Input
        placeholder="e.g. React TypeScript, Frontend…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-72"
      />
    </div>
  )
}
