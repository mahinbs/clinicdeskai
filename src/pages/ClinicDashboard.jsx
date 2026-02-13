import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Stethoscope, ClipboardList } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClinicUsers } from '../utils/database';
import { getRoleDisplayName } from '../utils/auth';

const KPICard = ({ label, value, subtext, icon: Icon, colorClass, bgClass }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group ${bgClass}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`mt-2 text-3xl font-bold text-gray-900 ${colorClass}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {subtext && <div className="mt-4 text-sm text-gray-500">{subtext}</div>}
  </div>
);

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clinicId = profile?.clinic_id;

  useEffect(() => {
    if (!clinicId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getClinicUsers(clinicId);
        setUsers(data || []);
      } catch (err) {
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clinicId]);

  const staff = users.filter((u) => u.role === 'doctor' || u.role === 'receptionist');
  const doctors = staff.filter((s) => s.role === 'doctor');
  const receptionists = staff.filter((s) => s.role === 'receptionist');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clinic Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Staff & Operations Management</p>
        </div>
        <Button variant="primary" icon={UserPlus} className="shadow-lg shadow-teal-100" onClick={() => navigate('/clinic/staff')}>Add New Staff</Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard label="Total Staff" value={loading ? '—' : staff.length} icon={Users} colorClass="text-indigo-600" bgClass="bg-indigo-50" subtext="Active members" />
        <KPICard label="Active Doctors" value={loading ? '—' : doctors.length} icon={Stethoscope} colorClass="text-teal-600" bgClass="bg-teal-50" subtext="Consulting" />
        <KPICard label="Receptionists" value={loading ? '—' : receptionists.length} icon={ClipboardList} colorClass="text-purple-600" bgClass="bg-purple-50" subtext="Front desk" />
      </div>

      <Card title="Clinic Staff Directory" noPadding className="overflow-hidden border-0 shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No staff yet.</td>
                  </tr>
                ) : (
                  staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm mr-3 ring-2 ring-white shadow-sm">
                            {(member.full_name || '?').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={member.role === 'doctor' ? 'primary' : 'secondary'}>
                          {getRoleDisplayName(member.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={member.status === 'active' ? 'success' : 'neutral'} showDot>
                          {member.status === 'active' ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-teal-600">Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClinicDashboard;
