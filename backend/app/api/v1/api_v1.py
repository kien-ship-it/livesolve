# backend/app/api/v1/api_v1.py

from fastapi import APIRouter
from .endpoints import submission

api_router = APIRouter()

# Include the submission router
# All endpoints from submission.py will be prefixed with /submission
api_router.include_router(submission.router, prefix="/submission", tags=["Submission"])