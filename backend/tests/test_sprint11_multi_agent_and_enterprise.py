from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_panel_evaluation_backend_endpoint():
    payload = {
        "role": "Lead Distributed Systems Architect",
        "question_scenario": "Design a resilient payment ledger with Kafka and PostgreSQL",
        "candidate_answer": (
            "We assign idempotency keys in Redis with 24-hour expiration. Incoming webhooks open a database "
            "transaction, acquire a row lock in PostgreSQL using SELECT FOR UPDATE, commit the ledger entry, "
            "and publish an asynchronous event to Kafka with partition key customer_id. We also use a dead-letter queue."
        ),
    }
    res = client.post("/api/v1/interview-coach/panel-evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "panel_agents" in data
    assert len(data["panel_agents"]) == 3
    agent_ids = [a["agent_id"] for a in data["panel_agents"]]
    assert "tech_lead" in agent_ids
    assert "system_design" in agent_ids
    assert "culture_alignment" in agent_ids
    assert data["composite_score"] >= 70.0
    assert data["committee_recommendation"] in ["Strong Hire", "Hire"]
    assert "executive_summary" in data


def test_sso_discovery_known_and_unknown_domains():
    # 1. Known enterprise domain (acme.com)
    res_known = client.post(
        "/api/v1/auth/sso/discover",
        json={"email": "lead.architect@acme.com"}
    )
    assert res_known.status_code == 200
    data_known = res_known.json()
    assert data_known["sso_enabled"] is True
    assert data_known["org_id"] == "org-acme"
    assert data_known["provider"] in ["okta", "azure_ad"]
    assert "redirect_url" in data_known

    # 2. Unknown public domain
    res_unknown = client.post(
        "/api/v1/auth/sso/discover",
        json={"email": "random.user@gmail.com"}
    )
    assert res_unknown.status_code == 200
    data_unknown = res_unknown.json()
    assert data_unknown["sso_enabled"] is False
    assert "Enterprise SSO is not configured" in data_unknown["message"]


def test_sso_authorize_flow():
    res = client.get("/api/v1/auth/sso/authorize?org_id=org-acme")
    assert res.status_code == 200
    data = res.json()
    assert data["org_id"] == "org-acme"
    assert "state" in data
    assert len(data["state"]) > 16
    assert "idp_sso_url" in data
    assert data["callback_endpoint"] == "/api/v1/auth/sso/callback"


def test_sso_callback_and_jit_user_provisioning():
    import uuid
    test_sso_email = f"jit.recruiter.{uuid.uuid4().hex[:6]}@acme.com"
    payload = {
        "org_id": "org-acme",
        "email": test_sso_email,
        "full_name": "Sarah Connor - Talent Lead",
        "saml_response": "PHNhbWxwOlJlc3BvbnNlPjwvc2FtbHA6UmVzcG9uc2U+",
        "relay_state": "/employer"
    }

    # 1. First callback - triggers JIT provisioning
    res1 = client.post("/api/v1/auth/sso/callback", json=payload)
    assert res1.status_code == 200
    data1 = res1.json()
    assert "access_token" in data1
    assert data1["token_type"] == "bearer"
    assert data1["user"]["email"] == test_sso_email
    assert data1["user"]["role"] == "employer"
    assert data1["user"]["org_id"] == "org-acme"
    assert data1["provisioned_jit"] is True

    # 2. Second callback with same email - signs in existing user
    res2 = client.post("/api/v1/auth/sso/callback", json=payload)
    assert res2.status_code == 200
    data2 = res2.json()
    assert "access_token" in data2
    assert data2["provisioned_jit"] is False
    assert data2["user"]["id"] == data1["user"]["id"]


def test_sso_config_update_and_retrieval():
    # 1. Read existing config
    res_get = client.get("/api/v1/auth/sso/config?org_id=org-acme")
    assert res_get.status_code == 200
    config_get = res_get.json()
    assert config_get["org_id"] == "org-acme"

    # 2. Update config
    update_payload = {
        "org_id": "org-acme",
        "sso_enabled": True,
        "sso_provider": "azure_ad",
        "sso_domain": "acme.com",
        "idp_entity_id": "https://sts.windows.net/acme-tenant-guid/",
        "idp_sso_url": "https://login.microsoftonline.com/acme/saml2",
    }
    res_post = client.post("/api/v1/auth/sso/config", json=update_payload)
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert data_post["success"] is True
    assert data_post["config"]["sso_provider"] == "azure_ad"


def test_outbound_webhook_lifecycle():
    # 1. Register a webhook subscription
    target_url = "https://webhook.site/mock-endpoint-2026"
    sub_payload = {
        "org_id": "org-acme",
        "target_url": target_url,
        "event_types": ["candidate.shortlisted", "credential.minted"],
    }
    res_reg = client.post("/api/v1/webhooks/outbound", json=sub_payload)
    assert res_reg.status_code == 200
    reg_data = res_reg.json()
    assert reg_data["success"] is True
    sub_id = reg_data["subscription"]["id"]
    assert sub_id.startswith("wh-")
    assert reg_data["subscription"]["target_url"] == target_url
    assert "whsec_" in reg_data["subscription"]["secret_key"]

    # 2. List webhooks for tenant
    res_list = client.get("/api/v1/webhooks/outbound?org_id=org-acme")
    assert res_list.status_code == 200
    list_data = res_list.json()
    sub_ids = [s["id"] for s in list_data["subscriptions"]]
    assert sub_id in sub_ids

    # 3. Fire HMAC-signed test ping event
    res_test = client.post(f"/api/v1/webhooks/outbound/{sub_id}/test")
    assert res_test.status_code == 200
    test_data = res_test.json()
    assert test_data["success"] is True
    assert test_data["response_status"] == 200
    assert test_data["signature_header"].startswith("sha256=")
    assert test_data["event_type"] == "candidate.shortlisted"

    # 4. Inspect delivery audit trail
    res_deliv = client.get(f"/api/v1/webhooks/outbound/{sub_id}/deliveries")
    assert res_deliv.status_code == 200
    deliv_data = res_deliv.json()
    assert deliv_data["count"] >= 1
    assert deliv_data["deliveries"][0]["response_status"] == 200

    # 5. Delete webhook subscription
    res_del = client.delete(f"/api/v1/webhooks/outbound/{sub_id}")
    assert res_del.status_code == 200
    del_data = res_del.json()
    assert del_data["success"] is True

    # Confirm deletion from listing
    res_list2 = client.get("/api/v1/webhooks/outbound?org_id=org-acme")
    sub_ids2 = [s["id"] for s in res_list2.json()["subscriptions"]]
    assert sub_id not in sub_ids2

