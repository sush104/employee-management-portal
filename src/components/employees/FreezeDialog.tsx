import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FreezeDetails } from '@/types/employee'

interface FreezeDialogProps {
  employeeName: string
  managerName: string
  open: boolean
  onClose: () => void
  onConfirm: (details: FreezeDetails) => void
}

export function FreezeDialog({ employeeName, managerName, open, onClose, onConfirm }: FreezeDialogProps) {
  const EMPTY: FreezeDetails = {
    projectName: '',
    managerName,
    startDate: '',
    endDate: '',
    notes: '',
  }

  const [form, setForm] = useState<FreezeDetails>({ ...EMPTY })
  const [errors, setErrors] = useState<Partial<Record<keyof FreezeDetails, string>>>({})

  function handleChange(field: keyof FreezeDetails, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate() {
    const next: typeof errors = {}
    if (!form.projectName.trim()) next.projectName = 'Project name is required'
    if (!form.startDate) next.startDate = 'Start date is required'
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      next.endDate = 'End date must be after start date'
    }
    return next
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onConfirm(form)
    setForm({ ...EMPTY })
    setErrors({})
  }

  function handleClose() {
    setForm({ ...EMPTY })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Freeze Employee</DialogTitle>
          <DialogDescription>
            Enter assignment details for <span className="font-medium text-[hsl(var(--foreground))]">{employeeName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Project Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="freeze-project">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="freeze-project"
              placeholder="e.g. Phoenix Relaunch"
              value={form.projectName}
              onChange={(e) => handleChange('projectName', e.target.value)}
            />
            {errors.projectName && (
              <span className="text-xs text-red-500">{errors.projectName}</span>
            )}
          </div>

          {/* Manager Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="freeze-manager">Manager Name</Label>
            <Input
              id="freeze-manager"
              value={form.managerName}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="freeze-start">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="freeze-start"
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
              {errors.startDate && (
                <span className="text-xs text-red-500">{errors.startDate}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="freeze-end">End Date</Label>
              <Input
                id="freeze-end"
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
              {errors.endDate && (
                <span className="text-xs text-red-500">{errors.endDate}</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="freeze-notes">Notes</Label>
            <textarea
              id="freeze-notes"
              rows={3}
              placeholder="Additional context or instructions…"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="flex w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              Confirm Freeze
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
