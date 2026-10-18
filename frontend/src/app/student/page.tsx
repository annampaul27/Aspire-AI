"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { MICRO_SPRINTS } from "@/lib/mockData";
import { MicroSprintData, UserNotification } from "@/types";
import SkillGapRadar from "@/components/student/SkillGapRadar";
import ReadinessRoadmap from "@/components/student/ReadinessRoadmap";
import SprintModal from "@/components/student/SprintModal";
import ResumeUploadDrawer from "@/components/student/ResumeUploadDrawer";
import SkillVerificationModal from "@/components/student/SkillVerificationModal";
import ATSResumeManagerModal from "@/components/student/ATSResumeManagerModal";
import DynamicSandboxModal from "@/components/student/DynamicSandboxModal";
import RealtimeJobAlerts from "@/components/student/RealtimeJobAlerts";
import JobDetailsModal from "@/components/student/JobDetailsModal";
import AIInterviewerModal from "@/components/student/AIInterviewerModal";
import { GitHubAnalysisModal } from "@/components/student/GitHubAnalysisModal";
import {
  UploadCloud,
  Compass,
  Radar,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
  Award,
  FileText,
  Terminal,
  AlertTriangle,
  ArrowRight,
  Bot,
  Video,
} from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import Link from "next/link";
import RoleGuard from "@/components/auth/RoleGuard";

