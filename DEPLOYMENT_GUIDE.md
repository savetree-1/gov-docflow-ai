# Complete Deployment Guide - Railway + Vercel

## 🚀 Quick Start Deployment Checklist

Follow these steps in order:

### Phase 1: Pre-Deployment Setup (15 minutes)

- [ ] **1. Push Latest Code to GitHub**
  ```bash
  git add .
  git commit -m "Prepare for deployment"
  git push origin main
  ```

- [ ] **2. Create MongoDB Atlas Account**
  - Go to: https://www.mongodb.com/cloud/atlas
  - Sign up (free tier available)
  - Create a new cluster (M0 Sandbox - Free)
  - **Save cluster connection string**

- [ ] **3. Get Required API Keys**
  - **Gemini API Key**: https://makersuite.google.com/app/apikey
  - **Gmail App Password**: Google Account → Security → 2-Step Verification → App Passwords
  - **Generate JWT Secret**: Run in terminal:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

---

### Phase 2: Deploy Backend to Railway (20 minutes)

- [ ] **1. Create Railway Account**
  - Go to: https://railway.app
  - Sign up with GitHub

- [ ] **2. Create New Project**
  - Click "New Project" → "Deploy from GitHub repo"
  - Select: `gov-docflow-ai`

- [ ] **3. Configure Service**
  - Click service card → Settings
  - **Root Directory**: `backend`
  - **Start Command**: `npm start`
  - **Build Command**: `npm install`

- [ ] **4. Add Environment Variables**
  Click "Variables" tab and add these:
  
  ```env
  NODE_ENV=production
  PORT=5001
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pravah_prototype
  JWT_SECRET=<your-generated-32-char-string>
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=<your-gmail@gmail.com>
  EMAIL_PASS=<your-16-char-app-password>
  GEMINI_API_KEY=<your-gemini-api-key>
  FRONTEND_URL=https://placeholder.vercel.app
  MAX_FILE_SIZE=10485760
  UPLOAD_DIR=./uploads
  ```

- [ ] **5. Deploy Backend**
  - Railway auto-deploys after adding variables
  - Wait 2-5 minutes for build
  - **Copy your backend URL**: `https://backend-production-xxxx.up.railway.app`

- [ ] **6. Test Backend**
  - Visit: `https://your-railway-url.up.railway.app/api/health`
  - Should return: `{"status":"ok"}`

- [ ] **7. Seed Database (Optional)**
  - Railway Dashboard → Service → Terminal
  - Run: `node seedDepartments.js && node seedUsers.js`

---

### Phase 3: Deploy Frontend to Vercel (15 minutes)

- [ ] **1. Create `.env.production` file**
  In project root directory, create:
  ```env
  REACT_APP_API_URL=https://your-railway-url.up.railway.app/api
  ```
  *(Replace with actual Railway URL)*

- [ ] **2. Commit .env.production**
  ```bash
  git add .env.production
  git commit -m "Add production environment variables"
  git push origin main
  ```

- [ ] **3. Create Vercel Account**
  - Go to: https://vercel.com
  - Sign up with GitHub

- [ ] **4. Import Project**
  - Click "Add New..." → "Project"
  - Select: `gov-docflow-ai`
  - Click "Import"

- [ ] **5. Configure Build Settings**
  - **Framework Preset**: Create React App
  - **Root Directory**: `./`
  - **Build Command**: `npm run build`
  - **Output Directory**: `build`

- [ ] **6. Add Environment Variable**
  - **Key**: `REACT_APP_API_URL`
  - **Value**: `https://your-railway-url.up.railway.app/api`
  - Click "Add"

- [ ] **7. Deploy**
  - Click "Deploy"
  - Wait 2-5 minutes
  - **Copy Vercel URL**: `https://gov-docflow-ai.vercel.app`

---

### Phase 4: Connect Frontend & Backend (5 minutes)

- [ ] **1. Update Railway FRONTEND_URL**
  - Go to Railway → Your Service → Variables
  - Edit `FRONTEND_URL` to your Vercel URL: `https://your-app.vercel.app`
  - Railway will redeploy automatically

- [ ] **2. Wait for Railway Redeploy**
  - Check Logs tab for "Deployment successful"

---

### Phase 5: Testing (10 minutes)

Visit your Vercel URL and test:

- [ ] **Homepage loads correctly**
- [ ] **Navigation works**
- [ ] **Login/Signup functionality**
  - Try: `admin@pravah.gov.in` / `admin123`
- [ ] **Dashboard loads**
- [ ] **File upload works**
- [ ] **Document processing works**
- [ ] **No CORS errors in console** (F12 → Console)
- [ ] **API calls succeed** (F12 → Network tab)

---

## 📋 Environment Variables Summary

### Railway Backend Variables:
```
NODE_ENV=production
PORT=5001
MONGODB_URI=<atlas-connection-string>
JWT_SECRET=<32-character-random-string>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>
GEMINI_API_KEY=<gemini-key>
FRONTEND_URL=<vercel-url>
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Vercel Frontend Variables:
```
REACT_APP_API_URL=<railway-backend-url>/api
```

---

## 🔧 Common Issues & Solutions

### Backend Won't Deploy
- **Check Logs**: Railway → Logs tab
- **Verify**: All dependencies in `backend/package.json`
- **Ensure**: `"start": "node server.js"` in scripts

### Frontend Won't Build
- **Check**: All imports are correct
- **Verify**: No syntax errors
- **Try**: `npm run build` locally first

### API Not Connecting
- **Check**: `REACT_APP_API_URL` includes `/api` at end
- **Verify**: Railway backend is running (visit health endpoint)
- **Check**: `FRONTEND_URL` in Railway matches Vercel URL exactly
- **Look for**: CORS errors in browser console

### Database Connection Failed
- **Check**: MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- **Verify**: Username/password in connection string are correct
- **Ensure**: Database user has read/write permissions

### Email Not Sending
- **Verify**: Gmail 2-Step Verification is enabled
- **Check**: App password is 16 characters (no spaces)
- **Ensure**: EMAIL_USER and EMAIL_PASS are correct

---

## 📱 Post-Deployment

### Auto-Deploy Setup
Both Railway and Vercel auto-deploy when you push to GitHub:
- Push to `main` → Both redeploy automatically

### Monitoring
- **Railway Logs**: Dashboard → Service → Logs
- **Vercel Logs**: Dashboard → Project → Deployments → Runtime Logs

### Custom Domain (Optional)
- **Vercel**: Project → Settings → Domains → Add Domain
- **Railway**: Service → Settings → Custom Domain

---

## 🎉 Success!

Your app is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app/api

**Default Login Credentials:**
- Super Admin: `admin@pravah.gov.in` / `admin123`
- Finance Admin: `finance.admin@pravah.gov.in` / `finance123`
- Disaster Admin: `disaster.admin@pravah.gov.in` / `disaster123`

---

## 📚 Detailed Guides

For more details, see:
- [`RAILWAY_DEPLOYMENT.md`](RAILWAY_DEPLOYMENT.md) - Backend deployment details
- [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md) - Frontend deployment details

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
