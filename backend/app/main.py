# backend/main.py

from fastapi import FastAPI
# No need for 'from typing import Optional' if you only use '|'
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
from .core.config import settings # The dot . means "from the current package"


app = FastAPI()

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

@app.get("/")
async def read_root():
    return {
        "message": "Hello from FastAPI Backend on Cloud Run!",
        "status": "healthy"
    }

@app.get("/api/hello") # Let's use a more specific endpoint for the test
async def hello(): # say_hello in Urdu as a little fun, or just say_hello
    return {"message": "Hello from the /api/hello endpoint!"}

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
