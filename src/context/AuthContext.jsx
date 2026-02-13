import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, signIn as supabaseSignIn, signOut as supabaseSignOut } from '../lib/supabase';
import { getDefaultRoute } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = async (userId, timeoutMs = 5000) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    try {
      // Race profile fetch against timeout so we never hang forever
      const profilePromise = getUserProfile(userId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timed out')), timeoutMs)
      );
      const p = await Promise.race([profilePromise, timeoutPromise]);
      setProfile(p);
      setError(null);
      return p;
    } catch (err) {
      console.error('Failed to load profile:', err);
      setProfile(null);
      setError(err.message);
      // If profile fails, the session is likely invalid → sign out
      if (err.message?.includes('timed out') || err.message?.includes('JWT')) {
        console.warn('Invalid session detected, signing out');
        await supabase.auth.signOut();
        setUser(null);
      }
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let initializing = true;

    const init = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const profile = await loadProfile(session.user.id);
          // If profile failed to load, clear the session
          if (!profile && isMounted) {
            setUser(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          initializing = false;
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Don't handle state changes until initial auth is done (prevent race condition)
      if (initializing) return;
      if (!isMounted) return;

      // Don't reload profile on USER_UPDATED (happens during password change) - just update user
      if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseSignIn(email, password);
      const p = await loadProfile(data.user.id);
      setUser(data.user);
      return { user: data.user, profile: p };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabaseSignOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = () => {
    if (user?.id) return loadProfile(user.id);
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signOut,
    refreshProfile,
    isAuthenticated: !!user && !!profile,
    role: profile?.role || null,
    clinicId: profile?.clinic_id || null,
    defaultRoute: profile ? getDefaultRoute(profile) : '/login',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
