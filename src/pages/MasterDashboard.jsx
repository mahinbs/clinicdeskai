import React, { useState, useEffect, useCallback } from 'react';
import { Building, Users, Activity } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { getAllClinics } from '../utils/database';
import ManageClinicModal from '../components/ManageClinicModal';

const MasterDashboard = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manageClinicId, setManageClinicId] = useState(null);

  const loadClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllClinics();
      setClinics(data || []);
    } catch (err) {
      setError(err.message);
      setClinics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  const activeCount = clinics.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Master Admin</h1>
          <p className="text-sm text-gray-500">Platform Overview</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/master/clinics')}>Manage Clinics</Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center p-6">
          <div className="p-3 rounded-full bg-teal-100 text-teal-700 mr-4">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Clinics</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? '—' : activeCount}</p>
          </div>
        </Card>
        <Card className="flex items-center p-6">
          <div className="p-3 rounded-full bg-green-100 text-green-700 mr-4">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Clinics</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? '—' : clinics.length}</p>
          </div>
        </Card>
        <Card className="flex items-center p-6">
          <div className="p-3 rounded-full bg-purple-100 text-purple-700 mr-4">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">System Status</p>
            <p className="text-lg font-bold text-green-600">Operational</p>
          </div>
        </Card>
      </div>

      <Card title="Registered Clinics" noPadding>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clinics.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No clinics yet.</td>
                  </tr>
                ) : (
                  clinics.map((clinic) => (
                    <tr key={clinic.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{clinic.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{clinic.address || clinic.contact_phone || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={clinic.status === 'active' ? 'success' : 'neutral'}>
                          {clinic.status === 'active' ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button variant="ghost" size="sm" onClick={() => setManageClinicId(clinic.id)}>Manage</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ManageClinicModal
        clinicId={manageClinicId}
        open={!!manageClinicId}
        onClose={() => setManageClinicId(null)}
        onUpdated={loadClinics}
      />
    </div>
  );
};

export default MasterDashboard;
