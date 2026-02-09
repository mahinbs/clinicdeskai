import React, { useState } from 'react';
import { Camera, Printer, Save, User, ChevronRight, Menu, X } from 'lucide-react';
import { patients } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const DoctorPrescriptions = () => {
    const [selectedPatient, setSelectedPatient] = useState(patients[0]);
    const [showMobileQueue, setShowMobileQueue] = useState(false);

    return (
        <div className="flex h-[calc(100vh-8rem)] relative">
            {/* Mobile Queue Toggle Overlay */}
            {showMobileQueue && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setShowMobileQueue(false)}
                />
            )}

            {/* Patient List Sidebar */}
            <div className={`
                absolute md:relative inset-y-0 left-0 z-50 bg-white 
                w-3/4 md:w-72 border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out
                ${showMobileQueue ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                flex flex-col
            `}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between md:hidden">
                    <h2 className="font-bold text-gray-900">Patient Queue</h2>
                    <button onClick={() => setShowMobileQueue(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 md:p-0 md:pr-6 md:pl-2 overflow-y-auto flex-1">
                    <h2 className="hidden md:block text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2 mt-4">Waiting Queue</h2>
                    <div className="space-y-2">
                        {patients.slice(0, 5).map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setSelectedPatient(p);
                                    setShowMobileQueue(false);
                                }}
                                className={`w-full cursor-pointer text-left p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${selectedPatient.id === p.id ? 'bg-teal-50 ring-1 ring-teal-200 shadow-sm' : 'hover:bg-gray-50'}`}
                            >
                                <div className="relative z-10">
                                    <p className={`font-bold text-sm ${selectedPatient.id === p.id ? 'text-teal-900' : 'text-gray-900'}`}>{p.name}</p>
                                    <p className={`text-xs mt-1 ${selectedPatient.id === p.id ? 'text-teal-600' : 'text-gray-500'}`}>{p.gender}, {p.age} years</p>
                                </div>
                                {selectedPatient.id === p.id && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Prescription Pad */}
            <div className="flex-1 w-full overflow-y-auto bg-white/50">
                <div className="p-4 md:p-8 md:pl-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <button
                                    onClick={() => setShowMobileQueue(true)}
                                    className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">Rx: {selectedPatient.name}</h1>
                                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold whitespace-nowrap">New Visit</span>
                            </div>
                            <p className="text-sm text-gray-500 ml-1 md:ml-0">ID: #{1000 + selectedPatient.id} • {selectedPatient.age}yrs • {selectedPatient.gender}</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <Button variant="outline" icon={Camera} className="whitespace-nowrap flex-1 md:flex-none justify-center">Add Photo</Button>
                            <Button variant="primary" icon={Printer} className="whitespace-nowrap flex-1 md:flex-none justify-center">Print & Save</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Vitals */}
                        <Card title="Vitals Check" className="lg:col-span-1 h-fit">
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                                <Input label="BP (mmHg)" placeholder="120/80" />
                                <Input label="Pulse (bpm)" placeholder="72" />
                                <Input label="Temp (°F)" placeholder="98.6" />
                                <Input label="Weight (kg)" placeholder="70" />
                            </div>
                        </Card>

                        {/* Diagnosis & Meds */}
                        <Card className="lg:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Clinical Diagnosis</label>
                                <textarea
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white shadow-sm focus:border-teal-500 focus:ring-teal-500/20 transition-all p-4 text-gray-900 min-h-[80px]"
                                    placeholder="Enter primary diagnosis..."
                                />
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Medications & Instructions</label>
                                <div className="border border-gray-200 rounded-xl bg-white shadow-inner flex flex-col h-[400px]">
                                    <div className="p-3 md:p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Digital Rx Pad</span>
                                        <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <textarea
                                        className="w-full h-full border-0 focus:ring-0 bg-transparent p-4 font-mono text-sm text-gray-800 leading-relaxed resize-none"
                                        placeholder="1. Drug Name - Dosage - Frequency (Duration)&#10;2. ..."
                                        defaultValue={`1. Paracetamol 500mg - 1-0-1 (3 days)
2. Amoxicillin 500mg - 1-0-1 (5 days)
3. Gargle with warm salt water`}
                                    />
                                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-right shrink-0">
                                        <p className="text-xs font-medium text-teal-700">Signed <span className="hidden sm:inline">electronically </span>by Dr. Sarah Mitchell</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPrescriptions;
