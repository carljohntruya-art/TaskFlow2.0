
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(email: string, pass: string): Chainable<Subject>;
    register(name: string, email: string, pass: string): Chainable<Subject>;
    resetData(): Chainable<Subject>;
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.window().then((win) => {
    // Mock user in localStorage for instant login
    // In a real e2e, we should go through the UI, but this is a shortcut helper
    // However, if we want to TEST login, we shouldn't use this.
    // Let's use UI interaction for robust testing
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
  });
});

Cypress.Commands.add('register', (name, email, password) => {
  cy.visit('/');
  cy.contains('Create Account').click();
  cy.get('input[placeholder="Full Name"]').type(name);
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  
  // Solve captcha (mocked in app as simple addition)
  cy.get('.font-mono').invoke('text').then((text) => {
    const parts = text.split('+');
    const num1 = parseInt(parts[0].trim());
    const num2 = parseInt(parts[1].replace('=', '').trim());
    const sum = num1 + num2;
    cy.get('input[type="number"]').type(sum.toString());
  });

  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('resetData', () => {
    cy.window().then((win) => {
        win.localStorage.clear();
    });
});
