/// <reference types="cypress" />

describe('Carbon Emission Tracker Application', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the Carbon Emission Tracker headline', () => {
    cy.contains('Carbon Emission Tracker').should('be.visible');
  });

  it('toggles theme', () => {
    cy.contains('Toggle Theme').click();
    cy.get('body').invoke('attr', 'class').should('include', 'dark');
    cy.contains('Toggle Theme').click();
    cy.get('body').invoke('attr', 'class').should('include', 'light');
  });

  it('shows login form', () => {
    cy.contains('Already have an account? Login').click();
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('logs in and adds data', () => {
    cy.contains('Already have an account? Login').click();
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.contains('Login').click();

    cy.wait(3000); // Adjust the wait time as needed

    cy.get('input[placeholder="Enter carbon emission data"]').type('123');
    cy.contains('Add Data').click();
    cy.contains('123').should('be.visible');
  });
});