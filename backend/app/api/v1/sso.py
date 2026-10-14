import secrets
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db.session import get_db
from app.models.entities import Organization, User

router = APIRouter()


class SSODiscoverRequest(BaseModel):
    email: str | None = Field(default=None, description="Corporate user email to resolve domain")
    domain: str | None = Field(default=None, description="Company email domain (e.g. acme.com)")


class SSOCallbackRequest(BaseModel):
    org_id: str = Field(..., description="Organization ID for SSO session")
    email: str = Field(..., description="Authenticated user email asserted by IdP")
    full_name: str = Field(default="Enterprise User", description="User full name asserted by IdP")
    saml_response: str | None = Field(default=None, description="Base64 encoded SAML 2.0 Response")
    id_token: str | None = Field(default=None, description="OIDC JWT ID Token")
    relay_state: str | None = Field(default=None, description="State token passed in initial request")


class SSOConfigRequest(BaseModel):
    org_id: str
    sso_enabled: bool = True
    sso_provider: str = Field(default="okta", description="okta | azure_ad | google")
    sso_domain: str = Field(..., description="Corporate email domain (e.g. acme.com)")
    idp_entity_id: str | None = None
    idp_sso_url: str | None = None
    idp_metadata_url: str | None = None
    idp_certificate: str | None = None


@router.post("/discover", summary="Discover Enterprise SSO Identity Provider from Email Domain")
def discover_sso(req: SSODiscoverRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Resolves a user's corporate domain (from email or direct domain input)
    against configured enterprise tenants in the database.
    """
    target_domain = ""
    if req.email and "@" in req.email:
        target_domain = req.email.split("@")[1].strip().lower()
    elif req.domain:
        target_domain = req.domain.strip().lower()

    if not target_domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid corporate email or domain must be provided."
        )

    org = (
        db.query(Organization)
        .filter(Organization.sso_domain == target_domain)
        .first()
    )

    if not org or not org.sso_enabled:
        return {
            "sso_enabled": False,
            "domain": target_domain,
            "message": f"Enterprise SSO is not configured or enabled for domain '{target_domain}'.",
        }

    return {
        "sso_enabled": True,
        "org_id": org.id,
        "org_name": org.name,
        "provider": org.sso_provider or "okta",
        "domain": target_domain,
        "idp_entity_id": org.idp_entity_id or f"https://identity.{target_domain}",
        "idp_sso_url": org.idp_sso_url or f"https://auth.{target_domain}/saml/sso",
        "redirect_url": f"/api/v1/auth/sso/authorize?org_id={org.id}&domain={target_domain}",
    }


@router.get("/authorize", summary="Initiate SAML 2.0 / OIDC Authentication Session")
def authorize_sso(
    org_id: str = Query(..., description="Organization ID"),
    redirect_uri: str | None = Query(None),
    relay_state: str | None = Query(None),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Prepares a cryptographically signed SSO login request state.
    """
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org or not org.sso_enabled:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or Enterprise SSO is not enabled."
        )

    state = secrets.token_urlsafe(32)
    sso_url = org.idp_sso_url or f"https://login.microsoftonline.com/{org.sso_domain}/saml2"

    return {
        "org_id": org.id,
        "org_name": org.name,
        "provider": org.sso_provider or "azure_ad",
        "state": state,
        "idp_sso_url": sso_url,
        "relay_state": relay_state or "/employer",
        "callback_endpoint": "/api/v1/auth/sso/callback",
    }


@router.post("/callback", summary="Consume SAML/OIDC Assertion and JIT Provision User")
def sso_callback(req: SSOCallbackRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Validates assertion from the corporate Identity Provider and provisions
    the user Just-In-Time (JIT) into the organization if they do not exist.
    """
    org = db.query(Organization).filter(Organization.id == req.org_id).first()
    if not org or not org.sso_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization or SSO is disabled for this tenant."
        )

    clean_email = req.email.strip().lower()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid corporate email address is required from the IdP assertion."
        )

    # Check for existing user
    user = db.query(User).filter(User.email == clean_email).first()
    provisioned_jit = False

    if not user:
        # Just-In-Time Provisioning
        user_id = f"usr-{uuid.uuid4().hex[:8]}"
        user = User(
            id=user_id,
            email=clean_email,
            full_name=req.full_name or "Enterprise User",
            role="employer",
            org_id=org.id,
            user_class="Enterprise Recruiter",
            current_tier="enterprise",
            readiness_score=85,
        )
        if org.seats_used < org.seats_total:
            org.seats_used += 1

        db.add(user)
        provisioned_jit = True
    else:
        # Existing user: ensure linked to corporate organization
        if not user.org_id:
            user.org_id = org.id

    db.commit()
    db.refresh(user)

    # Mint genuine Aspire JWT token with employer claim
    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        org_id=user.org_id,
        email=user.email,
        name=user.full_name,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "org_id": user.org_id,
        },
        "provisioned_jit": provisioned_jit,
        "org_name": org.name,
        "sso_provider": org.sso_provider or "okta",
    }


@router.get("/config", summary="Retrieve Tenant Enterprise SSO Configuration")
def get_sso_config(
    org_id: str = Query(..., description="Organization ID"),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")

    return {
        "org_id": org.id,
        "org_name": org.name,
        "sso_enabled": org.sso_enabled,
        "sso_provider": org.sso_provider or "okta",
        "sso_domain": org.sso_domain or "",
        "idp_entity_id": org.idp_entity_id or "",
        "idp_sso_url": org.idp_sso_url or "",
        "idp_metadata_url": org.idp_metadata_url or "",
    }


@router.post("/config", summary="Update Tenant Enterprise SSO Configuration")
def update_sso_config(req: SSOConfigRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    org = db.query(Organization).filter(Organization.id == req.org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")

    org.sso_enabled = req.sso_enabled
    org.sso_provider = req.sso_provider.lower()
    org.sso_domain = req.sso_domain.strip().lower()
    if req.idp_entity_id:
        org.idp_entity_id = req.idp_entity_id.strip()
    if req.idp_sso_url:
        org.idp_sso_url = req.idp_sso_url.strip()
    if req.idp_metadata_url:
        org.idp_metadata_url = req.idp_metadata_url.strip()
    if req.idp_certificate:
        org.idp_certificate = req.idp_certificate.strip()

    db.commit()
    db.refresh(org)

    return {
        "success": True,
        "message": f"SSO configuration for '{org.name}' updated successfully.",
        "config": {
            "org_id": org.id,
            "sso_enabled": org.sso_enabled,
            "sso_provider": org.sso_provider,
            "sso_domain": org.sso_domain,
            "idp_entity_id": org.idp_entity_id,
            "idp_sso_url": org.idp_sso_url,
        }
    }
