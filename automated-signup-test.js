/**
 * Automated Signup Test
 * Tests the signup process programmatically
 */

import puppeteer from 'puppeteer';

const testUser = {
  firstName: 'Ömer',
  lastName: 'Ünsal',
  email: 'sahbaz@sahbaz.com',
  phone: '+90 555 123 4567',
  company: 'Şahbaz Isı',
  password: 'SahbazIsi2024!',
  confirmPassword: 'SahbazIsi2024!'
};

async function testSignup() {
  console.log('🧪 Starting automated signup test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle0' });
    
    console.log('📝 Filling Step 1 (Personal Info)...');
    
    // Step 1: Personal Info
    await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
    await page.type('input[name="firstName"]', testUser.firstName);
    await page.type('input[name="lastName"]', testUser.lastName);
    await page.type('input[name="email"]', testUser.email);
    await page.type('input[name="phone"]', testUser.phone);
    
    console.log('✅ Step 1 completed');
    
    // Click next button
    await page.click('button[type="button"]:has-text("İleri")');
    
    console.log('📝 Filling Step 2 (Company & Password)...');
    
    // Step 2: Company & Password
    await page.waitForSelector('input[name="company"]', { timeout: 10000 });
    await page.type('input[name="company"]', testUser.company);
    await page.type('input[name="password"]', testUser.password);
    await page.type('input[name="confirmPassword"]', testUser.confirmPassword);
    
    // Check terms checkbox
    await page.click('input[type="checkbox"]');
    
    console.log('✅ Step 2 completed');
    
    // Submit form
    console.log('🚀 Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for redirect or success message
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard!');
      
      // Test Shopify integration
      console.log('🔗 Testing Shopify integration...');
      await page.goto('http://localhost:3000/integrations/shopify');
      await page.waitForTimeout(3000);
      
      const shopifyPageTitle = await page.title();
      console.log('📄 Shopify page title:', shopifyPageTitle);
      
      console.log('✅ Shopify integration accessible!');
      
    } else {
      console.log('❌ Not redirected to dashboard');
      console.log('Current URL:', currentUrl);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is available
try {
  await testSignup();
} catch (error) {
  console.log('❌ Puppeteer not available. Manual test required.');
  console.log('📋 Manual test steps:');
  console.log('1. Go to http://localhost:3000/signup');
  console.log('2. Fill the form with the test data');
  console.log('3. Submit and check results');
}

