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
    assert data_known["provider"] == "okta"
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
    test_sso_email = "jit.recruiter.2026@acme.com"
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
