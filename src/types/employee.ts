export type Status = 'available' | 'blocked' | 'frozen'

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
}

export const STATUS_CONFIG: Record<Status, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  available: { label: 'Available', variant: 'success'   },
  blocked:   { label: 'Blocked',   variant: 'warning'   },
  frozen:    { label: 'Frozen',    variant: 'secondary' },
}


