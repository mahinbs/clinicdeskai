import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { getAllPatients } from '../utils/database';

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPatients();
        setPatients(data || []);
      } catch (err) {
        setError(err.message);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm) ||
      (p.patient_id_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = () => {
    navigate('/reception/checkin');
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

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <Card noPadding className="border border-gray-200 shadow-sm bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <Input
            icon={Search}
            placeholder="Search by name, phone or ID..."
            className="max-w-md bg-white border-gray-200 focus:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No patients found.</td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                      onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 ring-2 ring-white">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{patient.full_name}</div>
                            <div className="text-xs text-gray-500 font-medium">{patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : '—'} yrs • {patient.gender || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{patient.patient_id_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.updated_at ? new Date(patient.updated_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="success" showDot size="sm">Active</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Patients;
