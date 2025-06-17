# backend/app/main.py

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
# Import the dependency and the User model from your new security file
from .core.security import get_current_user, User

app = FastAPI(
    title="LiveSolve AI API",
    description="API for the LiveSolve handwriting analysis and feedback tool.",
    version="0.1.0"
)

# Configure CORS
origins = [
    "<http://localhost:5173>",  # Vite dev server
    "<http://localhost:3000>",  # React dev server
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

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from the /api/hello endpoint!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# --- PROTECTED ROUTE (Login required) ---

@app.get("/api/me", response_model=User)
async def read_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Test endpoint to verify authentication.
    Returns the current user's data if the token is valid.
    """
    # The code here only runs if `get_current_user` was successful.
    # The `current_user` variable will contain the User object returned by the dependency.
    return current_user

