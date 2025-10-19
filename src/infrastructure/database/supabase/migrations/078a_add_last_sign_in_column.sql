-- Migration: Add last_sign_in_at column to users table
-- Description: users tablosuna last_sign_in_at kolonu ekleme

-- 1. last_sign_in_at kolonu ekle
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- 2. Index ekle
CREATE INDEX IF NOT EXISTS idx_users_last_sign_in_at ON public.users(last_sign_in_at);

-- 3. Kolon açıklaması ekle
COMMENT ON COLUMN public.users.last_sign_in_at IS 'Kullanıcının son giriş tarihi ve saati';
