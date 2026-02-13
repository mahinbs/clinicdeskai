// Edge Function to send WhatsApp billing messages with invoice
// This is triggered when an appointment is marked as completed and billing is generated

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { formatError } from '../_shared/utils.ts';

interface SendBillingRequest {
  billing_id: string;
}

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

    // Parse request body
    const requestData: SendBillingRequest = await req.json();
    const { billing_id } = requestData;

    if (!billing_id) {
      throw new Error('Missing required field: billing_id');
    }

    // Get billing details with related data
    const { data: billing, error: billingError } = await supabaseAdmin
      .from('billing')
      .select(`
        *,
        patient:patients(*),
        appointment:appointments(
          *,
          doctor:users!appointments_doctor_id_fkey(*)
        ),
        clinic:clinics(*)
      `)
      .eq('id', billing_id)
      .single();

    if (billingError || !billing) {
      throw new Error(`Billing record not found: ${billingError?.message}`);
    }

    // Check if message already sent
    if (billing.whatsapp_sent_at) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Billing message already sent',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { patient, clinic, appointment } = billing;

    if (!patient?.phone) {
      throw new Error('Patient phone number not found');
    }

    // Format invoice details
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    };

    // Build invoice message
    let message = `*${clinic.name}*\n`;
    message += `*INVOICE*\n\n`;
    message += `Invoice No: ${billing.invoice_number}\n`;
    message += `Date: ${new Date(billing.created_at).toLocaleDateString('en-IN')}\n\n`;
    
    message += `*Patient Details*\n`;
    message += `Name: ${patient.full_name}\n`;
    message += `Patient ID: ${patient.patient_id_number}\n\n`;

    if (appointment?.doctor) {
      message += `*Consultation*\n`;
      message += `Doctor: ${appointment.doctor.full_name}\n`;
      message += `Date: ${new Date(appointment.appointment_date).toLocaleDateString('en-IN')}\n\n`;
    }

    message += `*Bill Details*\n`;
    message += `Consultation Fee: ${formatCurrency(billing.consultation_fee)}\n`;
    
    if (billing.medication_charges > 0) {
      message += `Medication Charges: ${formatCurrency(billing.medication_charges)}\n`;
    }

    // Add additional charges if any
    if (billing.additional_charges && billing.additional_charges.length > 0) {
      billing.additional_charges.forEach((charge: any) => {
        message += `${charge.description}: ${formatCurrency(charge.amount)}\n`;
      });
    }

    if (billing.discount > 0) {
      message += `Discount: -${formatCurrency(billing.discount)}\n`;
    }

    message += `\n*Total Amount: ${formatCurrency(billing.total_amount)}*\n`;
    message += `Payment Mode: ${billing.payment_mode.toUpperCase()}\n`;
    message += `Status: ${billing.status === 'paid' ? '✅ PAID' : '⏳ PENDING'}\n\n`;

    if (billing.notes) {
      message += `Note: ${billing.notes}\n\n`;
    }

    message += `Thank you for visiting ${clinic.name}!\n`;
    if (clinic.contact_phone) {
      message += `Contact: ${clinic.contact_phone}\n`;
    }
    message += `\n_This is an automated message._`;

    // Send WhatsApp message
    const whatsappApiUrl = Deno.env.get('WHATSAPP_API_URL');
    const whatsappApiToken = Deno.env.get('WHATSAPP_API_TOKEN');

    if (!whatsappApiUrl || !whatsappApiToken) {
      throw new Error('WhatsApp API credentials not configured');
    }

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
      const errorText = await whatsappResponse.text();
      throw new Error(`WhatsApp API error: ${errorText}`);
    }

    // Update billing record to mark WhatsApp as sent
    await supabaseAdmin
      .from('billing')
      .update({ whatsapp_sent_at: new Date().toISOString() })
      .eq('id', billing_id);

    // Log to notification queue
    await supabaseAdmin.from('notification_queue').insert({
      clinic_id: billing.clinic_id,
      notification_type: 'billing',
      recipient_type: 'patient',
      recipient_id: patient.id,
      recipient_phone: patient.phone,
      message_template: 'billing_invoice',
      message_data: {
        billing_id: billing.id,
        invoice_number: billing.invoice_number,
        patient_name: patient.full_name,
        total_amount: billing.total_amount,
        payment_mode: billing.payment_mode,
      },
      scheduled_for: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      status: 'sent',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Billing message sent successfully',
        invoice_number: billing.invoice_number,
        recipient: patient.full_name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-billing-message function:', error);
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
