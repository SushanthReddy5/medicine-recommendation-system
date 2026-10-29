# 🚀 MediAssist — Deployment Guide (Render.com Free Tier)

## Step 1: Deploy the Backend (Flask API)

1. Go to **[render.com](https://render.com)** → Sign up / Login with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `SushanthReddy5/medicine-recommendation-system`
4. Configure:
   - **Name:** `mediassist-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn "app:create_app()" --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Plan:** Free
5. Under **Environment Variables**, add the values from your `backend/.env` file:
   - `FLASK_ENV` = `production`
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `GROQ_API_KEY` = your Groq API key
   - `JWT_SECRET` = a long random secret string
   - `GMAIL_USER` = your Gmail address
   - `GMAIL_APP_PASSWORD` = your Gmail app password
   - `FRONTEND_URL` = the frontend URL (set after Step 2)
6. Click **"Create Web Service"** — build takes ~5-10 mins
7. Copy the backend URL (e.g., `https://mediassist-backend.onrender.com`)

---

## Step 2: Deploy the Frontend (React Static Site)

1. Click **"New +"** → **"Static Site"**
2. Connect the same GitHub repo
3. Configure:
   - **Name:** `mediassist-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
   - **Plan:** Free
4. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = the backend URL from Step 1
5. Under **Redirects/Rewrites**, add:
   - **Source:** `/*`  **Destination:** `/index.html`  **Type:** Rewrite
6. Click **"Create Static Site"**

---

## Step 3: Update FRONTEND_URL in Backend

Once frontend is deployed, go to the backend service → **Environment** tab and update `FRONTEND_URL` to the frontend URL.

---

## Notes

- Free tier cold starts: Backend spins down after 15 min of inactivity (~30-50s delay on first request after idle).
- MongoDB Atlas, Groq AI Chatbot, and Gmail SMTP are all pre-configured in the code.
- See `backend/.env.example` for the full list of required environment variables.
