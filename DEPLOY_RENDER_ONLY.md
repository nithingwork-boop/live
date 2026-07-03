# Deploy FinOps Flow on Render Only (No Docker)

> This guide covers deploying **both** the backend API and the frontend dashboard
> entirely on [Render](https://render.com) without Docker.
> All code changes required for this have already been made to the project.

---

## What you will create on Render
| Service | Type | What it runs |
|---------|------|--------------|
| `finops-backend` | **Web Service** (Node) | NestJS REST API |
| `finops-frontend` | **Static Site** | Vite-built React dashboard |

---

## Step 1 – Push the project to GitHub

### 1.1 – Create a GitHub repository
1. Open https://github.com and log in.
2. Click the **+** icon (top-right) → **New repository**.
3. Name it `flow` (or anything you like).
4. Choose **Private** if you do not want the source public.
5. **Do NOT** tick "Add a README" – the repo must be empty.
6. Click **Create repository**.

### 1.2 – Initialise Git locally (skip if you already have a repo)
Open a terminal in your project root (`c:\Users\Nithin\Desktop\Flow`) and run:
```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.3 – Connect and push to GitHub
Copy the remote URL shown by GitHub after creating the repo, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/flow.git
git branch -M main
git push -u origin main
```
Refresh GitHub – you should see all project files there.

---

## Step 2 – Sign up / log in to Render
1. Go to https://render.com.
2. Click **Get Started for Free**.
3. Sign up with your **GitHub account** (this makes connecting repos much easier).
4. Verify your email if prompted.

---

## Step 3 – Deploy the Backend (Web Service)

### 3.1 – Create a new Web Service
1. From the Render dashboard, click the **New +** button (top-right).
2. Select **Web Service**.

### 3.2 – Connect your repository
1. Click **Connect a repository**.
2. If prompted, click **Configure account** → select your GitHub account → grant Render access to the `flow` repository.
3. Back in Render, you should see `flow` in the list – click **Connect**.

### 3.3 – Fill in the service settings
Fill in **every** field exactly as shown:

| Field | Value |
|-------|-------|
| **Name** | `finops-backend` |
| **Region** | Choose the region closest to you (e.g. Oregon for US, Frankfurt for EU) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or Starter if you need it always-on) |

> ⚠️ **Root Directory is critical.** Setting it to `backend` tells Render where
> `package.json` lives. If you leave it blank, the build will fail.

### 3.4 – Add environment variables
Scroll down to **Environment Variables** and click **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

> You can add `ALLOWED_ORIGINS` later (after you know the frontend URL).

### 3.5 – Deploy
Click **Create Web Service**. Render will:
1. Clone your repo.
2. Run `npm install && npm run build` inside the `backend` folder.
3. Start the server with `npm start`.

Watch the **Logs** tab. You should eventually see:
```
🚀 FinOps API listening on port 10000
📊 REST API available at /v1/*
🏥 Health Check: /health
```

### 3.6 – Copy the backend URL
At the top of the service page you will see a URL like:
```
https://finops-backend.onrender.com
```
**Copy this URL** – you need it in Step 4.

### 3.7 – Verify the backend is alive
Open a new browser tab and visit:
```
https://finops-backend.onrender.com/health
```
You should see `OK` on the page. If you see an error, check the Logs tab.

---

## Step 4 – Deploy the Frontend (Static Site)

### 4.1 – Create a new Static Site
1. From the Render dashboard, click **New +** → **Static Site**.

### 4.2 – Connect the same repository
1. Select the same `flow` repository you connected earlier.
2. Click **Connect**.

### 4.3 – Fill in the static site settings

| Field | Value |
|-------|-------|
| **Name** | `finops-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

> ⚠️ **Publish Directory must be `dist`** – this is where Vite puts the built files.

### 4.4 – Add environment variable (the backend URL)
Scroll down to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://finops-backend.onrender.com` ← paste the URL you copied in Step 3.6 |

> This is what makes the frontend call your deployed backend instead of localhost.

### 4.5 – Deploy
Click **Create Static Site**. Render will:
1. Clone the repo.
2. `cd` into `frontend`, run `npm install && npm run build`.
3. Serve everything inside `dist/` as a static site.

When the build finishes you will see a URL like:
```
https://finops-frontend.onrender.com
```

### 4.6 – Verify the frontend works
Open `https://finops-frontend.onrender.com` in your browser.
- The dashboard should load.
- Open **DevTools → Network** and confirm API requests go to `https://finops-backend.onrender.com` (not localhost).

---

## Step 5 – (Optional but recommended) Update CORS on the backend

Now that you know the frontend URL, you can tighten CORS:

1. Go to Render → `finops-backend` → **Environment**.
2. Add a new variable:

| Key | Value |
|-----|-------|
| `ALLOWED_ORIGINS` | `https://finops-frontend.onrender.com` |

3. The backend will automatically redeploy.

> The backend currently accepts any origin (`origin: true`), so this step is
> optional for a demo, but good practice for anything public.

---

## Step 6 – Enable Auto-Deploy (so future pushes go live automatically)

For both services:
1. Go to the service → **Settings** tab.
2. Under **Auto-Deploy**, make sure it is set to **Yes**.

Now every `git push origin main` will rebuild and redeploy both services automatically.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Build fails: `Cannot find module ...` | Wrong Root Directory | Check that **Root Directory** is `backend` (API) or `frontend` (site) |
| API returns 502 / site shows blank | Server not started | Check backend Logs – look for the `🚀 FinOps API listening` line |
| Network requests still hit `localhost` | `VITE_API_URL` env var missing or wrong | Re-check the env var on the static site and redeploy |
| Page refresh gives 404 | `_redirects` file not found | Make sure `frontend/public/_redirects` exists in git (already added) |
| Backend health check fails | Port mismatch | The code now uses `process.env.PORT` – this is already fixed |
| Free tier backend is slow on first load | Render spins down free services after inactivity | Normal behaviour on the Free tier; upgrade to Starter to avoid it |

---

## Quick Reference – What was changed in the codebase

| File | Change |
|------|--------|
| `frontend/src/config.ts` | **NEW** – central `API_V1` constant that reads `VITE_API_URL` env var |
| `frontend/src/utils/finopsApi.ts` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/ai/aiApi.ts` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/Recommendations.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/Workflows.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/SoftwareInventory.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/Overview.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/Audit.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/ContractsOptimization.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/Anomalies.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/ai/AISpendOpsHome.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/pages/admin/AdminWorkflows.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/components/ScopeDashboard.tsx` | Imports `API_V1` from `config.ts` |
| `frontend/src/components/CostExplorer.tsx` | Uses `API_V1` from `config.ts` |
| `frontend/public/_redirects` | **NEW** – Render SPA redirect rule (`/* /index.html 200`) |
| `backend/src/main.ts` | Uses `process.env.PORT` instead of hardcoded `8081` |
