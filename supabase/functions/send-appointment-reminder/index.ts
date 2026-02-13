// Edge Function to send WhatsApp appointment reminders
// This runs as a scheduled cron job to check for upcoming appointments

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { formatError } from '../_shared/utils.ts';

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get Supabase client with service role
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

    // Calculate time range: 5-6 hours from now
    const now = new Date();
    const startTime = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours from now
    const endTime = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now

    // Get appointments that need reminders
    // - Scheduled for 5-6 hours from now
    // - Status is 'scheduled'
    // - Reminder not yet sent
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:users!appointments_doctor_id_fkey(*),
        clinic:clinics(*)
      `)
      .eq('status', 'scheduled')
      .is('reminder_sent_at', null)
      .gte('appointment_date', startTime.toISOString().split('T')[0])
      .lte('appointment_date', endTime.toISOString().split('T')[0]);

    if (appointmentsError) {
      throw new Error(`Failed to fetch appointments: ${appointmentsError.message}`);
    }

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No appointments found that need reminders',
          count: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Filter appointments by time slot
    const appointmentsToRemind = appointments.filter((apt) => {
      const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.time_slot}`);
      return appointmentDateTime >= startTime && appointmentDateTime <= endTime;
    });

    const results = [];
    const whatsappApiUrl = Deno.env.get('WHATSAPP_API_URL');
    const whatsappApiToken = Deno.env.get('WHATSAPP_API_TOKEN');

    // Send reminders
    for (const appointment of appointmentsToRemind) {
      try {
        const { patient, doctor, clinic } = appointment;

        if (!patient?.phone) {
          console.log(`Skipping appointment ${appointment.id} - no patient phone`);
          continue;
        }

        // Format appointment details
        const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const appointmentTime = new Date(`2000-01-01T${appointment.time_slot}`).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        // Create reminder message
        const message = `*${clinic.name} - Appointment Reminder*\n\n` +
          `Dear ${patient.full_name},\n\n` +
          `This is a reminder for your upcoming appointment:\n\n` +
          `📅 Date: ${appointmentDate}\n` +
          `⏰ Time: ${appointmentTime}\n` +
          `👨‍⚕️ Doctor: ${doctor.full_name}\n` +
          (appointment.token_number ? `🎫 Token: ${appointment.token_number}\n` : '') +
          `\n` +
          `📍 ${clinic.address || 'Please contact clinic for address'}\n\n` +
          `Please arrive 10 minutes before your scheduled time.\n\n` +
          `For any changes or cancellations, please contact us.\n\n` +
          `Thank you!`;

        // Send WhatsApp message
        if (whatsappApiUrl && whatsappApiToken) {
          const whatsappResponse = await fetch(whatsappApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappApiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: patient.phone,
              message: message,
            }),
          });

          if (!whatsappResponse.ok) {
            throw new Error(`WhatsApp API error: ${await whatsappResponse.text()}`);
          }
        }

        // Update appointment to mark reminder as sent
        await supabaseAdmin
          .from('appointments')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', appointment.id);

        // Log to notification queue for tracking
        await supabaseAdmin.from('notification_queue').insert({
          clinic_id: appointment.clinic_id,
          notification_type: 'appointment_reminder',
          recipient_type: 'patient',
          recipient_id: patient.id,
          recipient_phone: patient.phone,
          message_template: 'appointment_reminder',
          message_data: {
            appointment_id: appointment.id,
            patient_name: patient.full_name,
            doctor_name: doctor.full_name,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
          },
          scheduled_for: startTime.toISOString(),
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

        results.push({
          appointment_id: appointment.id,
          patient: patient.full_name,
          status: 'sent',
        });

      } catch (error) {
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
        results.push({
          appointment_id: appointment.id,
          patient: appointment.patient?.full_name,
          status: 'failed',
          error: formatError(error),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} appointment reminders`,
        results: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-appointment-reminder function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: formatError(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
