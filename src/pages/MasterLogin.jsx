import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const MasterLogin = () => {
  const navigate = useNavigate();
  const { signIn, signOut, loading, error, isAuthenticated, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // If already logged in as master admin, force redirect to master dashboard (ignore URL)
  useEffect(() => {
    if (loading || !profile) return;
    if (isAuthenticated && profile?.role === 'master_admin') {
      navigate('/master', { replace: true });
    }
  }, [loading, isAuthenticated, profile, navigate]);

  // Don't show login form while redirecting logged-in master admin
  if (!loading && isAuthenticated && profile?.role === 'master_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim() || !password) {
      setLocalError('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const { profile } = await signIn(email.trim(), password);
      if (profile?.role !== 'master_admin') {
        await signOut();
        setLocalError('This login is for Master Admin only. Use the main login for Clinic Admin, Doctor, or Receptionist.');
        return;
      }
      navigate('/master', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-800 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ClinicDesk AI</span>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Master Admin Portal</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Sign in to manage clinics, onboard new clinic admins, and oversee the platform.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-400">© 2026 ClinicDesk AI</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Master Admin</h1>
            <p className="text-gray-500 mt-2">Sign in with your master admin credentials.</p>
          </div>

          {(localError || error) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="master@clinicdesk.ai"
                  icon={Mail}
                  className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="h-12 text-base font-semibold shadow-lg shadow-slate-200 hover:shadow-slate-300 transition-all"
              icon={ArrowRight}
              disabled={submitting || loading}
            >
              {submitting || loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-6 text-center border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Clinic Admin, Doctor, or Receptionist?{' '}
              <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterLogin;
