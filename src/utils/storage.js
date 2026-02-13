import { supabase } from '../lib/supabase';

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in bucket
 * @param {File} file - File to upload
 * @returns {Promise<string>} Public URL of uploaded file
 */
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
};

/**
 * Upload clinic logo
 * @param {string} clinicId - Clinic ID
 * @param {File} file - Logo file
 * @returns {Promise<string>} Public URL
 */
export const uploadClinicLogo = async (clinicId, file) => {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `${clinicId}_logo.${fileExt}`;
  const { error } = await supabase.storage
    .from('clinic-logos')
    .upload(fileName, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('clinic-logos').getPublicUrl(fileName);
  return publicUrl;
};

/**
 * Upload prescription image/PDF
 * @param {string} clinicId - Clinic ID
 * @param {string} patientId - Patient ID
 * @param {File} file - Prescription file
 * @returns {Promise<string>} File path
 */
export const uploadPrescription = async (clinicId, patientId, file) => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const fileName = `${clinicId}/${patientId}/prescription_${timestamp}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('prescriptions')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return fileName;
};

/**
 * Upload patient report
 * @param {string} clinicId - Clinic ID
 * @param {string} patientId - Patient ID
 * @param {File} file - Report file
 * @returns {Promise<string>} File path
 */
export const uploadPatientReport = async (clinicId, patientId, file) => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const fileName = `${clinicId}/${patientId}/report_${timestamp}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('patient-reports')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return fileName;
};

/**
 * Get signed URL for private file
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @param {number} expiresIn - Expiration time in seconds (default 3600)
 * @returns {Promise<string>} Signed URL
 */
export const getSignedUrl = async (bucket, path, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
};

/**
 * Get prescription URL
 * @param {string} path - File path
 * @returns {Promise<string>} Signed URL
 */
export const getPrescriptionUrl = async (path) => {
  return await getSignedUrl('prescriptions', path);
};

/**
 * Get patient report URL
 * @param {string} path - File path
 * @returns {Promise<string>} Signed URL
 */
export const getPatientReportUrl = async (path) => {
  return await getSignedUrl('patient-reports', path);
};

/**
 * Delete file from storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 */
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

/**
 * Delete prescription
 * @param {string} path - File path
 */
export const deletePrescription = async (path) => {
  return await deleteFile('prescriptions', path);
};

/**
 * Delete patient report
 * @param {string} path - File path
 */
export const deletePatientReport = async (path) => {
  return await deleteFile('patient-reports', path);
};

/**
 * List files in a directory
 * @param {string} bucket - Bucket name
 * @param {string} path - Directory path
 * @returns {Promise<Array>} List of files
 */
export const listFiles = async (bucket, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) throw error;
  return data;
};
