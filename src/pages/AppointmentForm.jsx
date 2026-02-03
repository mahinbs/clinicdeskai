import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, FileText, Save, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const AppointmentForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientName: '',
        date: '',
        time: '',
        doctor: 'Dr. Sarah Mitchell',
        type: 'General Checkup',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting Appointment:", formData);
        // In a real app, this would send data to an API
        navigate('/appointments');
    };

    return (

        <div className="max-w-3xl space-y-8 relative">
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight">New Appointment</h1>
                    <p className="text-slate-400 mt-2">Schedule a visit for a patient</p>
                </div>
                <Button variant="ghost" icon={X} onClick={() => navigate('/appointments')} className="hover:bg-slate-800/50 text-slate-400 hover:text-slate-200">Cancel</Button>
            </div>

            <Card className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden z-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-cyan opacity-50"></div>

                <form onSubmit={handleSubmit} className="space-y-8 p-2">
                    <Input
                        label="Patient Name"
                        name="patientName"
                        icon={User}
                        placeholder="e.g. John Doe"
                        value={formData.patientName}
                        onChange={handleChange}
                        required
                        className="bg-slate-800/50 border-slate-700/50 focus:border-primary-500/50 focus:ring-primary-500/20"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Date"
                            name="date"
                            type="date"
                            icon={Calendar}
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="bg-slate-800/50 border-slate-700/50 focus:border-primary-500/50 focus:ring-primary-500/20"
                        />
                        <Input
                            label="Time"
                            name="time"
                            type="time"
                            icon={Clock}
                            value={formData.time}
                            onChange={handleChange}
                            required
                            className="bg-slate-800/50 border-slate-700/50 focus:border-primary-500/50 focus:ring-primary-500/20"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-300 ml-1">Doctor</label>
                            <div className="relative">
                                <select
                                    name="doctor"
                                    value={formData.doctor}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all duration-300 appearance-none"
                                >
                                    <option>Dr. Sarah Mitchell</option>
                                    <option>Dr. James Wilson</option>
                                    <option>Dr. Emily Chen</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <User className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-300 ml-1">Type</label>
                            <div className="relative">
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all duration-300 appearance-none"
                                >
                                    <option>General Checkup</option>
                                    <option>Consultation</option>
                                    <option>Follow-up</option>
                                    <option>Vaccination</option>
                                    <option>Emergency</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <FileText className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-300 ml-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            className="w-full pl-4 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all duration-300 resize-none"
                            placeholder="Add any additional notes here..."
                        />
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => navigate('/appointments')} className="text-slate-400 hover:text-slate-200">Cancel</Button>
                        <Button variant="primary" icon={Save} type="submit" className="shadow-lg shadow-primary-500/20">Schedule Appointment</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AppointmentForm;
