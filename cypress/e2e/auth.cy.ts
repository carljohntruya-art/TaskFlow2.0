/// <reference types="cypress" />

describe('Authentication Flows', () => {
  beforeEach(() => {
    cy.resetData();
    cy.visit('/');
  });

  it('should register a new user successfully', () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    };

    // Navigate to register screen via UI
    cy.contains('Create Account').click();
    
    // Fill form
    cy.get('input[placeholder="Full Name"]').type(user.name);
    cy.get('input[type="email"]').type(user.email);
    cy.get('input[type="password"]').type(user.password);

    // Solve Captcha
    cy.get('.font-mono').invoke('text').then((text) => {
        const [num1, num2] = text.replace('=', '').split('+').map(n => parseInt(n.trim()));
        cy.get('input[type="number"]').type((num1 + num2).toString());
    });

    cy.get('button[type="submit"]').click();

    // Should move to verification step
    cy.contains('Verify Email').should('be.visible');
  });

  it('should login with valid credentials', () => {
    // 1. Register first (setup)
    const user = {
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
    };
    
    // Navigate to register
    cy.contains('Create Account').click();
    
    cy.get('input[placeholder="Full Name"]').type(user.name);
    cy.get('input[type="email"]').type(user.email);
    cy.get('input[type="password"]').type(user.password);
    
    cy.get('.font-mono').invoke('text').then((text) => {
        const [num1, num2] = text.replace('=', '').split('+').map(n => parseInt(n.trim()));
        cy.get('input[type="number"]').type((num1 + num2).toString());
    });
    
    cy.get('button[type="submit"]').click();

    // Verify email
    cy.wait(1000); 
    cy.window().then((win) => {
        const users = JSON.parse(win.localStorage.getItem('taskflow_users') || '[]');
        const targetUser = users.find((u: any) => u.email === user.email);
        const code = targetUser.verificationCode;
        
        // Enter code
        const digits = code.split('');
        digits.forEach((d: string, i: number) => {
            cy.get(`#otp-${i}`).type(d);
        });

        cy.contains('Verify Securely').click();
    });

    // Should be at Home screen - check for actual content
    cy.wait(2000); // Wait for transition
    
    // Verify we're on home screen by checking for unique home content
    cy.get('h1').contains('Good morning').should('be.visible');
    cy.contains('Total Tasks').should('be.visible');
    cy.contains('Recent Tasks').should('be.visible');
  });

  it('should prevent bot registration (HoneyPot)', () => {
    // Navigate to register
    cy.contains('Create Account').click();
    
    // Fill hidden honeypot field using force: true because it is hidden
    cy.get('input[name="role_check"]').type('iamabot', { force: true });
    
    cy.get('input[placeholder="Full Name"]').type('Bot User');
    cy.get('input[type="email"]').type('bot@example.com');
    cy.get('input[type="password"]').type('Password123!');
    
    // Solve Captcha (even if correct)
    cy.get('.font-mono').invoke('text').then((text) => {
        const [num1, num2] = text.replace('=', '').split('+').map(n => parseInt(n.trim()));
        cy.get('input[type="number"]').type((num1 + num2).toString());
    });

    cy.get('button[type="submit"]').click();
    
    // Wait for potential transition
    cy.wait(1000);

    // Should stay on register page (silent fail - no error shown to bot)
    cy.contains('Create Account').should('be.visible');
    // Should NOT see verify screen
    cy.contains('Verify Email').should('not.exist');
    
    // Verify no user was created in localStorage
    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem('taskflow_users') || '[]');
      const botUser = users.find((u: any) => u.email === 'bot@example.com');
      expect(botUser).to.be.undefined;
    });
  });

  it('should show error for rate limiting', () => {
    // Attempt registration multiple times quickly to trigger rate limit
    // Rate limit is 2 registrations per hour
    for (let i = 0; i < 3; i++) {
        if (i > 0) {
          cy.visit('/');
        }
        cy.contains('Create Account').click();
        
        cy.get('input[placeholder="Full Name"]').type(`User ${i}`);
        cy.get('input[type="email"]').type(`user${i}@test.com`);
        cy.get('input[type="password"]').type('Password123!');
        
        cy.get('.font-mono').invoke('text').then((text) => {
            const [num1, num2] = text.replace('=', '').split('+').map(n => parseInt(n.trim()));
            cy.get('input[type="number"]').type((num1 + num2).toString());
        });

        cy.get('button[type="submit"]').click();
        cy.wait(1500); // Wait for response
    }
    
    // The 3rd attempt should show rate limit error
    // Error message format: "Too many registration attempts. Please wait X minutes."
    cy.contains(/Too many registration attempts/i).should('be.visible');
  });
});
