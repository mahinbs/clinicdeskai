import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import LayoutWrapper from '../components/layout/LayoutWrapper';

// Doctor Pages (Existing)
import Dashboard from '../pages/Dashboard';
import Appointments from '../pages/Appointments';
import Patients from '../pages/Patients';
import PatientHistory from '../pages/PatientHistory';
import Revenue from '../pages/Revenue';
import Settings from '../pages/Settings';

// Master Portal Pages
import MasterDashboard from '../pages/MasterDashboard';
import ManageClinics from '../pages/ManageClinics';

// Clinic Portal Pages
import ClinicDashboard from '../pages/ClinicDashboard';
import ManageStaff from '../pages/ManageStaff';

// Reception Portal Pages
import ReceptionDashboard from '../pages/ReceptionDashboard';
import CheckInPatient from '../pages/CheckInPatient';
import LiveQueue from '../pages/LiveQueue';

import DoctorPrescriptions from '../pages/DoctorPrescriptions';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/signup" element={<Signup />} /> */}

            {/* MASTER PORTAL */}
            <Route path="/master" element={<LayoutWrapper />}>
                <Route index element={<MasterDashboard />} />
                <Route path="clinics" element={<ManageClinics />} />
            </Route>

            {/* CLINIC ADMIN PORTAL */}
            <Route path="/clinic" element={<LayoutWrapper />}>
                <Route index element={<ClinicDashboard />} />
                <Route path="staff" element={<ManageStaff />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* RECEPTION PORTAL */}
            <Route path="/reception" element={<LayoutWrapper />}>
                <Route index element={<ReceptionDashboard />} />
                <Route path="checkin" element={<CheckInPatient />} />
                <Route path="queue" element={<LiveQueue />} />
            </Route>

            {/* DOCTOR PORTAL */}
            <Route path="/doctor" element={<LayoutWrapper />}>
                <Route index element={<Dashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="patients" element={<Patients />} />
                <Route path="patients/:id" element={<PatientHistory />} />
                <Route path="prescriptions" element={<DoctorPrescriptions />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Default Redirect to Login for now, or Doctor if authenticated (mock) */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
