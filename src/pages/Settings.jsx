import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Save, LogOut, Copy, CalendarOff, Trash2, Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import {
  getClinicSchedules,
  upsertClinicSchedules,
  getClinicHolidays,
  addClinicHoliday,
  removeClinicHoliday,
  getDoctorSchedulesForEditor,
  upsertDoctorSchedules,
  getDoctorSettings,
  upsertDoctorSettings,
  getDoctorHolidays,
  addDoctorHoliday,
  removeDoctorHoliday,
  updateMyDoctorProfile,
} from '../utils/database';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultSchedule = (dayOfWeek) => ({
  day_of_week: dayOfWeek,
  is_closed: false,
  start_time: '09:00',
  end_time: '18:00',
});

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

const Settings = () => {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState(() => DAY_NAMES.map((_, i) => defaultSchedule(i)));
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');
  const [savingHoliday, setSavingHoliday] = useState(false);

  const isClinicAdmin = profile?.role === 'clinic_admin';
  const isDoctor = profile?.role === 'doctor' || profile?.is_also_doctor;
  const clinicId = profile?.clinic_id;
  const userId = profile?.id;

  // Doctor: schedule, holidays, appointment duration
  const [doctorSchedules, setDoctorSchedules] = useState(() => DAY_NAMES.map((_, i) => ({ day_of_week: i, start_time: '09:00', end_time: '18:00', is_active: true, slot_duration_minutes: 30 })));
  const [doctorSchedulesLoaded, setDoctorSchedulesLoaded] = useState(false);
  const [doctorHolidays, setDoctorHolidays] = useState([]);
  const [doctorHolidayDate, setDoctorHolidayDate] = useState('');
  const [doctorHolidayReason, setDoctorHolidayReason] = useState('');
  const [savingDoctorHoliday, setSavingDoctorHoliday] = useState(false);
  const [doctorSettings, setDoctorSettings] = useState({ default_appointment_duration: 30, allow_custom_duration: true });
  const [doctorSettingsLoaded, setDoctorSettingsLoaded] = useState(false);
  const [savingDoctorSchedule, setSavingDoctorSchedule] = useState(false);
  const [savingDoctorSettings, setSavingDoctorSettings] = useState(false);
  const [clinicSchedules, setClinicSchedules] = useState([]);
  const [doctorScheduleError, setDoctorScheduleError] = useState('');
  const [doctorProfileEdit, setDoctorProfileEdit] = useState({ degree: '', experience_years: '', experience_since_year: '' });
  const [savingDoctorProfile, setSavingDoctorProfile] = useState(false);
  const [doctorProfileError, setDoctorProfileError] = useState('');

  useEffect(() => {
    if (!isClinicAdmin || !clinicId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getClinicSchedules(clinicId);
        if (cancelled) return;
        if (data?.length) {
          const byDay = {};
          data.forEach((row) => { byDay[row.day_of_week] = row; });
          setSchedules(
            DAY_NAMES.map((_, i) => ({
              id: byDay[i]?.id,
              day_of_week: i,
              is_closed: byDay[i]?.is_closed ?? false,
              start_time: (byDay[i]?.start_time || '09:00').slice(0, 5),
              end_time: (byDay[i]?.end_time || '18:00').slice(0, 5),
            }))
          );
        }
        setSchedulesLoaded(true);
      } catch {
        setSchedulesLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [isClinicAdmin, clinicId]);

  useEffect(() => {
    if (!isClinicAdmin || !clinicId) return;
    (async () => {
      try {
        const data = await getClinicHolidays(clinicId);
        setHolidays(data || []);
      } catch {}
    })();
  }, [isClinicAdmin, clinicId]);

  useEffect(() => {
    if (isDoctor && profile) {
      setDoctorProfileEdit({
        degree: profile.degree ?? '',
        experience_years: profile.experience_years != null ? String(profile.experience_years) : '',
        experience_since_year: profile.experience_since_year != null ? String(profile.experience_since_year) : '',
      });
    }
  }, [isDoctor, profile?.id, profile?.degree, profile?.experience_years, profile?.experience_since_year]);

  useEffect(() => {
    if (!isDoctor || !userId || !clinicId) return;
    let cancelled = false;
    setDoctorSchedulesLoaded(false);
    (async () => {
      try {
        const [schedData, settingsData, holidaysData, clinicSchedData] = await Promise.all([
          getDoctorSchedulesForEditor(userId),
          getDoctorSettings(userId),
          getDoctorHolidays(userId),
          getClinicSchedules(clinicId),
        ]);
        if (cancelled) return;
        setClinicSchedules(clinicSchedData || []);
        if (schedData?.length) {
          const byDay = {};
          schedData.forEach((row) => { byDay[row.day_of_week] = row; });
          setDoctorSchedules(
            DAY_NAMES.map((_, i) => ({
              day_of_week: i,
              start_time: (byDay[i]?.start_time || '09:00').slice(0, 5),
              end_time: (byDay[i]?.end_time || '18:00').slice(0, 5),
              is_active: byDay[i]?.is_active !== false,
              slot_duration_minutes: byDay[i]?.slot_duration_minutes ?? 30,
            }))
          );
        }
        if (settingsData) setDoctorSettings({ default_appointment_duration: settingsData.default_appointment_duration ?? 30, allow_custom_duration: settingsData.allow_custom_duration !== false });
        setDoctorHolidays(holidaysData || []);
      } catch {}
      if (!cancelled) setDoctorSchedulesLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [isDoctor, userId, clinicId]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const updateSchedule = (index, field, value) => {
    setSchedules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const copyDayToAll = (index) => {
    const source = schedules[index];
    setSchedules(
      DAY_NAMES.map((_, i) => ({
        ...schedules[i],
        is_closed: source.is_closed,
        start_time: source.start_time,
        end_time: source.end_time,
      }))
    );
  };

  const saveSchedules = async () => {
    if (!clinicId) return;
    setSaving(true);
    try {
      await upsertClinicSchedules(clinicId, schedules);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addHoliday = async (e) => {
    e.preventDefault();
    if (!clinicId || !holidayDate) return;
    setSavingHoliday(true);
    try {
      await addClinicHoliday(clinicId, holidayDate, holidayReason.trim() || null);
      setHolidays((prev) => [...prev, { date: holidayDate, reason: holidayReason.trim(), id: undefined }]);
      setHolidayDate('');
      setHolidayReason('');
      const data = await getClinicHolidays(clinicId);
      setHolidays(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingHoliday(false);
    }
  };

  const deleteHoliday = async (id) => {
    try {
      await removeClinicHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const updateDoctorSchedule = (index, field, value) => {
    setDoctorSchedules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const copyDoctorDayToAll = (index) => {
    const source = doctorSchedules[index];
    setDoctorSchedules((prev) =>
      prev.map((row, i) => ({
        ...row,
        is_active: source.is_active,
        start_time: source.start_time,
        end_time: source.end_time,
        slot_duration_minutes: source.slot_duration_minutes ?? 30,
      }))
    );
  };

  const validateDoctorScheduleWithinClinic = () => {
    const byDay = {};
    (clinicSchedules || []).forEach((row) => { byDay[row.day_of_week] = row; });
    for (let i = 0; i < doctorSchedules.length; i++) {
      const row = doctorSchedules[i];
      const clinicDay = byDay[row.day_of_week];
      if (!row.is_active) continue;
      if (clinicDay?.is_closed) {
        return { valid: false, message: `Clinic is closed on ${DAY_NAMES[row.day_of_week]}. You cannot set yourself as available.` };
      }
      const clinicStart = (clinicDay?.start_time || '09:00').slice(0, 5);
      const clinicEnd = (clinicDay?.end_time || '18:00').slice(0, 5);
      const docStart = (row.start_time || '09:00').slice(0, 5);
      const docEnd = (row.end_time || '18:00').slice(0, 5);
      if (docStart < clinicStart || docEnd > clinicEnd) {
        return { valid: false, message: `On ${DAY_NAMES[row.day_of_week]}, your hours must be within clinic hours (clinic: ${clinicStart}–${clinicEnd}).` };
      }
    }
    return { valid: true };
  };

  const saveDoctorSchedules = async () => {
    if (!userId || !clinicId) return;
    setDoctorScheduleError('');
    const validation = validateDoctorScheduleWithinClinic();
    if (!validation.valid) {
      setDoctorScheduleError(validation.message);
      return;
    }
    setSavingDoctorSchedule(true);
    try {
      await upsertDoctorSchedules(userId, clinicId, doctorSchedules);
    } catch (e) {
      console.error(e);
      setDoctorScheduleError(e.message || 'Failed to save schedule');
    } finally {
      setSavingDoctorSchedule(false);
    }
  };

  const saveDoctorSettings = async () => {
    if (!userId || !clinicId) return;
    setSavingDoctorSettings(true);
    try {
      await upsertDoctorSettings(userId, clinicId, doctorSettings);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingDoctorSettings(false);
    }
  };

  const addDoctorHolidaySubmit = async (e) => {
    e.preventDefault();
    if (!userId || !clinicId || !doctorHolidayDate) return;
    setSavingDoctorHoliday(true);
    try {
      await addDoctorHoliday(userId, clinicId, doctorHolidayDate, doctorHolidayReason.trim() || null);
      setDoctorHolidays((prev) => [...prev, { date: doctorHolidayDate, reason: doctorHolidayReason, id: undefined }]);
      setDoctorHolidayDate('');
      setDoctorHolidayReason('');
      const data = await getDoctorHolidays(userId);
      setDoctorHolidays(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingDoctorHoliday(false);
    }
  };

  const deleteDoctorHoliday = async (id) => {
    try {
      await removeDoctorHoliday(id);
      setDoctorHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const saveDoctorProfile = async () => {
    setDoctorProfileError('');
    setSavingDoctorProfile(true);
    try {
      const payload = {};
      if (doctorProfileEdit.degree !== undefined) payload.degree = doctorProfileEdit.degree.trim() || null;
      const sinceYear = doctorProfileEdit.experience_since_year ? parseInt(doctorProfileEdit.experience_since_year, 10) : null;
      const expYears = doctorProfileEdit.experience_years ? parseInt(doctorProfileEdit.experience_years, 10) : null;
      if (sinceYear) payload.experience_since_year = sinceYear;
      else payload.experience_since_year = null;
      if (expYears != null && !sinceYear) payload.experience_years = expYears;
      else if (sinceYear) payload.experience_years = currentYear - sinceYear;
      await updateMyDoctorProfile(payload);
      await refreshProfile();
    } catch (e) {
      setDoctorProfileError(e.message || 'Failed to update');
    } finally {
      setSavingDoctorProfile(false);
    }
  };

  const experienceDisplay = profile?.experience_since_year
    ? `${currentYear - profile.experience_since_year} years (since ${profile.experience_since_year})`
    : profile?.experience_years != null
      ? `${profile.experience_years} years`
      : '—';

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
            </div>

      {isClinicAdmin && (
        <Card title="Clinic Schedule" className="bg-white border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Set operating hours for each day. Mark days as closed or add one-off off days below.</p>
          {schedulesLoaded && (
            <>
              <div className="space-y-3">
                {schedules.map((row, index) => (
                  <div
                    key={row.day_of_week}
                    className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-28 font-medium text-gray-700">{DAY_NAMES[row.day_of_week]}</div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={row.is_closed}
                        onChange={(e) => updateSchedule(index, 'is_closed', e.target.checked)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      Closed
                    </label>
                    {!row.is_closed && (
                      <>
                        <input
                          type="time"
                          value={row.start_time}
                          onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={row.end_time}
                          onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                        />
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                      onClick={() => copyDayToAll(index)}
                      className="text-gray-500 hover:text-teal-600"
                    >
                      Copy to all days
                    </Button>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="primary" icon={Save} onClick={saveSchedules} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Schedule'}
                </Button>
              </div>
            </>
          )}
          {!schedulesLoaded && (
            <div className="py-8 text-center text-gray-500">Loading schedule…</div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CalendarOff className="w-4 h-4" /> Clinic off days
            </h3>
            <p className="text-sm text-gray-500 mb-3">Add specific dates when the clinic will be closed.</p>
            <form onSubmit={addHoliday} className="flex flex-wrap gap-2 mb-4">
              <input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                min={new Date().toISOString().slice(0, 10)}
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={holidayReason}
                onChange={(e) => setHolidayReason(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm flex-1 min-w-[120px]"
              />
              <Button type="submit" variant="secondary" size="sm" icon={Plus} disabled={savingHoliday || !holidayDate}>
                Add
              </Button>
            </form>
            {holidays.length > 0 ? (
              <ul className="space-y-1">
                {holidays.map((h) => (
                  <li key={h.id || h.date} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium">{h.date}</span>
                    {h.reason && <span className="text-sm text-gray-500">{h.reason}</span>}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => deleteHoliday(h.id)}
                      className="text-red-600 hover:text-red-700"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No off days added yet.</p>
            )}
          </div>
        </Card>
      )}

      {isDoctor && (
        <Card title="Degree & experience" className="bg-white border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Update your degree and experience. Experience can auto-update every year if you set &quot;Year started practice&quot;.</p>
          {doctorProfileError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{doctorProfileError}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree (e.g. MBBS, MD)</label>
              <input
                type="text"
                value={doctorProfileEdit.degree}
                onChange={(e) => setDoctorProfileEdit((p) => ({ ...p, degree: e.target.value }))}
                placeholder="e.g. MBBS, MD, MS"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year started practice (recommended — auto-updates experience every year)</label>
              <select
                value={doctorProfileEdit.experience_since_year || ''}
                onChange={(e) => setDoctorProfileEdit((p) => ({ ...p, experience_since_year: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">— Select year —</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Or enter years of experience manually (if not using year started)</label>
              <input
                type="number"
                min={0}
                value={doctorProfileEdit.experience_years}
                onChange={(e) => setDoctorProfileEdit((p) => ({ ...p, experience_years: e.target.value }))}
                placeholder="e.g. 5"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                disabled={!!doctorProfileEdit.experience_since_year}
              />
            </div>
            {(profile?.experience_since_year != null || profile?.experience_years != null) && (
              <p className="text-sm text-gray-600">Current display: <strong>{experienceDisplay}</strong></p>
            )}
            <Button variant="primary" size="sm" icon={Save} onClick={saveDoctorProfile} disabled={savingDoctorProfile}>
              {savingDoctorProfile ? 'Saving…' : 'Save degree & experience'}
            </Button>
          </div>
        </Card>
      )}

      {isDoctor && (
        <Card title="My Schedule & Availability" className="bg-white border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Set your working hours within clinic operating hours. Your schedule cannot be outside clinic hours.</p>
          {doctorScheduleError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{doctorScheduleError}</div>
          )}
          {doctorSchedulesLoaded && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Weekly schedule</h3>
              <div className="space-y-2 mb-6">
                {doctorSchedules.map((row, index) => {
                  const clinicDay = (clinicSchedules || []).find((c) => c.day_of_week === row.day_of_week);
                  const clinicHint = clinicDay?.is_closed ? 'Clinic closed' : `Clinic: ${(clinicDay?.start_time || '09:00').slice(0, 5)}–${(clinicDay?.end_time || '18:00').slice(0, 5)}`;
                  return (
                  <div key={row.day_of_week} className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-28">
                      <div className="font-medium text-gray-700">{DAY_NAMES[row.day_of_week]}</div>
                      <div className="text-xs text-gray-500">{clinicHint}</div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={row.is_active}
                        onChange={(e) => updateDoctorSchedule(index, 'is_active', e.target.checked)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      Available
                    </label>
                    {row.is_active && (
                      <>
                        <input
                          type="time"
                          value={row.start_time}
                          onChange={(e) => updateDoctorSchedule(index, 'start_time', e.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={row.end_time}
                          onChange={(e) => updateDoctorSchedule(index, 'end_time', e.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                        />
                        <select
                          value={row.slot_duration_minutes}
                          onChange={(e) => updateDoctorSchedule(index, 'slot_duration_minutes', Number(e.target.value))}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                        >
                          <option value={15}>15 min</option>
                          <option value={30}>30 min</option>
                          <option value={60}>1 hr</option>
                        </select>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                      onClick={() => copyDoctorDayToAll(index)}
                      className="text-gray-500 hover:text-teal-600"
                    >
                      Copy to all days
                    </Button>
                  </div>
                  );
                })}
              </div>
              <div className="flex justify-end mb-6">
                <Button variant="primary" size="sm" icon={Save} onClick={saveDoctorSchedules} disabled={savingDoctorSchedule}>
                  {savingDoctorSchedule ? 'Saving…' : 'Save schedule'}
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Appointment duration (default)</h3>
                <p className="text-xs text-gray-500 mb-2">Default slot length for new appointments. Min 15 min, max 1 hr.</p>
                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={doctorSettings.default_appointment_duration}
                    onChange={(e) => setDoctorSettings((s) => ({ ...s, default_appointment_duration: Number(e.target.value) }))}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={doctorSettings.allow_custom_duration}
                      onChange={(e) => setDoctorSettings((s) => ({ ...s, allow_custom_duration: e.target.checked }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    Allow custom duration when booking
                  </label>
                  <Button variant="secondary" size="sm" icon={Save} onClick={saveDoctorSettings} disabled={savingDoctorSettings}>
                    Save
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CalendarOff className="w-4 h-4" /> My off days
                </h3>
                <p className="text-sm text-gray-500 mb-3">Add dates when you are unavailable.</p>
                <form onSubmit={addDoctorHolidaySubmit} className="flex flex-wrap gap-2 mb-4">
                  <input
                    type="date"
                    value={doctorHolidayDate}
                    onChange={(e) => setDoctorHolidayDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                  <input
                    type="text"
                    placeholder="Reason (optional)"
                    value={doctorHolidayReason}
                    onChange={(e) => setDoctorHolidayReason(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm flex-1 min-w-[120px]"
                  />
                  <Button type="submit" variant="secondary" size="sm" icon={Plus} disabled={savingDoctorHoliday || !doctorHolidayDate}>
                    Add
                  </Button>
                </form>
                {doctorHolidays.length > 0 ? (
                  <ul className="space-y-1">
                    {doctorHolidays.map((h) => (
                      <li key={h.id || h.date} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium">{h.date}</span>
                        {h.reason && <span className="text-sm text-gray-500">{h.reason}</span>}
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => deleteDoctorHoliday(h.id)} className="text-red-600 hover:text-red-700" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No off days added.</p>
                )}
              </div>
            </>
          )}
          {!doctorSchedulesLoaded && isDoctor && <div className="py-8 text-center text-gray-500">Loading…</div>}
        </Card>
      )}

      <Card title="Profile Information" className="bg-white border-gray-200">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" defaultValue={profile?.full_name || ''} icon={User} disabled className="bg-gray-50" />
            <Input label="Clinic" defaultValue={profile?.clinic?.name || '—'} disabled className="bg-gray-50" />
                    </div>
                    <Input
                        label="Email Address"
                        type="email"
            defaultValue={profile?.email || ''}
                        disabled
                        className="bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 focus:ring-0 px-3"
                    />
                    <div className="pt-2 flex justify-end">
            <Button variant="primary" icon={Save} disabled type="submit">Save Changes</Button>
                    </div>
                </form>
            </Card>

            <Card title="Security" className="bg-white border-gray-200">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Current Password" type="password" placeholder="••••••••" icon={Lock} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="New Password" type="password" placeholder="••••••••" icon={Lock} />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" icon={Lock} />
                    </div>
                    <div className="pt-2 flex justify-end">
            <Button variant="secondary" icon={Save} type="submit" disabled>Update Password</Button>
                    </div>
                </form>
            </Card>

            <div className="pt-4 border-t border-gray-200">
        <Button variant="danger" fullWidth icon={LogOut} onClick={handleLogout}>
                    Log Out of All Sessions
                </Button>
            </div>
        </div>
    );
};

export default Settings;
