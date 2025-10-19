-- Debug Login Tracking System
-- Bu migration login tracking sistemini test eder

-- 1. Tester kullanıcısının ID'sini bul
DO $$
DECLARE
    tester_user_id UUID;
    tester_email TEXT := 'tester@tester.com';
BEGIN
    -- Tester kullanıcısının ID'sini bul
    SELECT id INTO tester_user_id 
    FROM auth.users 
    WHERE email = tester_email;
    
    IF tester_user_id IS NOT NULL THEN
        RAISE NOTICE 'Tester user found: %', tester_user_id;
        
        -- Manuel olarak son giriş tarihini şimdiye ayarla
        UPDATE public.users 
        SET last_sign_in_at = NOW() 
        WHERE id = tester_user_id;
        
        RAISE NOTICE 'Tester user last_sign_in_at updated to: %', NOW();
        
        -- Durumu kontrol et
        SELECT 
            id,
            email,
            last_sign_in_at,
            CASE 
                WHEN last_sign_in_at > (NOW() - INTERVAL '30 days') THEN 'active'
                ELSE 'inactive'
            END as status
        FROM public.users 
        WHERE id = tester_user_id;
        
    ELSE
        RAISE NOTICE 'Tester user not found in auth.users';
    END IF;
END $$;

-- 2. Tüm kullanıcıların durumunu kontrol et
SELECT 
    u.id,
    u.email,
    u.last_sign_in_at,
    CASE 
        WHEN u.last_sign_in_at > (NOW() - INTERVAL '30 days') THEN 'active'
        ELSE 'inactive'
    END as status,
    COALESCE(t.company_name, 'Şirket bilgisi yok') as company_name
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
ORDER BY u.last_sign_in_at DESC NULLS LAST;
