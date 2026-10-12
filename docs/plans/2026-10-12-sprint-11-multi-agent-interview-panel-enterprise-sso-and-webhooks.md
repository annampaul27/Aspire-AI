# Sprint 11: Multi-Agent AI Interview Panel, Enterprise SSO & Outbound ATS Webhooks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Engineer enterprise-grade multi-agent AI interview panel evaluations with debate consensus, corporate SAML 2.0/OIDC Single Sign-On with JIT provisioning, and HMAC-signed outbound ATS event webhook dispatching.

**Architecture:** A 3-agent autonomous panel (Technical Lead, System Design, Culture Alignment) coordinated by a Panel Arbiter for debate negotiation; enterprise SSO discovery and JIT provisioning in SQLAlchemy session; HMAC-SHA256 signed webhook dispatcher with delivery logs; Next.js 16 UI for panel debriefs, SSO configurations, and webhook management.

**Tech Stack:** FastAPI, SQLAlchemy 2.0, Pydantic, HMAC-SHA256, Next.js 16 (App Router), TypeScript, Tailwind CSS, Pytest, Ruff.

---

### Task 1: Multi-Agent AI Interview Panel & Debate Consensus Engine
- **Files:**
  - Create: `services/interview_coach/panel_evaluator.py`
  - Modify: `services/interview_coach/api.py` (mount `/panel/evaluate`)
  - Modify: `backend/app/api/v1/career_compass.py` (or mount `/api/v1/interview-coach/panel-evaluate`)
  - Test: `services/interview_coach/tests/test_panel_evaluator.py`
  - Test: `backend/test_sprint11_multi_agent_and_enterprise.py`
- **Details:**
  - Define `AgentPersona` enum: `TECH_LEAD`, `SYSTEM_DESIGN`, `CULTURE_ALIGNMENT`.
  - Individual agent evaluation rubrics:
    - **Tech Lead:** Code correctness, algorithmic Big-O, defensive edge-case handling, memory safety (0-100).
    - **System Design:** Distributed systems partitioning, caching, CAP theorem trade-offs, scalability, microservice contracts (0-100).
    - **Culture Alignment:** Humility, structured communication, empathy, receptive to feedback (0-100).
  - Define `PanelArbiter`:
    - Compares ratings across dimensions. If variance > 20 points, runs a multi-agent debate round where agents adjust scores based on specific critique arguments.
    - Synthesizes final committee recommendation (`strong_hire`, `hire`, `neutral`, `reject`) with consensus confidence percentage and signed debate minutes.
    - Fully deterministic fallback for offline/test environments without Groq API dependencies.

---

### Task 2: Enterprise SSO Configuration, Domain Discovery & JIT Provisioning
- **Files:**
  - Modify: `backend/app/models/entities.py` (extend `Organization` with SSO columns: `sso_enabled`, `sso_provider`, `sso_domain`, `idp_entity_id`, `idp_sso_url`, `idp_metadata_url`)
  - Create: `backend/app/api/v1/sso.py`
  - Modify: `backend/app/main.py` (mount `/api/v1/auth/sso` routes)
  - Test: `backend/test_sprint11_multi_agent_and_enterprise.py`
- **Details:**
  - `POST /api/v1/auth/sso/discover`: Resolves user email domain (e.g., `engineer@acme.com`) to the tenant's configured IdP redirect URL and provider type (`okta`, `azure_ad`, `google`).
  - `POST /api/v1/auth/sso/authorize`: Initiates SAML/OIDC authentication request with cryptographic state parameter.
  - `POST /api/v1/auth/sso/callback`: Validates IdP assertions/tokens; provisions user Just-In-Time (JIT) if they do not exist; assigns organization membership with `employer` role; issues authentic Aspire JWT bearer token.
  - `POST /api/v1/auth/sso/config`: Employer admin configuration endpoint to update organization SSO settings.

---

