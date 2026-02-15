# 🚀 TaskFlow 2.0 Deployment Guide

This guide covers the end-to-end process of deploying **TaskFlow 2.0**, including repository initialization, EmailJS configuration for secure authentication, and hosting on Vercel.

---

## 1. Initializing the Repository

Follow these steps to host your code on GitHub:

1. **Create Repository**: Go to [GitHub](https://github.com/new) and create a new repository named `TaskFlow2.0`.
2. **Initialize Locally**:
   ```bash
   # Open terminal in your project root
   git init
   git add .
   git commit -m "feat: initial commit for TaskFlow 2.0"
   ```
3. **Connect and Push**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/carljohntruya-art/TaskFlow2.0.git
   git push -u origin main
   ```

---

## 2. Setting Up EmailJS (Authentication Service)

TaskFlow uses EmailJS to send verification codes to users.

### Step 1: Create Account

Sign up at [EmailJS.com](https://www.emailjs.com/).

### Step 2: Add Email Service

1. Go to **Email Services** > **Add New Service**.
2. Select your provider (e.g., Gmail, Outlook).
3. Connect your account and click **Create Service**.
4. **Copy the `Service ID`** (e.g., `service_xxxxxx`).

### Step 3: Create Email Template

1. Go to **Email Templates** > **Create New Template**.
2. **Design the Template**: Use the following variables in your content:
   - **Recipient Email**: `{{to_email}}` (Place this in the "To Email" field in the settings tab)
   - **Recipient Name**: `{{to_name}}`
   - **Verification Code**: `{{verification_code}}`
3. **Save the Template**.
4. **Copy the `Template ID`** (e.g., `template_xxxxxx`).

### Step 4: Get Public Key

1. Go to **Account** (or Account Settings).
2. **Copy the `Public Key`** (e.g., `pk_xxxxx`).

---

## 3. Vercel Project Setup

Hosting the frontend and environment variables.

### Step 1: Import Project

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import `carljohntruya-art/TaskFlow2.0` from GitHub.

### Step 2: Configure Environment Variables

Inside the Vercel deployment settings, under **Environment Variables**, add the following:

| Key                        | Value                        |
| -------------------------- | ---------------------------- |
| `VITE_EMAILJS_SERVICE_ID`  | Your Service ID from Step 2  |
| `VITE_EMAILJS_TEMPLATE_ID` | Your Template ID from Step 3 |
| `VITE_EMAILJS_PUBLIC_KEY`  | Your Public Key from Step 4  |

### Step 3: Build and Deploy

1. **Framework Preset**: Select `Vite`.
2. **Build Command**: `npm run build`.
3. **Output Directory**: `dist`.
4. Click **Deploy**.

---

## 4. Verification Check

- Once deployed, visit your Vercel URL.
- Register a new account.
- Check if you receive the verification email.
- **Admin Note**: The very first user to register on the platform will automatically be assigned the **Admin** role.

---

## 💡 Troubleshooting

- **Routing**: If you get 404s when refreshing subpages, ensure `vercel.json` is in your root:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Email Not Sending**: Check your EmailJS dashboard for "Requests" to see if there are any error logs or if you've hit your daily free tier limit.
