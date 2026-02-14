/**
 * Database utility functions for common queries
 * These functions handle the Supabase queries and error handling
 */

import { supabase } from '../lib/supabase';
import { createAuditLog } from './auth';

// ============================================================================
// CLINIC OPERATIONS
// ============================================================================

export const getAllClinics = async () => {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getClinicById = async (clinicId) => {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();

  if (error) throw error;
  return data;
};

export const createClinic = async (clinicData) => {
  const { data, error } = await supabase
    .from('clinics')
    .insert(clinicData)
    .select()
    .single();

  if (error) throw error;

  await createAuditLog('create_clinic', 'clinic', data.id, null, clinicData);
  return data;
};

export const updateClinic = async (clinicId, updates) => {
  const { data: oldData } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();

  const { data, error } = await supabase
    .from('clinics')
    .update(updates)
    .eq('id', clinicId)
    .select()
    .single();

  if (error) throw error;

  await createAuditLog('update_clinic', 'clinic', clinicId, oldData, updates);
  return data;
};

export const suspendClinic = async (clinicId) => {
  const { data, error } = await supabase.rpc('suspend_clinic', {
    p_clinic_id: clinicId,
  });

  if (error) throw error;
  return data;
};

export const reactivateClinic = async (clinicId) => {
  const { data, error } = await supabase.rpc('reactivate_clinic', {
    p_clinic_id: clinicId,
  });

  if (error) throw error;
  return data;
};

// ============================================================================
// CLINIC SCHEDULES (operating hours & holidays)
// ============================================================================

export const getClinicSchedules = async (clinicId) => {
  const { data, error } = await supabase
    .from('clinic_schedules')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('day_of_week', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const upsertClinicSchedules = async (clinicId, schedules) => {
  const rows = schedules.map(({ day_of_week, is_closed, start_time, end_time }) => ({
    clinic_id: clinicId,
    day_of_week,
    is_closed: !!is_closed,
    start_time: start_time || '09:00',
    end_time: end_time || '18:00',
  }));

  const { data, error } = await supabase
    .from('clinic_schedules')
    .upsert(rows, { onConflict: 'clinic_id,day_of_week', ignoreDuplicates: false })
    .select();

  if (error) throw error;
  return data;
};

export const getClinicHolidays = async (clinicId) => {
  const { data, error } = await supabase
    .from('clinic_holidays')
    .select('*')
    .eq('clinic_id', clinicId)
    .gte('date', new Date().toISOString().slice(0, 10))
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addClinicHoliday = async (clinicId, date, reason) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('clinic_holidays')
    .insert({ clinic_id: clinicId, date, reason: reason || null, created_by: user?.id })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeClinicHoliday = async (holidayId) => {
  const { error } = await supabase
    .from('clinic_holidays')
    .delete()
    .eq('id', holidayId);

  if (error) throw error;
};

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const getClinicUsers = async (clinicId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createUser = async (userData) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('You must be logged in to create a user.');
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: userData,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) throw error;
  return data;
};

export const suspendUser = async (userId) => {
  const { data, error } = await supabase.rpc('suspend_user', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
};

export const reactivateUser = async (userId) => {
  const { data, error } = await supabase.rpc('reactivate_user', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
};

export const resetUserPassword = async (userId) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('You must be logged in to reset a password.');
  const { data, error } = await supabase.functions.invoke('reset-user-password', {
    body: { user_id: userId },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (error) throw error;
  if (data?.success === false) throw new Error(data?.error || 'Reset failed');
  return data;
};

// ============================================================================
// PATIENT OPERATIONS
// ============================================================================

export const getAllPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPatientById = async (patientId) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error) throw error;
  return data;
};

export const searchPatients = async (searchTerm, clinicId = null) => {
  let q = supabase
    .from('patients')
    .select('*')
    .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,patient_id_number.ilike.%${searchTerm}%`)
    .limit(20);
  if (clinicId) q = q.eq('clinic_id', clinicId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
};

export const createPatient = async (patientData) => {
  const { data, error } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single();

  if (error) throw error;

  await createAuditLog('create_patient', 'patient', data.id, null, patientData);
  return data;
};

export const updatePatient = async (patientId, updates) => {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', patientId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPatientHistory = async (patientId) => {
  const { data, error } = await supabase.rpc('get_patient_history', {
    p_patient_id: patientId,
  });

  if (error) throw error;
  return data[0]; // Function returns array with single object
};

// ============================================================================
// APPOINTMENT OPERATIONS
// ============================================================================

export const getTodayAppointments = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(*),
      doctor:users!appointments_doctor_id_fkey(*)
    `)
    .eq('doctor_id', doctorId)
    .eq('appointment_date', today)
    .order('time_slot');

  if (error) throw error;
  return data;
};

export const getAppointmentsByDate = async (doctorId, date) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(*),
      doctor:users!appointments_doctor_id_fkey(*)
    `)
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .order('time_slot');

  if (error) throw error;
  return data;
};

export const getAvailableSlots = async (doctorId, date) => {
  // Ensure YYYY-MM-DD so Postgres DATE is unambiguous
  const dateStr = date && date.includes('-') ? date.slice(0, 10) : null;
  if (!dateStr) return [];
  const { data, error } = await supabase.rpc('get_available_slots', {
    p_doctor_id: doctorId,
    p_date: dateStr,
  });

  if (error) throw error;
  return data ?? [];
};

export const createAppointment = async (appointmentData) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single();

  if (error) throw error;

  await createAuditLog('create_appointment', 'appointment', data.id, null, appointmentData);
  return data;
};

export const updateAppointmentStatus = async (appointmentId, status, notes = null) => {
  const updates = {
    status,
    ...(status === 'completed' && { completed_at: new Date().toISOString() }),
    ...(notes && { notes }),
  };

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/** Reassign appointment to another doctor (and optionally new time slot). Used when doctor is on leave. */
export const updateAppointmentDoctor = async (appointmentId, clinicId, { doctor_id, time_slot }) => {
  const updates = { updated_at: new Date().toISOString(), ...(doctor_id && { doctor_id }), ...(time_slot && { time_slot }) };
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .eq('clinic_id', clinicId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Appointments (today and future, up to 7 days) where the doctor is on leave. Reception can reassign to another doctor. */
export const getAppointmentsAffectedByDoctorLeave = async (clinicId) => {
  const today = new Date().toISOString().split('T')[0];
  const future = new Date();
  future.setDate(future.getDate() + 7);
  const endDate = future.toISOString().split('T')[0];
  const [{ data: holidays }, { data: appointments }] = await Promise.all([
    supabase.from('doctor_holidays').select('doctor_id, date').eq('clinic_id', clinicId).gte('date', today).lte('date', endDate),
    supabase.from('appointments').select(`
      id, appointment_date, time_slot, status,
      patient:patients(id, full_name, phone),
      doctor:users!appointments_doctor_id_fkey(id, full_name, specialization)
    `).eq('clinic_id', clinicId).gte('appointment_date', today).lte('appointment_date', endDate).neq('status', 'cancelled'),
  ]);
  const leaveSet = new Set((holidays || []).map((h) => `${h.doctor_id}|${h.date}`));
  return (appointments || []).filter((a) => leaveSet.has(`${a.doctor_id}|${a.appointment_date}`));
};

/** Create invoice (billing) after patient is done. Uses doctor's consultation fee. */
export const createBillingForCompletedAppointment = async (appointmentId) => {
  const { data: apt, error: aptErr } = await supabase
    .from('appointments')
    .select('id, clinic_id, patient_id, doctor_id')
    .eq('id', appointmentId)
    .single();
  if (aptErr || !apt) throw new Error('Appointment not found');
  const consultationFee = await getDoctorConsultationFee(apt.doctor_id);
  const billingData = {
    clinic_id: apt.clinic_id,
    patient_id: apt.patient_id,
    appointment_id: apt.id,
    consultation_fee: consultationFee,
    medication_charges: 0,
    discount: 0,
    total_amount: consultationFee,
    payment_mode: 'cash',
    status: 'pending',
  };
  return createBilling(billingData);
};

/** Today's collection by doctor: fee per doctor and total to collect. For receptionist. */
export const getTodayCollectionByDoctor = async (clinicId) => {
  const today = new Date().toISOString().split('T')[0];
  const nextDay = new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0];
  const [doctorsWithFee, completedApts, billings] = await Promise.all([
    getClinicDoctorsWithSettings(clinicId),
    supabase.from('appointments').select('id, doctor_id').eq('clinic_id', clinicId).eq('appointment_date', today).eq('status', 'completed'),
    supabase.from('billing').select('appointment_id, total_amount, status').eq('clinic_id', clinicId).gte('created_at', today + 'T00:00:00Z').lt('created_at', nextDay + 'T00:00:00Z'),
  ]);
  const aptIds = (completedApts.data || []).map((a) => a.id);
  const byAppointment = (billings.data || []).reduce((acc, b) => {
    if (b.appointment_id) acc[b.appointment_id] = (acc[b.appointment_id] || 0) + Number(b.total_amount || 0);
    return acc;
  }, {});
  const byDoctor = {};
  (completedApts.data || []).forEach((a) => {
    const did = a.doctor_id;
    if (!byDoctor[did]) byDoctor[did] = { count: 0, total: 0 };
    byDoctor[did].count += 1;
    byDoctor[did].total += byAppointment[a.id] ?? 0;
  });
  return (doctorsWithFee || []).map((d) => {
    const count = byDoctor[d.id]?.count ?? 0;
    const fee = Number(d.consultation_fee || 0);
    return {
      doctor_id: d.id,
      doctor_name: d.full_name,
      consultation_fee: fee,
      completed_today: count,
      total_to_collect: byDoctor[d.id]?.total ?? 0,
      expected_from_fee: count * fee,
    };
  });
};

/** Today's appointments for reception: list with patient, doctor, time, token. Excludes cancelled. */
export const getTodayAppointmentsForReception = async (clinicId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, appointment_date, time_slot, token_number, status,
      patient:patients(id, full_name, phone),
      doctor:users!appointments_doctor_id_fkey(id, full_name, specialization)
    `)
    .eq('clinic_id', clinicId)
    .eq('appointment_date', today)
    .neq('status', 'cancelled')
    .order('time_slot');
  if (error) throw error;
  return data || [];
};

/** Next token number for today. Per doctor: pass doctorId so each doctor has their own queue (1, 2, 3…). */
export const getNextTokenForToday = async (clinicId, doctorId) => {
  const today = new Date().toISOString().split('T')[0];
  let q = supabase
    .from('appointments')
    .select('token_number')
    .eq('clinic_id', clinicId)
    .eq('appointment_date', today)
    .not('token_number', 'is', null);
  if (doctorId) q = q.eq('doctor_id', doctorId);
  const { data, error } = await q;
  if (error) throw error;
  const max = (data || []).reduce((m, r) => Math.max(m, r.token_number || 0), 0);
  return max + 1;
};

/** Assign queue token to an appointment (check-in). Token is per doctor. Use next for that doctor unless preferredToken provided. */
export const checkInAppointment = async (appointmentId, clinicId, preferredToken = null) => {
  const { data: apt, error: aptErr } = await supabase.from('appointments').select('doctor_id').eq('id', appointmentId).single();
  if (aptErr || !apt?.doctor_id) throw new Error('Appointment not found');
  const token = preferredToken != null && preferredToken > 0 ? Number(preferredToken) : await getNextTokenForToday(clinicId, apt.doctor_id);
  const { data, error } = await supabase
    .from('appointments')
    .update({ token_number: token, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .eq('clinic_id', clinicId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Call in a patient: set to with_doctor and auto-complete any other appointment with_doctor for the same doctor (same day). */
export const callInAppointment = async (appointmentId) => {
  const { data: apt, error: aptErr } = await supabase
    .from('appointments')
    .select('id, doctor_id, clinic_id, appointment_date')
    .eq('id', appointmentId)
    .single();
  if (aptErr || !apt) throw new Error('Appointment not found');
  const today = apt.appointment_date;
  const { data: others } = await supabase
    .from('appointments')
    .select('id')
    .eq('clinic_id', apt.clinic_id)
    .eq('doctor_id', apt.doctor_id)
    .eq('appointment_date', today)
    .eq('status', 'with_doctor')
    .neq('id', appointmentId);
  for (const row of others || []) {
    await updateAppointmentStatus(row.id, 'completed');
    try { await createBillingForCompletedAppointment(row.id); } catch (_) {}
  }
  await updateAppointmentStatus(appointmentId, 'with_doctor');
  const { data: updated } = await supabase.from('appointments').select('*').eq('id', appointmentId).single();
  return updated;
};

/** Receptionist sets a specific queue number for an appointment (today). */
export const setAppointmentQueueNumber = async (appointmentId, clinicId, tokenNumber) => {
  const num = Math.max(1, Math.floor(Number(tokenNumber)));
  const { data, error } = await supabase
    .from('appointments')
    .update({ token_number: num, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .eq('clinic_id', clinicId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ============================================================================
// PRESCRIPTION OPERATIONS
// ============================================================================

export const getPatientPrescriptions = async (patientId) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:users!prescriptions_doctor_id_fkey(full_name, specialization)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPrescription = async (prescriptionData) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert(prescriptionData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================================================
// BILLING OPERATIONS
// ============================================================================
// When creating billing/invoice for an appointment, set consultation_fee from the doctor's
// fee (set by clinic admin): use getDoctorConsultationFee(appointment.doctor_id).

export const createBilling = async (billingData) => {
  const { data, error } = await supabase
    .from('billing')
    .insert(billingData)
    .select()
    .single();

  if (error) throw error;

  await createAuditLog('create_billing', 'billing', data.id, null, billingData);
  return data;
};

export const updateBillingStatus = async (billingId, status, paidAt = null) => {
  const updates = {
    status,
    ...(paidAt && { paid_at: paidAt }),
  };

  const { data, error } = await supabase
    .from('billing')
    .update(updates)
    .eq('id', billingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const sendBillingMessage = async (billingId) => {
  const { data, error } = await supabase.functions.invoke('send-billing-message', {
    body: { billing_id: billingId },
  });

  if (error) throw error;
  return data;
};

export const getClinicRevenue = async (clinicId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('billing')
    .select('id, invoice_number, total_amount, payment_mode, created_at, status')
    .eq('clinic_id', clinicId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'paid');

  if (error) throw error;
  return data;
};

// ============================================================================
// DOCTOR SCHEDULE OPERATIONS
// ============================================================================

export const getDoctorSchedule = async (doctorId) => {
  const { data, error } = await supabase
    .from('doctor_schedules')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('is_active', true)
    .order('day_of_week');

  if (error) throw error;
  return data;
};

export const createDoctorSchedule = async (scheduleData) => {
  const { data, error } = await supabase
    .from('doctor_schedules')
    .insert(scheduleData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDoctorSchedule = async (scheduleId, updates) => {
  const { data, error } = await supabase
    .from('doctor_schedules')
    .update(updates)
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDoctorSchedule = async (scheduleId) => {
  const { error } = await supabase
    .from('doctor_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) throw error;
};

export const getDoctorSchedulesForEditor = async (doctorId) => {
  const { data, error } = await supabase
    .from('doctor_schedules')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('day_of_week');

  if (error) throw error;
  return data || [];
};

export const upsertDoctorSchedules = async (doctorId, clinicId, schedules) => {
  await supabase.from('doctor_schedules').delete().eq('doctor_id', doctorId);
  if (schedules.length) {
    const rows = schedules.map((row) => ({
      doctor_id: doctorId,
      clinic_id: clinicId,
      day_of_week: row.day_of_week,
      start_time: row.start_time || '09:00',
      end_time: row.end_time || '18:00',
      is_active: row.is_active !== false,
      slot_duration_minutes: row.slot_duration_minutes ?? 30,
    }));
    const { error } = await supabase.from('doctor_schedules').insert(rows);
    if (error) throw error;
  }
  return getDoctorSchedulesForEditor(doctorId);
};

export const getDoctorSettings = async (doctorId) => {
  const { data, error } = await supabase
    .from('doctor_settings')
    .select('*')
    .eq('doctor_id', doctorId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/** Consultation fee for a doctor at a clinic (set by clinic admin). Use when creating billing/invoice. */
export const getDoctorConsultationFee = async (doctorId) => {
  const settings = await getDoctorSettings(doctorId);
  return settings?.consultation_fee != null ? Number(settings.consultation_fee) : 0;
};

/** List doctors in a clinic with their settings (including consultation_fee). Includes role=doctor and clinic_admin who is also doctor (is_also_doctor). */
export const getClinicDoctorsWithSettings = async (clinicId) => {
  const [doctorsRes, adminDoctorsRes] = await Promise.all([
    supabase.from('users').select('id, full_name, email, specialization, role').eq('clinic_id', clinicId).eq('role', 'doctor').eq('status', 'active').order('full_name'),
    supabase.from('users').select('id, full_name, email, specialization, role').eq('clinic_id', clinicId).eq('role', 'clinic_admin').eq('is_also_doctor', true).eq('status', 'active').order('full_name'),
  ]);
  if (doctorsRes.error) throw doctorsRes.error;
  if (adminDoctorsRes.error) throw adminDoctorsRes.error;
  const users = [...(doctorsRes.data || []), ...(adminDoctorsRes.data || [])].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  if (!users.length) return [];
  const { data: settingsList, error: setError } = await supabase
    .from('doctor_settings')
    .select('doctor_id, consultation_fee, default_appointment_duration, allow_custom_duration')
    .eq('clinic_id', clinicId)
    .in('doctor_id', users.map((u) => u.id));
  if (setError) throw setError;
  const byDoctor = (settingsList || []).reduce((acc, s) => {
    acc[s.doctor_id] = s;
    return acc;
  }, {});
  return users.map((u) => ({
    ...u,
    consultation_fee: byDoctor[u.id]?.consultation_fee ?? 0,
    doctor_settings_id: byDoctor[u.id] ? true : false,
  }));
};

export const upsertDoctorSettings = async (doctorId, clinicId, settings) => {
  const current = await getDoctorSettings(doctorId);
  const consultationFee = settings.consultation_fee !== undefined
    ? Math.max(0, Number(settings.consultation_fee))
    : (current?.consultation_fee ?? 0);
  const { data, error } = await supabase
    .from('doctor_settings')
    .upsert({
      doctor_id: doctorId,
      clinic_id: clinicId,
      default_appointment_duration: Math.min(60, Math.max(15, settings.default_appointment_duration ?? 30)),
      allow_custom_duration: settings.allow_custom_duration !== false,
      consultation_fee: consultationFee,
    }, { onConflict: 'doctor_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/** Clinic admin sets a doctor's consultation fee. Preserves existing duration/allow_custom. */
export const setDoctorConsultationFee = async (doctorId, clinicId, fee) => {
  const current = await getDoctorSettings(doctorId);
  return upsertDoctorSettings(doctorId, clinicId, {
    default_appointment_duration: current?.default_appointment_duration ?? 30,
    allow_custom_duration: current?.allow_custom_duration !== false,
    consultation_fee: Math.max(0, Number(fee)),
  });
};

export const getDoctorHolidays = async (doctorId) => {
  const { data, error } = await supabase
    .from('doctor_holidays')
    .select('*')
    .eq('doctor_id', doctorId)
    .gte('date', new Date().toISOString().slice(0, 10))
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addDoctorHoliday = async (doctorId, clinicId, date, reason) => {
  const { data, error } = await supabase
    .from('doctor_holidays')
    .insert({ doctor_id: doctorId, clinic_id: clinicId, date, reason: reason || null })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeDoctorHoliday = async (id) => {
  const { error } = await supabase.from('doctor_holidays').delete().eq('id', id);
  if (error) throw error;
};

// Update current user's doctor profile (degree, experience) - for doctors editing their own profile
export const updateMyDoctorProfile = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Not authenticated');
  const allowed = {};
  if (updates.degree !== undefined) allowed.degree = updates.degree;
  if (updates.experience_years !== undefined) allowed.experience_years = updates.experience_years;
  if (updates.experience_since_year !== undefined) allowed.experience_since_year = updates.experience_since_year;
  if (Object.keys(allowed).length === 0) return null;
  const { data, error } = await supabase
    .from('users')
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export const getClinicDashboardStats = async (clinicId, startDate, endDate) => {
  const { data, error } = await supabase.rpc('get_clinic_dashboard_stats', {
    p_clinic_id: clinicId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data[0]; // Function returns array with single object
};

export const getDoctorDashboardStats = async (doctorId, date) => {
  const { data, error } = await supabase.rpc('get_doctor_dashboard_stats', {
    p_doctor_id: doctorId,
    p_date: date,
  });

  if (error) throw error;
  return data[0];
};

// ============================================================================
// PATIENT REPORTS
// ============================================================================

export const getPatientReports = async (patientId) => {
  const { data, error } = await supabase
    .from('patient_reports')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPatientReport = async (reportData) => {
  const { data, error } = await supabase
    .from('patient_reports')
    .insert(reportData)
    .select()
    .single();

  if (error) throw error;
  return data;
};
