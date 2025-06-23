# backend/app/core/config.py
# (Updated with Firebase Initialization and a dedicated AI_REGION)

import firebase_admin
from firebase_admin import credentials
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, validator, Field
from typing import Optional, Dict, Any

class Settings(BaseSettings):
    # --- Primary GCP Configuration ---
    GCP_PROJECT_ID: str
    GCS_BUCKET_NAME: str
    # GCP_REGION is the main region for most services (Cloud Run, SQL, Storage)
    GCP_REGION: str
    # AI_REGION is the specific region for the AI model API call, which may differ.
    AI_REGION: str # <--- ADDED: Dedicated setting for the AI service region
    
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None

    # --- Database Configuration ---
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[int] = 5432
    DB_NAME: str
    DB_INSTANCE_CONNECTION_NAME: Optional[str] = None # For Cloud Run SQL connection
    DATABASE_URL: Optional[PostgresDsn] = None

    @validator("DATABASE_URL", pre=True, always=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str): # If DATABASE_URL is directly set in env, use it
            return v

        db_user = values.get("DB_USER")
        db_password = values.get("DB_PASSWORD")
        db_name = values.get("DB_NAME")
        db_host_env = values.get("DB_HOST")

        if (db_host_env and db_host_env.startswith("/cloudsql/")) or values.get("DB_INSTANCE_CONNECTION_NAME"):
            instance_connection_name = values.get("DB_INSTANCE_CONNECTION_NAME") or \
                                       (db_host_env.split('/')[-1] if db_host_env else None)
            if not instance_connection_name:
                 raise ValueError("DB_INSTANCE_CONNECTION_NAME or valid DB_HOST for Cloud SQL socket not provided")

            socket_dir = f"/cloudsql/{instance_connection_name}"
            dsn_string = f"postgresql+psycopg2://{db_user}:{db_password}@localhost/{db_name or ''}?host={socket_dir}"
            return dsn_string

        elif db_host_env: # For local TCP connection (e.g. Cloud SQL Proxy)
            db_port_val = values.get("DB_PORT")
            return PostgresDsn.build(
                scheme="postgresql+psycopg2",
                username=db_user,
                password=db_password,
                host=db_host_env,
                port=db_port_val,
                path=f"{db_name or ''}",
            )
        else:
            raise ValueError("Cannot assemble DATABASE_URL: Insufficient DB connection parameters.")

    # --- MVP Specifics ---
    PROBLEM_ID_MVP: Optional[str] = Field(default=None)
    CANONICAL_SOLUTION_MVP: Optional[str] = Field(default=None)

    # --- Firebase ---
    FIREBASE_PROJECT_ID: Optional[str] = Field(default=None)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# FIREBASE ADMIN INITIALIZATION
try:
    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()

        firebase_admin.initialize_app(cred, {
            'projectId': settings.FIREBASE_PROJECT_ID,
        })
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")