# Railway Deployment Guide - Backend

## Prerequisites
1. GitHub account with your repository pushed
2. Railway account (sign up at https://railway.app)
3. MongoDB Atlas account for production database

## Step-by-Step Deployment

### 1. Setup MongoDB Atlas (Production Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login → Create New Cluster (Free M0 cluster)
3. Choose Cloud Provider: AWS, Region: Closest to your users
4. Click "Create Cluster" (takes 3-5 minutes)
5. Once ready:
   - Click "Connect" on your cluster
   - Add IP: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Create Database User: Username & Password (SAVE THESE!)
   - Click "Choose connection method" → "Connect your application"
   - Copy the connection string: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password

### 2. Deploy Backend to Railway

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Click "Login" → "Login with GitHub"
   - Authorize Railway to access your repositories

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository: `gov-docflow-ai`
   - Railway will detect your project

3. **Configure Backend Service**
   - Railway will create a service automatically
   - Click on the service card
   - Go to "Settings" tab
   - Set Root Directory: `backend`
   - Set Start Command: `npm start`
   - Set Node version: Latest (v18 or v20)

4. **Add Environment Variables**
   - Click "Variables" tab
   - Add these variables one by one:

   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-secure-random-string-32-chars>
   
   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-gmail-address>
   EMAIL_PASS=<your-gmail-app-password>
   
   # Google Gemini AI
   GEMINI_API_KEY=<your-gemini-api-key>
   
   # Frontend URL (add after Vercel deployment)
   FRONTEND_URL=https://your-app.vercel.app
   
   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   ```

   **How to generate JWT_SECRET:**
   - In your terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

   **How to get Gmail App Password:**
   - Go to Google Account → Security → 2-Step Verification (enable it)
   - Then go to App Passwords → Generate new app password
   - Select "Mail" and your device → Copy the 16-character password

5. **Deploy**
   - Railway will automatically deploy after adding variables
   - Wait for build to complete (2-5 minutes)
   - Once deployed, you'll see a URL like: `https://backend-production-xxxx.up.railway.app`
   - **COPY THIS URL** - you'll need it for frontend

6. **Verify Backend is Running**
   - Visit: `https://your-backend-url.railway.app/api/health`
   - Should see: `{"status":"ok"}`

### 3. Seed Initial Data (Optional but Recommended)

1. In Railway dashboard → Click your service
2. Click "Terminal" tab
3. Run these commands:
   ```bash
   npm run seed-departments
   npm run seed-users
   ```
   Or manually trigger via Railway CLI

---

## Troubleshooting

**Build Fails:**
- Check "Logs" tab for errors
- Ensure all dependencies are in package.json
- Check Node version compatibility

**Can't Connect to MongoDB:**
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check MONGODB_URI is correct with password properly encoded
- Ensure database user has read/write permissions

**Email Not Sending:**
- Verify Gmail app password is correct
- Check 2-Step Verification is enabled
- Ensure EMAIL_USER and EMAIL_PASS are correct

---

**Next:** Deploy Frontend to Vercel (see VERCEL_DEPLOYMENT.md)
