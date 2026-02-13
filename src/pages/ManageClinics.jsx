import React, { useState, useRef } from 'react';
import { Building, MapPin, Mail, Save, Copy, CheckCircle, AlertCircle, Image, Palette, Upload } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { createClinic, updateClinic } from '../utils/database';
import { uploadClinicLogo } from '../utils/storage';
import { supabase } from '../lib/supabase';

const DEFAULT_THEME = { primaryColor: '#0d9488', secondaryColor: '#10b981' };

const ManageClinics = () => {
  const [clinicName, setClinicName] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_THEME.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_THEME.secondaryColor);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [isAlsoDoctor, setIsAlsoDoctor] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [degree, setDegree] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [experienceSinceYear, setExperienceSinceYear] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);
  const logoInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!clinicName.trim()) {
      setError('Clinic name is required.');
      return;
    }
    if (!adminName.trim() || !adminEmail.trim()) {
      setError('Admin name and email are required.');
      return;
    }
    if (isAlsoDoctor) {
      const sinceYear = experienceSinceYear ? parseInt(experienceSinceYear, 10) : null;
      const exp = experienceYears ? parseInt(experienceYears, 10) : NaN;
      if (!sinceYear && (!Number.isInteger(exp) || exp < 0)) {
        setError('Set either "Year started practice" or "Experience (years)" when Clinic Admin is also a Doctor.');
        return;
      }
    }
    setLoading(true);
    try {
      const clinic = await createClinic({
        name: clinicName.trim(),
        address: address.trim() || null,
        status: 'active',
        logo_url: logoUrl.trim() || null,
        theme: {
          primaryColor: primaryColor || DEFAULT_THEME.primaryColor,
          secondaryColor: secondaryColor || DEFAULT_THEME.secondaryColor,
        },
      });

      if (logoFile && clinic?.id) {
        try {
          const publicUrl = await uploadClinicLogo(clinic.id, logoFile);
          await updateClinic(clinic.id, { logo_url: publicUrl });
        } catch (uploadErr) {
          console.error('Logo upload failed:', uploadErr);
        }
        setLogoFile(null);
        if (logoInputRef.current) logoInputRef.current.value = '';
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session expired. Please sign in again.');
      const { data: fnData, error: fnError } = await supabase.functions.invoke('create-user', {
        body: {
          email: adminEmail.trim(),
          full_name: adminName.trim(),
          role: 'clinic_admin',
          clinic_id: clinic.id,
          is_also_doctor: isAlsoDoctor,
          specialization: isAlsoDoctor ? specialization.trim() : null,
          degree: isAlsoDoctor ? (degree.trim() || null) : null,
          experience_years: isAlsoDoctor && !experienceSinceYear ? parseInt(experienceYears, 10) : undefined,
          experience_since_year: isAlsoDoctor && experienceSinceYear ? parseInt(experienceSinceYear, 10) : undefined,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw fnError;
      if (fnData?.success === false) throw new Error(fnData?.error || 'Failed to create admin');

      setResult({
        email: adminEmail.trim(),
        temporary_password: fnData?.temporary_password || '—',
        clinic_name: clinic.name,
        message: fnData?.message || 'Credentials sent to admin email.',
      });

      setClinicName('');
      setAddress('');
      setLogoUrl('');
      setLogoFile(null);
      setPrimaryColor(DEFAULT_THEME.primaryColor);
      setSecondaryColor(DEFAULT_THEME.secondaryColor);
      setAdminName('');
      setAdminEmail('');
      setIsAlsoDoctor(true);
      setSpecialization('');
      setDegree('');
      setExperienceYears('');
      setExperienceSinceYear('');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (result?.temporary_password) {
      navigator.clipboard.writeText(result.temporary_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setResult(null);
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Onboard New Clinic</h1>
        <p className="text-sm text-gray-500 mt-1">Create a workspace for a new medical center</p>
      </div>

      <Modal open={!!result} onClose={closeModal}>
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-teal-100 text-teal-600 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">Clinic created successfully</h3>
            <p className="text-sm text-gray-600 mt-1">{result?.clinic_name}</p>
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinic Admin Email</p>
                <p className="font-mono font-semibold text-gray-900 mt-0.5">{result?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Temporary Password (show once)</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 font-mono text-sm font-bold text-gray-900 break-all">
                    {result?.temporary_password}
                  </code>
                  <Button variant="outline" size="sm" icon={copied ? CheckCircle : Copy} onClick={copyPassword} className="shrink-0">
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-teal-700 font-medium flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {result?.message}
              </p>
            </div>
            <Button type="button" variant="primary" fullWidth className="mt-6" onClick={closeModal}>
              Yes, I have saved it
            </Button>
          </div>
        </div>
      </Modal>

      <Card title="Clinic Details">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Input
            label="Clinic Name"
            placeholder="e.g. Sunrise Medical Center"
            icon={Building}
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            required
          />
          <Input
            label="Location / Address"
            placeholder="e.g. 123 Health St, London"
            icon={MapPin}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" /> Clinic branding
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setLogoFile(f);
                      if (!f) setLogoFile(null);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    icon={Upload}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoFile ? logoFile.name : 'Upload logo'}
                  </Button>
                  {logoFile && (
                    <button
                      type="button"
                      onClick={() => { setLogoFile(null); if (logoInputRef.current) logoInputRef.current.value = ''; }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG or WebP. Max 5MB. Uploaded after clinic is created.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or paste logo URL</label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Primary color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">Secondary color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Admin Account</h3>
            <div className="space-y-4">
              <Input
                label="Admin Name"
                placeholder="Full Name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@clinic.com"
                icon={Mail}
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              
              {/* Checkbox: Is clinic admin also a doctor? */}
              <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-teal-50/30">
                <input
                  type="checkbox"
                  id="isAlsoDoctor"
                  checked={isAlsoDoctor}
                  onChange={(e) => setIsAlsoDoctor(e.target.checked)}
                  className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="isAlsoDoctor" className="flex-1 cursor-pointer">
                  <span className="text-sm font-semibold text-gray-900">Clinic Admin is also a Doctor</span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Check this if the admin will also see patients and manage appointments
                  </p>
                </label>
              </div>

              {/* Show specialization field if is_also_doctor is checked */}
              {isAlsoDoctor && (
                <>
                  <Input
                    label="Specialization (as Doctor)"
                    placeholder="e.g. General Physician, Cardiologist"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                  <Input
                    label="Degree (optional)"
                    placeholder="e.g. MBBS, MD, MS"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year started practice (optional — experience auto-updates every year)</label>
                    <select
                      value={experienceSinceYear}
                      onChange={(e) => setExperienceSinceYear(e.target.value)}
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
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    disabled={!!experienceSinceYear}
                  />
                </>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" icon={Save} disabled={loading}>
              {loading ? 'Creating…' : 'Create Clinic'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManageClinics;
