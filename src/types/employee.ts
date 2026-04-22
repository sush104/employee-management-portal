export type Status = 'available' | 'blocked' | 'frozen'

export interface FreezeDetails {
  projectName: string
  managerName: string
  startDate: string
  endDate: string
  notes: string
}

export interface Employee {
  id: number
  name: string
  role: string
  skills: string[]
  experience: string
  team: string
  status: Status
  // Detail fields
  email: string
  phone: string
  location: string
  department: string
  joinedDate: string
  bio: string
  freezeDetails?: FreezeDetails
  lockedByManagerEmail?: string | null
}

export const STATUS_CONFIG: Record<Status, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  available: { label: 'Available', variant: 'success'   },
  blocked:   { label: 'Blocked',   variant: 'warning'   },
  frozen:    { label: 'Frozen',    variant: 'secondary' },
}


