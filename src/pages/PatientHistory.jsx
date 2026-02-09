import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, FileText, Activity } from 'lucide-react';
import { patients, patientHistory } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const PatientHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const patient = patients.find(p => p.id === parseInt(id));
    const history = patientHistory.filter(h => h.patientId === parseInt(id));

    if (!patient) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-gray-900">Patient not found</h2>
                <Button variant="secondary" className="mt-4" onClick={() => navigate('/patients')}>
                    Back to Directory
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={() => navigate('/patients')}
                className="pl-0 hover:bg-transparent hover:text-teal-600 cursor-pointer"
            >
                Back to Patients
            </Button>

            {/* Patient Header */}
            <Card noPadding className="bg-white border-gray-200 shadow-sm overflow-visible">
                <div className="p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div className="flex items-start space-x-6">
                        <div className="h-20 w-20 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                            {patient.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{patient.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 font-medium">
                                <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full"><User className="w-4 h-4 mr-1.5 text-gray-400" /> {patient.age} yrs, {patient.gender}</span>
                                <span className="flex items-center bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full"><Activity className="w-4 h-4 mr-1.5" /> {patient.condition}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Last Visit</div>
                        <div className="font-bold text-gray-900 text-lg">{patient.lastVisit}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Phone</div>
                        <div className="font-bold text-gray-700">{patient.phone}</div>
                    </div>
                </div>
            </Card>

            {/* Medical History Section */}
            <div className="mt-8 relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

                <h2 className="text-xl font-bold text-gray-900 mb-6 pl-20">Medical History Timeline</h2>

                <div className="space-y-8 relative z-10">
                    {history.length > 0 ? history.map((record) => (
                        <div key={record.id} className="flex gap-6 group">
                            {/* Timeline Connector */}
                            <div className="flex-shrink-0 w-16 flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-md relative z-10 group-hover:scale-125 transition-transform duration-300"></div>
                            </div>

                            <Card className="flex-1 border-gray-200 hover:border-teal-300 transition-colors shadow-sm ml-[-1rem] bg-white">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {record.date}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Clinical Notes</h3>
                                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                            {record.notes}
                                        </p>
                                    </div>
                                    {record.prescription && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-emerald-500" />
                                                Prescription
                                            </h3>
                                            <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300 font-mono text-sm text-gray-700">
                                                {record.prescription}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )) : (
                        <div className="text-center py-12 ml-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No medical history records found for this patient.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientHistory;
