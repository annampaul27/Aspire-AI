"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import CredentialLedger from "@/components/admin/CredentialLedger";
import SkillTaxonomyTable from "@/components/admin/SkillTaxonomyTable";
import OrgManager from "@/components/admin/OrgManager";
import AnomalyMonitor from "@/components/admin/AnomalyMonitor";
import CohortBatchManager from "@/components/admin/CohortBatchManager";
import NaacAccreditationCard from "@/components/admin/NaacAccreditationCard";
import Link from "next/link";
import {
  Shield,
  Network,
  Building2,
  AlertTriangle,
  KeyRound,
  GraduationCap,
  Award,
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminPage() {
  const { jobs, credentials, organizations, anomalies } = useStore();
  const [activeTab, setActiveTab] = useState<
    "cohorts" | "naac" | "ledger" | "taxonomy" | "orgs" | "anomalies"
  >("cohorts");

  const pendingAnomalies = anomalies.filter((a) => !a.resolved);

  return (
    <RoleGuard allowedRoles={["admin"]} portalName="Superuser Platform Governance">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#FBFBFD] min-h-screen text-[#1D1D1F]">
        {/* Header Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#0071E3] shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-[#1D1D1F]">
                    Platform Administration
                  </h2>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Institutional Governance
                  </span>
                </div>
                <p className="text-xs text-[#6E6E73] mt-1">
                  Cryptographic ledger authority, skill taxonomy registry, and multi-tenant telemetry.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/profile"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-xs font-medium text-[#1D1D1F] transition-colors"
                title="Super Admin Profile & Key Authority"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Authority Keys & Telemetry</span>
              </Link>
            </div>
          </div>

          {/* Platform Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E5E5EA]">
            <div className="p-3.5 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6E6E73]">
                Candidates
              </span>
              <p className="text-2xl font-bold font-mono text-[#1D1D1F] mt-1">
                1,420
              </p>
            </div>

            <div className="p-3.5 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6E6E73]">
                Open Requisitions
              </span>
              <p className="text-2xl font-bold font-mono text-[#0071E3] mt-1">
                {jobs.length}
              </p>
            </div>

            <div className="p-3.5 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6E6E73]">
                Verified Credentials
              </span>
              <p className="text-2xl font-bold font-mono text-purple-700 mt-1">
                {credentials.length}
              </p>
            </div>

            <div className="p-3.5 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6E6E73]">
                Tenants & Orgs
              </span>
              <p className="text-2xl font-bold font-mono text-[#1D1D1F] mt-1">
                {organizations.length}
                {pendingAnomalies.length > 0 && (
                  <span className="text-xs text-rose-700 font-sans font-medium ml-2">
                    ({pendingAnomalies.length} flagged)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("cohorts")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "cohorts"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Cohorts & Batches</span>
            </button>

            <button
              onClick={() => setActiveTab("naac")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "naac"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>NAAC Accreditation</span>
            </button>

            <button
              onClick={() => setActiveTab("ledger")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "ledger"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Credential Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab("taxonomy")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "taxonomy"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Skill Taxonomy</span>
            </button>

            <button
              onClick={() => setActiveTab("orgs")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "orgs"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Organizations</span>
            </button>

            <button
              onClick={() => setActiveTab("anomalies")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "anomalies"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Anomalies</span>
              {pendingAnomalies.length > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {pendingAnomalies.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Panels */}
        {activeTab === "cohorts" && <CohortBatchManager />}
        {activeTab === "naac" && <NaacAccreditationCard />}
        {activeTab === "ledger" && <CredentialLedger />}
        {activeTab === "taxonomy" && <SkillTaxonomyTable />}
        {activeTab === "orgs" && <OrgManager />}
        {activeTab === "anomalies" && <AnomalyMonitor />}
      </div>
    </RoleGuard>
  );
}
