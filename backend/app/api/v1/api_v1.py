# backend/app/api/v1/api_v1.py

from fastapi import APIRouter
from .endpoints import submission, ai_test

api_router = APIRouter()

# Include the submission router
# All endpoints from submission.py will be prefixed with /submission
api_router.include_router(submission.router, prefix="/submission", tags=["Submission"])

# Include the AI testing router
# All endpoints from ai_test.py will be prefixed with /ai
api_router.include_router(ai_test.router, prefix="/ai", tags=["AI Testing"])