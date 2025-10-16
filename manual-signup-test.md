# Manual Signup Test for "Şahbaz Isı" User

## 🧪 Test Objective
Create a new user account for "Şahbaz Isı" company to test the complete signup process and Shopify integration.

## 📝 Test Data
- **Ad**: Ömer
- **Soyad**: Ünsal
- **Email**: sahbaz@sahbaz.com
- **Telefon**: +90 555 123 4567
- **Şirket**: Şahbaz Isı
- **Şifre**: SahbazIsi2024!
- **Şifre Tekrar**: SahbazIsi2024!

## 🔐 Password Validation
- ✅ Minimum 8 characters: YES
- ✅ Has uppercase: YES
- ✅ Has lowercase: YES
- ✅ Has number: YES
- ✅ Has special character: YES

## 📋 Test Steps

### Step 1: Navigate to Signup Page
1. Open browser
2. Go to `http://localhost:3000/signup`
3. Verify page loads correctly
4. Check form fields are visible

### Step 2: Fill Personal Information
1. **Ad**: Ömer
2. **Soyad**: Ünsal
3. **Email**: sahbaz@sahbaz.com
4. **Telefon**: +90 555 123 4567
5. Click "İleri" button

### Step 3: Fill Company Information
1. **Şirket**: Şahbaz Isı
2. **Şifre**: SahbazIsi2024!
3. **Şifre Tekrar**: SahbazIsi2024!
4. Check "Kullanım Şartları" checkbox
5. Click "Kayıt Ol" button

### Step 4: Verify Success
1. Wait for redirect to dashboard
2. Check user is logged in
3. Verify company name appears
4. Check user role is "tenant_admin"

### Step 5: Test Shopify Integration
1. Navigate to `/integrations/shopify`
2. Check page loads correctly
3. Test connection settings
4. Verify no errors in console

## 🎯 Expected Results
- ✅ User created successfully
- ✅ Redirected to dashboard
- ✅ Tenant created for "Şahbaz Isı"
- ✅ User role: tenant_admin
- ✅ Shopify integration accessible
- ✅ No console errors

## 🚨 Potential Issues
- Password validation errors
- Form submission failures
- Authentication errors
- Database connection issues
- Shopify integration errors

## 📊 Test Results
- [ ] Step 1: Signup page loads
- [ ] Step 2: Personal info form works
- [ ] Step 3: Company info form works
- [ ] Step 4: User creation successful
- [ ] Step 5: Dashboard redirect works
- [ ] Step 6: Shopify integration accessible

## 🔧 Troubleshooting
If issues occur:
1. Check browser console for errors
2. Verify Supabase connection
3. Check database migrations
4. Verify environment variables
5. Check authentication flow

## 📝 Notes
- Test should be performed in a clean environment
- No existing user with same email
- Database should be properly migrated
- All services should be running

