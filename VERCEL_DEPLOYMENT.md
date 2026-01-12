# Vercel Deployment Guide - Frontend

## Prerequisites
1. Backend deployed on Railway (complete RAILWAY_DEPLOYMENT.md first)
2. Vercel account (sign up at https://vercel.com)
3. GitHub repository with your code

## Step-by-Step Deployment

### 1. Prepare Frontend for Deployment

Before deploying, ensure your `.env` file structure is correct for Vercel.

#### Create `.env.production` file:
Create this file in your root directory with:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

**Replace** `your-backend-url.railway.app` with your actual Railway backend URL from previous step.

### 2. Update package.json Scripts

Your build script should be:
```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

### 3. Deploy Frontend to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Click "Login" → "Continue with GitHub"
   - Authorize Vercel to access your repositories

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select: `gov-docflow-ai`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Create React App (auto-detected)
   - **Root Directory:** `./ ` (leave as root, NOT backend)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" section and add:
   
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```
   
   - Environment: Production
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy (2-5 minutes)
   - Once complete, you'll get a URL like: `https://gov-docflow-ai.vercel.app`

6. **Update Railway Backend CORS**
   - Go back to Railway dashboard
   - Click your backend service → Variables
   - Update or add:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - This ensures CORS allows requests from your Vercel frontend

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to your project root
cd /Users/anks/Documents/GitHub/gov-docflow-ai

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? gov-docflow-ai
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add REACT_APP_API_URL production
# Enter: https://your-backend-url.railway.app/api

# Deploy to production
vercel --prod
```

### 4. Custom Domain (Optional)

1. In Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain: `yourapp.com`
3. Follow DNS configuration instructions:
   - Add A record or CNAME to your domain registrar
   - Wait for DNS propagation (5-30 minutes)

### 5. Verify Deployment

1. **Test Frontend:**
   - Visit your Vercel URL: `https://your-app.vercel.app`
   - Check homepage loads
   - Try login/signup functionality

2. **Test API Connection:**
   - Open browser console (F12)
   - Try logging in
   - Check Network tab for API calls to Railway backend
   - Ensure no CORS errors

3. **Test File Upload:**
   - Login as an officer
   - Try uploading a document
   - Verify it processes correctly

## Configuration Files Summary

### `.env.production` (Root directory)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

### `vercel.json` (Optional - for advanced routing)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Post-Deployment Checklist

- [ ] Backend deployed on Railway and accessible
- [ ] MongoDB Atlas connected and working
- [ ] Frontend deployed on Vercel and accessible
- [ ] API calls from frontend to backend working (check console)
- [ ] Login/Signup functionality working
- [ ] File upload working
- [ ] Email notifications sending
- [ ] AI document processing working
- [ ] No CORS errors in console
- [ ] All environment variables set correctly

## Troubleshooting

### Build Fails on Vercel

**Error: "Module not found"**
- Check all imports in your files
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Build exceeded maximum duration"**
- Contact Vercel support to increase build time
- Or optimize your build by removing unused dependencies

### API Not Connecting

**CORS Errors:**
- Verify `FRONTEND_URL` in Railway backend matches Vercel URL
- Check backend CORS configuration allows your domain
- Ensure no trailing slashes in URLs

**404 on API Calls:**
- Verify `REACT_APP_API_URL` is correct and includes `/api`
- Check Railway backend is running (visit health endpoint)
- Ensure environment variable is set in Vercel

### Environment Variables Not Working

- Vercel requires `REACT_APP_` prefix for Create React App
- After adding env vars, redeploy: Vercel dashboard → Deployments → Redeploy
- Clear cache: Settings → Clear Cache and Redeploy

### Images/Assets Not Loading

- Ensure all image imports use relative paths
- Check `public` folder assets are committed to git
- Verify image extensions are lowercase

## Continuous Deployment

Once setup, any push to your GitHub main branch will automatically:
1. Trigger new deployment on Vercel (frontend)
2. Railway will auto-deploy if configured (backend)

To disable auto-deploy:
- Vercel: Project Settings → Git → Disable Auto-deploy
- Railway: Service Settings → Deploy → Manual deploy

## Monitoring & Logs

### Vercel Logs:
- Dashboard → Your Project → Deployments → Click deployment → View Logs
- Real-time logs: Runtime Logs tab

### Railway Logs:
- Dashboard → Your Service → Logs tab
- Filter by severity: Info, Warn, Error

---

**Deployment Complete! 🎉**

Your application is now live at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`
