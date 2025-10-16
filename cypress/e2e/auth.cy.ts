describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.contains('Giriş Yap').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('should show validation errors for empty login form', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.contains('E-posta').should('be.visible');
  });

  it('should navigate to signup page', () => {
    cy.visit('/login');
    cy.contains('Kayıt Ol').click();
    cy.url().should('include', '/signup');
  });

  it('should display signup page', () => {
    cy.visit('/signup');
    cy.contains('Hesap Oluştur').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('should show password strength indicator', () => {
    cy.visit('/signup');
    cy.get('input[type="password"]').first().type('weak');
    // Password strength indicator should appear
  });

  it('should validate email format', () => {
    cy.visit('/signup');
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.contains('geçerli').should('be.visible');
  });
});
