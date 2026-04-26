# Employee Management Portal

A full-stack employee operations dashboard with manager login, freeze/block workflows, priority queue handling, and analytics.

## Features

- Manager login with client-side credential validation.
- Employee search across name, role, team, and skills.
- Dashboard with key workforce metrics and quick search-to-employees navigation.
- Employee table with profile details, status badges, and row detail modal.
- Freeze workflow with form validation (project, dates, notes).
- Priority freeze queue (up to 3 requests per employee).
- Auto-expiring freezes (72 hours) with countdown in UI.
- Block and release actions with manager ownership guards.
- Queue rule enforcement:
  - No duplicate active queue entries for same manager.
  - Max 3 managers per employee in active queue.
  - When employee is blocked, queue is cleared.
- Reports page with:
  - Status distribution pie chart.
  - Department-wise bar chart.
  - Top skills chart.
  - Frozen/blocked-by-you table with actions.
- Departments page with grouped employees, status breakdown, and top department skills.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Recharts.
- Backend: Node.js, Express, TypeScript, PostgreSQL.
- Tooling: ESLint, concurrently, tsx.

## Project Structure

```text
.
├── src/                    # Frontend (React)
├── server/
│   ├── src/                # Backend (Express)
│   └── db/                 # SQL schema, migration, seed
├── vite.config.ts          # Vite config + /api proxy
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Setup

1. Install frontend dependencies (root):

```bash
npm install
```

2. Install backend dependencies:

```bash
cd server
npm install
cd ..
```

3. Create the database (example):

```sql
CREATE DATABASE employee_portal;
```

4. Apply schema, migration, and seed data:

```bash
psql -U postgres -d employee_portal -f server/db/schema.sql
psql -U postgres -d employee_portal -f server/db/migrate.sql
psql -U postgres -d employee_portal -f server/db/seed.sql
```

5. Configure backend environment variables (optional; defaults exist in code):

```bash
# server/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_portal
DB_USER=postgres
DB_PASSWORD=
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## Run in Development

From project root:

```bash
npm run dev
```

This starts:

- Frontend on http://localhost:5173
- Backend on http://localhost:3001

The frontend proxies `/api/*` to backend via `vite.config.ts`.

## Manager Login Credentials

Use any of the following demo credentials:

- alice@company.com / alice123
- bob@company.com / bob456
- carol@company.com / carol789
- david@company.com / david321
- eve@company.com / eve654

## Queue and Status Rules

- Freeze requests are stored as a priority queue in `employees.freeze_queue` (JSONB).
- Highest priority is P1 (first queue item).
- Max queue length per employee: 3.
- Freeze auto-expiry window: 72 hours.
- Only the lock owner can release.
- Only the active priority manager can block.
- Blocking an employee clears any queued follow-up freezes.
- Releasing promotes next queued freeze (if any), otherwise employee becomes available.

## API Overview

- `GET /api/employees`
  - Returns employee list with computed `freezeDetails` and queue metadata.
- `POST /api/employees/:id/freeze`
  - Adds freeze request to queue after validations.
- `PATCH /api/employees/:id/status`
  - Supports `blocked` and `available` transitions.

## Build

Frontend build:

```bash
npm run build
```

Backend build:

```bash
cd server
npm run build
```

## Notes

- Project package name currently uses `empoyee-management-portal` (typo retained for compatibility).
- If DB migration is missing `freeze_queue`, freeze/block routes will return migration-required errors.
