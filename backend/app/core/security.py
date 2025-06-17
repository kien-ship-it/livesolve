# backend/app/core/security.py

from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from pydantic import BaseModel
from starlette import status

# This is our Pydantic model for User data.
# It ensures that the user data we get from Firebase has a predictable structure.
class User(BaseModel):
    uid: str
    email: Optional[str] = None
    # You can add more fields here if you need them, e.g., name, picture

# This is our "bouncer". It's a reusable dependency.
# HTTPBearer is a class that extracts the "Bearer" token from the Authorization header.
bearer_scheme = HTTPBearer()

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> User:
    """
    Verifies the Firebase ID token from the Authorization header and returns the user data.

    Raises HTTPException with status 401 if the token is invalid, expired, or missing.
    """
    if not creds:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token missing",
        )

    try:
        # The core of the bouncer's logic: ask Firebase to verify the ID card.
        decoded_token = auth.verify_id_token(creds.credentials)

        # If the card is valid, create a User object with the info.
        return User(uid=decoded_token["uid"], email=decoded_token.get("email"))

    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has expired",
        )
    except Exception:
        # A catch-all for any other unexpected errors during verification.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

