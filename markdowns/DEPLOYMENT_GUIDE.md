# 🚀 GitHub Deployment Guide for UCon Ministries Website

This guide will help you deploy your Next.js website to Vercel using GitHub for continuous deployment.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git installed on your local machine

## 🔧 Step 1: Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

## 📦 Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `ucon-ministries-website`)
3. **Do NOT** initialize with README, .gitignore, or license (you already have these)
4. Copy the repository URL

## 📤 Step 3: Push to GitHub

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR-USERNAME/ucon-ministries-website.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 4: Connect Vercel to GitHub

### Option A: Automatic Deployment (Recommended)

1. **Login to Vercel**
   - Go to https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `bun run build` (or leave default)
   - Output Directory: `.next` (leave as default)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add:

   ```
   TURSO_DATABASE_URL=your_database_url
   TURSO_AUTH_TOKEN=your_auth_token
   BETTER_AUTH_SECRET=your_auth_secret
   BETTER_AUTH_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   RESEND_API_KEY=your_resend_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (2-5 minutes)
   - Your site will be live at `your-project.vercel.app`

### Option B: Manual Deployment via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🔐 Step 5: Setup GitHub Actions (Optional - Advanced)

To enable the GitHub Actions workflow for automatic deployments:

1. **Get Vercel Credentials**
   
   ```bash
   # Get your Vercel token from: https://vercel.com/account/tokens
   # Create a new token with deployment permissions
   ```

2. **Get Project IDs**
   
   ```bash
   # In your project directory
   vercel link
   
   # Get IDs from .vercel/project.json
   cat .vercel/project.json
   ```

3. **Add GitHub Secrets**
   
   Go to: GitHub Repository → Settings → Secrets and variables → Actions
   
   Add these secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your organization ID
   - `VERCEL_PROJECT_ID`: Your project ID
   - `TURSO_DATABASE_URL`: Your database URL
   - `TURSO_AUTH_TOKEN`: Your database token
   - `BETTER_AUTH_SECRET`: Your auth secret
   - `BETTER_AUTH_URL`: Your production URL
   - `NEXT_PUBLIC_APP_URL`: Your production URL
   - `RESEND_API_KEY`: Your Resend API key

4. **GitHub Actions will now automatically deploy on every push to main!**

## 🎯 Step 6: Configure Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `uconministries.org`)
4. Follow DNS configuration instructions
5. Update environment variables with new domain

## 🔄 Deployment Workflow

After setup, your deployment workflow will be:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main

# Vercel automatically deploys! 🎉
```

## 📊 Monitoring Deployments

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: Repository → Actions tab
- **Build Logs**: Check Vercel dashboard for detailed logs

## 🐛 Troubleshooting

### Build Fails on Vercel

1. **Check environment variables** - Make sure all required vars are set
2. **Check build logs** - Look for specific error messages
3. **Test locally** - Run `bun run build` to catch issues early

### Database Connection Issues

- Ensure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correctly set
- Check that database is accessible from Vercel's network

### Authentication Problems

- Verify `BETTER_AUTH_URL` matches your deployment URL
- Ensure `BETTER_AUTH_SECRET` is set and secure

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use GitHub Secrets** - For all sensitive environment variables
3. **Rotate tokens regularly** - Update API keys periodically
4. **Enable branch protection** - Protect main branch from direct pushes
5. **Review deployment previews** - Check PRs before merging

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🎉 Success!

Your website should now be:
- ✅ Hosted on GitHub
- ✅ Automatically deployed to Vercel
- ✅ Live and accessible worldwide
- ✅ Ready for continuous updates

Every push to your main branch will trigger a new deployment automatically!

---

**Need Help?** Contact your development team or refer to the documentation links above.
