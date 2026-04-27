import { Router } from 'express'
import { pool } from '../db'

export const employeeRouter = Router()

const MAX_FREEZES_PER_EMPLOYEE = 3
const FREEZE_WINDOW_MS = 72 * 60 * 60 * 1000
const MAX_MANAGERS_PER_EMPLOYEE = 3

interface FreezeQueueItem {
  projectName: string
  managerName: string
  managerEmail: string
  startDate: string
  endDate: string
  notes: string
  expiryDate: string
  priority: number
}

function toDate(value: string): Date | null {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function normalizeFreezeQueue(raw: unknown): FreezeQueueItem[] {
  let parsed: unknown[] = []
  if (Array.isArray(raw)) {
    parsed = raw
  } else if (typeof raw === 'string') {
    try {
      const next = JSON.parse(raw)
      if (Array.isArray(next)) parsed = next
    } catch {
      parsed = []
    }
  }

  const queue = parsed
    .map((item): FreezeQueueItem | null => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const projectName = String(record.projectName ?? '').trim()
      const managerName = String(record.managerName ?? '').trim()
      const managerEmail = String(record.managerEmail ?? '').trim()
      const startDate = String(record.startDate ?? '').trim()
      const expiryDate = String(record.expiryDate ?? '').trim()
      if (!projectName || !managerName || !startDate || !toDate(expiryDate)) return null

      return {
        projectName,
        managerName,
        managerEmail,
        startDate,
        endDate: String(record.endDate ?? '').trim(),
        notes: String(record.notes ?? '').trim(),
        expiryDate,
        priority: Number(record.priority ?? 0),
      }
    })
    .filter((item): item is FreezeQueueItem => item !== null)

  // Keep stable order by existing priority, then re-sequence from 1.
  queue.sort((a, b) => (a.priority || Number.MAX_SAFE_INTEGER) - (b.priority || Number.MAX_SAFE_INTEGER))
  return queue.map((item, index) => ({ ...item, priority: index + 1 }))
}

function removeExpiredFreezes(queue: FreezeQueueItem[]): FreezeQueueItem[] {
  const nowMs = Date.now()
  return queue
    .filter((item) => {
      const expiry = toDate(item.expiryDate)
      return expiry ? expiry.getTime() > nowMs : false
    })
    .map((item, index) => ({ ...item, priority: index + 1 }))
}

