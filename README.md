TASKFLOW 2.0
Premium Task Management System

TaskFlow 2.0 is a state-of-the-art Task Management System built for productivity and security. It features a modern, responsive UI with glassmorphic elements, robust administrator tools, and secure authentication.

[ TaskFlow Banner ]
(https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

---

KEY FEATURES

Secure Authentication

- Email Verification: Integrated with EmailJS for secure 6-digit OTP verification.
- Bot Protection: Multi-layered defense including a Math CAPTCHA and an invisible HoneyPot field.
- Rate Limiting: Built-in protection against brute-force login and registration attempts.

Task and Productivity

- Omni-Tasking: Create, update, and categorize tasks with priority levels (High, Medium, Low).
- Visual Analytics: Real-time productivity charts using Recharts.
- Offline Persistence: Automatic data synchronization with LocalStorage to prevent data loss.

Admin Console

- Automatic Handover: The first user to register is automatically promoted to System Administrator.
- System Monitoring: Real-time overview of users and security events.

---

TECH STACK

Frontend: React 19 + Vite
Styling: Tailwind CSS (Glassmorphism and Dark Mode)
Icons: Lucide React
Charts: Recharts
Authentication: EmailJS
Testing: Cypress E2E

---

GETTING STARTED

Prerequisites

- Node.js (v18 or higher)
- EmailJS Account (for authentication)

Installation

1. Clone the project
   git clone https://github.com/carljohntruya-art/TaskFlow2.0.git
   cd TaskFlow2.0

2. Install dependencies
   npm install

3. Configure Environment Variables
   Create a .env file in the root directory:
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key

4. Run Development Server
   npm run dev

---

TESTING

TaskFlow comes with a pre-configured Cypress suite. To run the tests:

Open Cypress Dashboard:
npm run cy:open

Run tests in headless mode:
npm run cy:run

---

DEPLOYMENT

For a detailed walkthrough on deploying to GitHub and Vercel, please refer to the Deployment Guide:
./DEPLOYMENT_GUIDE.md

---

LICENSE

This project is licensed under the MIT License - see the LICENSE file for details.
