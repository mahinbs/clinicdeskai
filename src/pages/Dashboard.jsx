import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, DollarSign, ArrowRight, TrendingUp, Plus, Clock } from 'lucide-react';
import { kpiStats, appointments, patients } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const KPICard = ({ label, value, change, status, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-bold ${status === 'positive' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-0.5 rounded-md`} >
                <TrendingUp className="w-3 h-3 mr-1" />
                {change}
            </span>
            <span className="ml-2 text-gray-400 font-medium">vs last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const date = new Date();
    const recentAppointments = appointments.slice(0, 3);
    const recentPatients = patients.slice(0, 3);

    const kpiIcons = [Users, Calendar, DollarSign];

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, Dr. Mitchell</p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/doctor/appointments')}>New Appointment</Button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpiStats.map((stat, index) => (
                    <KPICard
                        key={index}
                        {...stat}
                        icon={kpiIcons[index]}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Appointments */}
                <Card title="Upcoming Appointments" action={<Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>View All</Button>}>
                    <div className="space-y-4">
                        {recentAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-sm hover:border-teal-100 group">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold shadow-sm">
                                            {apt.patient.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{apt.patient}</p>
                                        <p className="text-xs text-gray-500 font-medium">{apt.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900 flex items-center justify-end">
                                        <Clock className="w-3 h-3 mr-1 text-teal-500" />
                                        {apt.time}
                                    </div>
                                    <div className="mt-1">
                                        <Badge variant={apt.status === 'Upcoming' ? 'primary' : 'neutral'} showDot>{apt.status}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Patients */}
                <Card title="Recent Patients" action={<Button variant="ghost" size="sm" onClick={() => navigate('/doctor/patients')}>View All</Button>}>
                    <div className="space-y-2">
                        {recentPatients.map((patient) => (
                            <div key={patient.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/doctor/patients/${patient.id}`)}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold ring-2 ring-white border border-gray-100">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{patient.name}</p>
                                        <p className="text-xs text-gray-500">{patient.condition}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium">Last Visit</p>
                                    <p className="text-sm text-gray-700 font-medium">{patient.lastVisit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
