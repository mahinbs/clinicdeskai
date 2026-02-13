-- Fix circular dependency in RLS when fetching user profile
-- Drop and recreate the function with correct types

DROP FUNCTION IF EXISTS public.get_my_profile();

CREATE FUNCTION public.get_my_profile()
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role user_role,
  clinic_id UUID,
  status user_status,
  is_temp_password BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  clinic_name VARCHAR(255),
  clinic_logo_url TEXT,
  clinic_theme JSONB,
  clinic_status clinic_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.role,
    u.clinic_id,
    u.status,
    u.is_temp_password,
    u.created_at,
    u.updated_at,
    c.name as clinic_name,
    c.logo_url as clinic_logo_url,
    c.theme as clinic_theme,
    c.status as clinic_status
  FROM public.users u
  LEFT JOIN public.clinics c ON u.clinic_id = c.id
  WHERE u.id = auth.uid()
  AND u.status = 'active'
  AND (u.role = 'master_admin' OR c.status = 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
