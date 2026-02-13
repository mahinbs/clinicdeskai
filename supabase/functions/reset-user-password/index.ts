// Edge Function to reset a user's password to a new temporary password.
// Master Admin can reset any user; Clinic Admin can reset users in their clinic.
// User must change password again on next login.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { generateRandomPassword, formatError } from '../_shared/utils.ts';

interface ResetPasswordRequest {
  user_id: string;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: creator }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !creator) throw new Error('Unauthorized');

    const { data: creatorProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, role, clinic_id')
      .eq('id', creator.id)
      .single();
    if (profileError || !creatorProfile) throw new Error('Creator profile not found');

    const body: ResetPasswordRequest = await req.json();
    const targetUserId = body?.user_id;
    if (!targetUserId) throw new Error('user_id is required');

    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, clinic_id')
      .eq('id', targetUserId)
      .single();
    if (targetError || !targetUser) throw new Error('User not found');

    if (creatorProfile.role === 'master_admin') {
      // Master admin can reset anyone except themselves
      if (targetUserId === creator.id) throw new Error('Cannot reset your own password here');
    } else if (creatorProfile.role === 'clinic_admin') {
      if (targetUser.clinic_id !== creatorProfile.clinic_id) throw new Error('Cannot reset users from other clinics');
    } else {
      throw new Error('Insufficient permissions to reset password');
    }

    const tempPassword = generateRandomPassword(12);

    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password: tempPassword,
    });
    if (updateAuthError) throw new Error(`Failed to update password: ${updateAuthError.message}`);

    const { error: updateProfileError } = await supabaseAdmin
      .from('users')
      .update({ is_temp_password: true, updated_at: new Date().toISOString() })
      .eq('id', targetUserId);
    if (updateProfileError) throw new Error('Failed to set temp password flag');

    const appUrl = Deno.env.get('VITE_APP_URL') || 'https://app.clinicdesk.ai';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ClinicDesk AI <noreply@clinicdesk.ai>',
            to: [targetUser.email],
            subject: 'ClinicDesk AI - Password reset',
            html: `
              <h2>Your password has been reset</h2>
              <p>Dear ${targetUser.full_name},</p>
              <p>An administrator has reset your password. Use the temporary password below to sign in. You will be required to set a new password on first login.</p>
              <p><strong>Email:</strong> ${targetUser.email}</p>
              <p><strong>Temporary password:</strong> ${tempPassword}</p>
              <p>Login at: ${appUrl}</p>
              <p>Please keep this secure and change your password after signing in.</p>
              <br><p>ClinicDesk AI Team</p>
            `,
          }),
        });
      } catch (e) {
        console.error('Email send error:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        temporary_password: tempPassword,
        message: 'Password reset. New temporary password sent via email.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('reset-user-password error:', error);
    return new Response(
      JSON.stringify({ success: false, error: formatError(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
