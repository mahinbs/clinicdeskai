import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building, MapPin, Copy, CheckCircle, AlertCircle, UserX, UserCheck, KeyRound } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import {
  getClinicById,
  getClinicUsers,
  suspendClinic,
  reactivateClinic,
  suspendUser,
  reactivateUser,
  resetUserPassword,
} from '../utils/database';

const ROLE_LABEL = { clinic_admin: 'Clinic Admin', doctor: 'Doctor', receptionist: 'Receptionist' };

const ManageClinic = () => {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [resetResult, setResetResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!clinicId) return;
    setLoading(true);
    setError('');
    try {
      const [c, u] = await Promise.all([getClinicById(clinicId), getClinicUsers(clinicId)]);
      setClinic(c);
      setUsers(u || []);
    } catch (err) {
      setError(err.message);
      setClinic(null);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [clinicId]);

  const handleSuspendClinic = async () => {
    if (!clinicId || clinic?.status === 'suspended') return;
    setActionLoading('suspend-clinic');
    setError('');
    try {
      await suspendClinic(clinicId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateClinic = async () => {
    if (!clinicId || clinic?.status !== 'suspended') return;
    setActionLoading('reactivate-clinic');
    setError('');
    try {
      await reactivateClinic(clinicId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async (userId) => {
    setActionLoading(`suspend-${userId}`);
    setError('');
    try {
      await suspendUser(userId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (userId) => {
    setActionLoading(`reactivate-${userId}`);
    setError('');
    try {
      await reactivateUser(userId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (user) => {
    setActionLoading(`reset-${user.id}`);
    setError('');
    setResetResult(null);
    try {
      const data = await resetUserPassword(user.id);
      setResetResult({
        email: user.email,
        full_name: user.full_name,
        temporary_password: data?.temporary_password || '—',
        message: data?.message || 'New temporary password sent via email.',
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const copyPassword = () => {
    if (resetResult?.temporary_password) {
      navigator.clipboard.writeText(resetResult.temporary_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !clinic) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!clinic && !loading) {
    return (
      <div className="space-y-4">
        <p className="text-gray-500">Clinic not found.</p>
        <Link to="/master/clinics" className="text-teal-600 hover:underline">← Back to Manage Clinics</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/master/clinics" className="text-sm text-teal-600 hover:underline mb-1 inline-block">← Manage Clinics</Link>
          <h1 className="text-2xl font-semibold text-gray-900">{clinic.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            {clinic.address && <><MapPin className="w-4 h-4" /> {clinic.address}</>}
            {!clinic.address && 'No address'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={clinic.status === 'active' ? 'success' : 'neutral'}>
            {clinic.status === 'active' ? 'Active' : 'Suspended'}
          </Badge>
          {clinic.status === 'active' ? (
            <Button variant="outline" size="sm" onClick={handleSuspendClinic} disabled={!!actionLoading}>
              {actionLoading === 'suspend-clinic' ? '…' : 'Suspend clinic'}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleReactivateClinic} disabled={!!actionLoading}>
              {actionLoading === 'reactivate-clinic' ? '…' : 'Reactivate clinic'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Modal open={!!resetResult} onClose={() => setResetResult(null)}>
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-teal-100 text-teal-600 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">Password reset</h3>
            <p className="text-sm text-gray-600 mt-1">{resetResult?.full_name}</p>
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</p>
                <p className="font-mono font-semibold text-gray-900 mt-0.5">{resetResult?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Temporary password (show once)</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 font-mono text-sm font-bold text-gray-900 break-all">
                    {resetResult?.temporary_password}
                  </code>
                  <Button variant="outline" size="sm" icon={copied ? CheckCircle : Copy} onClick={copyPassword} className="shrink-0">
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-teal-700 font-medium">{resetResult?.message}</p>
            </div>
            <Button type="button" variant="primary" fullWidth className="mt-6" onClick={() => setResetResult(null)}>
              Yes, I have saved it
            </Button>
          </div>
        </div>
      </Modal>

      <Card title="Clinic users" noPadding>
        {users.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">No users in this clinic.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{ROLE_LABEL[u.role] || u.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={u.status === 'active' ? 'success' : 'neutral'}>{u.status === 'active' ? 'Active' : 'Suspended'}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.status === 'active' ? (
                          <Button variant="ghost" size="sm" onClick={() => handleSuspendUser(u.id)} disabled={!!actionLoading} title="Suspend">
                            <UserX className="w-4 h-4 text-red-600" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleReactivateUser(u.id)} disabled={!!actionLoading} title="Reactivate">
                            <UserCheck className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(u)}
                          disabled={!!actionLoading}
                          title="Reset password (sends new temp password)"
                        >
                          <KeyRound className="w-4 h-4 text-amber-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageClinic;
