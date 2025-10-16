describe('Dashboard', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then(win => {
      win.localStorage.setItem(
        'supabase.auth.token',
        JSON.stringify({
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
        })
      );
    });
  });

  it('should display dashboard after login', () => {
    cy.visit('/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should show revenue metrics', () => {
    cy.visit('/dashboard');
    cy.contains('Toplam Gelir').should('be.visible');
    cy.contains('Sipariş').should('be.visible');
  });

  it('should display sales chart', () => {
    cy.visit('/dashboard');
    cy.get('[class*="recharts"]').should('exist');
  });

  it('should show top products', () => {
    cy.visit('/dashboard');
    cy.contains('En Çok Satan').should('be.visible');
  });

  it('should navigate to products page', () => {
    cy.visit('/dashboard');
    cy.contains('Ürünler').click();
    cy.url().should('include', '/products');
  });

  it('should navigate to orders page', () => {
    cy.visit('/dashboard');
    cy.contains('Siparişler').click();
    cy.url().should('include', '/orders');
  });
});
