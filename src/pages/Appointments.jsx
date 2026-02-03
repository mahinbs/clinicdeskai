import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Filter, Eye, CheckCircle, Clock } from 'lucide-react';
import { appointments } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

const Appointments = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(true);

    const filters = ['All', 'Upcoming', 'Completed', 'Cancelled'];

    const filteredAppointments = appointments.filter(apt => {
        const matchesFilter = filter === 'All' || apt.status === 'Confirmed' && filter === 'Upcoming' || apt.status === filter;
        const matchesSearch = (apt.patient?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (apt.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (apt.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleNewAppointment = () => {
        navigate('/appointments/new');
    };

    const handleEdit = (id) => {
        console.log("Edit Appointment", id);
    };

    const handleCancel = (id) => {
        console.log("Cancel Appointment", id);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Appointments</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage your schedule</p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        icon={Filter}
                        className="hidden sm:inline-flex"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filter
                    </Button>
                    <Button
                        variant="primary"
                        icon={Calendar}
                        className="shadow-neon"
                        onClick={handleNewAppointment}
                    >
                        New Appointment
                    </Button>
                </div>
            </div>

            <Card noPadding className="border-0 shadow-lg">
                {/* Toolbar */}
                {showFilters && (
                    <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300">
                        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl">
                            {filters.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300
                    ${filter === f
                                            ? 'bg-slate-700 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'}
                                    `}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="w-full sm:w-72">
                            <Input
                                icon={Search}
                                placeholder="Search patient..."
                                className="bg-slate-800/50 border-transparent focus:bg-slate-800 text-slate-100 placeholder-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900/20 divide-y divide-slate-800">
                            {filteredAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-slate-800/50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {appointment.patient.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-100">{appointment.patient}</div>
                                                <div className="text-xs text-slate-500">ID: #4829</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-bold text-slate-200">{appointment.date}</div>
                                            <div className="text-xs text-slate-500 flex items-center mt-0.5">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {appointment.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">
                                        {appointment.doctor}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {appointment.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={appointment.status === 'Confirmed' ? 'success' : appointment.status === 'Pending' ? 'warning' : 'neutral'} showDot>
                                            {appointment.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => handleEdit(appointment.id)}>Edit</Button>
                                            <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300" onClick={() => handleCancel(appointment.id)}>Cancel</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/20">
                    <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-200">1</span> to <span className="font-medium text-slate-200">{filteredAppointments.length}</span> of <span className="font-medium text-slate-200">{appointments.length}</span> results</p>
                    <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" disabled>Previous</Button>
                        <Button variant="secondary" size="sm">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Appointments;
