#!/usr/bin/env node
/**
 * One-time script to create the Master Admin user in Supabase.
 *
 * Run with (do NOT commit SERVICE_ROLE_KEY to git):
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/create-master-admin.mjs
 *
 * Optional env overrides:
 *   MASTER_ADMIN_EMAIL=master@clinicdesk.ai
 *   MASTER_ADMIN_PASSWORD=12Master@Clinic
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.MASTER_ADMIN_EMAIL || 'master@clinicdesk.ai';
const PASSWORD = process.env.MASTER_ADMIN_PASSWORD || '12Master@Clinic';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in the environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('Creating Master Admin:', EMAIL);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Master Admin' },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('User already exists. Fetching existing user...');
      const { data: existing } = await supabase.auth.admin.listUsers();
      const user = existing?.users?.find((u) => u.email === EMAIL);
      if (user) {
        const { error: insertError } = await supabase.from('users').upsert(
          {
            id: user.id,
            role: 'master_admin',
            full_name: 'Master Admin',
            email: EMAIL,
            is_temp_password: false,
            status: 'active',
          },
          { onConflict: 'id' }
        );
        if (insertError) {
          console.error('Upsert users row failed:', insertError.message);
          process.exit(1);
        }
        console.log('Master Admin profile updated in public.users. You can sign in at:', EMAIL);
        return;
      }
    }
    console.error('Auth create failed:', authError.message);
    process.exit(1);
  }

  const { error: insertError } = await supabase.from('users').insert({
    id: authData.user.id,
    role: 'master_admin',
    full_name: 'Master Admin',
    email: EMAIL,
    is_temp_password: false,
    status: 'active',
  });

  if (insertError) {
    console.error('Insert into users failed:', insertError.message);
    process.exit(1);
  }

  console.log('Master Admin created successfully.');
  console.log('Email:', EMAIL);
  console.log('Sign in at your app login page.');
}

main();
