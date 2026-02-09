import React from 'react';
import { Building, Users, Plus, Activity } from 'lucide-react';
import { clinics } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

const MasterDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Master Admin</h1>
                    <p className="text-sm text-gray-500">Platform Overview</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => navigate('clinics')}>Add New Clinic</Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center p-6">
                    <div className="p-3 rounded-full bg-teal-100 text-teal-700 mr-4">
                        <Building className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Clinics</p>
                        <p className="text-3xl font-bold text-gray-900">{clinics.length}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-6">
                    <div className="p-3 rounded-full bg-green-100 text-green-700 mr-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
                        <p className="text-3xl font-bold text-gray-900">48</p>
                    </div>
                </Card>
                <Card className="flex items-center p-6">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-700 mr-4">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">System Status</p>
                        <p className="text-lg font-bold text-green-600">Operational</p>
                    </div>
                </Card>
            </div>

            {/* Clinic List */}
            <Card title="Registered Clinics" noPadding>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctors</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clinics.map((clinic) => (
                                <tr key={clinic.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{clinic.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{clinic.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{clinic.doctorCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={clinic.active ? 'success' : 'neutral'}>
                                            {clinic.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Button variant="ghost" size="sm" onClick={() => navigate('clinics')}>Manage</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default MasterDashboard;
