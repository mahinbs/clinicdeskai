import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, DollarSign, ArrowRight, TrendingUp, Plus, Clock, CalendarOff } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { getDoctorDashboardStats, getTodayAppointments, getAllPatients, getClinicSchedules, getClinicHolidays } from '../utils/database';

const KPICard = ({ label, value, change, status, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-3 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {change && (
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-bold ${status === 'positive' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 bg-gray-100'} px-2 py-0.5 rounded-md`}>
          <TrendingUp className="w-3 h-3 mr-1" />
          {change}
        </span>
      </div>
    )}
  </div>
);

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const am = hour < 12;
  return `${hour % 12 || 12}:${m} ${am ? 'AM' : 'PM'}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinicSchedules, setClinicSchedules] = useState([]);
  const [clinicHolidays, setClinicHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const doctorId = profile?.id;
  const clinicId = profile?.clinic_id;
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (!doctorId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().split('T')[0];
        const promises = [
          getDoctorDashboardStats(doctorId, today),
          getTodayAppointments(doctorId),
          getAllPatients(),
        ];
        if (clinicId) {
          promises.push(getClinicSchedules(clinicId), getClinicHolidays(clinicId));
        }
        const results = await Promise.all(promises);
        setStats(results[0]);
        setAppointments(results[1] || []);
        setPatients(results[2] || []);
        if (clinicId) {
          setClinicSchedules(results[3] || []);
          setClinicHolidays(results[4] || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId, clinicId]);

  const date = new Date();
  const recentAppointments = appointments.slice(0, 3);
  const recentPatients = patients.slice(0, 3);

  const kpiStats = stats ? [
    { label: 'Total Patients', value: String(stats.total_patients ?? 0), change: null, status: 'neutral' },
    { label: 'Appointments Today', value: String(stats.total_appointments ?? 0), change: `${stats.pending_appointments ?? 0} remaining`, status: 'neutral' },
    { label: 'Completed Today', value: String(stats.completed_appointments ?? 0), change: null, status: 'positive' },
  ] : [
    { label: 'Total Patients', value: '0', change: null, status: 'neutral' },
    { label: 'Appointments Today', value: '0', change: null, status: 'neutral' },
    { label: 'Completed Today', value: '0', change: null, status: 'neutral' },
  ];
  const kpiIcons = [Users, Calendar, DollarSign];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.full_name || 'Doctor'}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/doctor/appointments')}>New Appointment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiStats.map((stat, index) => (
          <KPICard key={index} {...stat} icon={kpiIcons[index]} />
        ))}
      </div>

      {clinicId && (clinicSchedules.some((c) => c.is_closed) || clinicHolidays.length > 0) && (
        <Card title="Clinic closed days" className="bg-amber-50/50 border-amber-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clinicSchedules.some((c) => c.is_closed) && (
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CalendarOff className="w-3.5 h-3.5" /> Off weekdays (by clinic)
                </p>
                <p className="text-sm text-gray-700">
                  {clinicSchedules
                    .filter((c) => c.is_closed)
                    .map((c) => DAY_NAMES[c.day_of_week])
                    .join(', ') || '—'}
                </p>
              </div>
            )}
            {clinicHolidays.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CalendarOff className="w-3.5 h-3.5" /> Clinic holidays (dates closed this year)
                </p>
                <ul className="text-sm text-gray-700 space-y-0.5 max-h-24 overflow-y-auto">
                  {clinicHolidays.slice(0, 10).map((h) => (
                    <li key={h.id || h.date}>
                      {h.date}{h.reason ? ` — ${h.reason}` : ''}
                    </li>
                  ))}
                  {clinicHolidays.length > 10 && <li className="text-gray-500">+{clinicHolidays.length - 10} more</li>}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Upcoming Appointments" action={<Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>View All</Button>}>
          <div className="space-y-4">
            {recentAppointments.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No appointments today.</p>
            ) : (
              recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-sm hover:border-teal-100 group">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold shadow-sm">
                        {(apt.patient?.full_name || '?').charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{apt.patient?.full_name || 'Patient'}</p>
                      <p className="text-xs text-gray-500 font-medium">{apt.reason_for_visit || 'Consultation'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 flex items-center justify-end">
                      <Clock className="w-3 h-3 mr-1 text-teal-500" />
                      {formatTime(apt.time_slot)}
                    </div>
                    <div className="mt-1">
                      <Badge variant={apt.status === 'scheduled' || apt.status === 'with_doctor' ? 'primary' : 'neutral'} showDot>{apt.status?.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Recent Patients" action={<Button variant="ghost" size="sm" onClick={() => navigate('/doctor/patients')}>View All</Button>}>
          <div className="space-y-2">
            {recentPatients.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No patients yet.</p>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/doctor/patients/${patient.id}`)}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold ring-2 ring-white border border-gray-100">
                      {(patient.full_name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{patient.full_name}</p>
                      <p className="text-xs text-gray-500">{patient.medical_history || '—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">ID</p>
                    <p className="text-sm text-gray-700 font-medium">{patient.patient_id_number}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
