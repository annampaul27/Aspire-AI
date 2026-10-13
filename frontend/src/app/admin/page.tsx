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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  Platform Administration
                </h2>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Admin
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Credential ledger, skill taxonomy, and organization management.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-semibold text-purple-300 hover:text-white transition-colors"
              title="Super Admin Profile & Key Authority"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Super Admin Profile</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-800">
          <div>
            <span className="text-xs text-gray-400">Candidates</span>
            <p className="text-xl font-semibold text-white mt-0.5">
              1,420
            </p>
          </div>

          <div>
            <span className="text-xs text-gray-400">Open Positions</span>
            <p className="text-xl font-semibold text-blue-400 mt-0.5">
              {jobs.length}
            </p>
          </div>

          <div>
            <span className="text-xs text-gray-400">Verified Credentials</span>
            <p className="text-xl font-semibold text-purple-400 mt-0.5">
              {credentials.length}
            </p>
          </div>

          <div>
            <span className="text-xs text-gray-400">Organizations</span>
            <p className="text-xl font-semibold text-white mt-0.5">
              {organizations.length}
              {pendingAnomalies.length > 0 && (
                <span className="text-xs text-red-400 font-normal ml-2">
                  {pendingAnomalies.length} flagged
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab("cohorts")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "cohorts"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cohorts & Batch Dispatch</span>
          </button>

          <button
            onClick={() => setActiveTab("naac")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "naac"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>NAAC Accreditation</span>
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "ledger"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Credential Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("taxonomy")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "taxonomy"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Skill Taxonomy</span>
          </button>

          <button
            onClick={() => setActiveTab("orgs")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "orgs"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Organizations</span>
          </button>

          <button
            onClick={() => setActiveTab("anomalies")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "anomalies"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Anomalies</span>
            {pendingAnomalies.length > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                {pendingAnomalies.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
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
