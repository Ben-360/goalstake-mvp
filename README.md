GoalStake - GitHub-ready MVP (no local Node required for deployment)
=================================================================
This repo is prepared so you can upload it to GitHub and deploy using Render (backend) and Vercel (frontend).

Quick start:
1. Create a GitHub repo and upload this folder (drag & drop).
2. Edit server/.env.example and web/.env.example values in GitHub (rename to .env on deployment services as required).
3. Deploy backend on Render: point to server folder, set environment variables (PORT, MONGO_URI, JWT_SECRET, ADMIN_API_KEY).
4. Deploy frontend on Vercel: point to web folder, set VITE_API_URL to your backend URL.

Admin notes:
- Admin routes require header 'x-admin-key' with the ADMIN_API_KEY value from server .env.
- Admin endpoints:
  POST /api/admin/create-challenge
  POST /api/admin/close-challenge/:id
