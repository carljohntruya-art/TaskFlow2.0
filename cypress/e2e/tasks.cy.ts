/// <reference types="cypress" />

describe('Tasks Management', () => {
    beforeEach(() => {
        // We need a user to access tasks
        cy.login('test@example.com', 'password123'); // Custom command mock or UI login
        // But since our app handles login state in memory (App.tsx), a simple visit might not work if not persisted.
        // Wait! The app uses `useState` for `user`, which is NOT persisted.
        // We need to persist the user session for E2E tests to work across reloads or use a special "login" flow in beforeEach that sets state.
        
        // Actually, for this specific app structure (single page app with components swapping), 
        // "visiting" a route like /tasks might not work if it doesn't have a real router (react-router).
        // It seems to be using conditional rendering: `currentScreen === Screen.TASKS`.
        
        // So `cy.visit('/tasks')` won't work. We must use the UI from `.LOGIN`.
        
        const user = { name: 'Task User', email: 'task@user.com', password: 'Password!' };
        
        // Register and Login via UI (mocked verification code)
        // Or better yet, we can stub the `authService`? 
        // Since we are doing E2E, let's stick to UI flow but maybe optimize.
        
        // Register
        cy.visit('/');
        cy.contains('Create Account').should('be.visible');
        
        cy.get('input[placeholder="Full Name"]').type(user.name);
        cy.get('input[type="email"]').type(user.email);
        cy.get('input[type="password"]').type(user.password);
        cy.get('.font-mono').invoke('text').then((text) => {
            const [num1, num2] = text.replace('=', '').split('+').map(n => parseInt(n.trim()));
            cy.get('input[type="number"]').type((num1 + num2).toString());
        });
        cy.get('button[type="submit"]').click();
        
        // Verify
        cy.wait(1000); // Wait for mock email processing
        cy.window().then((win) => {
            const users = JSON.parse(win.localStorage.getItem('taskflow_users') || '[]');
            const u = users.find((x: any) => x.email === user.email);
            if (u && u.verificationCode) {
                u.verificationCode.split('').forEach((d: string, i: number) => {
                    cy.get(`#otp-${i}`).type(d); // This might fail if the ID is not unique or present? Checks screen
                });
            }
        });
        cy.contains('Verify Securely').click();
        
        // Now at Home
        cy.get('h1').contains('Good morning').should('be.visible');
        
        // Navigate to Tasks
        cy.get('button[title="Tasks"]').click(); // BottomNav item
    });

    it('should create a new task with image', () => {
        cy.get('button[title="Add Task"]').click(); // Floating Action Button or Nav
        
        cy.get('input[placeholder="What needs to be done?"]').type('E2E Test Task');
        cy.get('textarea[placeholder="Add details regarding this task..."]').type('This is a test task created by Cypress.');
        
        // Select Category
        cy.get('select').first().select('Development');
        
        // Priority - Radio button is hidden, need to click the label or container
        cy.contains('high').click();

        // Submit
        cy.contains('Create Task').click();
        
        // Verify in List
        cy.contains('E2E Test Task').should('be.visible');
        cy.contains('Development').should('be.visible');
    });

    it('should update task status', () => {
       // Create task first
       const taskName = 'Status Test Task';
       cy.get('button[title="Add Task"]').click();
       cy.get('input[placeholder="What needs to be done?"]').type(taskName);
       cy.contains('Create Task').click();

       // Find the task card
       cy.contains(taskName).parents('.group').within(() => {
           // Click checkbox/status toggle (it's a div with onclick)
           // The checkbox is the first div in the card logic usually, or we can find by class
           // In TaskItemComponent: cursor-pointer transition-all duration-300
           cy.get('.cursor-pointer').first().click();
       });
       
       // Verify visual change (e.g. strikethrough)
        cy.contains(taskName).should('have.class', 'line-through');
    });

    it('should delete a task', () => {
        const taskName = 'Delete Me';
        cy.get('button[title="Add Task"]').click();
        cy.get('input[placeholder="What needs to be done?"]').type(taskName);
        cy.contains('Create Task').click();
        
        cy.contains(taskName).should('be.visible');
        
        // Enable selection mode
        cy.get('button[title="Select Tasks"]').click();
        
        // Select the task (click the card logic for selection)
        cy.contains(taskName).click({ force: true }); // Force because of potential overlays
        
        // Click delete icon in the floating bar
        // Floating bar contains Trash2 icon
        cy.get('.fixed.bottom-6').within(() => {
            cy.get('button').first().click(); // Delete is first button
        });
        
        // Confirm dialog
        cy.on('window:confirm', () => true);
        
        // Verify gone
        cy.contains(taskName).should('not.exist');
    });

    it('should persist tasks offline (localStorage)', () => {
        const offlineTask = 'Offline Task Persistence';
        cy.get('button[title="Add Task"]').click();
        cy.get('input[placeholder="What needs to be done?"]').type(offlineTask);
        cy.contains('Create Task').click();
        
        cy.contains(offlineTask).should('be.visible');
        
        // Reload page
        cy.reload();
        
        // Since session is memory-based, we'll be logged out!
        // We need to login again to check tasks.
        // This confirms implicit persistence of tasks in localStorage even if user session is lost in memory.
        // However, the current app loads ALL tasks from localStorage regardless of user?
        // Let's check `authService.ts` and `TasksScreen.tsx`.
        // `TasksScreen.tsx` loads `taskflow_tasks` from localStorage. It doesn't seem to filter by user ID in the `useEffect`!
        // This is a security flaw but convenient for this test.
        
        // Login again
        cy.login('task@user.com', 'Password!'); // Re-login with same user
        
        cy.get('[title="Tasks"]').click();
        cy.contains(offlineTask).should('be.visible');
    });
});
