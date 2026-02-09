import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, MoreHorizontal } from 'lucide-react';
import { patients } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const Patients = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleActionClick = (e, patientName) => {
        e.stopPropagation();
        // In a real app, this would open a dropdown menu
        alert(`Options for ${patientName}: Edit, Archive, or Delete`);
    };

    const handleAddPatient = () => {
        // navigate('/patients/new'); // Route doesn't exist yet, just logging
        alert("Add Patient feature coming soon!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Patients</h1>
                    <p className="text-sm text-gray-500 mt-1">Directory of all registered patients</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={handleAddPatient}>Add Patient</Button>
            </div>

            <Card noPadding className="border border-gray-200 shadow-sm bg-white overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <Input
                        icon={Search}
                        placeholder="Search by name or phone..."
                        className="max-w-md bg-white border-gray-200 focus:bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Condition</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Visit</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPatients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                                    onClick={() => navigate(`/patients/${patient.id}`)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 ring-2 ring-white">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{patient.name}</div>
                                                <div className="text-xs text-gray-500 font-medium">{patient.age} yrs • {patient.gender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {patient.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                                            {patient.condition}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {patient.lastVisit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Badge variant="success" showDot size="sm">Active</Badge>
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

export default Patients;
