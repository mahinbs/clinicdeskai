import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, DollarSign, ArrowRight, TrendingUp, Plus } from 'lucide-react';
import { kpiStats, appointments, patients } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const KPICard = ({ label, value, change, status, icon: Icon }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group border-0 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="mt-2 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{value}</p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-900/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-primary-400" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-bold ${status === 'positive' ? 'text-emerald-400' : 'text-rose-400'} bg-slate-800/50 px-2 py-0.5 rounded-lg`} >
                <TrendingUp className="w-3 h-3 mr-1" />
                {change}
            </span>
            <span className="ml-2 text-slate-500 font-medium">vs last month</span>
        </div>
    </Card>
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
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Overview</h1>
                    <p className="text-sm text-slate-400 mt-1">Welcome back, Dr. Smith</p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400 font-medium bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
                        {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/appointments')}>New Appointment</Button>
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
                <Card title="Upcoming Appointments" action={<Button variant="ghost" size="sm">View All</Button>}>
                    <div className="space-y-4">
                        {recentAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-900 backdrop-blur-md rounded-2xl border border-slate-100/30 transition-all duration-300 hover:shadow-md group">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-700 font-bold shadow-inner group-hover:scale-105 transition-transform">
                                            {apt.patient.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">{apt.patient}</p>
                                        <p className="text-xs text-primary-300 font-medium">{apt.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-200">{apt.time}</p>
                                    <Badge variant="warning" size="sm" showDot>{apt.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Patients */}
                <Card title="Recent Patients" action={<Button variant="ghost" size="sm">View All</Button>}>
                    <div className="space-y-2">
                        {recentPatients.map((patient) => (
                            <div key={patient.id} className="flex items-center justify-between p-3 rounded-xl transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold ring-2 ring-white">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">{patient.name}</p>
                                        <p className="text-xs text-slate-300">{patient.condition}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-medium">Last Visit</p>
                                    <p className="text-sm text-slate-200 font-medium">{patient.lastVisit}</p>
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
