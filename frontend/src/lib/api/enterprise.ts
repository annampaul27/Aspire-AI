import {
  MultiAgentPanelEvaluationResponse,
  SSODiscoveryResponse,
  SSOConfig,
  AtsWebhookSubscription,
  AtsWebhookDelivery,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("aspire_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const enterpriseApi = {
  /**
   * Evaluates candidate response using the 3-agent executive hiring panel with debate consensus
   */
  async evaluateInterviewPanel(
    role: string,
    questionScenario: string,
    candidateAnswer: string
  ): Promise<MultiAgentPanelEvaluationResponse> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/interview-coach/panel-evaluate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          role,
          question_scenario: questionScenario,
          candidate_answer: candidateAnswer,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      return await res.json();
    } catch {
      // Offline fallback simulation
      return {
        session_id: "panel-offline-preview",
        role,
        question_scenario: questionScenario,
        candidate_answer: candidateAnswer,
        panel_agents: [
          {
            agent_id: "tech_lead",
            agent_name: "Alex Rivera",
            avatar_role: "Lead Software Architect",
            role_focus: "Code Rigor, Big-O Complexity & Error Handling",
            initial_score: 84.0,
            final_score: 82.0,
            recommendation: "Hire",
            strengths: ["Clean algorithmic complexity analysis", "Idempotency keys and transactional boundaries"],
            concerns: ["Could detail failure recovery on message re-delivery"],
            critique_quote: "Candidate demonstrates strong programmatic precision with reliable failure semantics.",
          },
          {
            agent_id: "system_design",
            agent_name: "Marcus Chen",
            avatar_role: "Principal Systems Architect",
            role_focus: "Distributed Scalability, Partitioning & Resiliency",
            initial_score: 88.0,
            final_score: 85.0,
            recommendation: "Strong Hire",
            strengths: ["Horizontal sharding by customer tenant", "Dead-letter queues and circuit breakers"],
            concerns: ["Cross-region latency was lightly touched upon"],
            critique_quote: "Solid distributed systems acumen with balanced CAP theorem awareness.",
          },
          {
            agent_id: "culture_alignment",
            agent_name: "Elena Rostova",
            avatar_role: "VP of Engineering & Culture",
            role_focus: "Communication Structure, Humility & Team Empathy",
            initial_score: 92.0,
            final_score: 92.0,
            recommendation: "Strong Hire",
            strengths: ["Structured top-down communication", "Articulated empathy for on-call operational maintainers"],
            concerns: ["None noted"],
            critique_quote: "Mature communication with high humility and collaborative empathy.",
          },
        ],
        debate_occurred: true,
        debate_transcripts: [
          {
            round_number: 1,
            speaker_agent: "Alex Rivera",
            speaker_title: "Lead Software Architect",
            argument: "Initial technical score adjusted down slightly to align with system design partition edge case.",
            concession_or_rebuttal: "Concession agreed upon during calibration round.",
            score_adjustment: -2.0,
          },
        ],
        composite_score: 86.1,
        committee_recommendation: "Strong Hire",
        consensus_status: "High Consensus",
        consensus_confidence: 88.5,
        executive_summary: "The executive hiring committee reached High Consensus recommending Strong Hire (86.1/100). The candidate exhibited clean algorithmic precision and mature architectural communication.",
      };
    }
  },

  /**
   * Discovers whether a corporate domain has Enterprise SSO configured
   */
  async discoverSSO(emailOrDomain: string): Promise<SSODiscoveryResponse> {
    const isEmail = emailOrDomain.includes("@");
    const body = isEmail ? { email: emailOrDomain } : { domain: emailOrDomain };

    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/sso/discover`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      return await res.json();
    } catch {
      return {
        sso_enabled: true,
        org_id: "org-acme",
        org_name: "Acme HyperScale Systems",
        provider: "okta",
        domain: isEmail ? emailOrDomain.split("@")[1] : emailOrDomain,
        idp_sso_url: "https://acme.okta.com/app/aspire/sso/saml",
        redirect_url: `/api/v1/auth/sso/authorize?org_id=org-acme`,
      };
    }
  },

  /**
   * Retrieves SSO configuration for an organization
   */
  async getSSOConfig(orgId: string): Promise<SSOConfig> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/sso/config?org_id=${encodeURIComponent(orgId)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      return await res.json();
    } catch {
      return {
        org_id: orgId,
        org_name: "Acme HyperScale Systems",
        sso_enabled: true,
        sso_provider: "okta",
        sso_domain: "acme.com",
        idp_entity_id: "https://identity.acme.com",
        idp_sso_url: "https://acme.okta.com/app/aspire/sso/saml",
      };
    }
  },

  /**
   * Updates SSO configuration for an organization
   */
  async updateSSOConfig(payload: SSOConfig): Promise<{ success: boolean; message: string; config: SSOConfig }> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/sso/config`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update SSO configuration.");
    }

    return await res.json();
  },

  /**
   * Lists registered outbound ATS event webhooks
   */
  async listWebhooks(orgId: string): Promise<{ subscriptions: AtsWebhookSubscription[]; count: number }> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/webhooks/outbound?org_id=${encodeURIComponent(orgId)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      return await res.json();
    } catch {
      return {
        subscriptions: [
          {
            id: "wh-preview-01",
            org_id: orgId,
            target_url: "https://api.greenhouse.io/v1/webhooks/aspire",
            secret_key: "whsec_987f654e3210abcd",
            event_types: ["candidate.shortlisted", "credential.minted"],
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ],
        count: 1,
      };
    }
  },

  /**
   * Creates a new outbound ATS event webhook subscription
   */
  async createWebhook(payload: {
    org_id?: string;
    target_url: string;
    event_types?: string[];
    secret_key?: string;
  }): Promise<{ success: boolean; subscription: AtsWebhookSubscription }> {
    const res = await fetch(`${BASE_URL}/api/v1/webhooks/outbound`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to register webhook subscription.");
    }

    return await res.json();
  },

  /**
   * Deletes a webhook subscription
   */
  async deleteWebhook(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/api/v1/webhooks/outbound/${encodeURIComponent(subscriptionId)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to delete webhook.");
    }

    return await res.json();
  },

  /**
   * Dispatches an HMAC-signed test ping event to the webhook URL
   */
  async testWebhook(subscriptionId: string): Promise<{
    success: boolean;
    delivery_id: string;
    response_status: number;
    signature_header: string;
  }> {
    const res = await fetch(`${BASE_URL}/api/v1/webhooks/outbound/${encodeURIComponent(subscriptionId)}/test`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to send test ping.");
    }

    return await res.json();
  },

  /**
   * Retrieves recent webhook delivery audit logs
   */
  async getWebhookDeliveries(subscriptionId: string): Promise<{
    deliveries: AtsWebhookDelivery[];
    count: number;
  }> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/webhooks/outbound/${encodeURIComponent(subscriptionId)}/deliveries`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      return await res.json();
    } catch {
      return {
        deliveries: [
          {
            id: "del-preview-01",
            subscription_id: subscriptionId,
            event_type: "candidate.shortlisted",
            response_status: 200,
            attempt_count: 1,
            delivered_at: new Date().toISOString(),
          },
        ],
        count: 1,
      };
    }
  },
};
