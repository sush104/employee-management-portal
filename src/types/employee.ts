export type Status = 'available' | 'blocked' | 'frozen'

export interface FreezeQueueItem {
  priority: number
  managerName: string
  managerEmail: string
  projectName: string
  startDate: string
  endDate: string
  expiryDate: string
}

export interface FreezeDetails {
  projectName: string
  managerName: string
  startDate: string
  endDate: string
  notes: string
  expiryDate?: string
  priority?: number
  totalQueued?: number
  queueManagerEmails?: string[]
  queue?: FreezeQueueItem[]
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


