#!/bin/zsh
# backend/deploy_backend.sh
# Script to deploy a pre-built Docker image from Artifact Registry to Google Cloud Run.
# to run: ./deploy_backend.sh

# --- Source local deployment environment variables if file exists ---
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
AI_REGION_VALUE="us-central1"
CLOUD_RUN_SERVICE_NAME="livesolve-backend"
ARTIFACT_REPO_NAME="livesolve-repo"
IMAGE_NAME="backend-api"

IMAGE_TAG="1.1.0" # Using the same tag, no need to rebuild the image

# Database and App environment variables
GCS_BUCKET_NAME_VALUE="livesolve-mvp-images"
DB_USER_VALUE="user"
DB_NAME_VALUE="livesolve_app_db"
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
ENV_VARS="GCP_PROJECT_ID=${GCP_PROJECT_ID},"
ENV_VARS+="FIREBASE_PROJECT_ID=${GCP_PROJECT_ID},"
ENV_VARS+="GCS_BUCKET_NAME=${GCS_BUCKET_NAME_VALUE},"
ENV_VARS+="GCP_REGION=${GCP_REGION},"
ENV_VARS+="AI_REGION=${AI_REGION_VALUE},"
ENV_VARS+="DB_USER=${DB_USER_VALUE},"
ENV_VARS+="DB_PASSWORD=${DEPLOY_DB_PASSWORD},"
ENV_VARS+="DB_NAME=${DB_NAME_VALUE},"
ENV_VARS+="DB_INSTANCE_CONNECTION_NAME=${DB_INSTANCE_CONNECTION_NAME_VALUE}"


# --- THE DEPLOY COMMAND (CORRECTED SYNTAX) ---
# The --add-cloudsql-instances flag is now correctly included as an argument
# to the gcloud command, with the proper line continuation.
gcloud run deploy "${CLOUD_RUN_SERVICE_NAME}" \
  --image "${IMAGE_NAME_TAG}" \
  --region "${GCP_REGION}" \
  --project "${GCP_PROJECT_ID}" \
  --allow-unauthenticated \
  --set-env-vars="${ENV_VARS}" \
  --add-cloudsql-instances "${DB_INSTANCE_CONNECTION_NAME_VALUE}"

EXIT_CODE=$? # Capture the exit code of gcloud deploy

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Cloud Run deployment successful for '${CLOUD_RUN_SERVICE_NAME}'."
else
  echo "❌ Cloud Run deployment FAILED for '${CLOUD_RUN_SERVICE_NAME}' with exit code $EXIT_CODE."
fi

exit $EXIT_CODE