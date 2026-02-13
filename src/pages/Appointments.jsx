import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Filter, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { getTodayAppointments } from '../utils/database';

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const am = hour < 12;
  return `${hour % 12 || 12}:${m} ${am ? 'AM' : 'PM'}`;
};

const Appointments = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const filters = ['All', 'scheduled', 'with_doctor', 'completed', 'cancelled'];

  useEffect(() => {
    if (!profile?.id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTodayAppointments(profile.id);
        setAppointments(data || []);
      } catch (err) {
        setError(err.message);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.id]);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesFilter = filter === 'All' || apt.status === filter;
    const patientName = (apt.patient?.full_name || '').toLowerCase();
    const reason = (apt.reason_for_visit || '').toLowerCase();
    const notes = (apt.notes || '').toLowerCase();
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || reason.includes(searchTerm.toLowerCase()) || notes.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusVariant = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'scheduled' || status === 'with_doctor') return 'primary';
    if (status === 'cancelled') return 'neutral';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your schedule and consultations</p>
        </div>
        <Button variant="primary" icon={Calendar} onClick={() => navigate('/doctor/appointments')}>
          New Appointment
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <Card noPadding className="border-0 shadow-lg overflow-hidden">
        {showFilters && (
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 transition-all duration-300">
            <div className="flex flex-wrap gap-1 bg-white p-1 rounded-lg border border-gray-200">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${filter === f ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-72">
              <Input
                icon={Search}
                placeholder="Search patient..."
                className="bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No appointments found.</td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                            {(appointment.patient?.full_name || '?').charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{appointment.patient?.full_name || 'Patient'}</div>
                            <div className="text-xs text-gray-500">{appointment.patient?.patient_id_number || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : '—'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(appointment.time_slot)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appointment.reason_for_visit || 'Consultation'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusVariant(appointment.status)} showDot>
                          {appointment.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{filteredAppointments.length}</span> of <span className="font-medium text-gray-900">{appointments.length}</span> results
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Appointments;
