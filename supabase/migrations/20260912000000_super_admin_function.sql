-- ============================================================================
-- Migration: 20260912000000_super_admin_function.sql
-- Description: Supabase function to grant PLATFORM_SUPER_ADMIN role to a user.
-- ============================================================================

-- 1. Ensure platform anchor institution exists
INSERT INTO public.institutions (id, name, slug, status, student_capacity)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ManoYug Platform Admin',
  'manoyug-platform-root',
  'ACTIVE',
  999999
)
ON CONFLICT (id) DO UPDATE 
SET name = excluded.name, status = 'ACTIVE';

-- 2. Create or replace the secure database function to make any user a Super Admin
CREATE OR REPLACE FUNCTION public.make_super_admin(target_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_institution_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- 1. Find user in auth.users by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(target_email))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('User with email "%s" was not found in auth.users. Please register or create user first.', target_email)
    );
  END IF;

  -- 2. Ensure profile exists in public.profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (v_user_id, lower(trim(target_email)), 'Super Administrator')
  ON CONFLICT (id) DO UPDATE
  SET email = excluded.email;

  -- 3. Upsert PLATFORM_SUPER_ADMIN membership
  INSERT INTO public.memberships (user_id, institution_id, role, is_active)
  VALUES (v_user_id, v_institution_id, 'PLATFORM_SUPER_ADMIN', true)
  ON CONFLICT (user_id, institution_id, role) DO UPDATE
  SET is_active = true;

  -- Normalize any other active role records for this user
  UPDATE public.memberships
  SET is_active = true, role = 'PLATFORM_SUPER_ADMIN'
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', format('Successfully granted PLATFORM_SUPER_ADMIN to %s (%s)', target_email, v_user_id),
    'user_id', v_user_id
  );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.make_super_admin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.make_super_admin(text) TO postgres;

-- 3. Run for user yugrathee28@gmail.com
DO $$
BEGIN
  PERFORM public.make_super_admin('yugrathee28@gmail.com');
END $$;
