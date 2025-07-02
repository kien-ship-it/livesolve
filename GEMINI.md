# Deployment Process

This document outlines the steps to deploy the backend and frontend of the application.

## Backend Deployment (Google Cloud Run)

1.  **List existing versions:**
    ```bash
    gcloud artifacts docker images list asia-southeast1-docker.pkg.dev/fleet-automata-460507-p5/livesolve-repo --include-tags --filter='IMAGE ~ "backend-api$"'
    ```
2.  **Determine the next version tag** (e.g., incrementing the patch version `x.y.z -> x.y.z+1`).

3.  **Build and push the new Docker image:**
    (Replace `[VERSION]` with the new version tag)
    ```bash
    docker build --platform linux/amd64 -t asia-southeast1-docker.pkg.dev/fleet-automata-460507-p5/livesolve-repo/backend-api:[VERSION] -f backend/Dockerfile backend && docker push asia-southeast1-docker.pkg.dev/fleet-automata-460507-p5/livesolve-repo/backend-api:[VERSION]
    ```

4.  **Update the deployment script:**
    -   Modify `backend/deploy_backend.sh`.
    -   Change the `IMAGE_TAG` variable to the new `[VERSION]`.

5.  **Run the deployment script:**
    ```bash
    ./backend/deploy_backend.sh
    ```

## Frontend Deployment (Firebase Hosting)

1.  **Build and Deploy**
    ```bash
    npm run build --prefix frontend && firebase deploy --only hosting
    ```
    *If there are build errors, they must be fixed before deployment.*


## Future Deployment Workflow

Next time you ask me to deploy, I will:
1.  Ask for your confirmation to start the process.
2.  Suggest the next version based on the latest version in the registry.
3.  You will provide the version you want to deploy.
4.  I will execute the backend and frontend deployment steps as outlined above.