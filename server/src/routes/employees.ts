import { Router } from 'express'
import { pool } from '../db'

export const employeeRouter = Router()

employeeRouter.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM employees ORDER BY id')
    res.json(rows.map(toEmployee))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /api/employees/:id/freeze ────────────────────────────────────────
interface FreezeBody {
  managerEmail: string
  projectName: string
  managerName: string
  startDate: string
  endDate?: string
  notes?: string
}

employeeRouter.post('/:id/freeze', async (req, res) => {
  const id = Number(req.params.id)
  const { managerEmail, projectName, managerName, startDate, endDate, notes } =
    req.body as FreezeBody

  if (!managerEmail || !projectName || !managerName || !startDate) {
    res.status(400).json({ error: 'managerEmail, projectName, managerName and startDate are required' })
    return
  }

  try {
    const { rows } = await pool.query(
      `UPDATE employees
       SET status                  = 'frozen',
           locked_by_manager_email = $1,
           freeze_project_name     = $2,
           freeze_manager_name     = $3,
           freeze_start_date       = $4,
           freeze_end_date         = $5,
           freeze_notes            = $6
       WHERE id = $7
       RETURNING *`,
      [managerEmail, projectName, managerName, startDate, endDate ?? null, notes ?? null, id]
    )
    if (rows.length === 0) {
      res.status(404).json({ error: 'Employee not found' })
      return
    }
    res.json(toEmployee(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── PATCH /api/employees/:id/status  (block / release only) ───────────────
interface StatusBody {
  status: 'available' | 'blocked'
  managerEmail: string
}

const VALID_STATUSES = new Set(['available', 'blocked'])

employeeRouter.patch('/:id/status', async (req, res) => {
  const id = Number(req.params.id)
  const { status, managerEmail } = req.body as StatusBody

  if (!VALID_STATUSES.has(status)) {
    res.status(400).json({ error: 'Use /freeze for frozen status. Valid values: available, blocked' })
    return
  }
  if (!managerEmail) {
    res.status(400).json({ error: 'managerEmail is required' })
    return
  }

  try {
    const { rows: current } = await pool.query(
      'SELECT locked_by_manager_email FROM employees WHERE id = $1',
      [id]
    )
    if (current.length === 0) {
      res.status(404).json({ error: 'Employee not found' })
      return
    }

    // Release guard: only the manager who locked can release
    if (status === 'available' && current[0].locked_by_manager_email) {
      if (current[0].locked_by_manager_email !== managerEmail) {
        res.status(403).json({
          error: `Only ${current[0].locked_by_manager_email} can release this employee.`,
        })
        return
      }
    }

    let rows
    if (status === 'blocked') {
      ;({ rows } = await pool.query(
        `UPDATE employees
         SET status                  = 'blocked',
             locked_by_manager_email = $1,
             freeze_project_name     = NULL,
             freeze_manager_name     = NULL,
             freeze_start_date       = NULL,
             freeze_end_date         = NULL,
             freeze_notes            = NULL
         WHERE id = $2
         RETURNING *`,
        [managerEmail, id]
      ))
    } else {
      // available – release
      ;({ rows } = await pool.query(
        `UPDATE employees
         SET status                  = 'available',
             locked_by_manager_email = NULL,
             freeze_project_name     = NULL,
             freeze_manager_name     = NULL,
             freeze_start_date       = NULL,
             freeze_end_date         = NULL,
             freeze_notes            = NULL
         WHERE id = $1
         RETURNING *`,
        [id]
      ))
    }

    res.json(toEmployee(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

function toEmployee(row: Record<string, unknown>) {
  const freezeDetails =
    row.status === 'frozen'
      ? {
          projectName: (row.freeze_project_name as string) ?? '',
          managerName: (row.freeze_manager_name as string) ?? '',
          startDate:   (row.freeze_start_date   as string) ?? '',
          endDate:     (row.freeze_end_date      as string) ?? '',
          notes:       (row.freeze_notes         as string) ?? '',
        }
      : undefined

  return {
    id:                   row.id,
    name:                 row.name,
    role:                 row.role,
    skills:               row.skills,
    experience:           row.experience,
    team:                 row.team,
    status:               row.status,
    email:                row.email,
    phone:                row.phone,
    location:             row.location,
    department:           row.department,
    joinedDate:           row.joined_date,
    bio:                  row.bio,
    lockedByManagerEmail: row.locked_by_manager_email ?? null,
    freezeDetails,
  }
}
