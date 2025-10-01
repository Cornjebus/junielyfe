# Deployment Guide

## Vercel Deployment (Web App)

### Initial Setup

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   pnpm add -g vercel
   ```

2. **Connect GitHub Repository**:
   - Go to https://vercel.com/new
   - Import your GitHub repository: `junielyfe`
   - Select "Continue" when prompted

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (monorepo root)
   - **Build Command**: `pnpm build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `pnpm install`

4. **Add Environment Variables**:

   Navigate to Project Settings → Environment Variables and add:

   ```bash
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cGVhY2VmdWwtamFja2FsLTEuY2xlcmsuYWNjb3VudHMuZGV2JA
   CLERK_SECRET_KEY=sk_test_EFIl6QBiu4DdKFEAt7EdwywStObZGvbNrDbR2qsed2
   CLERK_WEBHOOK_SECRET=[Get from Clerk Dashboard after deployment]

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://jwpopvvaoipjjslrlpmg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cG9wdnZhb2lwampzbHJscG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzE3ODQsImV4cCI6MjA3NDg0Nzc4NH0.zxj0sW63vRn47G6HG3gAcE_LnuRdLoaePzoEb_-JkY4
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cG9wdnZhb2lwampzbHJscG1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI3MTc4NCwiZXhwIjoyMDc0ODQ3Nzg0fQ.4jw827w2wg8lyMqLE7PfqVn4T5LzeWNwUMvF_2RZwyY

   # OpenAI
   OPENAI_API_KEY=[Get from .env.local]

   # QStash
   QSTASH_URL=[Get from .env.local]
   QSTASH_TOKEN=[Get from .env.local]
   QSTASH_CURRENT_SIGNING_KEY=[Get from .env.local]
   QSTASH_NEXT_SIGNING_KEY=[Get from .env.local]

   # PostHog (TODO: Get real key)
   NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_POSTHOG_KEY
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

   # App Configuration
   NEXT_PUBLIC_APP_URL=[Will be your Vercel URL]
   WORKER_URL=[Will be your worker deployment URL]
   NODE_ENV=production
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Note your production URL (e.g., `https://junielyfe.vercel.app`)

### Post-Deployment: Configure Clerk Webhook

Once deployed, you need to set up the Clerk webhook:

1. **Get your Vercel URL** (e.g., `https://junielyfe.vercel.app`)

2. **Configure Clerk Webhook**:
   - Go to https://dashboard.clerk.com
   - Navigate to "Webhooks" in the sidebar
   - Click "Add Endpoint"
   - **Endpoint URL**: `https://your-vercel-url.vercel.app/api/webhooks/clerk`
   - **Subscribe to events**:
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - Click "Create"

3. **Copy Webhook Secret**:
   - After creating the webhook, copy the signing secret (starts with `whsec_`)
   - Go back to Vercel → Project Settings → Environment Variables
   - Update `CLERK_WEBHOOK_SECRET` with the real value
   - Redeploy to apply the change

4. **Test the Webhook**:
   - Sign up a new user in your app
   - Check Supabase Studio → `users` table to verify the user was synced
   - Check `clerk_webhook_events` table for webhook logs

### Preview Deployments

Vercel automatically creates preview deployments for:
- Every push to a branch
- Every pull request

Preview URLs follow the pattern: `https://junielyfe-git-[branch]-[team].vercel.app`

## Railway Deployment (Background Worker)

### Setup

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Create New Project**:
   ```bash
   cd apps/worker
   railway init
   ```

4. **Add Environment Variables**:
   ```bash
   railway variables set SUPABASE_SERVICE_ROLE_KEY="..."
   railway variables set NEXT_PUBLIC_SUPABASE_URL="..."
   railway variables set OPENAI_API_KEY="..."
   railway variables set QSTASH_TOKEN="..."
   railway variables set QSTASH_CURRENT_SIGNING_KEY="..."
   railway variables set QSTASH_NEXT_SIGNING_KEY="..."
   railway variables set PORT=3001
   railway variables set NODE_ENV=production
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Get Worker URL**:
   ```bash
   railway domain
   ```

7. **Update Vercel Environment**:
   - Add `WORKER_URL` to Vercel environment variables with Railway URL
   - Redeploy web app

## GitHub Actions CI/CD

CI runs automatically on:
- Every push to `main`
- Every pull request

Jobs:
1. **Lint** - ESLint checks
2. **Typecheck** - TypeScript compilation
3. **Build** - Full Turborepo build

## Monitoring

- **Vercel**: https://vercel.com/dashboard
- **Railway**: https://railway.app/dashboard
- **Supabase**: https://supabase.com/dashboard/project/jwpopvvaoipjjslrlpmg
- **Clerk**: https://dashboard.clerk.com
- **PostHog**: https://app.posthog.com (once configured)

## Rollback

### Vercel
1. Go to Deployments tab
2. Find the last working deployment
3. Click "..." → "Promote to Production"

### Railway
```bash
railway rollback
```
