// Edge Function to create users with temporary password
// This function is called by Master Admin (to create Clinic Admin)
// or by Clinic Admin (to create Doctor/Receptionist)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { generateRandomPassword, formatError } from '../_shared/utils.ts';

interface CreateUserRequest {
  email: string;
  full_name: string;
  role: 'clinic_admin' | 'doctor' | 'receptionist';
  clinic_id?: string;
  phone?: string;
  specialization?: string;
  is_also_doctor?: boolean;
  degree?: string;
  experience_years?: number;
  experience_since_year?: number; // Year started practice - experience auto-updates every year
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get Supabase client with service role (has admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the user from the request (the one creating the new user)
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: creator }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !creator) {
      throw new Error('Unauthorized');
    }

    // Get creator's profile to check permissions
    const { data: creatorProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*, clinic:clinics(*)')
      .eq('id', creator.id)
      .single();

    if (profileError || !creatorProfile) {
      throw new Error('Creator profile not found');
    }

    // Parse request body
    const requestData: CreateUserRequest = await req.json();
    const { email, full_name, role, clinic_id, phone, specialization, is_also_doctor, degree, experience_years, experience_since_year } = requestData;

    // Validate required fields
    if (!email || !full_name || !role) {
      throw new Error('Missing required fields: email, full_name, role');
    }

    const isDoctorRole = role === 'doctor' || (role === 'clinic_admin' && is_also_doctor);
    const hasExperience = experience_years != null && experience_years >= 0;
    const hasSinceYear = experience_since_year != null && experience_since_year >= 1980 && experience_since_year <= new Date().getFullYear();
    if (isDoctorRole && !hasExperience && !hasSinceYear) {
      throw new Error('Experience (years) or Year started practice is required for doctors');
    }

    // Permission checks
    if (creatorProfile.role === 'master_admin') {
      // Master admin can only create clinic admins
      if (role !== 'clinic_admin') {
        throw new Error('Master admin can only create clinic admins');
      }
      if (!clinic_id) {
        throw new Error('clinic_id is required when creating clinic admin');
      }
    } else if (creatorProfile.role === 'clinic_admin') {
      // Clinic admin can create doctors and receptionists in their clinic
      if (role !== 'doctor' && role !== 'receptionist') {
        throw new Error('Clinic admin can only create doctors or receptionists');
      }
      // Use the creator's clinic_id
      if (clinic_id && clinic_id !== creatorProfile.clinic_id) {
        throw new Error('Cannot create user for a different clinic');
      }
    } else {
      throw new Error('Insufficient permissions to create users');
    }

    // Determine the actual clinic_id to use
    const actualClinicId = creatorProfile.role === 'master_admin' ? clinic_id : creatorProfile.clinic_id;

    // Verify clinic exists and is active
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .select('id, name, status')
      .eq('id', actualClinicId)
      .single();

    if (clinicError || !clinic) {
      throw new Error('Clinic not found');
    }

    if (clinic.status !== 'active') {
      throw new Error('Cannot create user for suspended clinic');
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword(12);

    // Create auth user
    const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name,
        role: role,
      },
    });

    if (createAuthError) {
      throw new Error(`Failed to create auth user: ${createAuthError.message}`);
    }

    // Create user profile in users table
    const { data: newUser, error: createUserError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        clinic_id: actualClinicId,
        role: role,
        full_name: full_name,
        email: email,
        phone: phone,
        specialization: specialization,
        degree: isDoctorRole ? (degree || null) : null,
        experience_years: isDoctorRole ? (experience_years ?? (hasSinceYear ? new Date().getFullYear() - experience_since_year! : null)) : null,
        experience_since_year: isDoctorRole ? (experience_since_year ?? null) : null,
        is_also_doctor: role === 'clinic_admin' ? (is_also_doctor ?? false) : false,
        is_temp_password: true,
        status: 'active',
        created_by: creator.id,
      })
      .select()
      .single();

    if (createUserError) {
      // If user profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create user profile: ${createUserError.message}`);
    }

    // Send email with credentials via Resend
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendApiKey) {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ClinicDesk AI <noreply@clinicdesk.ai>',
            to: [email],
            subject: 'Welcome to ClinicDesk AI - Your Account Credentials',
            html: `
              <h2>Welcome to ClinicDesk AI</h2>
              <p>Dear ${full_name},</p>
              <p>Your account has been created for <strong>${clinic.name}</strong>.</p>
              <p><strong>Role:</strong> ${role.replace('_', ' ').toUpperCase()}</p>
              <br>
              <p><strong>Login Credentials:</strong></p>
              <p>Email: ${email}</p>
              <p>Temporary Password: <strong>${tempPassword}</strong></p>
              <br>
              <p style="color: #dc2626;"><strong>Important:</strong> You will be required to change your password on first login.</p>
              <p>Please keep these credentials secure and do not share them with anyone.</p>
              <br>
              <p>Login at: ${Deno.env.get('VITE_APP_URL') || 'https://app.clinicdesk.ai'}</p>
              <br>
              <p>If you have any questions, please contact your administrator.</p>
              <br>
              <p>Best regards,<br>ClinicDesk AI Team</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email:', await emailResponse.text());
        }
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    // Create audit log
    await supabaseAdmin.from('audit_logs').insert({
      clinic_id: actualClinicId,
      user_id: creator.id,
      action: 'create_user',
      resource_type: 'user',
      resource_id: newUser.id,
      new_values: {
        email: email,
        full_name: full_name,
        role: role,
      },
    });

    // Return success response with user details and temp password
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          clinic_id: newUser.clinic_id,
        },
        temporary_password: tempPassword,
        message: 'User created successfully. Credentials sent via email.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );

  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: formatError(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
