-- Allow authenticated user to clear their own is_temp_password flag after setting a new password.
-- SECURITY DEFINER so it always succeeds regardless of RLS.
CREATE OR REPLACE FUNCTION public.clear_my_temp_password()
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET is_temp_password = false, updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.clear_my_temp_password() TO authenticated;
