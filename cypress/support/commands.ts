// Custom Cypress Commands

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createProduct(productData: any): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[aria-label="User menu"]').click();
  cy.contains('Çıkış Yap').click();
  cy.url().should('include', '/login');
});

// Create product command
Cypress.Commands.add('createProduct', productData => {
  cy.visit('/products');
  cy.contains('Yeni Ürün').click();

  Object.keys(productData).forEach(key => {
    cy.get(`[name="${key}"]`).type(productData[key]);
  });

  cy.get('button[type="submit"]').click();
  cy.contains('Ürün başarıyla oluşturuldu').should('be.visible');
});

export {};
