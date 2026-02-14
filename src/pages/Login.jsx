import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Stethoscope, Activity, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'clinic_admin', label: 'Clinic Admin' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'receptionist', label: 'Receptionist' },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signOut, loading, error, defaultRoute, isAuthenticated, profile } = useAuth();
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // If already logged in (staff role), always show their portal — redirect to their default route
  useEffect(() => {
    if (loading || !profile) return;
    if (isAuthenticated && profile.role !== 'master_admin') {
      navigate(defaultRoute, { replace: true });
    }
  }, [loading, isAuthenticated, profile, defaultRoute, navigate]);

  // Don't show login form while redirecting already logged-in user to their portal
  if (!loading && isAuthenticated && profile && profile.role !== 'master_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  const from = location.state?.from?.pathname || defaultRoute || '/doctor';

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
      // If profile failed to load, don't enforce role check (but user won't be able to proceed anyway)
      if (!profile) {
        setLocalError('Failed to load your profile. Please try again or contact support.');
        return;
      }
      if (profile.role === 'master_admin') {
        await signOut();
        setLocalError('Use Master Admin login for this account.');
        return;
      }
      if (profile.role !== selectedRole) {
        await signOut();
        const roleLabel = ROLES.find((r) => r.id === selectedRole)?.label ?? selectedRole;
        setLocalError(`This login is for ${roleLabel} only. Your account is not a ${roleLabel}.`);
        return;
      }
      // Only when they have a temp password (new account or admin reset) — then ask once; after they change it we won't ask again
      if (profile?.is_temp_password === true) {
        navigate('/change-password', { replace: true });
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-teal-700 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white/30"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ClinicDesk AI</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Streamline Your Medical Practice Today.</h2>
          <p className="text-teal-100 text-lg leading-relaxed mb-8">
            Experience the next generation of clinic management.
            AI-driven workflows, smart reception, and seamless doctor-patient interactions.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-6 h-6 mb-3 text-teal-200" />
              <h3 className="font-semibold">Secure & HIPAA Compliant</h3>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <Stethoscope className="w-6 h-6 mb-3 text-teal-200" />
              <h3 className="font-semibold">Smart Doctor Tools</h3>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-teal-200">
          © 2026 ClinicDesk AI. All rights reserved.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to your clinic portal.</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Login as</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                    selectedRole === role.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-teal-50 hover:border-teal-200'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {(localError || error) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {localError || error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@clinic.com"
                  icon={Mail}
                  className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link to="#" className="text-sm font-medium text-teal-600 hover:text-teal-700">Forgot password?</Link>
                </div>
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
              className="h-12 text-base font-semibold shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all transform active:scale-[0.98]"
              icon={ArrowRight}
              disabled={submitting || loading}
            >
              {submitting || loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-6 text-center border-t border-gray-100 space-y-2">
            <p className="text-sm text-gray-500">
              Master Admin?{' '}
              <Link to="/master/login" className="font-semibold text-slate-700 hover:text-slate-800 hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              New to ClinicDesk? <span className="text-gray-400">Contact your admin for access.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
