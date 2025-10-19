-- ============================================================================
-- CREATE SUPER ADMIN USER
-- ============================================================================

-- Super admin kullanıcısını oluştur
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@otoniq.ai',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Super admin profilini oluştur
INSERT INTO public.users (
  id,
  tenant_id,
  email,
  role,
  full_name,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  NULL, -- Super admin'de tenant_id NULL
  'admin@otoniq.ai',
  'super_admin',
  'Super Admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Super admin için profil oluştur
INSERT INTO public.profiles (
  id,
  tenant_id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  NULL, -- Super admin'de tenant_id NULL
  'admin@otoniq.ai',
  'Super Admin',
  'super_admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Test tenant oluştur (super admin için)
INSERT INTO public.tenants (
  id,
  company_name,
  domain,
  subscription_plan,
  subscription_status,
  settings,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'OTONIQ Test Tenant',
  'test.otoniq.ai',
  'enterprise',
  'active',
  '{}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Test kullanıcısı oluştur
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@otoniq.ai',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Test kullanıcısı profilini oluştur
INSERT INTO public.users (
  id,
  tenant_id,
  email,
  role,
  full_name,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'test@otoniq.ai',
  'tenant_admin',
  'Test User',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Test kullanıcısı için profil oluştur
INSERT INTO public.profiles (
  id,
  tenant_id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'test@otoniq.ai',
  'Test User',
  'tenant_admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
