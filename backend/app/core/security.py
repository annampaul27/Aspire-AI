import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Any
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """Hashes a raw password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a raw password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def create_access_token(
    subject: str,
    role: str,
    org_id: str | None = None,
    email: str | None = None,
    name: str | None = None,
    expires_delta: timedelta | None = None
) -> str:
    """Creates a cryptographically signed JWT token with role and org claims."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "email": email or "",
        "name": name or "",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    
    if org_id:
        to_encode["org_id"] = org_id
        
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict | None:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        return None
