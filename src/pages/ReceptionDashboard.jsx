import React, { useState, useEffect } from 'react';
import { UserPlus, Clock, CheckCircle, Activity, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const KPICard = ({ label, value, icon: Icon, colorClass, bgClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const ReceptionDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clinicId = profile?.clinic_id;

  useEffect(() => {
    if (!clinicId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error: err } = await supabase
          .from('appointments')
          .select('id, status, patient:patients(full_name), time_slot')
          .eq('clinic_id', clinicId)
          .eq('appointment_date', today)
          .in('status', ['scheduled', 'with_doctor', 'completed'])
          .order('time_slot');
        if (err) throw err;
        setAppointments(data || []);
      } catch (err) {
        setError(err.message);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clinicId]);

  const waiting = appointments.filter((a) => a.status === 'scheduled' || a.status === 'with_doctor').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Front Desk</h1>
          <p className="text-sm text-gray-500 mt-1">Patient Flow Management & Check-in</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('queue')} icon={Activity}>Live Queue</Button>
          <Button variant="primary" icon={UserPlus} className="shadow-lg shadow-teal-100" onClick={() => navigate('checkin')}>New Check-in</Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard label="Total Check-ins Today" value={loading ? '—' : appointments.length} icon={User} colorClass="text-teal-600" bgClass="bg-teal-50" />
        <KPICard label="Currently Waiting" value={loading ? '—' : waiting} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-50" />
        <KPICard label="Completed" value={loading ? '—' : completed} icon={CheckCircle} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Quick Actions" className="h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('checkin')} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">New Patient</h3>
              <p className="text-xs text-gray-500 mt-1">Register a walk-in patient</p>
            </button>
            <button onClick={() => navigate('queue')} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Manage Queue</h3>
              <p className="text-xs text-gray-500 mt-1">Update patient status</p>
            </button>
          </div>
        </Card>

        <Card title="Queue Status" action={<Button variant="ghost" size="sm" onClick={() => navigate('queue')}>View Full</Button>}>
          <div className="space-y-3">
            {!loading && waiting > 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start">
                <Clock className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900">{waiting} Patients Waiting</h4>
                  <p className="text-sm text-amber-700 mt-1">Estimated wait time: ~{waiting * 10} mins</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>{loading ? 'Loading…' : 'No patients currently waiting'}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
