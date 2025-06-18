#!/bin/zsh

# Script to deploy the backend to Google Cloud Run

# --- Source local deployment environment variables if file exists ---
DEPLOY_ENV_FILE=".deploy.env"
if [ -f "$DEPLOY_ENV_FILE" ]; then
  echo "Sourcing deployment secrets from $DEPLOY_ENV_FILE"
  # Using set -a to export all variables defined in the sourced file
  # and then set +a to turn it off. This makes them available to gcloud.
  set -a 
  source "$DEPLOY_ENV_FILE"
  set +a
else
  echo "Warning: $DEPLOY_ENV_FILE not found. Assuming secrets are pre-exported or not needed for this step."
fi
# --- End Sourcing ---

# --- Configuration Variables (Generally non-sensitive, can be hardcoded or also in .deploy.env if preferred) ---
GCP_PROJECT_ID="fleet-automata-460507-p5"
GCP_REGION="asia-southeast1"
CLOUD_RUN_SERVICE_NAME="livesolve-backend"
GCS_BUCKET_NAME_VALUE="livesolve-mvp-images"
DB_USER_VALUE="user"
# DB_PASSWORD_VALUE is now expected from .deploy.env as DEPLOY_DB_PASSWORD
DB_NAME_VALUE="livesolve_app_db"
DB_INSTANCE_CONNECTION_NAME_ENV_VAR_VALUE="${GCP_PROJECT_ID}:${GCP_REGION}:livesolve-postgres-mvp"
# --- End Configuration Variables ---

# --- Check for REQUIRED SENSITIVE Environment Variables ---
if [ -z "$DEPLOY_DB_PASSWORD" ]; then # Check for the variable loaded from .deploy.env
  echo "Error: Required secret DEPLOY_DB_PASSWORD is not set."
  echo "Please ensure it is defined in $DEPLOY_ENV_FILE or exported in your environment."
  exit 1
fi
# --- End Sensitive Variable Check ---

echo "Starting Cloud Run deployment for ${CLOUD_RUN_SERVICE_NAME} with user ${DB_USER_VALUE}..."

gcloud run deploy "${CLOUD_RUN_SERVICE_NAME}" \
  --source . \
  --region "${GCP_REGION}" \
  --set-env-vars="GCP_PROJECT_ID=${GCP_PROJECT_ID}" \
  --set-env-vars="GCS_BUCKET_NAME=${GCS_BUCKET_NAME_VALUE}" \
  --set-env-vars="DB_USER=${DB_USER_VALUE}" \
  --set-env-vars="DB_PASSWORD=${DEPLOY_DB_PASSWORD}" \
  --set-env-vars="DB_NAME=${DB_NAME_VALUE}" \
  --set-env-vars="DB_INSTANCE_CONNECTION_NAME=${DB_INSTANCE_CONNECTION_NAME_ENV_VAR_VALUE}"

EXIT_CODE=$? # Capture the exit code of gcloud deploy

if [ $EXIT_CODE -eq 0 ]; then
  echo "Cloud Run deployment successful for '${CLOUD_RUN_SERVICE_NAME}'."
else
  echo "Cloud Run deployment FAILED for '${CLOUD_RUN_SERVICE_NAME}' with exit code $EXIT_CODE."
fi

exit $EXIT_CODE