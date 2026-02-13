-- Fix circular dependency in users RLS policy
-- The "Users can view own profile" policy was calling is_user_active() which joins clinics,
-- but clinics RLS also calls is_user_active(), creating infinite recursion.

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Recreate without is_user_active() check - just verify it's the current user
-- The status/clinic checks will be done by the get_my_profile() function instead
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

-- Update policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
