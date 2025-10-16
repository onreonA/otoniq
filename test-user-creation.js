/**
 * Test User Creation Script
 * Creates "Şahbaz Isı" company user for testing
 */

const testUserData = {
  firstName: 'Ömer',
  lastName: 'Ünsal',
  email: 'sahbaz@sahbaz.com',
  password: 'SahbazIsi2024!',
  company: 'Şahbaz Isı',
  phone: '+90 555 123 4567'
};

console.log('🧪 Test User Creation Script');
console.log('📝 User Data:', testUserData);

// Simulate form filling
console.log('\n📋 Form Filling Simulation:');
console.log('1. Ad:', testUserData.firstName);
console.log('2. Soyad:', testUserData.lastName);
console.log('3. Email:', testUserData.email);
console.log('4. Telefon:', testUserData.phone);
console.log('5. Şirket:', testUserData.company);
console.log('6. Şifre:', testUserData.password);

// Password validation
const passwordRequirements = {
  minLength: testUserData.password.length >= 8,
  hasUppercase: /[A-Z]/.test(testUserData.password),
  hasLowercase: /[a-z]/.test(testUserData.password),
  hasNumber: /\d/.test(testUserData.password),
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(testUserData.password)
};

console.log('\n🔐 Password Validation:');
console.log('✓ Minimum 8 characters:', passwordRequirements.minLength);
console.log('✓ Has uppercase:', passwordRequirements.hasUppercase);
console.log('✓ Has lowercase:', passwordRequirements.hasLowercase);
console.log('✓ Has number:', passwordRequirements.hasNumber);
console.log('✓ Has special character:', passwordRequirements.hasSpecialChar);

const isValidPassword = Object.values(passwordRequirements).every(req => req === true);
console.log('✅ Password valid:', isValidPassword);

if (isValidPassword) {
  console.log('\n🚀 Ready to create user!');
  console.log('📝 Next steps:');
  console.log('1. Go to http://localhost:3000/signup');
  console.log('2. Fill the form with the data above');
  console.log('3. Click "Kayıt Ol" button');
  console.log('4. Check dashboard redirect');
  console.log('5. Test Shopify integration');
} else {
  console.log('\n❌ Password does not meet requirements');
}
