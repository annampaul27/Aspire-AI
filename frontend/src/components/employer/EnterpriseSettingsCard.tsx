"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Key,
  Globe,
  Radio,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Lock,
  History,
  X,
} from "lucide-react";
import { enterpriseApi } from "@/lib/api/enterprise";
import {
  SSOConfig,
  AtsWebhookSubscription,
  AtsWebhookDelivery,
  SSODiscoveryResponse,
} from "@/types";

interface EnterpriseSettingsCardProps {
  orgId: string;
  orgName: string;
}

const SUPPORTED_EVENTS = [
  { id: "interview.completed", label: "Interview Completed" },
  { id: "scorecard.calibrated", label: "Scorecard Calibrated" },
  { id: "candidate.hired", label: "Candidate Hired" },
  { id: "candidate.rejected", label: "Candidate Rejected" },
  { id: "sprint.dispatched", label: "Gap Sprint Dispatched" },
];

export default function EnterpriseSettingsCard({
  orgId,
  orgName,
}: EnterpriseSettingsCardProps) {
  // SSO State
  const [ssoConfig, setSsoConfig] = useState<SSOConfig>({
    org_id: orgId,
    org_name: orgName,
    sso_enabled: true,
    sso_provider: "okta",
    sso_domain: "acme.com",
    idp_entity_id: "https://identity.acme.com",
    idp_sso_url: "https://acme.okta.com/app/aspire/sso/saml",
  });
  const [isSavingSSO, setIsSavingSSO] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<SSODiscoveryResponse | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Webhooks State
  const [webhooks, setWebhooks] = useState<AtsWebhookSubscription[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("https://ats.acme.com/api/webhooks/aspire");
  const [newSecret, setNewSecret] = useState("whsec_enterprise_ats_default");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "interview.completed",
    "scorecard.calibrated",
  ]);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [pingStatus, setPingStatus] = useState<Record<string, { status: number; message: string }>>({});

  // Deliveries Modal State
  const [selectedWebhookDeliveries, setSelectedWebhookDeliveries] = useState<AtsWebhookDelivery[] | null>(null);
  const [isDeliveriesModalOpen, setIsDeliveriesModalOpen] = useState(false);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);

  // Notification message
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch initial SSO config & Webhooks
  useEffect(() => {
    async function loadData() {
      setIsLoadingWebhooks(true);
      try {
        const [config, subsResponse] = await Promise.all([
          enterpriseApi.getSSOConfig(orgId),
          enterpriseApi.listWebhooks(orgId),
        ]);
        if (config) setSsoConfig(config);
        if (subsResponse?.subscriptions) {
          setWebhooks(subsResponse.subscriptions);
        }
      } catch (err: unknown) {
        console.warn("Could not load initial enterprise config, fallback to defaults", err);
      } finally {
        setIsLoadingWebhooks(false);
      }
    }
    loadData();
  }, [orgId]);

  const handleSaveSSO = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSSO(true);
    setAlertMessage(null);
    try {
      const res = await enterpriseApi.updateSSOConfig(ssoConfig);
      setAlertMessage({
        type: "success",
        text: res.message || `SSO configuration updated for ${ssoConfig.sso_domain}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAlertMessage({ type: "error", text: "Failed to save SSO config: " + msg });
    } finally {
      setIsSavingSSO(false);
    }
  };

  const handleDiscoverSSO = async () => {
    const domain = ssoConfig.sso_domain || "acme.com";
    setIsDiscovering(true);
    try {
      const result = await enterpriseApi.discoverSSO(domain);
      setDiscoveryResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAlertMessage({ type: "error", text: "Domain discovery failed: " + msg });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;
    setIsCreatingWebhook(true);
    setAlertMessage(null);
    try {
      const res = await enterpriseApi.createWebhook({
        org_id: orgId,
        target_url: newWebhookUrl,
        secret_key: newSecret,
        event_types: selectedEvents,
      });
      setWebhooks((prev) => [res.subscription, ...prev]);
      setAlertMessage({
        type: "success",
        text: `Webhook subscription created for ${res.subscription.target_url}`,
      });
      setNewSecret("whsec_corp_" + Date.now().toString(36));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAlertMessage({ type: "error", text: "Failed to create webhook: " + msg });
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (subId: string) => {
    try {
      await enterpriseApi.deleteWebhook(subId);
      setWebhooks((prev) => prev.filter((w) => w.id !== subId));
      setAlertMessage({ type: "success", text: "Webhook subscription deleted." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAlertMessage({ type: "error", text: "Failed to delete webhook: " + msg });
    }
  };

  const handleTestPing = async (subId: string) => {
    try {
      const res = await enterpriseApi.testWebhook(subId);
      setPingStatus((prev) => ({
        ...prev,
        [subId]: {
          status: res.response_status,
          message: `HMAC Signature: ${res.signature_header.substring(0, 24)}...`,
        },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPingStatus((prev) => ({
        ...prev,
        [subId]: { status: 500, message: msg },
      }));
    }
  };

  const handleViewDeliveries = async (subId: string) => {
    setIsDeliveriesModalOpen(true);
    setIsLoadingDeliveries(true);
    try {
      const res = await enterpriseApi.getWebhookDeliveries(subId);
      setSelectedWebhookDeliveries(res.deliveries);
    } catch (err: unknown) {
      console.error(err);
      setSelectedWebhookDeliveries([]);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
            alertMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Part 1: Corporate SSO Integration */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span>Corporate SSO (SAML 2.0 & OIDC)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Federate authentication with enterprise identity providers and enable Just-In-Time (JIT) recruiter provisioning for {orgName}.
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border self-start sm:self-center ${
              ssoConfig.sso_enabled
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {ssoConfig.sso_enabled ? "SSO Active" : "SSO Disabled"}
          </span>
        </div>

        <form onSubmit={handleSaveSSO} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Corporate Domain
              </label>
              <input
                type="text"
                value={ssoConfig.sso_domain}
                onChange={(e) => setSsoConfig({ ...ssoConfig, sso_domain: e.target.value })}
                placeholder="acme.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Identity Provider (IdP)
              </label>
              <select
                value={ssoConfig.sso_provider}
                onChange={(e) => setSsoConfig({ ...ssoConfig, sso_provider: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="okta">Okta Enterprise</option>
                <option value="azure_ad">Microsoft Entra ID (Azure AD)</option>
                <option value="google_workspace">Google Workspace SAML</option>
                <option value="ping_identity">Ping Identity</option>
                <option value="onelogin">OneLogin</option>
                <option value="generic_saml">Generic SAML 2.0</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                IdP Entity ID
              </label>
              <input
                type="text"
                value={ssoConfig.idp_entity_id}
                onChange={(e) => setSsoConfig({ ...ssoConfig, idp_entity_id: e.target.value })}
                placeholder="https://identity.acme.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                IdP Single Sign-On URL
              </label>
              <input
                type="url"
                value={ssoConfig.idp_sso_url}
                onChange={(e) => setSsoConfig({ ...ssoConfig, idp_sso_url: e.target.value })}
                placeholder="https://acme.okta.com/app/aspire/sso/saml"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Feature toggles */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Enable Corporate SSO Authentication</span>
              <p className="text-[10px] text-slate-400">Allow team members to authenticate via enterprise identity provider</p>
            </div>
            <input
              type="checkbox"
              checked={ssoConfig.sso_enabled}
              onChange={(e) => setSsoConfig({ ...ssoConfig, sso_enabled: e.target.checked })}
              className="accent-blue-500 h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDiscoverSSO}
              disabled={isDiscovering}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              {isDiscovering ? "Discovering..." : `Test Domain Discovery (${ssoConfig.sso_domain})`}
            </button>

            <button
              type="submit"
              disabled={isSavingSSO}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              {isSavingSSO ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Save SSO Configuration
            </button>
          </div>

          {/* Domain Discovery Result Preview */}
          {discoveryResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 text-xs space-y-1">
              <span className="font-bold text-blue-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Discovered SSO Provider: {discoveryResult.provider?.toUpperCase()}
              </span>
              <p className="text-slate-400 text-[11px]">
                Domain: <strong className="text-white">{discoveryResult.domain}</strong> · SSO Enabled:{" "}
                <strong className={discoveryResult.sso_enabled ? "text-emerald-400" : "text-amber-400"}>
                  {discoveryResult.sso_enabled ? "Yes" : "No"}
                </strong>
              </p>
              {discoveryResult.redirect_url && (
                <p className="text-slate-400 text-[11px] truncate">
                  Auth Redirect: <span className="text-blue-400 font-mono">{discoveryResult.redirect_url}</span>
                </p>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Part 2: Outbound ATS Event Webhooks */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Outbound ATS Event Webhooks</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Deliver real-time hiring, scorecard calibration, and interview events to Greenhouse, Lever, Workday, or custom endpoints.
            </p>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-center">
            <Lock className="w-3 h-3" /> HMAC-SHA256 Signed
          </span>
        </div>

        {/* Existing Webhooks List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Active Webhook Endpoints</span>
            <span className="text-[11px] text-slate-500">{webhooks.length} configured</span>
          </div>

          {isLoadingWebhooks ? (
            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading webhooks...
            </div>
          ) : webhooks.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
              No webhook endpoints configured yet. Add your ATS ingestion URL below.
            </div>
          ) : (
            webhooks.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-xs font-mono text-white truncate font-medium">
                      {sub.target_url}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTestPing(sub.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors flex items-center gap-1"
                      title="Send simulated test event"
                    >
                      <Send className="w-3 h-3 text-emerald-400" /> Ping Test
                    </button>
                    <button
                      onClick={() => handleViewDeliveries(sub.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="View delivery audit logs"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(sub.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center pt-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Events:</span>
                  {sub.event_types.map((ev: string) => (
                    <span
                      key={ev}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono"
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                {pingStatus[sub.id] && (
                  <div
                    className={`mt-2 p-2 rounded-lg text-[10px] font-mono border ${
                      pingStatus[sub.id].status === 200
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    Ping Result: HTTP {pingStatus[sub.id].status}  -  {pingStatus[sub.id].message}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Webhook Form */}
        <form onSubmit={handleCreateWebhook} className="pt-3 border-t border-slate-800 space-y-4">
          <span className="text-xs font-bold text-white block">Register New Webhook Endpoint</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Endpoint URL
              </label>
              <input
                type="url"
                required
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://api.greenhouse.io/v1/webhooks/aspire"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                HMAC Signing Secret
              </label>
              <input
                type="text"
                required
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Subscribed Event Types
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {SUPPORTED_EVENTS.map((event) => {
                const isSelected = selectedEvents.includes(event.id);
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => toggleEvent(event.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span>{event.label}</span>
                    <input
                      type="checkbox"
                      readOnly
                      checked={isSelected}
                      className="accent-emerald-500 h-3.5 w-3.5"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreatingWebhook || selectedEvents.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              {isCreatingWebhook ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Add Webhook Endpoint
            </button>
          </div>
        </form>
      </div>

      {/* Deliveries Modal */}
      {isDeliveriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                Outbound Webhook Delivery Log
              </h4>
              <button
                onClick={() => setIsDeliveriesModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {isLoadingDeliveries ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading audit history...
                </div>
              ) : !selectedWebhookDeliveries || selectedWebhookDeliveries.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No delivery logs recorded for this endpoint yet.
                </div>
              ) : (
                selectedWebhookDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1 font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{delivery.event_type}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          delivery.response_status >= 200 && delivery.response_status < 300
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        HTTP {delivery.response_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(delivery.delivered_at).toLocaleTimeString()}</span>
                      <span>Attempt #{delivery.attempt_count}</span>
                    </div>
                    {delivery.error_message && (
                      <p className="text-[10px] text-rose-400 truncate pt-1 border-t border-slate-800">
                        {delivery.error_message}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
