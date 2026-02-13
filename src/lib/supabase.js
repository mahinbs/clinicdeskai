import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce', // Use PKCE flow for better security
  },
});

// Helper to get current user session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper to get user profile with role and clinic info
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      clinic:clinics (
        id,
        name,
        logo_url,
        theme,
        status
      )
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Helper to check if user has access (active status + active clinic)
export const checkUserAccess = async () => {
  try {
    const { data, error } = await supabase.rpc('check_user_access');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Check if user has access (not suspended)
  const hasAccess = await checkUserAccess();
  if (!hasAccess) {
    await supabase.auth.signOut();
    throw new Error('Your account or clinic has been suspended. Please contact support.');
  }

  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Update password (used only after first login with temp password or after admin reset)
export const updatePassword = async (newPassword) => {
  console.log('[updatePassword] Starting password update...');
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('[updatePassword] Auth update failed:', error);
    throw error;
  }
  
  console.log('[updatePassword] Auth password updated successfully');

  // Clear temp-password flag so we don't ask again on next login
  console.log('[updatePassword] Clearing temp password flag...');
  const { error: rpcError } = await supabase.rpc('clear_my_temp_password');
  if (rpcError) {
    console.error('[updatePassword] RPC failed:', rpcError);
    throw rpcError;
  }
  
  console.log('[updatePassword] Temp password flag cleared successfully');
  return data;
};

// Request password reset
export const resetPasswordRequest = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  return data;
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
