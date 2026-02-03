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
        <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 shadow-xl">
            {/* Brand */}
            <div className="p-6 flex items-center space-x-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md rounded-xl" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">ClinicDesk</h1>
                    <p className="text-[10px] text-primary-400 font-semibold uppercase tracking-widest">AI Workspace</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) => `
              flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden
              ${isActive
                                ? 'bg-gradient-to-r from-primary-500 to-accent-cyan text-white shadow-neon scale-100'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white hover:shadow-sm hover:scale-[1.02]'}
            `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActive ? 'animate-pulse' : 'group-hover:rotate-12'}`} />
                                <span className="relative z-10">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center mb-4 p-2 rounded-xl bg-slate-800/40 border border-white/5 shadow-sm">
                    <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover mr-3 ring-2 ring-white"
                    />
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-200 truncate">{currentUser.name}</p>
                        <p className="text-xs text-slate-400 truncate font-medium">{currentUser.clinic}</p>
                    </div>
                </div>
                <NavLink
                    to="/login"
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
