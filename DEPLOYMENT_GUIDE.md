TASKFLOW 2.0
Deployment and Configuration Guide

This guide covers the end-to-end process of deploying TaskFlow 2.0, including repository initialization, EmailJS configuration for secure authentication, and hosting on Vercel.

---

1. INITIALIZING THE REPOSITORY

Follow these steps to host your code on GitHub:

1. Create Repository
   Go to GitHub and create a new repository named TaskFlow2.0.

2. Initialize Locally
   Open terminal in your project root:
   git init
   git add .
   git commit -m "feat: initial commit for TaskFlow 2.0"

3. Connect and Push
   git branch -M main
   git remote add origin https://github.com/carljohntruya-art/TaskFlow2.0.git
   git push -u origin main

---

2. SETTING UP EMAILJS

TaskFlow uses EmailJS to send verification codes to users.

Step 1: Create Account
Sign up at EmailJS.com.

Step 2: Add Email Service

1. Go to Email Services > Add New Service.
2. Select your provider (e.g., Gmail, Outlook).
3. Connect your account and click Create Service.
4. Copy the Service ID (e.g., service_xxxxxx).

Step 3: Create Email Template

1. Go to Email Templates > Create New Template.
2. Design the Template: Use the following variables in your content:
   - Recipient Email: {{to_email}}
   - Recipient Name: {{to_name}}
   - Verification Code: {{verification_code}}
3. Save the Template.
4. Copy the Template ID (e.g., template_xxxxxx).

Step 4: Get Public Key

1. Go to Account or Account Settings.
2. Copy the Public Key (e.g., pk_xxxxx).

---

3. VERCEL PROJECT SETUP

Hosting the frontend and environment variables.

Step 1: Import Project

1. Log in to Vercel.com.
2. Click Add New > Project.
3. Import the TaskFlow2.0 repository from GitHub.

Step 2: Configure Environment Variables
In Vercel deployment settings, under Environment Variables, add:

VITE_EMAILJS_SERVICE_ID = (Your Service ID)
VITE_EMAILJS_TEMPLATE_ID = (Your Template ID)
VITE_EMAILJS_PUBLIC_KEY = (Your Public Key)

Step 3: Build and Deploy

1. Framework Preset: Select Vite.
2. Build Command: npm run build.
3. Output Directory: dist.
4. Click Deploy.

---

4. VERIFICATION CHECK

- Once deployed, visit your Vercel URL.
- Register a new account.
- Check if you receive the verification email.
- Admin Note: The very first user to register will be assigned the Administrator role.

---

TROUBLESHOOTING

Routing
If you experience 404 errors when refreshing subpages, ensure vercel.json exists in your root with:
{
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

Email Delivery
Check your EmailJS dashboard for "Requests" to monitor error logs or daily quota limits.
