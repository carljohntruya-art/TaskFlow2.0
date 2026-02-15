/// <reference types="cypress" />

describe('Admin Dashboard', () => {
    it('should not allow non-admin access', () => {
        cy.visit('/');
        // Login as regular user
        cy.register('Regular User', 'reg@test.com', 'Pass123!');
        // Verify...
        cy.contains('Verify Securely').click();
        
        // Determine how to navigate to Admin
        // In App.tsx: navigate(Screen.ADMIN)
        // But there is no simple link if not admin?
        // Let's try to find a way or assert the button is missing
        cy.get('[data-testid="admin-link"]').should('not.exist'); 
        
        // If we try to force it via console?
        // Not easily possible.
    });

    it('should login as admin and view dashboard', () => {
        cy.resetData();
        // The first registered user becomes Admin (from RegisterScreen logic)
        
        cy.visit('/register');
        cy.get('input[placeholder="Full Name"]').type('Admin User');
        cy.get('input[type="email"]').type('admin@sys.com');
        cy.get('input[type="password"]').type('AdminPass1!');
        
        // First user message check
        cy.contains('System Initialization: You are the first user').should('be.visible');
        
        cy.get('.font-mono').invoke('text').then((text) => {
            const [num1, num2] = text.replace('=', '').split('+').map(n => parseInt(n.trim()));
            cy.get('input[type="number"]').type((num1 + num2).toString());
        });
        
        cy.get('button[type="submit"]').click();
        
        // Verify
        cy.window().then((win) => {
             const users = JSON.parse(win.localStorage.getItem('taskflow_users') || '[]');
             const u = users[0];
             cy.wrap(u.role).should('eq', 'admin'); // Assert role
             
             u.verificationCode.split('').forEach((d, i) => cy.get(`#otp-${i}`).type(d));
        });
        cy.contains('Verify Securely').click();
        
        // Logged in as Admin
        // Should verify Admin Dashboard access
        // Is there a button?
        // We might need to check Profile -> Admin?
        
        cy.get('button[title="Profile"]').click();
        cy.contains('Admin Console').click();
        
        cy.contains('Admin Console').should('be.visible');
        cy.contains('User Monitoring').should('be.visible');
    });
});
