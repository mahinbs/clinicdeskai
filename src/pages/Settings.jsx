import React from 'react';
import { User, Lock, Save, LogOut } from 'lucide-react';
import { currentUser } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Settings = () => {
    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
            </div>

            <Card title="Profile Information">
                <form className="space-y-4">
                    <Input
                        label="Full Name"
                        defaultValue={currentUser.name}
                        icon={User}
                    />
                    <Input
                        label="Clinic Name"
                        defaultValue={currentUser.clinic}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        defaultValue={currentUser.email}
                        disabled
                        className="bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <div className="pt-4 flex justify-end">
                        <Button variant="primary" icon={Save}>Save Changes</Button>
                    </div>
                </form>
            </Card>

            <Card title="Security">
                <form className="space-y-4">
                    <Input
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                    />
                    <Input
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                    />
                    <div className="pt-4 flex justify-end">
                        <Button variant="secondary" icon={Save}>Update Password</Button>
                    </div>
                </form>
            </Card>

            <div className="pt-4 border-t border-gray-200">
                <Button variant="danger" fullWidth icon={LogOut}>
                    Log Out of All Sessions
                </Button>
            </div>
        </div>
    );
};

export default Settings;
