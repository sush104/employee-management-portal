-- Migration: add freeze details and manager-lock columns
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='locked_by_manager_email') THEN
    ALTER TABLE employees ADD COLUMN locked_by_manager_email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='freeze_project_name') THEN
    ALTER TABLE employees ADD COLUMN freeze_project_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='freeze_manager_name') THEN
    ALTER TABLE employees ADD COLUMN freeze_manager_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='freeze_start_date') THEN
    ALTER TABLE employees ADD COLUMN freeze_start_date TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='freeze_end_date') THEN
    ALTER TABLE employees ADD COLUMN freeze_end_date TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='freeze_notes') THEN
    ALTER TABLE employees ADD COLUMN freeze_notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='freeze_expiry') THEN
    ALTER TABLE employees ADD COLUMN freeze_expiry TIMESTAMP;
  END IF;
END$$;
