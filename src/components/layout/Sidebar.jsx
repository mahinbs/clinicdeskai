import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, FileText, DollarSign, Settings, LogOut,
  Building, UserPlus, ClipboardList, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleDisplayName } from '../../utils/auth';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const menus = {
    master: [
      { icon: LayoutDashboard, label: 'Master Dashboard', path: '/master', end: true },
      { icon: Building, label: 'Manage Clinics', path: '/master/clinics' },
    ],
    clinic_admin: [
      { icon: LayoutDashboard, label: 'Clinic Dashboard', path: '/clinic', end: true },
      { icon: Users, label: 'Manage Staff', path: '/clinic/staff' },
      { icon: DollarSign, label: 'Revenue', path: '/clinic/revenue' },
      { icon: Settings, label: 'Clinic Settings', path: '/clinic/settings' },
    ],
    receptionist: [
      { icon: LayoutDashboard, label: 'Front Desk', path: '/reception', end: true },
      { icon: Users, label: 'Check In Patient', path: '/reception/checkin' },
      { icon: Activity, label: 'Live Queue', path: '/reception/queue' },
    ],
    doctor: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor', end: true },
      { icon: Activity, label: 'My Queue', path: '/doctor/queue' },
      { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
      { icon: Users, label: 'Patients', path: '/doctor/patients' },
      { icon: FileText, label: 'Prescriptions', path: '/doctor/prescriptions' },
      { icon: DollarSign, label: 'Revenue', path: '/doctor/revenue' },
      { icon: Settings, label: 'Settings', path: '/doctor/settings' },
    ]
  };

  const roleKey = profile?.role === 'master_admin' ? 'master' : profile?.role;
  const navItems = menus[roleKey] || menus.doctor;
  const displayRole = getRoleDisplayName(profile?.role);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">ClinicDesk AI</h1>
        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
          {displayRole} Portal
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
            `}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3">
            {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.clinic?.name || profile?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
