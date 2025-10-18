-- Test Admin Access Script
-- Bu script'i Supabase SQL Editor'da çalıştırarak mevcut kullanıcının role'ünü kontrol edebilir ve super_admin yapabilirsiniz

-- 1. Mevcut kullanıcıları ve role'lerini listele
SELECT 
  id,
  email,
  full_name,
  role,
  tenant_id,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 2. Belirli bir kullanıcıyı super_admin yap (email'i değiştir)
-- UPDATE profiles 
-- SET role = 'super_admin'
-- WHERE email = 'BURAYA_EMAIL_YAZIN@example.com';

-- 3. Yeni bir super admin kullanıcısı oluştur (önce Supabase Auth'da kullanıcı oluşturmalısınız)
-- INSERT INTO profiles (id, email, full_name, role, tenant_id)
-- VALUES (
--   'USER_ID_BURAYA', 
--   'admin@otoniq.ai', 
--   'Super Admin', 
--   'super_admin',
--   NULL
-- );

