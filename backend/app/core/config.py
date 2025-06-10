# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, validator, Field # Added Field
from typing import Optional, Dict, Any

class Settings(BaseSettings):
    # GCP Configuration
    GCP_PROJECT_ID: str
    GCS_BUCKET_NAME: str
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None

    # Database Configuration
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
        # db_host will be None if not set in env, which is fine for Cloud Run socket logic
        db_host_env = values.get("DB_HOST") # Get what was provided, if anything

        if (db_host_env and db_host_env.startswith("/cloudsql/")) or values.get("DB_INSTANCE_CONNECTION_NAME"):
            instance_connection_name = values.get("DB_INSTANCE_CONNECTION_NAME") or \
                                       (db_host_env.split('/')[-1] if db_host_env else None)
            if not instance_connection_name:
                 raise ValueError("DB_INSTANCE_CONNECTION_NAME or valid DB_HOST for Cloud SQL socket not provided")
            
            socket_dir = f"/cloudsql/{instance_connection_name}" # Just the directory for the socket

            # Construct the DSN string manually for socket connections
            # in a format Pydantic's PostgresDsn should parse correctly via psycopg2's expectations.
            # The host part of the netloc is empty for default socket connections.
            # The actual socket path is given as a 'host' query parameter.
            dsn_string = f"postgresql+psycopg2://{db_user}:{db_password}@localhost/{db_name or ''}?host={socket_dir}"
            
            print(f"DEBUG CLOUD RUN DSN STRING: {dsn_string}") # For debugging
            
            # Let Pydantic parse this fully formed DSN string.
            # This will internally use psycopg2's parsing which understands ?host= for sockets.
            return dsn_string # Pydantic will validate this string against PostgresDsn

        elif db_host_env: # For local TCP connection (e.g. Cloud SQL Proxy)
            # This part was likely correct already
            db_port_val = values.get("DB_PORT")
            return PostgresDsn.build(
                scheme="postgresql+psycopg2",
                username=db_user,
                password=db_password,
                host=db_host_env, 
                port=str(db_port_val) if db_port_val is not None else None,
                path=f"/{db_name or ''}",
            )
        else:
            # Not enough info to build a URL if neither socket path info nor TCP host is available
            raise ValueError("Cannot assemble DATABASE_URL: Insufficient DB connection parameters.")

    # MVP Specifics - Make them optional for now
    PROBLEM_ID_MVP: Optional[str] = Field(default=None)
    CANONICAL_SOLUTION_MVP: Optional[str] = Field(default=None)

    # Firebase
    FIREBASE_PROJECT_ID: Optional[str] = Field(default=None)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()