-- ============================================================================
-- Migration: 20260910000001_cleanup_seed_and_normalize_schema.sql
-- Description: Cleans up demo/mock records, enforces strict unique institute
--              codes, composite unique constraints on (institution_id, roll_number),
--              and configures real multi-tenant RLS policies.
-- ============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean up any leftover demo / seed records safely with table existence checks
DO $$
BEGIN
  -- Clean up demo institution_support_contacts if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'institution_support_contacts') THEN
    DELETE FROM public.institution_support_contacts 
    WHERE institution_id IN (
      SELECT id FROM public.institutions WHERE code IN ('MANOYUG-DU-001', 'MANOYUG-MDU-002', 'MANO-DEMO-001') OR slug LIKE 'demo-%'
    );
  END IF;

  -- Clean up demo institution_students if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'institution_students') THEN
    DELETE FROM public.institution_students 
    WHERE institution_id IN (
      SELECT id FROM public.institutions WHERE code IN ('MANOYUG-DU-001', 'MANOYUG-MDU-002', 'MANO-DEMO-001') OR slug LIKE 'demo-%'
    );
  END IF;

  -- Clean up demo institutions
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'institutions') THEN
    DELETE FROM public.institutions 
    WHERE code IN ('MANOYUG-DU-001', 'MANOYUG-MDU-002', 'MANO-DEMO-001') OR slug LIKE 'demo-%';
  END IF;
END $$;

-- 3. Update institutions schema for manual code, capacity and admin credentials
ALTER TABLE public.institutions 
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS is_code_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS admin_email TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS institution_type TEXT DEFAULT 'University',
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 5000;

-- Ensure code is unique and uppercase
CREATE UNIQUE INDEX IF NOT EXISTS idx_institutions_code_unique ON public.institutions (UPPER(TRIM(code))) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions (status, is_code_active);

-- 4. Update institution_students schema for roll numbers & profile fields
ALTER TABLE public.institution_students
  ADD COLUMN IF NOT EXISTS roll_number TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- Backfill roll_number from university_roll_no if present
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'institution_students' AND column_name = 'university_roll_no'
  ) THEN
    UPDATE public.institution_students 
    SET roll_number = university_roll_no 
    WHERE roll_number IS NULL AND university_roll_no IS NOT NULL;
  END IF;
END $$;

-- Unique constraint: A roll number is unique within an institution scope
CREATE UNIQUE INDEX IF NOT EXISTS idx_institution_students_roll_scope 
  ON public.institution_students (institution_id, UPPER(TRIM(roll_number))) 
  WHERE roll_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_institution_students_email_scope 
  ON public.institution_students (institution_id, LOWER(TRIM(email)));

-- 5. Ensure institution_requests table exists for campus access requests
CREATE TABLE IF NOT EXISTS public.institution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  location TEXT,
  institution_type TEXT NOT NULL DEFAULT 'University',
  official_email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  approximate_student_count INTEGER NOT NULL DEFAULT 500,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institution_requests_status ON public.institution_requests (status, created_at DESC);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'institution_support_contacts') THEN
    ALTER TABLE public.institution_support_contacts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Allow public insertion into institution_requests
DROP POLICY IF EXISTS "Public can submit institution requests" ON public.institution_requests;
CREATE POLICY "Public can submit institution requests"
  ON public.institution_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public verification of active institute code
DROP POLICY IF EXISTS "Public can verify active institute codes" ON public.institutions;
CREATE POLICY "Public can verify active institute codes"
  ON public.institutions FOR SELECT
  TO anon, authenticated
  USING (status = 'ACTIVE' AND is_code_active = true);
