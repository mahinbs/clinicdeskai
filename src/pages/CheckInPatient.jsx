import React, { useState, useEffect, useMemo } from 'react';
import { User, Stethoscope, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  getTodayAppointmentsForReception,
  checkInAppointment,
  setAppointmentQueueNumber,
  getClinicDoctorsWithSettings,
  getAvailableSlots,
  createAppointment,
  createPatient,
  searchPatients,
  getAppointmentsAffectedByDoctorLeave,
  updateAppointmentDoctor,
  getTodayCollectionByDoctor,
} from '../utils/database';

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = String(t).split(':');
  const hour = parseInt(h, 10);
  const am = hour < 12;
  return `${hour % 12 || 12}:${m || '00'} ${am ? 'AM' : 'PM'}`;
};

// Minimum lead time for booking over phone (today only): 1 hour = 2 x 30min slots
const BOOK_AHEAD_MINUTES = 60;

/** For today, only show slots that start at least BOOK_AHEAD_MINUTES from now. */
function filterSlotsForToday(slots, dateStr) {
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr !== todayStr || !slots?.length) return slots ?? [];
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const cutoffMinutes = nowMinutes + BOOK_AHEAD_MINUTES;
  return slots.filter((slot) => {
    const t = typeof slot.time_slot === 'string' ? slot.time_slot : slot.time_slot;
    const [h, m] = String(t).split(':');
    const slotMinutes = parseInt(h, 10) * 60 + parseInt(m || '0', 10);
    return slotMinutes >= cutoffMinutes;
  });
}

