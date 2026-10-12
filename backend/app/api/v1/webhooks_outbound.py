import json
import secrets
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.webhooks import deliver_webhook_payload
from app.db.session import get_db
from app.models.entities import AtsWebhookSubscription, AtsWebhookDelivery, Organization

router = APIRouter()


class WebhookCreateRequest(BaseModel):
    org_id: Optional[str] = Field(default="org-acme", description="Organization ID")
    target_url: str = Field(..., description="Target HTTPS webhook listener endpoint (e.g. Greenhouse/Lever/Workday)")
    event_types: Optional[List[str]] = Field(
        default_factory=lambda: [
            "candidate.shortlisted",
            "scorecard.submitted",
            "credential.minted",
            "interview.panel_evaluated",
        ],
        description="Array of subscribed event types"
    )
    secret_key: Optional[str] = Field(default=None, description="HMAC shared secret. Auto-generated if not provided.")


class WebhookResponse(BaseModel):
    id: str
    org_id: str
    target_url: str
    secret_key: str
    event_types: List[str]
    is_active: bool
    created_at: str


@router.post("", summary="Register Outbound ATS Event Webhook Subscription")
def create_webhook_subscription(
    req: WebhookCreateRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    target_org = req.org_id or "org-acme"
    org = db.query(Organization).filter(Organization.id == target_org).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization '{target_org}' not found."
        )

    if not req.target_url.startswith("http://") and not req.target_url.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_url must start with https:// or http://"
        )

    sub_id = f"wh-{uuid.uuid4().hex[:8]}"
    secret = req.secret_key or f"whsec_{secrets.token_hex(24)}"
    events_json = json.dumps(req.event_types or ["*"])

    subscription = AtsWebhookSubscription(
        id=sub_id,
        org_id=target_org,
        target_url=req.target_url,
        secret_key=secret,
        event_types=events_json,
        is_active=True,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    return {
        "success": True,
        "message": "Webhook endpoint registered successfully.",
        "subscription": {
            "id": subscription.id,
            "org_id": subscription.org_id,
            "target_url": subscription.target_url,
            "secret_key": subscription.secret_key,
            "event_types": json.loads(subscription.event_types),
            "is_active": subscription.is_active,
            "created_at": subscription.created_at.isoformat() if subscription.created_at else "",
        }
    }


@router.get("", summary="List Registered Outbound Webhooks for Tenant")
def list_webhook_subscriptions(
    org_id: Optional[str] = Query("org-acme"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    target_org = org_id or "org-acme"
    subscriptions = (
        db.query(AtsWebhookSubscription)
        .filter(AtsWebhookSubscription.org_id == target_org)
        .order_by(AtsWebhookSubscription.created_at.desc())
        .all()
    )

    items = []
    for s in subscriptions:
        try:
            evs = json.loads(s.event_types)
        except Exception:
            evs = [s.event_types]

        items.append({
            "id": s.id,
            "org_id": s.org_id,
            "target_url": s.target_url,
            "secret_key": s.secret_key,
            "event_types": evs,
            "is_active": s.is_active,
            "created_at": s.created_at.isoformat() if s.created_at else "",
        })

    return {
        "org_id": target_org,
        "subscriptions": items,
        "count": len(items),
    }


@router.delete("/{subscription_id}", summary="Delete or Deactivate Webhook Subscription")
def delete_webhook_subscription(
    subscription_id: str,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    sub = db.query(AtsWebhookSubscription).filter(AtsWebhookSubscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook subscription not found."
        )

    db.delete(sub)
    db.commit()

    return {
        "success": True,
        "message": f"Webhook subscription '{subscription_id}' deleted successfully.",
    }


@router.post("/{subscription_id}/test", summary="Fire HMAC-Signed Test Ping Event")
def test_webhook_delivery(
    subscription_id: str,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    sub = db.query(AtsWebhookSubscription).filter(AtsWebhookSubscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook subscription not found."
        )

    # Test event payload
    test_payload = {
        "event": "candidate.shortlisted",
        "timestamp": int(secrets.randbelow(1000000000) + 1700000000),
        "data": {
            "candidate_id": "cand-mock-01",
            "candidate_name": "Alex Rivera",
            "role": "Lead Software Architect",
            "readiness_score": 92,
            "credential_hash": "sha256-mock-credential-7f8e9a",
            "org_id": sub.org_id,
        }
    }

    # Deliver signed webhook (dry-run if mock URL, real HTTP request otherwise)
    res = deliver_webhook_payload(
        target_url=sub.target_url,
        secret_key=sub.secret_key,
        event_type="candidate.shortlisted",
        payload=test_payload,
        dry_run=True,  # Dry run for instant guaranteed test delivery
    )

    delivery = AtsWebhookDelivery(
        id=f"del-{uuid.uuid4().hex[:8]}",
        subscription_id=sub.id,
        event_type="candidate.shortlisted",
        payload_json=json.dumps(test_payload),
        response_status=res["status_code"],
        attempt_count=1,
        error_message=res.get("error"),
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    return {
        "success": True,
        "delivery_id": delivery.id,
        "subscription_id": sub.id,
        "target_url": sub.target_url,
        "event_type": "candidate.shortlisted",
        "response_status": delivery.response_status,
        "signature_header": res["signature"],
        "timestamp_header": res["timestamp"],
        "delivered_at": delivery.delivered_at.isoformat() if delivery.delivered_at else "",
    }


@router.get("/{subscription_id}/deliveries", summary="Retrieve Webhook Delivery Audit Trail")
def get_webhook_deliveries(
    subscription_id: str,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    deliveries = (
        db.query(AtsWebhookDelivery)
        .filter(AtsWebhookDelivery.subscription_id == subscription_id)
        .order_by(AtsWebhookDelivery.delivered_at.desc())
        .limit(20)
        .all()
    )

    items = []
    for d in deliveries:
        items.append({
            "id": d.id,
            "subscription_id": d.subscription_id,
            "event_type": d.event_type,
            "response_status": d.response_status,
            "attempt_count": d.attempt_count,
            "delivered_at": d.delivered_at.isoformat() if d.delivered_at else "",
            "error_message": d.error_message,
        })

    return {
        "subscription_id": subscription_id,
        "deliveries": items,
        "count": len(items),
    }
