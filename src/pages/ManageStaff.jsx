import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Lock, Save, Stethoscope, ClipboardList, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ManageStaff = () => {
    const [role, setRole] = useState('doctor');

    return (
        <div className="max-w-6xl space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Staff Member</h1>
                <p className="text-gray-500 mt-2">Onboard a new Doctor or Receptionist to your clinic</p>
            </div>

            <Card className="shadow-xl border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Staff Profile Details</h2>
                    <p className="text-sm text-gray-500">All fields are required for account creation</p>
                </div>

                <form className="p-8 space-y-8">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-4">Select Role</label>
                        <div className="grid grid-cols-2 gap-6">
                            <button
                                type="button"
                                onClick={() => setRole('doctor')}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col items-center justify-center gap-3 group
                                ${role === 'doctor'
                                        ? 'border-teal-500 bg-teal-50/50 ring-4 ring-teal-500/10'
                                        : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'}`}
                            >
                                <div className={`p-3 rounded-full ${role === 'doctor' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                                    <Stethoscope className="w-8 h-8" />
                                </div>
                                <span className={`font-bold ${role === 'doctor' ? 'text-teal-900' : 'text-gray-600'}`}>Doctor</span>
                                {role === 'doctor' && (
                                    <div className="absolute top-4 right-4 text-teal-500">
                                        <Check className="w-5 h-5 bg-teal-500 text-white rounded-full p-0.5" />
                                    </div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('receptionist')}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col items-center justify-center gap-3 group
                                ${role === 'receptionist'
                                        ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10'
                                        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                            >
                                <div className={`p-3 rounded-full ${role === 'receptionist' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                    <ClipboardList className="w-8 h-8" />
                                </div>
                                <span className={`font-bold ${role === 'receptionist' ? 'text-indigo-900' : 'text-gray-600'}`}>Receptionist</span>
                                {role === 'receptionist' && (
                                    <div className="absolute top-4 right-4 text-indigo-500">
                                        <Check className="w-5 h-5 bg-indigo-500 text-white rounded-full p-0.5" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Input
                            label="Full Name"
                            placeholder={`e.g. ${role === 'doctor' ? 'Dr. John Doe' : 'Jane Smith'}`}
                            icon={UserPlus}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Email Address" type="email" placeholder="staff@clinic.com" icon={Mail} />
                            <Input label="Phone Number" placeholder="+1 (555) 000-0000" icon={Phone} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                            <Lock className="w-4 h-4 mr-2 text-gray-400" />
                            Account Security
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Temporary Password" type="password" placeholder="••••••••" icon={Lock} />
                            <Input label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" size="lg">Cancel</Button>
                        <Button variant="primary" size="lg" icon={Save} className="shadow-lg shadow-teal-100">Create Staff Account</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ManageStaff;
