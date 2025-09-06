# backend/app/core/config_local.py
# Local development configuration with SQLite fallback

import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class LocalSettings(BaseSettings):
    """Local development settings with SQLite fallback"""
    
    # --- Primary GCP Configuration ---
    GCP_PROJECT_ID: str = "fleet-automata-460507-p5"
    GCS_BUCKET_NAME: str = "fleet-automata-460507-p5.appspot.com"
    GCP_REGION: str = "us-central1"
    AI_REGION: str = "global"
    
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None

    # --- Local Database Configuration (SQLite) ---
    USE_SQLITE: bool = True
    SQLITE_DB_PATH: str = "local_test.db"
    
    # --- Firebase ---
    FIREBASE_PROJECT_ID: Optional[str] = "fleet-automata-460507-p5"

    # --- MVP Specifics ---
    PROBLEM_ID_MVP: Optional[str] = "problem_1_algebra"
    CANONICAL_SOLUTION_MVP: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")

local_settings = LocalSettings()

# Override the main settings for local development
def get_local_settings():
    """Get settings configured for local development"""
    return local_settings
