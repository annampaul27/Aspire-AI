"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Candidate, ProofOfWorkCredential } from "@/types";
import TalentRadar from "@/components/employer/TalentRadar";
import PipelineKanban from "@/components/employer/PipelineKanban";
import ProofOfWorkModal from "@/components/employer/ProofOfWorkModal";
import CandidateDrawer from "@/components/employer/CandidateDrawer";
import JobCreatorModal from "@/components/employer/JobCreatorModal";
import UniversityCohortAnalytics from "@/components/employer/UniversityCohortAnalytics";
import RecruitmentFunnelAnalytics from "@/components/employer/RecruitmentFunnelAnalytics";
import Link from "next/link";
import {
  Plus,
  Layers,
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  Share2,
  Check,
  Settings,
  BarChart3,
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function EmployerPage() {
  const {
    candidates,
    currentOrg,
    activeJob,
    dispatchGapSprint,
    isAnonymizedScreening,
    setIsAnonymizedScreening,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"radar" | "pipeline" | "cohort" | "analytics">("radar");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [auditCredential, setAuditCredential] = useState<{
    cred: ProofOfWorkCredential;
    candidate: Candidate;
  } | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const handleAudit = (cred: ProofOfWorkCredential, candidate: Candidate) => {
    setAuditCredential({ cred, candidate });
  };

  const handleShareShortlist = () => {
    const url = window.location.origin + "/verify/" + (auditCredential?.cred.hash || "sample");
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    addToast({
      type: "info",
      title: "Shortlist Link Copied",
      message: "Shareable link copied to clipboard.",
    });
    setTimeout(() => setCopiedShareLink(false), 3000);
  };

  return (
    <RoleGuard allowedRoles={["employer", "admin"]} portalName="Employer ATS Portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#FBFBFD] min-h-screen text-[#1D1D1F]">
        {/* Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-xl shrink-0">
              {currentOrg.logo}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold text-[#1D1D1F]">
                  {activeJob?.title || "Lead Software Architect"}
                </h2>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071E3] border border-blue-200">
                  Active Requisition
                </span>
              </div>
              <p className="text-xs text-[#6E6E73] mt-1">
                {currentOrg.name} · {activeJob?.department} · {activeJob?.salaryRange} ·{" "}
                <span className="font-medium text-[#1D1D1F]">{candidates.length} candidates in pipeline</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Blind Screening Toggle */}
            <button
              id="btn-blind-merit-screening-toggle-top"
              onClick={() => {
                const nextVal = !isAnonymizedScreening;
                setIsAnonymizedScreening(nextVal);
                addToast({
                  type: "info",
                  title: nextVal ? "Blind Screening Enabled" : "Blind Screening Disabled",
                  message: nextVal
                    ? "Candidate identities are now anonymized."
                    : "Candidate identities are now visible.",
                });
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                isAnonymizedScreening
                  ? "bg-amber-50 border border-amber-300 text-amber-900"
                  : "bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#E8E8ED]"
              }`}
            >
              {isAnonymizedScreening ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Blind Screening: Active</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#6E6E73]" />
                  <span>Blind Screening: Off</span>
                </>
              )}
            </button>

            {/* Share Link */}
            <button
              onClick={handleShareShortlist}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-xs font-medium text-[#1D1D1F] transition-colors"
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#6E6E73]" />
                  <span>Share Shortlist</span>
                </>
              )}
            </button>

            {/* New Job */}
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Requisition</span>
            </button>

            {/* Recruiter Profile Link */}
            <Link
              href="/employer/profile"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-xs font-medium text-[#1D1D1F] transition-colors"
              title="Recruiter & Workspace Profile"
            >
              <Settings className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Preferences</span>
            </Link>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "radar"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Talent Radar</span>
            </button>

            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "pipeline"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pipeline Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab("cohort")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "cohort"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>University Cohorts</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "analytics"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Hiring Funnel</span>
            </button>
          </div>

          <div className="hidden sm:block text-xs text-[#6E6E73] font-medium">
            {currentOrg.plan} · {currentOrg.seatsUsed}/{currentOrg.seatsTotal} active seats
          </div>
        </div>

        {/* Content Panels */}
        {activeTab === "radar" && (
          <TalentRadar
            candidates={candidates}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onAuditCredential={(cred, cand) => handleAudit(cred, cand)}
          />
        )}

        {activeTab === "pipeline" && (
          <PipelineKanban
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onAuditCredential={(cred, cand) => handleAudit(cred, cand)}
          />
        )}

        {activeTab === "cohort" && <UniversityCohortAnalytics />}

        {activeTab === "analytics" && <RecruitmentFunnelAnalytics />}

        {/* Drawers and Modals */}
        {selectedCandidate && (
          <CandidateDrawer
            candidate={
              candidates.find((c) => c.id === selectedCandidate.id) || selectedCandidate
            }
            onClose={() => setSelectedCandidate(null)}
            onAuditCredential={(cred) => handleAudit(cred, selectedCandidate)}
            onDispatchSprint={(candId, skillId, skillName) => {
              dispatchGapSprint(candId, skillId, skillName);
            }}
          />
        )}

        {auditCredential && (
          <ProofOfWorkModal
            credential={auditCredential.cred}
            candidate={auditCredential.candidate}
            onClose={() => setAuditCredential(null)}
          />
        )}

        {isJobModalOpen && (
          <JobCreatorModal onClose={() => setIsJobModalOpen(false)} />
        )}
      </div>
    </RoleGuard>
  );
}
