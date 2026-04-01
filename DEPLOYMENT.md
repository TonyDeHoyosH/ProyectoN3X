# Deployment Guide

For deploying to platforms like Vercel, Railway, or Render:

1. **Database**: Spin up a managed PostgreSQL instance and set `DATABASE_URL`.
2. **Backend**: Deploy a Docker container using the `backend/Dockerfile` and expose port 8000.
3. **Frontend**: Deploy `frontend/` to Vercel/Netlify passing `VITE_API_URL` as your deployed backend URL.
