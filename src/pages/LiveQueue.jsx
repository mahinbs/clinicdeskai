import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Play, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const am = hour < 12;
  return `${hour % 12 || 12}:${m} ${am ? 'AM' : 'PM'}`;
};

const LiveQueue = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clinicId = profile?.clinic_id;

  const load = async () => {
    if (!clinicId) return;
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error: err } = await supabase
        .from('appointments')
        .select('id, status, token_number, time_slot, patient:patients(full_name)')
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

  useEffect(() => {
    load();
  }, [clinicId]);

  // Supabase Realtime: when any appointment for this clinic changes, refetch queue
  // so multiple receptionists/screens stay in sync without refresh
  useEffect(() => {
    if (!clinicId) return;
    const channel = supabase
      .channel(`live-queue-${clinicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId]);

  const updateStatus = async (id, newStatus) => {
    try {
      await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const waiting = appointments.filter((a) => a.status === 'scheduled');
  const withDoctor = appointments.filter((a) => a.status === 'with_doctor');
  const completed = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Live Consultation Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time patient flow management</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
          </span>
          <span className="text-sm font-medium text-teal-700">Live</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Waiting Room" icon={Users} className="h-full border-t-4 border-t-amber-400">
            <div className="space-y-4">
              {waiting.map((apt) => (
                <div key={apt.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all duration-300 group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100">
                      {apt.token_number || apt.id?.slice(0, 4)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{apt.patient?.full_name || 'Patient'}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(apt.time_slot)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" icon={Play} className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => updateStatus(apt.id, 'with_doctor')}>
                    Call In
                  </Button>
                </div>
              ))}
              {waiting.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Users className="w-8 h-8 mb-2 opacity-50" />
                  <p>Waiting room is empty</p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="In Consultation" icon={Play} className="border-t-4 border-t-teal-500 bg-teal-50/50">
              <div className="space-y-4">
                {withDoctor.map((apt) => (
                  <div key={apt.id} className="p-5 rounded-xl bg-white border border-teal-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl animate-pulse">
                          {apt.token_number || apt.id?.slice(0, 4)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{apt.patient?.full_name || 'Patient'}</p>
                        <p className="text-xs text-teal-600 font-medium uppercase tracking-wide">With Doctor</p>
                      </div>
                    </div>
                    <Button size="sm" variant="primary" icon={CheckCircle} onClick={() => updateStatus(apt.id, 'completed')}>
                      Complete
                    </Button>
                  </div>
                ))}
                {withDoctor.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-white/50 rounded-xl border border-dashed border-gray-200">
                    <Play className="w-8 h-8 mb-2 opacity-50" />
                    <p>Doctor is currently free</p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Recently Completed" className="opacity-80">
              <div className="space-y-2">
                {completed.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs mr-3">
                        {apt.token_number || '—'}
                      </div>
                      <span className="font-medium text-gray-700">{apt.patient?.full_name || 'Patient'}</span>
                    </div>
                    <Badge variant="success" size="sm" showDot>Done</Badge>
                  </div>
                ))}
                {completed.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No completed sessions yet.</p>}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQueue;
