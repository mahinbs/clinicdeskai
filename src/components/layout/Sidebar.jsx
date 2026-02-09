import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Users, FileText, DollarSign, Settings, LogOut,
    Building, UserPlus, ClipboardList, Activity
} from 'lucide-react';
import { currentUser } from '../../data/mockData';

const Sidebar = ({ onClose }) => {
    // Define menu items for each role
    const menus = {
        master: [
            { icon: LayoutDashboard, label: 'Master Dashboard', path: '/master', end: true },
            { icon: Building, label: 'Manage Clinics', path: '/master/clinics' },
        ],
        clinic_admin: [
            { icon: LayoutDashboard, label: 'Clinic Dashboard', path: '/clinic', end: true },
            { icon: Users, label: 'Manage Staff', path: '/clinic/staff' },
            { icon: Settings, label: 'Clinic Settings', path: '/clinic/settings' },
        ],
        receptionist: [
            { icon: LayoutDashboard, label: 'Front Desk', path: '/reception', end: true },
            { icon: Users, label: 'Check In Patient', path: '/reception/checkin' },
            { icon: Activity, label: 'Live Queue', path: '/reception/queue' },
        ],
        doctor: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor', end: true },
            { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
            { icon: Users, label: 'Patients', path: '/doctor/patients' },
            { icon: FileText, label: 'Prescriptions', path: '/doctor/prescriptions' }, // New
            { icon: DollarSign, label: 'Revenue', path: '/doctor/revenue' },
            { icon: Settings, label: 'Settings', path: '/doctor/settings' },
        ]
    };

    // Default to doctor if role unknown (fallback)
    const role = currentUser.role || 'doctor';
    const navItems = menus[role] || menus['doctor'];

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Brand */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">ClinicDesk AI</h1>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                    {role.replace('_', ' ')} Portal
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={onClose}
                        className={({ isActive }) => `
              flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${isActive
                                ? 'bg-teal-50 text-teal-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
            `}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3">
                        {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.clinic}</p>
                    </div>
                </div>
                <NavLink
                    to="/login"
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
