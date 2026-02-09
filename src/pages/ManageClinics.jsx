import React from 'react';
import { Building, MapPin, Mail, Save } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ManageClinics = () => {
    return (
        <div className="max-w-6xl space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Onboard New Clinic</h1>
                <p className="text-sm text-gray-500 mt-1">Create a workspace for a new medical center</p>
            </div>

            <Card title="Clinic Details">
                <form className="space-y-4">
                    <Input label="Clinic Name" placeholder="e.g. Sunrise Medical Center" icon={Building} />
                    <Input label="Location" placeholder="e.g. 123 Health St, London" icon={MapPin} />

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Admin Account</h3>
                        <div className="space-y-4">
                            <Input label="Admin Name" placeholder="Full Name" />
                            <Input label="Admin Email" type="email" placeholder="admin@clinic.com" icon={Mail} />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button variant="primary" icon={Save}>Create Clinic</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ManageClinics;
