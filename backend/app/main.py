# backend/app/main.py

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.security import get_current_user, User
from .api.v1.api_v1 import api_router as api_v1_router # IMPORT OUR NEW V1 ROUTER

app = FastAPI(
    title="LiveSolve AI API",
    description="API for the LiveSolve handwriting analysis and feedback tool.",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # React dev server
    "https://*.web.app",      # Firebase Hosting
    "https://*.firebaseapp.com"  # Firebase Hosting
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PUBLIC ROUTES (No login required) ---
@app.get("/")
async def read_root():
    return {
        "message": "Hello from FastAPI Backend on Cloud Run!",
        "status": "healthy"
    }

# --- API ROUTERS ---
# Include the v1 router. All routes defined in api_v1.py will now be active
# and prefixed with /api/v1.
# So, our upload endpoint will be available at: /api/v1/submission/upload-image
app.include_router(api_v1_router, prefix="/api/v1")

# --- EXAMPLE PROTECTED ROUTE (You can keep this for testing or remove it) ---
@app.get("/api/me", response_model=User, tags=["Testing"])
async def read_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Test endpoint to verify authentication.
    Returns the current user's data if the token is valid.
    """
    return current_user