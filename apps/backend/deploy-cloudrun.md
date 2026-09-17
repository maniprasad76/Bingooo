# Google Cloud Run Deployment Guide for Bingooo Backend

This guide walks through deploying the Bingooo NestJS backend (`@bingooo/api`) to **Google Cloud Run**.

---

## 1. Prerequisites

1. **Google Cloud Account**: A GCP project with billing enabled.
2. **Google Cloud CLI (`gcloud`)**: Install from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install) if deploying from your local machine, OR use **Cloud Shell** (free in GCP Console).
3. **Database**: Supabase PostgreSQL project with migrations applied.

---

## 2. One-Time GCP Setup

Open **Google Cloud Shell** (or your local terminal with `gcloud` installed):

```bash
# 1. Log in and select your project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Set your default region (e.g. asia-south1 for Mumbai, or us-central1)
export REGION="asia-south1"
export REPO="bingooo-repo"
export SERVICE="bingooo-api"
gcloud config set run/region $REGION

# 3. Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com

# 4. Create an Artifact Registry Docker repository
gcloud artifacts repositories create $REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="Bingooo container images"
```

---

## 3. Configure Environment Variables & Secrets

Store sensitive keys in **Google Secret Manager** for maximum security:

```bash
# Example: Create secrets for Supabase and Razorpay
echo -n "your-supabase-service-role-key" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
echo -n "your-razorpay-secret" | gcloud secrets create RAZORPAY_KEY_SECRET --data-file=-
```

---

## 4. Deploying to Cloud Run

### Option A: 1-Command Source Deploy (Easiest)

From the project root directory, run:

```bash
gcloud run deploy bingooo-api \
  --source . \
  --region asia-south1 \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,PORT=8080,CORS_ORIGINS=https://your-frontend-domain.vercel.app"
```

Cloud Run will automatically pick up the root [`Dockerfile`](file:///c:/Users/manip/Desktop/bingooo/Dockerfile), build the container in Cloud Build, and deploy the service.

### Option B: Build & Deploy with Docker

```bash
# Authenticate Docker to Artifact Registry
gcloud auth configure-docker asia-south1-docker.pkg.dev

# Build and Tag
docker build -t asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/bingooo-repo/bingooo-api:v1 -f Dockerfile .

# Push
docker push asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/bingooo-repo/bingooo-api:v1

# Deploy
gcloud run deploy bingooo-api \
  --image asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/bingooo-repo/bingooo-api:v1 \
  --region asia-south1 \
  --port 8080 \
  --memory 512Mi \
  --allow-unauthenticated
```

### Option C: Automated CI/CD with GitHub Actions

1. In your GitHub repository, go to **Settings → Secrets and variables → Actions**.
2. Add:
   - `GCP_PROJECT_ID`: Your GCP Project ID.
   - `GCP_SA_KEY`: Base64/JSON service account key with `Cloud Run Admin` and `Artifact Registry Writer` permissions.
3. Pushing to `main` will automatically build and deploy the backend!

---

## 5. Health Checks & Verification

Cloud Run provides automatic container health checks. You can test your live endpoints:

```bash
# Health check
curl https://bingooo-api-xyz-as.a.run.app/api/v1/health/live

# Swagger API Documentation
https://bingooo-api-xyz-as.a.run.app/api/docs
```

---

## 6. Connect Frontend to Cloud Run

In your frontend project (e.g. on Vercel or in [`apps/frontend/.env`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/.env)):

```env
VITE_API_URL=https://bingooo-api-xyz-as.a.run.app
```

And ensure the Cloud Run `CORS_ORIGINS` environment variable includes your frontend domain.
