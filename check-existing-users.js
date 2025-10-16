/**
 * Check existing users in Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ydqqmyhkxczmdnqkswro.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcXFteWhreGN6bWRucWtzd3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzQ5NzEsImV4cCI6MjA1MDA1MDk3MX0.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users...');
    
    // Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth users error:', authError);
    } else {
      console.log('👥 Auth users:', authUsers?.users?.length || 0);
      authUsers?.users?.forEach(user => {
        console.log(`  - ${user.email} (${user.id})`);
      });
    }
    
    // Check profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.error('❌ Profiles error:', profileError);
    } else {
      console.log('📋 Profiles:', profiles?.length || 0);
      profiles?.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.email}) - ${profile.role}`);
      });
    }
    
    // Check tenants
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantError) {
      console.error('❌ Tenants error:', tenantError);
    } else {
      console.log('🏢 Tenants:', tenants?.length || 0);
      tenants?.forEach(tenant => {
        console.log(`  - ${tenant.name} (${tenant.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers();
