import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FreezeDialog } from '@/components/employees/FreezeDialog'
import type { Status, FreezeDetails } from '@/types/employee'

interface EmployeeActionsProps {
  employeeName: string
  managerName: string
  managerEmail: string
  lockedByManagerEmail?: string | null
  status: Status
  onFreeze: (details: FreezeDetails) => void
  onBlock: () => void
  onRelease: () => void
}

export function EmployeeActions({ employeeName, managerName, managerEmail, lockedByManagerEmail, status, onFreeze, onBlock, onRelease }: EmployeeActionsProps) {
  const canRelease = !lockedByManagerEmail || lockedByManagerEmail === managerEmail
  const [freezeOpen, setFreezeOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-1.5">
        {status === 'available' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
              onClick={() => setFreezeOpen(true)}
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
          canRelease ? (
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={onRelease}
            >
              Release
            </Button>
          ) : (
            <span className="text-xs text-[hsl(var(--muted-foreground))] italic">
              Locked by {lockedByManagerEmail}
            </span>
          )
        )}
      </div>

      <FreezeDialog
        employeeName={employeeName}
        managerName={managerName}
        open={freezeOpen}
        onClose={() => setFreezeOpen(false)}
        onConfirm={(details) => {
          setFreezeOpen(false)
          onFreeze(details)
        }}
      />
    </>
  )
}