async function hasColumn(columnName: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1
       FROM information_schema.columns
      WHERE table_name = 'employees'
        AND column_name = $1`,
    [columnName]
  )
  return rows.length > 0
}

employeeRouter.get('/', async (req, res) => {
  try {
    await releaseExpiredFreezes()

    const rawLimit = Number(req.query.limit)
    const rawOffset = Number(req.query.offset)
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : null
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0
    const searchTerms = typeof req.query.q === 'string'
      ? req.query.q
          .split(/[\s,]+/)
          .map((term) => term.trim().toLowerCase())
          .filter(Boolean)
      : []
    const hasPagination = limit !== null || offset > 0 || searchTerms.length > 0

    const whereParts: string[] = []
    const params: unknown[] = []

    if (searchTerms.length > 0) {
      const termClauses = searchTerms.map((term) => {
        params.push(`%${term}%`)
        const searchParam = `$${params.length}`
        return `(
          LOWER(name) LIKE ${searchParam}
          OR LOWER(role) LIKE ${searchParam}
          OR LOWER(team) LIKE ${searchParam}
          OR LOWER(department) LIKE ${searchParam}
          OR EXISTS (
            SELECT 1
            FROM unnest(skills) AS skill
            WHERE LOWER(skill) LIKE ${searchParam}
          )
        )`
      })
      whereParts.push(`(${termClauses.join(' OR ')})`)
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''

    if (!hasPagination) {
      const { rows } = await pool.query(`SELECT * FROM employees ${whereClause} ORDER BY id`)
      res.json(rows.map(toEmployee))
      return
    }

    const countQuery = `SELECT COUNT(*)::int AS total FROM employees ${whereClause}`
    const [{ total }] = (await pool.query<{ total: number }>(countQuery, params)).rows

    const paginatedParams = [...params]
    paginatedParams.push(limit ?? 50)
    const limitParam = `$${paginatedParams.length}`
    paginatedParams.push(offset)
    const offsetParam = `$${paginatedParams.length}`

    const dataQuery = `
      SELECT *
      FROM employees
      ${whereClause}
      ORDER BY id
      LIMIT ${limitParam}
      OFFSET ${offsetParam}`

    const { rows } = await pool.query(dataQuery, paginatedParams)
    const items = rows.map(toEmployee)

    res.json({
      items,
      total,
      limit: limit ?? 50,
      offset,
      hasMore: offset + items.length < total,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

async function releaseExpiredFreezes() {
  try {
    const queueColumnExists = await hasColumn('freeze_queue')
    if (!queueColumnExists) {
      // Fallback for older schema (single freeze only)
      await pool.query(
        `UPDATE employees
         SET status                  = 'available',
             locked_by_manager_email = NULL,
             freeze_project_name     = NULL,
             freeze_manager_name     = NULL,
             freeze_start_date       = NULL,
             freeze_end_date         = NULL,
             freeze_notes            = NULL,
             freeze_expiry           = NULL
         WHERE status = 'frozen'
           AND freeze_expiry IS NOT NULL
           AND freeze_expiry <= NOW()`
      )
      return
    }

    const { rows } = await pool.query(
      `SELECT id, freeze_queue
         FROM employees
        WHERE status = 'frozen'`
    )

    for (const row of rows) {
      const queue = removeExpiredFreezes(normalizeFreezeQueue(row.freeze_queue))
      if (queue.length === 0) {
        await pool.query(
          `UPDATE employees
             SET status                  = 'available',
                 locked_by_manager_email = NULL,
                 freeze_project_name     = NULL,
                 freeze_manager_name     = NULL,
                 freeze_start_date       = NULL,
                 freeze_end_date         = NULL,
                 freeze_notes            = NULL,
                 freeze_expiry           = NULL,
                 freeze_queue            = '[]'::jsonb
           WHERE id = $1`,
          [row.id]
        )
        continue
      }

      const first = queue[0]
      await pool.query(
        `UPDATE employees
           SET locked_by_manager_email = $1,
               freeze_project_name     = $2,
               freeze_manager_name     = $3,
               freeze_start_date       = $4,
               freeze_end_date         = $5,
               freeze_notes            = $6,
               freeze_expiry           = $7,
               freeze_queue            = $8::jsonb
         WHERE id = $9`,
        [
          first.managerEmail || null,
          first.projectName,
          first.managerName,
          first.startDate,
          first.endDate || null,
          first.notes || null,
          first.expiryDate,
          JSON.stringify(queue),
          row.id,
        ]
      )
    }
  } catch (err) {
    console.error('releaseExpiredFreezes error (non-blocking):', err)
  }
}

// ─── POST /api/employees/:id/freeze ────────────────────────────────────────
interface FreezeBody {
  managerEmail: string
  projectName: string
  managerName: string
  startDate?: string
  endDate?: string
  notes?: string
}

employeeRouter.post('/:id/freeze', async (req, res) => {
  const id = Number(req.params.id)
  const { managerEmail, projectName, managerName, startDate, endDate, notes } =
    req.body as FreezeBody

  if (!managerEmail || !projectName || !managerName) {
    res.status(400).json({ error: 'managerEmail, projectName and managerName are required' })
    return
  }

  try {
    const queueColumnExists = await hasColumn('freeze_queue')
    if (!queueColumnExists) {
      res.status(500).json({ error: 'Database migration required: freeze_queue column is missing.' })
      return
    }

    const { rows: current } = await pool.query(
      'SELECT status, freeze_queue, locked_by_manager_email FROM employees WHERE id = $1',
      [id]
    )
    if (current.length === 0) {
      res.status(404).json({ error: 'Employee not found' })
      return
    }

    if (current[0].status === 'blocked') {
      res.status(400).json({ error: 'Cannot add freeze while employee is blocked.' })
      return
    }

    const normalizedManagerEmail = managerEmail.trim().toLowerCase()

    let queue = removeExpiredFreezes(normalizeFreezeQueue(current[0].freeze_queue))
    if (queue.length >= MAX_FREEZES_PER_EMPLOYEE) {
      res.status(400).json({ error: `Maximum ${MAX_FREEZES_PER_EMPLOYEE} freeze requests are allowed per employee.` })
      return
    }

    const uniqueManagers = new Set(queue.map((item) => item.managerEmail.trim().toLowerCase()).filter(Boolean))
    const currentLockOwner = String(current[0].locked_by_manager_email ?? '').trim().toLowerCase()
    const managerAlreadyQueued = uniqueManagers.has(normalizedManagerEmail)

    // Strict guard: same manager cannot add another freeze before their active one expires.
    if (currentLockOwner && currentLockOwner === normalizedManagerEmail) {
      res.status(400).json({ error: 'You already have an active freeze for this employee. Wait for expiry or release first.' })
      return
    }

    if (managerAlreadyQueued) {
      res.status(400).json({ error: 'This manager already has an active freeze in the queue for this employee.' })
      return
    }
    if (uniqueManagers.size >= MAX_MANAGERS_PER_EMPLOYEE) {
      res.status(400).json({ error: `Only ${MAX_MANAGERS_PER_EMPLOYEE} managers can have active freezes per employee.` })
      return
    }

    const freezeStartDate = startDate?.trim() || new Date().toISOString().slice(0, 10)
    const freezeExpiry = new Date(Date.now() + FREEZE_WINDOW_MS).toISOString()
    queue = [
      ...queue,
      {
        projectName: projectName.trim(),
        managerName: managerName.trim(),
        managerEmail: normalizedManagerEmail,
        startDate: freezeStartDate,
        endDate: endDate?.trim() ?? '',
        notes: notes?.trim() ?? '',
        expiryDate: freezeExpiry,
        priority: queue.length + 1,
      },
    ].map((item, index) => ({ ...item, priority: index + 1 }))

    const first = queue[0]
    const { rows } = await pool.query(
      `UPDATE employees
       SET status                  = 'frozen',
           locked_by_manager_email = $1,
           freeze_project_name     = $2,
           freeze_manager_name     = $3,
           freeze_start_date       = $4,
           freeze_end_date         = $5,
           freeze_notes            = $6,
           freeze_expiry           = $7,
           freeze_queue            = $8::jsonb
       WHERE id = $9
       RETURNING *`,
      [
        first.managerEmail || null,
        first.projectName,
        first.managerName,
        first.startDate,
        first.endDate || null,
        first.notes || null,
        first.expiryDate,
        JSON.stringify(queue),
        id,
      ]
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
      `SELECT status,
              locked_by_manager_email,
              freeze_queue,
              freeze_project_name,
              freeze_manager_name,
              freeze_start_date,
              freeze_end_date,
              freeze_notes
         FROM employees
        WHERE id = $1`,
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
      const queueColumnExists = await hasColumn('freeze_queue')
      if (!queueColumnExists) {
        res.status(500).json({ error: 'Database migration required: freeze_queue column is missing.' })
        return
      }

      const queue = removeExpiredFreezes(normalizeFreezeQueue(current[0].freeze_queue))
      if (queue.length === 0) {
        res.status(400).json({ error: 'Only priority 1 freeze can be blocked. No active freeze found.' })
        return
      }

      const first = queue[0]
      if (first.managerEmail && first.managerEmail !== managerEmail) {
        res.status(403).json({ error: `Only ${first.managerEmail} can block priority 1 freeze.` })
        return
      }

      ;({ rows } = await pool.query(
        `UPDATE employees
         SET status                  = 'blocked',
             locked_by_manager_email = $1,
             freeze_project_name     = $2,
             freeze_manager_name     = $3,
             freeze_start_date       = $4,
             freeze_end_date         = $5,
             freeze_notes            = $6,
             freeze_queue            = '[]'::jsonb,
             freeze_expiry           = NULL
         WHERE id = $7
         RETURNING *`,
        [
          managerEmail,
          first.projectName,
          first.managerName,
          first.startDate,
          first.endDate || null,
          first.notes || null,
          id,
        ]
      ))
    } else {
      // available – release current priority; if queued freezes remain, promote next priority.
      const queueColumnExists = await hasColumn('freeze_queue')
      if (!queueColumnExists) {
        ;({ rows } = await pool.query(
          `UPDATE employees
           SET status                  = 'available',
               locked_by_manager_email = NULL,
               freeze_project_name     = NULL,
               freeze_manager_name     = NULL,
               freeze_start_date       = NULL,
               freeze_end_date         = NULL,
               freeze_notes            = NULL,
               freeze_expiry           = NULL
           WHERE id = $1
           RETURNING *`,
          [id]
        ))
      } else {
        const queue = removeExpiredFreezes(normalizeFreezeQueue(current[0].freeze_queue))
        const remainingQueue = queue.slice(1).map((item, index) => ({ ...item, priority: index + 1 }))

        if (remainingQueue.length > 0) {
          const next = remainingQueue[0]
          ;({ rows } = await pool.query(
            `UPDATE employees
             SET status                  = 'frozen',
                 locked_by_manager_email = $1,
                 freeze_project_name     = $2,
                 freeze_manager_name     = $3,
                 freeze_start_date       = $4,
                 freeze_end_date         = $5,
                 freeze_notes            = $6,
                 freeze_queue            = $7::jsonb,
                 freeze_expiry           = $8
             WHERE id = $9
             RETURNING *`,
            [
              next.managerEmail || null,
              next.projectName,
              next.managerName,
              next.startDate,
              next.endDate || null,
              next.notes || null,
              JSON.stringify(remainingQueue),
              next.expiryDate,
              id,
            ]
          ))
        } else {
          ;({ rows } = await pool.query(
            `UPDATE employees
             SET status                  = 'available',
                 locked_by_manager_email = NULL,
                 freeze_project_name     = NULL,
                 freeze_manager_name     = NULL,
                 freeze_start_date       = NULL,
                 freeze_end_date         = NULL,
                 freeze_notes            = NULL,
                 freeze_queue            = '[]'::jsonb,
                 freeze_expiry           = NULL
             WHERE id = $1
             RETURNING *`,
            [id]
          ))
        }
      }
    }

    res.json(toEmployee(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

function toEmployee(row: Record<string, unknown>) {
  const queue = normalizeFreezeQueue(row.freeze_queue)
  const first = queue[0]

  const freezeDetails =
    (row.status === 'frozen' || row.status === 'blocked')
      ? {
          projectName: first?.projectName ?? (row.freeze_project_name as string) ?? '',
          managerName: first?.managerName ?? (row.freeze_manager_name as string) ?? '',
          startDate:   first?.startDate ?? (row.freeze_start_date as string) ?? '',
          endDate:     first?.endDate ?? (row.freeze_end_date as string) ?? '',
          notes:       first?.notes ?? (row.freeze_notes as string) ?? '',
          expiryDate:  first?.expiryDate ?? (row.freeze_expiry ? new Date(row.freeze_expiry as string).toISOString() : ''),
          priority:    first?.priority ?? 1,
          totalQueued: queue.length,
          queueManagerEmails: queue.map((item) => item.managerEmail).filter(Boolean),
          queue: queue.map((item) => ({
            priority: item.priority,
            managerName: item.managerName,
            managerEmail: item.managerEmail,
            projectName: item.projectName,
            startDate: item.startDate,
            endDate: item.endDate,
            expiryDate: item.expiryDate,
          })),
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
