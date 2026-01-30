import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, DollarSign, Settings, LogOut } from 'lucide-react';
import { currentUser } from '../../data/mockData';

const Sidebar = ({ onClose }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: DollarSign, label: 'Revenue', path: '/revenue' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">ClinicDesk AI</h1>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Doctor Dashboard</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) => `
              flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${isActive
                                ? 'bg-blue-50 text-blue-700'
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
                    <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover mr-3 bg-gray-200"
                    />
                    <div>
                        <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
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
