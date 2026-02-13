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

export const searchPatients = async (searchTerm) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,patient_id_number.ilike.%${searchTerm}%`)
    .limit(20);

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
  const { data, error } = await supabase.rpc('get_available_slots', {
    p_doctor_id: doctorId,
    p_date: date,
  });

  if (error) throw error;
  return data;
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

export const upsertDoctorSettings = async (doctorId, clinicId, settings) => {
  const { data, error } = await supabase
    .from('doctor_settings')
    .upsert({
      doctor_id: doctorId,
      clinic_id: clinicId,
      default_appointment_duration: Math.min(60, Math.max(15, settings.default_appointment_duration ?? 30)),
      allow_custom_duration: settings.allow_custom_duration !== false,
    }, { onConflict: 'doctor_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
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
