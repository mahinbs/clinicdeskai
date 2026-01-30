import React from 'react';
import { Users, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { kpiStats, appointments, patients } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const KPICard = ({ label, value, change, status, icon: Icon }) => (
    <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="w-6 h-6 text-blue-700" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${status === 'positive' ? 'text-green-600' : 'text-gray-600'}`}>
                {change}
            </span>
            <span className="ml-2 text-gray-400">vs last month</span>
        </div>
    </Card>
);

const Dashboard = () => {
    const recentAppointments = appointments.slice(0, 3);
    const recentPatients = patients.slice(0, 3);

    const kpiIcons = [Users, Calendar, DollarSign];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <Button variant="primary" icon={Calendar}>New Appointment</Button>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <Card title="Upcoming Appointments" action={<Button variant="ghost" size="sm">View All</Button>}>
                    <div className="space-y-4">
                        {recentAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                                            {apt.patient.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{apt.patient}</p>
                                        <p className="text-xs text-gray-500">{apt.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{apt.time}</p>
                                    <Badge variant="active" size="sm">{apt.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Patients */}
                <Card title="Recent Patients" action={<Button variant="ghost" size="sm">View All</Button>}>
                    <div className="divide-y divide-gray-100">
                        {recentPatients.map((patient) => (
                            <div key={patient.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                                        <p className="text-xs text-gray-500">{patient.condition}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Last Visit</p>
                                    <p className="text-sm text-gray-900">{patient.lastVisit}</p>
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
