import React, { useState } from 'react';
import { User, Phone, Stethoscope, Printer, UserPlus, FileText, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const CheckInPatient = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="max-w-lg mx-auto mt-12 px-4">
                <Card className="text-center p-10 shadow-2xl border-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-500"></div>

                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Check-in Complete</h2>
                    <p className="text-gray-500 mb-8">Patient added to queue successfully.</p>

                    <div className="bg-gray-50 rounded-2xl p-8 mb-8 text-center border border-gray-100 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider shadow-sm">
                            Token Number
                        </div>
                        <p className="text-6xl font-black text-teal-600 tracking-tighter">A-05</p>
                        <div className="mt-4 flex items-center justify-center text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-100 inline-block shadow-sm">
                            <Stethoscope className="w-4 h-4 mr-2 text-teal-500" />
                            Dr. Sarah Mitchell
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button variant="primary" fullWidth size="lg" icon={Printer} className="shadow-lg shadow-teal-100">Print Token</Button>
                        <Button variant="ghost" fullWidth onClick={() => setIsSubmitted(false)}>Check In Another Patient</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Patient Check-in</h1>
                <p className="text-gray-500 mt-2">Generate a token for walk-ins or scheduled appointments</p>
            </div>

            <Card className="shadow-xl border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <Input label="Patient Name" placeholder="e.g. Michael Scott" icon={User} required />
                        <Input label="Phone Number" placeholder="+1 (555) 000-0000" icon={Phone} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign Doctor</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Stethoscope className="h-5 w-5 text-gray-400" />
                            </div>
                            <select className="block w-full pl-10 pr-4 py-3 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm rounded-xl bg-gray-50 transition-all hover:bg-white">
                                <option>Dr. Sarah Mitchell (General)</option>
                                <option>Dr. James Wilson (Cardio)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start gap-3">
                        <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Note</p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Checking in will immediately add the patient to the "Waiting" queue.
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" variant="primary" fullWidth size="lg" icon={UserPlus} className="h-12 text-base shadow-lg shadow-teal-100">
                            Generate Token
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CheckInPatient;
