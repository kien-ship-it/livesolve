# backend/main.py

from fastapi import FastAPI
# No need for 'from typing import Optional' if you only use '|'
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware

app = FastAPI()

origins = [
    "<http://localhost:5173>",  # Your local React dev server (default for Vite)
    "<http://localhost:3000>",  # Common for create-react-app
    # Add your Firebase Hosting URL once deployed:
    # "<https://your-project-id.web.app>",
    # "<https://your-project-id.firebaseapp.com>",
    # For this initial test with deployed services, you'll need the Firebase URL.
    # If you haven't deployed the frontend yet but want to test backend with a tool like Postman,
    # this isn't strictly necessary for Postman, but good to have for the browser test.
]

origins_for_testing = ["*"] # Allows all origins for now - BE CAREFUL with this in production

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_for_testing,  # Now allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI Backend on Cloud Run!"}

@app.get("/api/hello") # Let's use a more specific endpoint for the test
async def hello(): # say_hello in Urdu as a little fun, or just say_hello
    return {"message": "Hello from the /api/hello endpoint!"}