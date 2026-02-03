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
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Patients</h1>
                    <p className="text-sm text-slate-400 mt-1">Directory of all registered patients</p>
                </div>
                <Button variant="primary" icon={Plus} className="shadow-neon" onClick={handleAddPatient}>Add Patient</Button>
            </div>

            <Card noPadding className="border-0 shadow-lg bg-slate-900/40">
                <div className="p-4 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
                    <Input
                        icon={Search}
                        placeholder="Search by name or phone..."
                        className="max-w-md bg-slate-800/50 border-transparent focus:bg-slate-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Condition</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Last Visit</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                {/* <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th> */}
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900/20 divide-y divide-slate-800">
                            {filteredPatients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200 group"
                                    onClick={() => navigate(`/patients/${patient.id}`)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 ring-2 ring-white/10">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-100 group-hover:text-primary-400 transition-colors">{patient.name}</div>
                                                <div className="text-xs text-slate-500 font-medium">{patient.age} yrs • {patient.gender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {patient.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                            {patient.condition}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {patient.lastVisit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Badge variant="success" showDot size="sm">Active</Badge>
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
                                            onClick={(e) => handleActionClick(e, patient.name)}
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td> */}
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
