# 🧪 Testing Guide - Otoniq.ai

## Test Infrastructure

### 📦 Dependencies to Install

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom cypress @cypress/vite-dev-server start-server-and-test
```

---

## 🎯 Unit Testing (Vitest)

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Testing React Components

```typescript
import { render, screen } from '@/test/utils/test-utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Example Tests Created

#### ✅ OpenAIService Test

- `src/infrastructure/services/__tests__/OpenAIService.test.ts`
- Tests product analysis
- Tests SEO title generation
- Tests bulk operations

---

## 🌐 E2E Testing (Cypress)

### Running E2E Tests

```bash
# Open Cypress UI
npm run cypress

# Run headless
npm run cypress:headless

# Run with dev server
npm run e2e

# Run with dev server (headless)
npm run e2e:headless
```

### Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/page');
  });

  it('should do something', () => {
    cy.get('button').click();
    cy.contains('Success').should('be.visible');
  });
});
```

### Example E2E Tests Created

#### ✅ Authentication Flow

- `cypress/e2e/auth.cy.ts`
- Login page display
- Form validation
- Signup navigation
- Password strength

#### ✅ Dashboard Tests

- `cypress/e2e/dashboard.cy.ts`
- Dashboard display
- Metrics visibility
- Navigation tests
- Chart rendering

### Custom Commands

```typescript
// Login
cy.login('user@example.com', 'password123');

// Logout
cy.logout();

// Create product
cy.createProduct({
  name: 'Test Product',
  price: '99.99',
  sku: 'TEST-001',
});
```

---

## 📊 Coverage Goals

```
Statements   : 70%
Branches     : 60%
Functions    : 70%
Lines        : 70%
```

### Current Coverage

Run `npm run test:coverage` to see detailed coverage report.

---

## 🎯 Testing Strategy

### What to Test

#### ✅ Unit Tests (Vitest)

- **Services**: All business logic
  - OpenAIService ✅
  - FeedDoctorService (TODO)
  - NotificationService (TODO)
  - AnalyticsService (TODO)
- **Utilities**: Helper functions
  - Date formatting (TODO)
  - Number formatting (TODO)
  - Validation helpers (TODO)

- **Hooks**: Custom React hooks
  - useAuth (TODO)
  - useRateLimit (TODO)

#### ✅ E2E Tests (Cypress)

- **Critical Paths**:
  - User registration/login ✅
  - Product CRUD operations (TODO)
  - Order creation (TODO)
  - Marketplace sync (TODO)

- **User Flows**:
  - Dashboard navigation ✅
  - Settings management (TODO)
  - Notification preferences (TODO)

---

## 🔧 Test Configuration Files

### ✅ Created Files

1. **vitest.config.ts** - Vitest configuration
2. **cypress.config.ts** - Cypress configuration
3. **src/test/setup.ts** - Test environment setup
4. **src/test/utils/test-utils.tsx** - Custom render utilities
5. **cypress/support/e2e.ts** - Cypress support file
6. **cypress/support/commands.ts** - Custom Cypress commands

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run test:run
      - run: npm run build
      - run: npm run e2e:headless

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📝 Writing Good Tests

### Unit Test Best Practices

```typescript
// ✅ Good: Descriptive test names
it('should return error when product name is empty', () => {
  // test code
});

// ❌ Bad: Vague test names
it('works', () => {
  // test code
});

// ✅ Good: Test one thing
it('should validate email format', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});

// ❌ Bad: Test multiple things
it('should validate email and password', () => {
  // testing two different things
});
```

### E2E Test Best Practices

```typescript
// ✅ Good: Use data-testid attributes
cy.get('[data-testid="submit-button"]').click();

// ❌ Bad: Rely on CSS classes
cy.get('.btn-primary').click();

// ✅ Good: Wait for elements
cy.contains('Success').should('be.visible');

// ❌ Bad: Use arbitrary waits
cy.wait(1000);
```

---

## 🐛 Debugging Tests

### Vitest

```bash
# Run specific test file
npm test -- OpenAIService

# Run in debug mode
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

### Cypress

```bash
# Open Cypress UI (interactive debugging)
npm run cypress

# Debug in browser console
cy.debug() // in test code
```

---

## 📊 Test Reports

### Coverage Report

```bash
npm run test:coverage
# Opens HTML report in coverage/index.html
```

### Cypress Results

```bash
# Screenshots: cypress/screenshots/
# Videos: cypress/videos/ (if enabled)
```

---

## 🎯 Next Steps for Complete Coverage

### Priority 1: Critical Services

- [ ] FeedDoctorService tests
- [ ] WhatsAppService tests
- [ ] TelegramService tests
- [ ] IoTService tests

### Priority 2: Integration Tests

- [ ] Product sync workflows
- [ ] Order processing flow
- [ ] Marketplace integrations
- [ ] N8N workflow execution

### Priority 3: Component Tests

- [ ] Auth components
- [ ] Form components
- [ ] Dashboard widgets
- [ ] Data tables

### Priority 4: Performance Tests

- [ ] Lighthouse CI setup
- [ ] Bundle size monitoring
- [ ] API response times

---

## 📚 Resources

- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Cypress Docs**: https://docs.cypress.io/
- **Test Best Practices**: https://testingjavascript.com/

---

**Status**: ✅ Test infrastructure complete  
**Coverage**: 🔄 Initial tests created (OpenAIService, Auth E2E, Dashboard E2E)  
**Next**: Expand coverage to all critical services
