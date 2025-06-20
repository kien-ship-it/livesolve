#!/bin/zsh
# backend/deploy_backend.sh
# Script to deploy a pre-built Docker image from Artifact Registry to Google Cloud Run.
# to run: ./deploy_backend.sh

# --- Source local deployment environment variables if file exists ---
# This file should contain secrets and should NOT be committed to git.
# Example .deploy.env:
# DEPLOY_DB_PASSWORD="your_secret_password"
DEPLOY_ENV_FILE=".deploy.env"
if [ -f "$DEPLOY_ENV_FILE" ]; then
  echo "Sourcing deployment secrets from $DEPLOY_ENV_FILE"
  set -a
  source "$DEPLOY_ENV_FILE"
  set +a
else
  echo "Warning: $DEPLOY_ENV_FILE not found. Assuming secrets are pre-exported."
fi
# --- End Sourcing ---

# --- Configuration Variables ---
GCP_PROJECT_ID="fleet-automata-460507-p5"
GCP_REGION="asia-southeast1"
CLOUD_RUN_SERVICE_NAME="livesolve-backend"
ARTIFACT_REPO_NAME="livesolve-repo" # The repo we created
IMAGE_NAME="backend-api"
IMAGE_TAG="0.1.3" # Make sure this matches the tag you built and pushed

# Database and App environment variables
GCS_BUCKET_NAME_VALUE="livesolve-mvp-images"
DB_USER_VALUE="user"
DB_NAME_VALUE="livesolve_app_db"
# IMPORTANT: Use the correct Cloud SQL Instance Connection Name for your project
DB_INSTANCE_CONNECTION_NAME_VALUE="${GCP_PROJECT_ID}:${GCP_REGION}:livesolve-postgres-mvp"

# --- Construct the full image name ---
IMAGE_NAME_TAG="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${ARTIFACT_REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"

# --- Check for REQUIRED SENSITIVE Environment Variables ---
if [ -z "$DEPLOY_DB_PASSWORD" ]; then
  echo "Error: Required secret DEPLOY_DB_PASSWORD is not set."
  echo "Please ensure it is defined in $DEPLOY_ENV_FILE or exported in your environment."
  exit 1
fi
# --- End Sensitive Variable Check ---

echo "Starting Cloud Run deployment for ${CLOUD_RUN_SERVICE_NAME}..."
echo "Using image: ${IMAGE_NAME_TAG}"

# --- CONSOLIDATED ENVIRONMENT VARIABLES STRING ---
# This is a cleaner way to pass multiple variables.
ENV_VARS="GCP_PROJECT_ID=${GCP_PROJECT_ID},"
ENV_VARS+="FIREBASE_PROJECT_ID=${GCP_PROJECT_ID}," # Added this, it's needed for firebase-admin
ENV_VARS+="GCS_BUCKET_NAME=${GCS_BUCKET_NAME_VALUE},"
ENV_VARS+="DB_USER=${DB_USER_VALUE},"
ENV_VARS+="DB_PASSWORD=${DEPLOY_DB_PASSWORD},"
ENV_VARS+="DB_NAME=${DB_NAME_VALUE},"
# IMPORTANT: The key for this in your config.py is DB_INSTANCE_CONNECTION_NAME
ENV_VARS+="DB_INSTANCE_CONNECTION_NAME=${DB_INSTANCE_CONNECTION_NAME_VALUE}"


# --- THE DEPLOY COMMAND ---
# CHANGED: Using --image instead of --source
gcloud run deploy "${CLOUD_RUN_SERVICE_NAME}" \
  --image "${IMAGE_NAME_TAG}" \
  --region "${GCP_REGION}" \
  --project "${GCP_PROJECT_ID}" \
  --allow-unauthenticated \
  --set-env-vars="${ENV_VARS}"

EXIT_CODE=$? # Capture the exit code of gcloud deploy

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Cloud Run deployment successful for '${CLOUD_RUN_SERVICE_NAME}'."
else
  echo "❌ Cloud Run deployment FAILED for '${CLOUD_RUN_SERVICE_NAME}' with exit code $EXIT_CODE."
fi

exit $EXIT_CODE