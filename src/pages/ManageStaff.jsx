import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Save, Stethoscope, ClipboardList, Check, Copy, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { createUser } from '../utils/database';

const ManageStaff = () => {
    const { profile } = useAuth();
    const [role, setRole] = useState('doctor');
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        specialization: '',
        degree: '',
        experience_years: '',
        experience_since_year: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (role === 'doctor') {
            const sinceYear = formData.experience_since_year ? parseInt(formData.experience_since_year, 10) : null;
            const exp = formData.experience_years ? parseInt(formData.experience_years, 10) : NaN;
            if (!sinceYear && (!Number.isInteger(exp) || exp < 0)) {
                setError('Set either "Year started practice" or "Experience (years)" for doctors.');
                return;
            }
        }
        setLoading(true);

        try {
            const sinceYear = formData.experience_since_year ? parseInt(formData.experience_since_year, 10) : undefined;
            const result = await createUser({
                email: formData.email,
                full_name: formData.full_name,
                role: role,
                phone: formData.phone,
                specialization: role === 'doctor' ? formData.specialization : null,
                degree: role === 'doctor' ? (formData.degree || null) : null,
                experience_years: role === 'doctor' && !sinceYear ? parseInt(formData.experience_years, 10) : undefined,
                experience_since_year: role === 'doctor' ? sinceYear : undefined,
                clinic_id: profile?.clinic_id,
            });

            setCreatedUser(result);
            setShowPasswordModal(true);
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                specialization: '',
                degree: '',
                experience_years: '',
                experience_since_year: '',
            });
        } catch (err) {
            setError(err.message || 'Failed to create staff account');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = () => {
        if (createdUser?.temporary_password) {
            navigator.clipboard.writeText(createdUser.temporary_password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="max-w-6xl space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Staff Member</h1>
                <p className="text-gray-500 mt-2">Onboard a new Doctor or Receptionist to your clinic</p>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <Card className="shadow-xl border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Staff Profile Details</h2>
                    <p className="text-sm text-gray-500">All fields are required for account creation</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-4">Select Role</label>
                        <div className="grid grid-cols-2 gap-6">
                            <button
                                type="button"
                                onClick={() => setRole('doctor')}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col items-center justify-center gap-3 group
                                ${role === 'doctor'
                                        ? 'border-teal-500 bg-teal-50/50 ring-4 ring-teal-500/10'
                                        : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'}`}
                            >
                                <div className={`p-3 rounded-full ${role === 'doctor' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                                    <Stethoscope className="w-8 h-8" />
                                </div>
                                <span className={`font-bold ${role === 'doctor' ? 'text-teal-900' : 'text-gray-600'}`}>Doctor</span>
                                {role === 'doctor' && (
                                    <div className="absolute top-4 right-4 text-teal-500">
                                        <Check className="w-5 h-5 bg-teal-500 text-white rounded-full p-0.5" />
                                    </div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('receptionist')}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col items-center justify-center gap-3 group
                                ${role === 'receptionist'
                                        ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10'
                                        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                            >
                                <div className={`p-3 rounded-full ${role === 'receptionist' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                    <ClipboardList className="w-8 h-8" />
                                </div>
                                <span className={`font-bold ${role === 'receptionist' ? 'text-indigo-900' : 'text-gray-600'}`}>Receptionist</span>
                                {role === 'receptionist' && (
                                    <div className="absolute top-4 right-4 text-indigo-500">
                                        <Check className="w-5 h-5 bg-indigo-500 text-white rounded-full p-0.5" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Input
                            label="Full Name"
                            placeholder={`e.g. ${role === 'doctor' ? 'Dr. John Doe' : 'Jane Smith'}`}
                            icon={UserPlus}
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="staff@clinic.com"
                                icon={Mail}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Phone Number"
                                placeholder="+1 (555) 000-0000"
                                icon={Phone}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        {role === 'doctor' && (
                            <>
                                <Input
                                    label="Specialization"
                                    placeholder="e.g. General Physician, Cardiologist"
                                    icon={Stethoscope}
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                />
                                <Input
                                    label="Degree (optional)"
                                    placeholder="e.g. MBBS, MD, MS"
                                    value={formData.degree}
                                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year started practice (optional — experience auto-updates every year)</label>
                                    <select
                                        value={formData.experience_since_year}
                                        onChange={(e) => setFormData({ ...formData, experience_since_year: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    >
                                        <option value="">— Select year —</option>
                                        {yearOptions.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Experience (years) * (or set year above)"
                                    type="number"
                                    min={0}
                                    placeholder="e.g. 5"
                                    value={formData.experience_years}
                                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                    disabled={!!formData.experience_since_year}
                                />
                            </>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100 bg-blue-50/30 -mx-8 px-8 py-4 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">
                            🔐 A secure temporary password will be auto-generated and sent to the staff member via email
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" size="lg" type="button">Cancel</Button>
                        <Button
                            variant="primary"
                            size="lg"
                            icon={Save}
                            className="shadow-lg shadow-teal-100"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Staff Account'}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Password Display Modal */}
            <Modal
                open={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Staff Account Created Successfully"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            ✅ <strong>{createdUser?.user?.full_name}</strong> has been added as a {createdUser?.user?.role?.replace('_', ' ')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Temporary Password</label>
                        <div className="flex gap-2">
                            <div className="flex-1 p-3 bg-gray-100 border border-gray-200 rounded-lg font-mono text-lg">
                                {createdUser?.temporary_password}
                            </div>
                            <Button
                                variant="ghost"
                                size="md"
                                icon={copied ? Check : Copy}
                                onClick={handleCopyPassword}
                                className={copied ? 'text-green-600' : ''}
                            >
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800">
                            ⚠️ <strong>Important:</strong> Save this password now. The staff member will be required to change it on first login.
                        </p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                            📧 Login credentials have been sent to <strong>{createdUser?.user?.email}</strong>
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button variant="primary" onClick={() => setShowPasswordModal(false)}>
                            Got it, I've saved the password
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageStaff;
