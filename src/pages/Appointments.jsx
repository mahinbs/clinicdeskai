import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Filter, Eye, CheckCircle, Clock, MoreVertical } from 'lucide-react';
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointments</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your schedule and consultations</p>
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
                        onClick={handleNewAppointment}
                    >
                        New Appointment
                    </Button>
                </div>
            </div>

            <Card noPadding className="border-0 shadow-lg overflow-hidden">
                {/* Toolbar */}
                {showFilters && (
                    <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 transition-all duration-300">
                        <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200">
                            {filters.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                                    ${filter === f
                                            ? 'bg-teal-50 text-teal-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
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
                                className="bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                                                {appointment.patient.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{appointment.patient}</div>
                                                <div className="text-xs text-gray-500">ID: #{1000 + appointment.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">{appointment.date || "Oct 24, 2023"}</div>
                                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {appointment.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                                        Dr. Sarah Mitchell
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {appointment.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={appointment.status === 'Upcoming' ? 'primary' : appointment.status === 'Completed' ? 'success' : 'neutral'} showDot>
                                            {appointment.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-teal-600" onClick={() => handleEdit(appointment.id)}>Edit</Button>
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-rose-600" onClick={() => handleCancel(appointment.id)}>Cancel</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">{filteredAppointments.length}</span> of <span className="font-medium text-gray-900">{appointments.length}</span> results</p>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Appointments;