const CheckInPatient = () => {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedInResult, setCheckedInResult] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInDoctorId, setWalkInDoctorId] = useState('');
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [checkingInId, setCheckingInId] = useState(null);
  const [customQueueNum, setCustomQueueNum] = useState('');
  const [editingQueueForId, setEditingQueueForId] = useState(null);
  const [editQueueNum, setEditQueueNum] = useState('');
  const [savingQueueNum, setSavingQueueNum] = useState(false);

  // Book appointment over phone: doctor availability + set date/time
  const [bookPatientSearch, setBookPatientSearch] = useState('');
  const [bookPatientResults, setBookPatientResults] = useState([]);
  const [bookSelectedPatient, setBookSelectedPatient] = useState(null);
  const [bookNewName, setBookNewName] = useState('');
  const [bookNewPhone, setBookNewPhone] = useState('');
  const [bookDoctorId, setBookDoctorId] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const maxBookDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  })();
  const [bookDate, setBookDate] = useState(todayStr);
  const [bookSlots, setBookSlots] = useState([]);
  const [bookSlotsLoading, setBookSlotsLoading] = useState(false);
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(null);

  const [affectedByLeave, setAffectedByLeave] = useState([]);
  const [affectedLoading, setAffectedLoading] = useState(false);
  const [reassigningId, setReassigningId] = useState(null);
  const [reassignAppointment, setReassignAppointment] = useState(null);
  const [reassignDoctorId, setReassignDoctorId] = useState('');
  const [reassignSlot, setReassignSlot] = useState('');
  const [reassignSlots, setReassignSlots] = useState([]);

  const [collectionByDoctor, setCollectionByDoctor] = useState([]);
  const [collectionLoading, setCollectionLoading] = useState(false);

  const loadAppointments = async () => {
    if (!clinicId) return;
    setLoading(true);
    setError('');
    try {
      const list = await getTodayAppointmentsForReception(clinicId);
      setAppointments(list);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [clinicId]);

  useEffect(() => {
    if (!clinicId) return;
    getClinicDoctorsWithSettings(clinicId).then((list) => setDoctors(list)).catch(() => setDoctors([]));
  }, [clinicId]);

  useEffect(() => {
    if (!clinicId || !patientSearch.trim() || patientSearch.length < 2) {
      setPatientResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchPatients(patientSearch.trim(), clinicId).then(setPatientResults).catch(() => setPatientResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [patientSearch, clinicId]);

  // Book-over-phone: load doctor availability when doctor + date selected
  useEffect(() => {
    if (!bookDoctorId || !bookDate) {
      setBookSlots([]);
      return;
    }
    setBookSlotsLoading(true);
    getAvailableSlots(bookDoctorId, bookDate)
      .then((data) => setBookSlots(data || []))
      .catch((err) => {
        console.error('getAvailableSlots failed:', err);
        setBookSlots([]);
      })
      .finally(() => setBookSlotsLoading(false));
  }, [bookDoctorId, bookDate]);

  // For today: hide past slots and those within 1 hour; future dates show all
  const displaySlots = useMemo(
    () => filterSlotsForToday(bookSlots, bookDate),
    [bookSlots, bookDate]
  );
  const isToday = bookDate === todayStr;
  const noSlotsLeftForToday = isToday && bookSlots.length > 0 && displaySlots.length === 0;

  useEffect(() => {
    if (!clinicId || !bookPatientSearch.trim() || bookPatientSearch.length < 2) {
      setBookPatientResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchPatients(bookPatientSearch.trim(), clinicId).then(setBookPatientResults).catch(() => setBookPatientResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [bookPatientSearch, clinicId]);

  useEffect(() => {
    if (!clinicId) return;
    setAffectedLoading(true);
    getAppointmentsAffectedByDoctorLeave(clinicId).then(setAffectedByLeave).catch(() => setAffectedByLeave([])).finally(() => setAffectedLoading(false));
  }, [clinicId, appointments]);

  useEffect(() => {
    if (!clinicId) return;
    setCollectionLoading(true);
    getTodayCollectionByDoctor(clinicId).then(setCollectionByDoctor).catch(() => setCollectionByDoctor([])).finally(() => setCollectionLoading(false));
  }, [clinicId, appointments]);

  useEffect(() => {
    if (!reassignAppointment || !reassignDoctorId) {
      setReassignSlots([]);
      return;
    }
    getAvailableSlots(reassignDoctorId, reassignAppointment.appointment_date)
      .then((s) => setReassignSlots(s || []))
      .catch((err) => {
        console.error('getAvailableSlots (reassign) failed:', err);
        setReassignSlots([]);
      });
  }, [reassignAppointment?.id, reassignAppointment?.appointment_date, reassignDoctorId]);

  const handleReassign = async () => {
    if (!clinicId || !reassignAppointment || !reassignDoctorId) return;
    const newSlot = reassignSlot || reassignAppointment.time_slot;
    setReassigningId(reassignAppointment.id);
    setError('');
    try {
      await updateAppointmentDoctor(reassignAppointment.id, clinicId, { doctor_id: reassignDoctorId, time_slot: newSlot });
      setReassignAppointment(null);
      setReassignDoctorId('');
      setReassignSlot('');
      setReassignSlots([]);
      setAffectedByLeave((prev) => prev.filter((a) => a.id !== reassignAppointment.id));
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Reassign failed');
    } finally {
      setReassigningId(null);
    }
  };

  const openReassign = (apt) => {
    setReassignAppointment(apt);
    setReassignDoctorId('');
    setReassignSlot('');
    setReassignSlots([]);
  };

  const handleBookAppointment = async (timeSlot) => {
    if (!clinicId || !bookDoctorId) return;
    let patientId = bookSelectedPatient?.id;
    if (!patientId) {
      if (!bookNewName.trim() || !bookNewPhone.trim()) {
        setError('Select an existing patient or enter name and phone for new patient.');
        return;
      }
      const newPatient = await createPatient({
        clinic_id: clinicId,
        full_name: bookNewName.trim(),
        phone: bookNewPhone.trim(),
        created_by: profile?.id,
      });
      patientId = newPatient.id;
    }
    setBookSubmitting(true);
    setError('');
    try {
      const slotStr = typeof timeSlot === 'string' ? timeSlot : `${String(timeSlot).padStart(2, '0')}:00:00`;
      const normalized = slotStr.length >= 8 ? slotStr : slotStr.length >= 5 ? `${slotStr}:00`.slice(0, 8) : `${slotStr.slice(0, 2)}:${slotStr.slice(2, 4)}:00`;
      const apt = await createAppointment({
        clinic_id: clinicId,
        patient_id: patientId,
        doctor_id: bookDoctorId,
        appointment_date: bookDate,
        time_slot: normalized,
        status: 'scheduled',
        created_by: profile?.id,
      });
      const doctorName = doctors.find((d) => d.id === bookDoctorId)?.full_name || 'Doctor';
      const patientName = bookSelectedPatient?.full_name || bookNewName.trim();
      let tokenNumber = null;
      if (bookDate === todayStr) {
        const updated = await checkInAppointment(apt.id, clinicId);
        tokenNumber = updated.token_number;
      }
      setBookSuccess({ date: bookDate, time: formatTime(normalized), doctorName, patientName, tokenNumber });
      setBookSelectedPatient(null);
      setBookPatientSearch('');
      setBookNewName('');
      setBookNewPhone('');
      setBookSlots([]);
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setBookSubmitting(false);
    }
  };

  const handleCheckIn = async (appointmentId, preferredQueueNum) => {
    if (!clinicId) return;
    setCheckingInId(appointmentId);
    setError('');
    try {
      const token = preferredQueueNum ? parseInt(String(preferredQueueNum).trim(), 10) : undefined;
      const updated = await checkInAppointment(appointmentId, clinicId, token);
      setCheckedInResult({
        token_number: updated.token_number,
        patient_name: appointments.find((a) => a.id === appointmentId)?.patient?.full_name || 'Patient',
        doctor_name: appointments.find((a) => a.id === appointmentId)?.doctor?.full_name || 'Doctor',
      });
      setCustomQueueNum('');
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setCheckingInId(null);
    }
  };

  const handleSetQueueNumber = async (appointmentId) => {
    if (!clinicId || !editQueueNum.trim()) return;
    setSavingQueueNum(true);
    setError('');
    try {
      await setAppointmentQueueNumber(appointmentId, clinicId, editQueueNum.trim());
      setEditingQueueForId(null);
      setEditQueueNum('');
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to set queue number');
    } finally {
      setSavingQueueNum(false);
    }
  };

  const handleWalkInSubmit = async (e) => {
        e.preventDefault();
    if (!clinicId) return;
    const doctorId = walkInDoctorId || doctors[0]?.id;
    if (!doctorId) {
      setError('Select a doctor.');
      return;
    }
    let patientId = selectedPatient?.id;
    if (!patientId) {
      if (!walkInName.trim() || !walkInPhone.trim()) {
        setError('Enter patient name and phone for new patient.');
        return;
      }
      const newPatient = await createPatient({
        clinic_id: clinicId,
        full_name: walkInName.trim(),
        phone: walkInPhone.trim(),
        created_by: profile?.id,
      });
      patientId = newPatient.id;
    }
    setWalkInSubmitting(true);
    setError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      const slots = await getAvailableSlots(doctorId, today);
      const firstSlot = (slots || []).find((s) => s.is_available);
      const timeSlot = firstSlot?.time_slot || '09:00:00';
      const apt = await createAppointment({
        clinic_id: clinicId,
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: today,
        time_slot: timeSlot,
        status: 'scheduled',
        created_by: profile?.id,
      });
      const updated = await checkInAppointment(apt.id, clinicId);
      setCheckedInResult({
        token_number: updated.token_number,
        patient_name: selectedPatient?.full_name || walkInName.trim(),
        doctor_name: doctors.find((d) => d.id === doctorId)?.full_name || 'Doctor',
      });
      setSelectedPatient(null);
      setPatientSearch('');
      setWalkInName('');
      setWalkInPhone('');
      setWalkInDoctorId('');
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Walk-in check-in failed');
    } finally {
      setWalkInSubmitting(false);
    }
  };

  if (checkedInResult) {
        return (
      <div className="max-w-lg mx-auto mt-8 px-4">
        <Card className="text-center p-8 shadow-xl border-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-500" />
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Check-in complete</h2>
          <p className="text-gray-500 mb-6">Patient added to the waiting queue.</p>
          <div className="bg-gray-50 rounded-2xl p-8 mb-6 text-center border border-gray-100 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Queue number
                        </div>
            <p className="text-5xl font-black text-teal-600 tracking-tighter">{checkedInResult.token_number}</p>
            <p className="mt-3 text-sm text-gray-600">{checkedInResult.patient_name}</p>
            <p className="flex items-center justify-center text-sm text-gray-500 mt-1">
                            <Stethoscope className="w-4 h-4 mr-2 text-teal-500" />
              {checkedInResult.doctor_name}
            </p>
                        </div>
          <Button variant="primary" fullWidth size="lg" onClick={() => setCheckedInResult(null)}>
            Check in another patient
          </Button>
                </Card>
            </div>
        );
    }

    return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Check in patient</h1>
        <p className="text-sm text-gray-500 mt-1">Today’s appointments — check in to assign queue number. Or add a walk-in.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Today's collection by doctor: how much to take from each doctor */}
      <Card title="Today's collection by doctor" className="overflow-hidden">
        <p className="text-sm text-gray-500 mb-4">Consultation fee per doctor and amount to collect from their completed patients today.</p>
        {collectionLoading ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" /></div>
        ) : collectionByDoctor.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No doctors or no completed appointments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 font-medium">
                  <th className="pb-2 pr-4">Doctor</th>
                  <th className="pb-2 pr-4">Fee (₹)</th>
                  <th className="pb-2 pr-4">Completed today</th>
                  <th className="pb-2">Amount to collect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {collectionByDoctor.map((row) => (
                  <tr key={row.doctor_id}>
                    <td className="py-2 pr-4 font-medium">{row.doctor_name}</td>
                    <td className="py-2 pr-4">{row.consultation_fee}</td>
                    <td className="py-2 pr-4">{row.completed_today}</td>
                    <td className="py-2 font-semibold text-teal-700">₹{row.total_to_collect || row.expected_from_fee || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Affected by doctor leave: reassign to another doctor */}
      <Card title="Affected by doctor leave" className="overflow-hidden">
        <p className="text-sm text-gray-500 mb-4">Appointments on days when the doctor is on leave. Reassign to another doctor (and time if needed).</p>
        {affectedLoading ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" /></div>
        ) : affectedByLeave.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No appointments affected by doctor leave.</p>
        ) : (
          <div className="space-y-4">
            {affectedByLeave.map((apt) => (
              <div key={apt.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-wrap items-center gap-4">
                <div>
                  <p className="font-medium text-gray-900">{apt.patient?.full_name || 'Patient'}</p>
                  <p className="text-sm text-gray-600">{apt.appointment_date} at {formatTime(apt.time_slot)} — {apt.doctor?.full_name} (on leave)</p>
                </div>
                {reassignAppointment?.id === apt.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={reassignDoctorId}
                      onChange={(e) => setReassignDoctorId(e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                    >
                      <option value="">Select doctor</option>
                      {doctors.filter((d) => d.id !== apt.doctor_id).map((d) => (
                        <option key={d.id} value={d.id}>{d.full_name}</option>
                      ))}
                    </select>
                    {reassignSlots.length > 0 && (
                      <select
                        value={reassignSlot}
                        onChange={(e) => setReassignSlot(e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                      >
                        <option value="">Same time / pick slot</option>
                        {reassignSlots.filter((s) => s.is_available).map((s, i) => (
                          <option key={i} value={s.time_slot}>{formatTime(s.time_slot)}</option>
                        ))}
                      </select>
                    )}
                    <Button size="sm" variant="primary" onClick={handleReassign} disabled={reassigningId === apt.id || !reassignDoctorId}>
                      {reassigningId === apt.id ? 'Reassigning…' : 'Reassign'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReassignAppointment(null); setReassignDoctorId(''); setReassignSlot(''); setReassignSlots([]); }}>Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => openReassign(apt)}>Reassign to another doctor</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Book appointment over phone: see doctor availability, set date & time */}
      <Card title="Book appointment (over phone)" className="overflow-hidden">
        <p className="text-sm text-gray-500 mb-4">See doctor availability and set date & time. Booked for <strong>today</strong> are auto-added to the queue with a number. Future dates get a queue number when you check them in on the day.</p>
        {bookSuccess ? (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-900">Appointment booked</p>
            <p className="text-sm text-green-800 mt-1">{bookSuccess.patientName} — {bookSuccess.date} at {bookSuccess.time} with {bookSuccess.doctorName}</p>
            {bookSuccess.tokenNumber != null ? (
              <p className="text-sm text-green-800 mt-2 font-medium">Auto-added to today’s queue as <span className="font-bold">#{bookSuccess.tokenNumber}</span></p>
            ) : (
              <p className="text-xs text-green-700 mt-2">On the day, check them in from Today’s appointments to add to queue.</p>
            )}
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setBookSuccess(null)}>Book another</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient (search or new)</label>
              <input
                type="text"
                placeholder="Search by name or phone…"
                value={bookPatientSearch}
                onChange={(e) => { setBookPatientSearch(e.target.value); if (!e.target.value) setBookSelectedPatient(null); }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              {bookPatientResults.length > 0 && !bookSelectedPatient && (
                <ul className="mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-40 overflow-auto">
                  {bookPatientResults.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => {
                          setBookSelectedPatient(p);
                          setBookPatientSearch(`${p.full_name} (${p.phone || '—'})`);
                          setBookPatientResults([]);
                        }}
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        {p.full_name} — {p.phone || 'No phone'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {bookSelectedPatient && (
                <p className="mt-2 text-sm text-teal-700">
                  Using: <strong>{bookSelectedPatient.full_name}</strong>
                  <button type="button" className="ml-2 text-gray-500 underline" onClick={() => { setBookSelectedPatient(null); setBookPatientSearch(''); }}>Change</button>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">Or new patient:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <Input placeholder="Full name" value={bookNewName} onChange={(e) => setBookNewName(e.target.value)} disabled={!!bookSelectedPatient} />
                <Input placeholder="Phone" value={bookNewPhone} onChange={(e) => setBookNewPhone(e.target.value)} disabled={!!bookSelectedPatient} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  value={bookDoctorId}
                  onChange={(e) => setBookDoctorId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.full_name} {d.specialization ? `(${d.specialization})` : ''}{d.role === 'clinic_admin' ? ' — Clinic Admin' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date (up to 7 days ahead)</label>
                <input
                  type="date"
                  min={todayStr}
                  max={maxBookDate}
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
                    </div>
                    <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available times</label>
              {!bookDoctorId || !bookDate ? (
                <p className="text-sm text-gray-500">Select doctor and date to see availability.</p>
              ) : bookSlotsLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500"><div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-500 border-t-transparent" /> Loading slots…</div>
              ) : noSlotsLeftForToday ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No bookable slots left for today (next slot would be within 1 hour). Patient can walk in and join the queue directly.
                </p>
              ) : bookSlots.length === 0 ? (
                <p className="text-sm text-gray-500">No slots available for this doctor on this date.</p>
              ) : displaySlots.length === 0 ? (
                <p className="text-sm text-gray-500">No slots available for this doctor on this date.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {displaySlots.map((slot, i) => {
                    const available = slot.is_available;
                    const timeStr = typeof slot.time_slot === 'string' ? slot.time_slot : slot.time_slot;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={!available || bookSubmitting}
                        onClick={() => available && handleBookAppointment(timeStr)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${available ? 'bg-teal-100 text-teal-800 hover:bg-teal-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        {formatTime(timeStr)}{!available ? ' (booked)' : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card title="Today’s appointments" className="overflow-hidden">
        <p className="text-sm text-gray-500 mb-4">Booked patients (auto in queue if booked for today). Check in to add to queue or set queue #. You can change any patient’s queue number.</p>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments for today. Use the form below for walk-in check-in.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 text-sm font-medium">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Doctor</th>
                  <th className="pb-3 pr-4">Queue</th>
                  <th className="pb-3 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="align-middle">
                    <td className="py-3 pr-4">
                      <span className="flex items-center text-gray-900 font-medium">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {formatTime(apt.time_slot)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{apt.patient?.full_name || '—'}</td>
                    <td className="py-3 pr-4 text-gray-600">{apt.doctor?.full_name || '—'}</td>
                    <td className="py-3 pr-4">
                      {apt.token_number != null ? (
                        editingQueueForId === apt.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              value={editQueueNum}
                              onChange={(e) => setEditQueueNum(e.target.value)}
                              className="w-16 rounded border border-gray-200 px-2 py-1 text-sm"
                              placeholder="#"
                            />
                            <Button size="sm" variant="primary" onClick={() => handleSetQueueNumber(apt.id)} disabled={savingQueueNum}>Save</Button>
                            <button type="button" className="text-xs text-gray-500 underline" onClick={() => { setEditingQueueForId(null); setEditQueueNum(''); }}>Cancel</button>
                            </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold bg-teal-100 text-teal-800">
                            #{apt.token_number}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      {apt.token_number == null ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            placeholder="Queue #"
                            value={customQueueNum}
                            onChange={(e) => setCustomQueueNum(e.target.value)}
                            className="w-20 rounded border border-gray-200 px-2 py-1 text-sm"
                            title="Optional: set specific queue number"
                          />
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleCheckIn(apt.id, customQueueNum || undefined)}
                            disabled={checkingInId === apt.id}
                          >
                            {checkingInId === apt.id ? 'Checking in…' : 'Check in'}
                          </Button>
                        </div>
                      ) : editingQueueForId !== apt.id ? (
                        <Button size="sm" variant="ghost" onClick={() => { setEditingQueueForId(apt.id); setEditQueueNum(String(apt.token_number)); }}>Change #</Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                    </div>
        )}
      </Card>

      <Card title="Walk-in / instant check-in">
        <p className="text-sm text-gray-500 mb-4">Walk-ins are <strong>manually</strong> added to the queue: use this form when the patient is present. Create & check in to add them and assign a queue number (or set a specific #).</p>
        <form onSubmit={handleWalkInSubmit} className="space-y-4">
                        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient (search or new)</label>
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                if (!e.target.value) setSelectedPatient(null);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            {patientResults.length > 0 && !selectedPatient && (
              <ul className="mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-40 overflow-auto">
                {patientResults.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientSearch(`${p.full_name} (${p.phone || '—'})`);
                        setPatientResults([]);
                      }}
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      {p.full_name} — {p.phone || 'No phone'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedPatient && (
              <p className="mt-2 text-sm text-teal-700">
                Using: <strong>{selectedPatient.full_name}</strong>
                <button type="button" className="ml-2 text-gray-500 underline" onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}>
                  Change
                </button>
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Or enter new patient below:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <Input
                placeholder="Full name"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                disabled={!!selectedPatient}
              />
              <Input
                placeholder="Phone"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                disabled={!!selectedPatient}
              />
                        </div>
                    </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              value={walkInDoctorId}
              onChange={(e) => setWalkInDoctorId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              required
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.full_name} {d.specialization ? `(${d.specialization})` : ''}{d.role === 'clinic_admin' ? ' — Clinic Admin' : ''}</option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary" disabled={walkInSubmitting}>
            {walkInSubmitting ? 'Creating & checking in…' : 'Create & check in (queue number will show)'}
                        </Button>
                </form>
            </Card>
        </div>
    );
};

export default CheckInPatient;
