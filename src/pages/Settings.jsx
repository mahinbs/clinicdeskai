import React from 'react';
import { User, Lock, Save, LogOut } from 'lucide-react';
import { currentUser } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Settings = () => {
    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Settings</h1>
                <p className="text-sm text-slate-400 mt-1">Manage your account and preferences</p>
            </div>

            <Card title="Profile Information" className="bg-slate-900/40 backdrop-blur-md border border-white/10">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            defaultValue={currentUser.name}
                            icon={User}
                        />
                        <Input
                            label="Clinic Name"
                            defaultValue={currentUser.clinic}
                        />
                    </div>
                    <Input
                        label="Email Address"
                        type="email"
                        defaultValue={currentUser.email}
                        disabled
                        className="bg-slate-800 text-slate-400 cursor-not-allowed border-slate-700/50 focus:ring-0 px-3"
                    />
                    <div className="pt-2 flex justify-end">
                        <Button variant="primary" icon={Save}>Save Changes</Button>
                    </div>
                </form>
            </Card>

            <Card title="Security" className="bg-slate-900/40 backdrop-blur-md border border-white/10">
                <form className="space-y-4">
                    <Input
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                    <div className="pt-2 flex justify-end">
                        <Button variant="secondary" icon={Save}>Update Password</Button>
                    </div>
                </form>
            </Card>

            <div className="pt-4 border-t border-slate-800">
                <Button variant="danger" fullWidth icon={LogOut}>
                    Log Out of All Sessions
                </Button>
            </div>
        </div>
    );
};

export default Settings;
