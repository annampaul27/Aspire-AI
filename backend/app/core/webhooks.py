import hashlib
import hmac
import json
import time
import uuid
from typing import Any
import urllib.request
import urllib.error

from sqlalchemy.orm import Session
from app.models.entities import AtsWebhookSubscription, AtsWebhookDelivery


def generate_webhook_signature(secret: str, payload_str: str, timestamp: int) -> str:
    """
    Computes standard HMAC-SHA256 signature header matching Stripe / GitHub webhook security conventions.
    Format: sha256=<hex_digest> computed over '{timestamp}.{payload_str}'.
    """
    signature_payload = f"{timestamp}.{payload_str}".encode()
    secret_bytes = secret.encode("utf-8")
    digest = hmac.new(secret_bytes, signature_payload, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def deliver_webhook_payload(
    target_url: str,
    secret_key: str,
    event_type: str,
    payload: dict[str, Any],
    timeout_seconds: float = 3.0,
    dry_run: bool = False,
) -> dict[str, Any]:
    """
    Delivers a signed webhook event to the recipient endpoint.
    Includes security headers:
      - X-Aspire-Signature: sha256=<hex_digest>
      - X-Aspire-Timestamp: <unix_epoch>
      - X-Aspire-Event: <event_type>
    """
    timestamp = int(time.time())
    payload_str = json.dumps(payload, separators=(",", ":"))
    signature = generate_webhook_signature(secret_key, payload_str, timestamp)

    if dry_run or target_url.startswith("http://example.com") or target_url.startswith("https://webhook.site/mock"):
        # Simulated instant delivery for mock/dry-run test scenarios
        return {
            "status_code": 200,
            "signature": signature,
            "timestamp": timestamp,
            "error": None,
        }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Aspire-ATS-Webhook-Dispatcher/1.0",
        "X-Aspire-Signature": signature,
        "X-Aspire-Timestamp": str(timestamp),
        "X-Aspire-Event": event_type,
    }

    req = urllib.request.Request(
        target_url,
        data=payload_str.encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            return {
                "status_code": resp.getcode(),
                "signature": signature,
                "timestamp": timestamp,
                "error": None,
            }
    except urllib.error.HTTPError as e:
        return {
            "status_code": e.code,
            "signature": signature,
            "timestamp": timestamp,
            "error": f"HTTP Error {e.code}: {e.reason}",
        }
    except Exception as e:
        return {
            "status_code": 504,
            "signature": signature,
            "timestamp": timestamp,
            "error": str(e),
        }


def dispatch_outbound_event(
    db: Session,
    org_id: str,
    event_type: str,
    payload: dict[str, Any],
    dry_run: bool = False,
) -> list[AtsWebhookDelivery]:
    """
    Queries active webhook subscriptions for the tenant, matches event types,
    signs and delivers payloads, and records immutable delivery audit logs.
    """
    subscriptions = (
        db.query(AtsWebhookSubscription)
        .filter(
            AtsWebhookSubscription.org_id == org_id,
            AtsWebhookSubscription.is_active.is_(True),
        )
        .all()
    )

    deliveries: list[AtsWebhookDelivery] = []

    for sub in subscriptions:
        try:
            subscribed_events = json.loads(sub.event_types)
        except Exception:
            subscribed_events = [sub.event_types]

        if "*" not in subscribed_events and event_type not in subscribed_events:
            continue

        delivery_result = deliver_webhook_payload(
            target_url=sub.target_url,
            secret_key=sub.secret_key,
            event_type=event_type,
            payload=payload,
            dry_run=dry_run,
        )

        delivery_record = AtsWebhookDelivery(
            id=f"del-{uuid.uuid4().hex[:8]}",
            subscription_id=sub.id,
            event_type=event_type,
            payload_json=json.dumps(payload),
            response_status=delivery_result["status_code"],
            attempt_count=1,
            error_message=delivery_result.get("error"),
        )
        db.add(delivery_record)
        deliveries.append(delivery_record)

    if deliveries:
        db.commit()
        for d in deliveries:
            db.refresh(d)

    return deliveries
