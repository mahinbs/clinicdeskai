import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { updatePassword } from '../lib/supabase';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      // Sign out after password change so they must login with new password
      await signOut();
      navigate('/login', { replace: true, state: { message: 'Password updated. Please sign in with your new password.' } });
    } catch (err) {
      setError(err.message || 'Failed to update password.');
      setLoading(false);
    }
    // Don't set loading=false here; we're navigating away
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-700 mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
          <p className="text-gray-500 mt-2">
            You signed in with a temporary password. Please choose a new password to continue.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">New password</label>
            <Input
              type="password"
              placeholder="At least 8 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Confirm password</label>
            <Input
              type="password"
              placeholder="Confirm new password"
              icon={Lock}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            fullWidth
            size="lg"
            icon={ArrowRight}
            disabled={loading}
          >
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
