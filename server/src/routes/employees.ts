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

const VALID_STATUSES = new Set(['available', 'blocked', 'frozen'])

employeeRouter.patch('/:id/status', async (req, res) => {
  const id = Number(req.params.id)
  const { status } = req.body as { status: string }

  if (!VALID_STATUSES.has(status)) {
    res.status(400).json({ error: 'Invalid status' })
    return
  }

  try {
    const { rows } = await pool.query(
      'UPDATE employees SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
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

function toEmployee(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    skills: row.skills,
    experience: row.experience,
    team: row.team,
    status: row.status,
    email: row.email,
    phone: row.phone,
    location: row.location,
    department: row.department,
    joinedDate: row.joined_date,
    bio: row.bio,
  }
}
