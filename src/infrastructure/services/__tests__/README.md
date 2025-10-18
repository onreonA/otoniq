# Service Layer Tests

## Overview

This directory contains unit tests for the service layer of the Otoniq.ai application.

## Test Files

### ✅ Basic Tests

- **basic.test.ts** - Basic infrastructure tests and data structure validation

### 🧪 Service Tests

- **SubscriptionService.test.ts** - Subscription plan and lifecycle management tests
- **BillingService.test.ts** - Billing, transactions, and invoice tests
- **TenantManagementService.test.ts** - Tenant CRUD and management tests

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Structure

### SubscriptionService Tests

Tests cover:

- ✅ Plan management (CRUD operations)
- ✅ Subscription lifecycle (create, update, cancel, renew)
- ✅ Trial management (start, convert to paid)
- ✅ Usage limits (check, increment)
- ✅ Analytics (MRR, ARR, churn rate)

### BillingService Tests

Tests cover:

- ✅ Transaction management
- ✅ Payment processing
- ✅ Invoice generation and management
- ✅ Refund processing
- ✅ Revenue analytics

### TenantManagementService Tests

Tests cover:

- ✅ Tenant CRUD operations
- ✅ Tenant filtering and search
- ✅ Status management (suspend, activate)
- ✅ Tenant statistics
- ✅ Bulk operations
- ✅ System-wide statistics

## Mocking Strategy

All tests use mocked Supabase client to avoid actual database calls:

```typescript
vi.mock('../database/supabase/client', () => ({
  getSupabaseClient: () => ({
    // Mocked Supabase methods
  }),
}));
```

## Test Coverage Goals

- **Target:** 80% code coverage
- **Current Focus:** Service layer business logic
- **Future:** Integration tests, E2E tests

## Writing New Tests

When adding new tests:

1. **Follow the existing structure**
   - Use `describe` blocks for grouping
   - Use descriptive test names
   - Test both success and error cases

2. **Mock external dependencies**
   - Mock Supabase client
   - Mock other services when needed

3. **Test business logic**
   - Focus on service methods
   - Validate data structures
   - Test calculations and transformations

4. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` for setup
   - Clean up after tests

## Example Test

```typescript
describe('SubscriptionService', () => {
  describe('createPlan', () => {
    it('should create a new subscription plan', async () => {
      const planData = {
        plan_name: 'test_plan',
        display_name: 'Test Plan',
        price_monthly: 99.99,
        price_yearly: 999.99,
        features: { max_products: 100 },
      };

      const result = await subscriptionService.createPlan(planData);
      expect(result).toBeDefined();
    });
  });
});
```

## Known Limitations

- Tests use mocked Supabase client
- Some tests require actual database for full validation
- Integration tests are planned for future implementation

## Future Improvements

- [ ] Add integration tests with test database
- [ ] Add E2E tests for critical flows
- [ ] Increase code coverage to 90%+
- [ ] Add performance tests
- [ ] Add load tests for high-traffic scenarios

## Contributing

When adding new service methods:

1. Write tests first (TDD approach)
2. Ensure tests pass
3. Update this README
4. Run coverage report

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
