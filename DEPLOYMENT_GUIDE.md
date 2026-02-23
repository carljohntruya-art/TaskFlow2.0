# TaskFlow 2.0 Deployment Guide

This guide ensures your React (Vercel) and Node.js (Railway) production environments are perfectly synced.

---

## Phase 1: Railway Backend Status

Status: You have already completed the variable setup.

1. Verify Database:
   - In Railway, ensure you see a PostgreSQL service in the same project as your API.
   - Click on the API service then go to Variables. DATABASE_URL must be present.

2. Expose the API:
   - Click on your backend service (TaskFlow2.0_server).
   - Go to Settings then Networking.
   - Under Public Domain, click Generate Domain (if not already done).
   - Copy the URL (Example: https://taskflow20-server-production.up.railway.app).

---

## Phase 2: Vercel Frontend Setup

1. Open Vercel Dashboard:
   - Go to your TaskFlow 2.0 project settings.

2. Add Environment Variable:
   - Navigate to Settings then Environment Variables.
   - Add a new variable:
     - Key: VITE_API_URL
     - Value: Paste your Railway Domain (Include the https:// prefix)
   - Ensure Production, Preview, and Development are checked.
   - Click Save.

3. Trigger Redeploy (Critical):
   - Vercel bakes environment variables into the React code at build-time. You must redeploy for the change to take effect.
   - Go to the Deployments tab.
   - Find your latest deployment.
   - Click the three dots (...) and select Redeploy.

---

## Phase 3: SPA Routing Fix (Vercel)

The vercel.json file has been added to your project root to prevent 404 errors when refreshing pages.

File: /vercel.json

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Phase 4: Verification Checklist

Once the Vercel redeploy finishes, test these in order:

1. CORS and Connection: Open the live site. Does the login page load without a Network Error?
2. Registration: Create a new user.
   - Open Browser DevTools (F12) then the Network Tab.
   - Look for the POST /api/auth/register request. It should be 201 Created.
3. Cookie Validation:
   - Go to DevTools then Application then Cookies.
   - You should see a jwt cookie.
   - It must have the Secure flag checked and SameSite set to None.
4. Data Persistence:
   - Create a task.
   - Refresh the page.
   - If the task stays there, your database connection is 100% successful.
5. Logout: Click Logout. The cookie should disappear, and you should be redirected to the landing page.

---

## Troubleshooting Cookie Issues

If you can log in but refreshing the page logs you out:

1. Check Railway Variables: COOKIE_SAME_SITE must be none.
2. Check Railway Variables: FRONTEND_ORIGIN must match your Vercel URL exactly.
3. Ensure Vercel redeployed after you saved the VITE_API_URL.