export default function StudentPage() {
  const { currentStudent, activeJob } = useStore();
  const [activeTab, setActiveTab] = useState<"radar" | "roadmap">("radar");
  const [activeSprint, setActiveSprint] = useState<MicroSprintData | null>(null);
  const [isResumeDrawerOpen, setIsResumeDrawerOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isATSResumeModalOpen, setIsATSResumeModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const [isAIInterviewerOpen, setIsAIInterviewerOpen] = useState(false);
  const [isGitHubAnalysisOpen, setIsGitHubAnalysisOpen] = useState(false);
  const [selectedJobModalId, setSelectedJobModalId] = useState<string | null>(null);
  const [deadlineAlerts, setDeadlineAlerts] = useState<UserNotification[]>([]);
  const [verificationSkillId, setVerificationSkillId] = useState("postgresql");
  const [verificationSkillName, setVerificationSkillName] = useState("PostgreSQL Optimization & Architecture");

  useEffect(() => {
    async function fetchDeadlines() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/notifications?user_id=cand-1");
        if (res.ok) {
          const data = await res.json();
          const deadlines = (data.notifications || []).filter(
            (n: UserNotification) => n.notification_type === "deadline_warning"
          );
          setDeadlineAlerts(deadlines);
        }
      } catch (e) {
        console.warn("Unable to fetch deadline alerts:", e);
      }
    }
    fetchDeadlines();
  }, []);

  const handleMarkAlertRead = async (notifId: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/notifications/${notifId}/read`, {
        method: "PATCH",
      });
      setDeadlineAlerts((prev) =>
        prev.map((a) => (a.id === notifId ? { ...a, is_read: true } : a))
      );
    } catch (e) {
      console.warn("Failed to mark alert as read:", e);
    }
  };

  const handleLaunchSprint = (skillId: string) => {
    const sprint = MICRO_SPRINTS[skillId] || MICRO_SPRINTS["postgres_optimization"];
    setActiveSprint(sprint);
  };

  const isJobReady = currentStudent.readinessScore >= 85;

  return (
    <RoleGuard allowedRoles={["student", "admin"]} portalName="Student Portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#FBFBFD] min-h-screen text-[#1D1D1F]">
        {/* Profile Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentStudent.avatarUrl}
              alt={currentStudent.fullName}
              className="w-12 h-12 rounded-xl object-cover border border-[#E5E5EA]"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold text-[#1D1D1F]">
                  {currentStudent.fullName}
                </h2>
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                    isJobReady
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {currentStudent.currentTier.replace("_", " ")} ({currentStudent.readinessScore}%)
                </span>
              </div>
              <p className="text-xs text-[#6E6E73] mt-1">
                {currentStudent.college} · Class of {currentStudent.gradYear} ·{" "}
                <span className="font-medium text-[#1D1D1F]">
                  {currentStudent.credentials.length} verified credentials
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-start-verification-assessment"
              onClick={() => {
                setVerificationSkillId("postgresql");
                setVerificationSkillName("PostgreSQL Optimization & Architecture");
                setIsVerificationModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Verify Skill</span>
            </button>

            <button
              id="btn-open-ats-resume-studio"
              onClick={() => setIsATSResumeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#1D1D1F] hover:bg-[#333336] text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume Studio</span>
            </button>

            <button
              id="btn-open-dynamic-sandbox"
              onClick={() => setIsSandboxModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Bug-Fix Sandbox</span>
            </button>

            <Link
              id="btn-open-ai-interview-studio"
              href="/interview-coach"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
              title="Launch Real-Time Multimodal AI Interview Coach with Video & Audio Telemetry"
            >
              <Video className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Interview Coach</span>
            </Link>

            <button
              id="btn-open-ai-interview-coach"
              onClick={() => setIsAIInterviewerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Quick Grill</span>
            </button>

            <button
              id="btn-open-github-verifier"
              onClick={() => setIsGitHubAnalysisOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5 text-[#1D1D1F]" />
              <span>GitHub Verifier</span>
            </button>

            <Link
              id="btn-open-github-security"
              href="/student/github-security"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
              title="Audit public repos for secret leaks and 1-click auto-remediate"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secret Shield</span>
            </Link>

            <Link
              id="btn-open-courses"
              href="/hub"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
              title="Open Backend AI Suite & 13-Course Academy"
            >
              <span>13 Courses</span>
            </Link>

            <button
              onClick={() => setIsResumeDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Realtime Job Alerts */}
        <RealtimeJobAlerts
          userId={currentStudent.id}
          onOpenJobDetails={(jobId) => setSelectedJobModalId(jobId)}
        />

        {/* Deadline Warnings */}
        {deadlineAlerts.length > 0 && (
          <div id="deadline-alerts-banner" className="space-y-2">
            {deadlineAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  !alert.is_read
                    ? "bg-rose-50 border-rose-200"
                    : "bg-white border-[#E5E5EA] opacity-80"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      !alert.is_read
                        ? "bg-rose-100 text-rose-700"
                        : "bg-[#F5F5F7] text-[#6E6E73]"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                        Deadline
                      </span>
                      <span className="text-xs font-semibold text-[#1D1D1F]">
                        {alert.job_title}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E6E73] mt-0.5">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!alert.is_read ? (
                    <button
                      onClick={() => handleMarkAlertRead(alert.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
                    >
                      Dismiss
                    </button>
                  ) : (
                    <span className="text-xs text-[#6E6E73] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Read
                    </span>
                  )}
                  <button
                    onClick={() => setActiveTab("roadmap")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors"
                  >
                    <span>Prepare</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sprint Alert Banner */}
        {currentStudent.sprintAssigned?.status === "pending" && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                    Sprint Assigned
                  </span>
                  <span className="text-xs text-[#1D1D1F]">
                    Skill: <strong>{currentStudent.sprintAssigned.skillName}</strong>
                  </span>
                </div>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  An employer identified a gap and assigned a micro-assessment. Complete it to improve your readiness score.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchSprint(currentStudent.sprintAssigned!.skillId)}
              className="px-3.5 py-2 rounded-lg bg-[#1D1D1F] hover:bg-[#333336] text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Start Challenge</span>
            </button>
          </div>
        )}

        {/* Pre-Recruiter Defense Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] shrink-0">
              <GithubIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA] uppercase">
                  Pre-Recruiter Defense
                </span>
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  GitHub Health & Leaked Secret Shield
                </span>
              </div>
              <p className="text-xs text-[#6E6E73] mt-1 max-w-2xl leading-relaxed">
                Audit public repositories for hardcoded API keys (OpenAI, AWS, PATs), verify .gitignore coverage, and apply 1-click zero-risk fixes before recruiters review your code.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/student/github-security"
              className="px-4 py-2 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Audit & Fix Repos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Workspace Tab Switcher */}
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
              <Radar className="w-3.5 h-3.5" />
              <span>Skill Gap Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab("roadmap")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "roadmap"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Readiness Roadmap</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#6E6E73]">
            <span>Target:</span>
            <span className="font-semibold text-[#1D1D1F]">{activeJob?.title}</span>
          </div>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === "radar" && (
          <SkillGapRadar onLaunchSprint={handleLaunchSprint} />
        )}

        {activeTab === "roadmap" && (
          <ReadinessRoadmap onLaunchSprint={handleLaunchSprint} />
        )}

        {/* Verified Credentials Ledger Card */}
        <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0071E3]" />
              <h4 className="text-xs uppercase tracking-wider text-[#1D1D1F] font-semibold">
                Verified Credentials
              </h4>
            </div>
            <span className="text-xs text-[#6E6E73] font-medium">
              {currentStudent.credentials.length} verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStudent.credentials.map((cred) => (
              <div
                key={cred.hash}
                className="p-4 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-semibold text-xs text-[#1D1D1F]">
                      {cred.skillName}
                    </h5>
                    <p suppressHydrationWarning className="text-[11px] text-[#6E6E73] mt-0.5">
                      {cred.issuerOrg} · {cred.issuedAt ? cred.issuedAt.split("T")[0] : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">
                    {cred.score}%
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-[#E5E5EA]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] block mb-1">
                    SHA-256 Ledger Digest
                  </span>
                  <p className="text-[11px] font-mono text-[#1D1D1F] break-all">
                    {cred.hash}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E5EA] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Cryptographically Valid
                  </span>
                  <Link
                    href={`/verify/${cred.hash}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[#0071E3] hover:underline text-xs font-medium"
                  >
                    View proof <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals and Overlays */}
        {isVerificationModalOpen && (
          <SkillVerificationModal
            skillId={verificationSkillId}
            skillName={verificationSkillName}
            onClose={() => setIsVerificationModalOpen(false)}
          />
        )}

        {isATSResumeModalOpen && (
          <ATSResumeManagerModal
            onClose={() => setIsATSResumeModalOpen(false)}
          />
        )}

        {activeSprint && (
          <SprintModal
            sprint={activeSprint}
            onClose={() => setActiveSprint(null)}
          />
        )}

        {isResumeDrawerOpen && (
          <ResumeUploadDrawer onClose={() => setIsResumeDrawerOpen(false)} />
        )}

        {isSandboxModalOpen && (
          <DynamicSandboxModal
            isOpen={isSandboxModalOpen}
            onClose={() => setIsSandboxModalOpen(false)}
          />
        )}

        {selectedJobModalId && (
          <JobDetailsModal
            jobId={selectedJobModalId}
            onClose={() => setSelectedJobModalId(null)}
          />
        )}

        {isAIInterviewerOpen && (
          <AIInterviewerModal
            isOpen={isAIInterviewerOpen}
            onClose={() => setIsAIInterviewerOpen(false)}
            defaultRole={currentStudent.targetRole || "Senior Backend Engineer"}
          />
        )}

        {isGitHubAnalysisOpen && (
          <GitHubAnalysisModal
            isOpen={isGitHubAnalysisOpen}
            onClose={() => setIsGitHubAnalysisOpen(false)}
            defaultUsername={
              currentStudent.githubUrl
                ? currentStudent.githubUrl.split("/").filter(Boolean).pop() || "aaravsharma-dev"
                : "aaravsharma-dev"
            }
            candidateName={currentStudent.fullName}
          />
        )}
      </div>
    </RoleGuard>
  );
}
