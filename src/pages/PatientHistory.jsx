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
            <div className="p-6 text-center">
                <h2 className="text-xl font-medium text-gray-900">Patient not found</h2>
                <Button variant="secondary" className="mt-4" onClick={() => navigate('/patients')}>
                    Back to Directory
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={() => navigate('/patients')}
            >
                Back to Patients
            </Button>

            {/* Patient Header */}
            <Card noPadding className="bg-white">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                            {patient.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {patient.age} yrs, {patient.gender}</span>
                                <span className="flex items-center"><Activity className="w-4 h-4 mr-1" /> {patient.condition}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                        <div className="text-sm text-gray-500">Last Visit</div>
                        <div className="font-medium text-gray-900">{patient.lastVisit}</div>
                        <div className="text-sm text-gray-500 mt-2">Phone</div>
                        <div className="font-medium text-gray-900">{patient.phone}</div>
                    </div>
                </div>
            </Card>

            {/* Medical History Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Medical History</h2>
                <div className="space-y-4">
                    {history.length > 0 ? history.map((record) => (
                        <Card key={record.id} className="border-l-4 border-l-blue-700">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-sm font-medium text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {record.date}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Clinical Notes</h3>
                                    <p className="mt-1 text-sm text-gray-600 leading-relaxed font-normal">
                                        {record.notes}
                                    </p>
                                </div>
                                {record.prescription && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                            Prescription
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-200 inline-block">
                                            {record.prescription}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No medical history records found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientHistory;
