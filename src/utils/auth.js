import { supabase, getUserProfile } from '../lib/supabase';

// Role hierarchy for permission checks
const roleHierarchy = {
  master_admin: 4,
  clinic_admin: 3,
  doctor: 2,
  receptionist: 1,
};

// Check if user has specific role
export const hasRole = (userRole, requiredRole) => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Check if user is master admin
export const isMasterAdmin = (user) => {
  return user?.role === 'master_admin';
};

// Check if user is clinic admin
export const isClinicAdmin = (user) => {
  return user?.role === 'clinic_admin';
};

// Check if user is doctor
export const isDoctor = (user) => {
  return user?.role === 'doctor';
};

// Check if user is receptionist
export const isReceptionist = (user) => {
  return user?.role === 'receptionist';
};

// Check if user can manage other users
export const canManageUser = (currentUser, targetUser) => {
  // Master admin can manage everyone except themselves
  if (isMasterAdmin(currentUser)) {
    return true;
  }

  // Clinic admin can manage doctors and receptionists in their clinic
  if (isClinicAdmin(currentUser)) {
    return (
      currentUser.clinic_id === targetUser.clinic_id &&
      (targetUser.role === 'doctor' || targetUser.role === 'receptionist')
    );
  }

  // Others cannot manage users
  return false;
};

// Check if user needs to change password
export const needsPasswordChange = (user) => {
  return user?.is_temp_password === true;
};

// Get user's full profile with clinic info
export const getFullUserProfile = async (userId) => {
  try {
    const profile = await getUserProfile(userId);
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Check if clinic is active
export const isClinicActive = (user) => {
  if (isMasterAdmin(user)) return true;
  return user?.clinic?.status === 'active';
};

// Check if user is active
export const isUserActive = (user) => {
  return user?.status === 'active';
};

// Check if user has full access (active status + active clinic)
export const hasFullAccess = (user) => {
  return isUserActive(user) && isClinicActive(user);
};

// Get user's permission level
export const getPermissionLevel = (user) => {
  return roleHierarchy[user?.role] || 0;
};

// Get redirect path based on user role
export const getDefaultRoute = (user) => {
  switch (user?.role) {
    case 'master_admin':
      return '/master';
    case 'clinic_admin':
      return '/clinic';
    case 'doctor':
      return '/doctor';
    case 'receptionist':
      return '/reception';
    default:
      return '/login';
  }
};

// Format user display name
export const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  return user.full_name || user.email;
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    master_admin: 'Master Admin',
    clinic_admin: 'Clinic Admin',
    doctor: 'Doctor',
    receptionist: 'Receptionist',
  };
  return roleNames[role] || role;
};

// Create audit log entry
export const createAuditLog = async (action, resourceType, resourceId, oldValues, newValues) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const profile = await getUserProfile(user.id);

    await supabase.from('audit_logs').insert({
      clinic_id: profile.clinic_id,
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};
