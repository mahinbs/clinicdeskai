import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import MasterLogin from '../pages/MasterLogin';
import ChangePassword from '../pages/ChangePassword';
import NotFound from '../pages/NotFound';
import LayoutWrapper from '../components/layout/LayoutWrapper';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { getDefaultRoute } from '../utils/auth';

function ChangePasswordGuard() {
  const { isAuthenticated, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }
  if (!isAuthenticated || !profile) return <Navigate to="/login" replace />;
  if (profile.role === 'master_admin' || !profile.is_temp_password) {
    return <Navigate to={getDefaultRoute(profile)} replace />;
  }
  return <ChangePassword />;
}

/** Root path: if logged in send to their portal, else to login. */
function RootRedirect() {
  const { isAuthenticated, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }
  if (isAuthenticated && profile) {
    return <Navigate to={getDefaultRoute(profile)} replace />;
  }
  return <Navigate to="/login" replace />;
}

/** No matching route: if logged in show 404 (wrong/forced URL), else send to login. */
function CatchAllRedirect() {
  const { isAuthenticated, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }
  if (isAuthenticated && profile) {
    return <NotFound />;
  }
  return <Navigate to="/login" replace />;
}

import Dashboard from '../pages/Dashboard';
import Appointments from '../pages/Appointments';
import Patients from '../pages/Patients';
import PatientHistory from '../pages/PatientHistory';
import Revenue from '../pages/Revenue';
import Settings from '../pages/Settings';

import MasterDashboard from '../pages/MasterDashboard';
import ManageClinics from '../pages/ManageClinics';
import ManageClinic from '../pages/ManageClinic';

import ClinicDashboard from '../pages/ClinicDashboard';
import ManageStaff from '../pages/ManageStaff';

import ReceptionDashboard from '../pages/ReceptionDashboard';
import CheckInPatient from '../pages/CheckInPatient';
import LiveQueue from '../pages/LiveQueue';

import DoctorPrescriptions from '../pages/DoctorPrescriptions';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/master/login" element={<MasterLogin />} />
      <Route path="/change-password" element={<ChangePasswordGuard />} />

      <Route path="/master" element={<ProtectedRoute allowedRoles={['master_admin']} loginPath="/master/login"><LayoutWrapper /></ProtectedRoute>}>
        <Route index element={<MasterDashboard />} />
        <Route path="clinics" element={<ManageClinics />} />
        <Route path="clinics/:clinicId" element={<ManageClinic />} />
      </Route>

      <Route path="/clinic" element={<ProtectedRoute allowedRoles={['clinic_admin']}><LayoutWrapper /></ProtectedRoute>}>
        <Route index element={<ClinicDashboard />} />
        <Route path="staff" element={<ManageStaff />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/reception" element={<ProtectedRoute allowedRoles={['receptionist']}><LayoutWrapper /></ProtectedRoute>}>
        <Route index element={<ReceptionDashboard />} />
        <Route path="checkin" element={<CheckInPatient />} />
        <Route path="queue" element={<LiveQueue />} />
      </Route>

      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><LayoutWrapper /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="queue" element={<LiveQueue />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientHistory />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
