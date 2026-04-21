import { Button } from '@/components/ui/button'
import type { Status } from '@/types/employee'

interface EmployeeActionsProps {
  status: Status
  onFreeze: () => void
  onBlock: () => void
  onRelease: () => void
}

export function EmployeeActions({ status, onFreeze, onBlock, onRelease }: EmployeeActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {status === 'available' && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            onClick={onFreeze}
          >
            Freeze
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={onBlock}
          >
            Block
          </Button>
        </>
      )}
      {(status === 'blocked' || status === 'frozen') && (
        <Button
          size="sm"
          variant="outline"
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          onClick={onRelease}
        >
          Release
        </Button>
      )}
    </div>
  )
}
