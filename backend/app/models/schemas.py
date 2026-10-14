from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class RoleEnum(str, Enum):
    EMPLOYER = "employer"
    STUDENT = "student"
    ADMIN = "admin"

class OrgTypeEnum(str, Enum):
    CORPORATE = "corporate"
    UNIVERSITY = "university"
    STAFFING = "staffing"

class OrganizationResponse(BaseModel):
    id: str
    name: str
    type: str
    logo: str
    plan: str
    seats_used: int
    seats_total: int
    status: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: RoleEnum
    avatar_url: str | None = None
    org_id: str | None = None
    org_name: str | None = None
    college: str | None = None
    readiness_score: int | None = None
    current_tier: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    role: RoleEnum = RoleEnum.EMPLOYER
    org_id: str | None = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserResponse
    organization: OrganizationResponse | None = None

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: RoleEnum = RoleEnum.STUDENT
    org_id: str | None = None
    college: str | None = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class GenericResponse(BaseModel):
    success: bool
    message: str
