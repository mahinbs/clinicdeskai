import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, FileText, Activity } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getPatientById, getPatientHistory } from '../utils/database';

const PatientHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, h] = await Promise.all([getPatientById(id), getPatientHistory(id)]);
        setPatient(p);
        setHistory(h);
      } catch (err) {
        setError(err.message);
        setPatient(null);
        setHistory(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-900">Patient not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/doctor/patients')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const appointments = history?.appointments || [];
  const prescriptions = history?.prescriptions || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/doctor/patients')} className="pl-0 hover:bg-transparent hover:text-teal-600 cursor-pointer">
        Back to Patients
      </Button>

      <Card noPadding className="bg-white border-gray-200 shadow-sm overflow-visible">
        <div className="p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start space-x-6">
            <div className="h-20 w-20 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {(patient.full_name || '?').charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{patient.full_name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 font-medium">
                <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <User className="w-4 h-4 mr-1.5 text-gray-400" />
                  {patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : '—'} yrs, {patient.gender || '—'}
                </span>
                <span className="flex items-center bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full">
                  <Activity className="w-4 h-4 mr-1.5" /> {patient.medical_history || '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Patient ID</div>
            <div className="font-bold text-gray-900 text-lg">{patient.patient_id_number}</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Phone</div>
            <div className="font-bold text-gray-700">{patient.phone}</div>
          </div>
        </div>
      </Card>

      <div className="mt-8 relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 z-0" />
        <h2 className="text-xl font-bold text-gray-900 mb-6 pl-20">Medical History Timeline</h2>

        <div className="space-y-8 relative z-10">
          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <div key={apt.id} className="flex gap-6 group">
                <div className="flex-shrink-0 w-16 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-md relative z-10 group-hover:scale-125 transition-transform duration-300" />
                </div>
                <Card className="flex-1 border-gray-200 hover:border-teal-300 transition-colors shadow-sm ml-[-1rem] bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">
                      <Calendar className="w-4 h-4 mr-2" />
                      {apt.date ? new Date(apt.date).toLocaleDateString() : '—'} {apt.time && `• ${apt.time}`}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Visit</h3>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{apt.notes || 'No notes.'}</p>
                    </div>
                    <p className="text-xs text-gray-500">Doctor: {apt.doctor_name || '—'}</p>
                  </div>
                </Card>
              </div>
            ))
          ) : (
            <div className="text-center py-12 ml-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No medical history records found for this patient.</p>
            </div>
          )}
        </div>

        {prescriptions.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4 mt-10 pl-20">Prescriptions</h2>
            <div className="space-y-4 pl-20">
              {prescriptions.map((rx) => (
                <Card key={rx.id} className="border-gray-200">
                  <div className="flex items-center text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100 w-fit mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    {rx.date ? new Date(rx.date).toLocaleDateString() : '—'}
                  </div>
                  <p className="text-sm text-gray-600">{rx.diagnosis || '—'}</p>
                  {rx.medications && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-xl font-mono text-sm text-gray-700">
                      {JSON.stringify(rx.medications)}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;