### Task 3: Outbound ATS Event Webhook Dispatcher & Sync Queue
- **Files:**
  - Modify: `backend/app/models/entities.py` (add `AtsWebhookSubscription` and `AtsWebhookDelivery` models)
  - Create: `backend/app/core/webhooks.py` (HMAC-SHA256 signature generator and async event dispatcher)
  - Create: `backend/app/api/v1/webhooks_outbound.py`
  - Modify: `backend/app/main.py` (mount `/api/v1/webhooks/outbound` routes)
  - Test: `backend/test_sprint11_multi_agent_and_enterprise.py`
- **Details:**
  - `AtsWebhookSubscription` model: `id`, `org_id`, `target_url`, `secret_key`, `event_types`, `is_active`, `created_at`.
  - `AtsWebhookDelivery` model: `id`, `subscription_id`, `event_type`, `payload`, `response_status`, `attempt_count`, `delivered_at`, `error_message`.
  - HMAC-SHA256 signature header: `X-Aspire-Signature: sha256=<hex_digest>`, timestamp header `X-Aspire-Timestamp: <unix_epoch>`.
  - Endpoints:
    - `POST /api/v1/webhooks/outbound`: Register webhook target.
    - `GET /api/v1/webhooks/outbound`: List tenant webhooks.
    - `POST /api/v1/webhooks/outbound/{id}/test`: Fire test ping event with mock payload and record delivery log.
    - `GET /api/v1/webhooks/outbound/{id}/deliveries`: View delivery audit log.

---

### Task 4: Frontend API Clients & TypeScript Definitions
- **Files:**
  - Modify: `frontend/src/types/index.ts` (add `PanelEvaluationResult`, `SSODiscoveryResponse`, `SSOConfig`, `AtsWebhookSubscription`, `AtsWebhookDelivery`)
  - Create: `frontend/src/lib/api/enterprise.ts` (API client for panel evaluation, SSO, and outbound webhooks)
  - Modify: `frontend/src/lib/api/index.ts` (re-export enterprise API)
- **Details:**
  - TypeScript interfaces for multi-agent panel evaluation, debate minutes, SSO configs, and webhook deliveries.
  - Strongly typed client methods with error handling and fallback support.

---

### Task 5: Frontend UI Components & Views
- **Files:**
  - Create: `frontend/src/components/interview/MultiAgentPanelModal.tsx`
  - Create: `frontend/src/components/employer/EnterpriseSettingsCard.tsx`
  - Modify: `frontend/src/app/interview-coach/page.tsx` (integrate multi-agent panel button & debrief modal)
  - Modify: `frontend/src/app/employer/profile/page.tsx` (integrate Enterprise SSO & Outbound Webhooks settings)
- **Details:**
  - **Multi-Agent Panel Debrief**: Visualizes Tech Lead, System Design, and Culture Agent avatar cards with scores, individual critique bullets, interactive debate transcript, and consensus recommendation.
  - **Enterprise Settings**:
    - Corporate SSO setup card (Domain, Provider selection, IdP SSO URL, metadata XML/URL, test toggle).
    - Outbound ATS Webhooks card (Target URL, subscribed events checkboxes, generated secret key, test ping button, delivery log modal).

---

### Task 6: Full Verification, Regression Testing & Documentation
- **Files:**
  - Modify: `README.md` (document Sprint 11 features, architecture, and API routes)
  - Modify: `MANUAL_TESTING_GUIDE.txt` (add Test Suite 12 for Multi-Agent Panel, Enterprise SSO, and Webhooks)
- **Verification Commands:**
  - `python -m pytest backend/ services/ -v` (verify 155+ tests pass with 100% pass rate)
  - `ruff check backend/ services/` (0 lint errors)
  - `npx tsc --noEmit` (in `frontend/`, 0 errors)
  - `npm run lint` (in `frontend/`, 0 warnings/errors)
  - `npm run build` (in `frontend/`, 18/18 routes compile cleanly)
  - `git push -u origin feat/sprint-11-multi-agent-interview-panel-enterprise-sso-and-webhooks`
